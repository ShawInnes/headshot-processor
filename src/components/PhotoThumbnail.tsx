import {useEffect, useRef, useState} from 'react'
import {PhotoWithExif} from '../lib/exif'
import {useImageLoader} from '../hooks/useImageLoader'

interface PhotoThumbnailProps {
    photo: PhotoWithExif
    onClick: () => void
    size?: 'sm' | 'md' | 'lg'
    lazyLoad?: boolean
    loadingBuffer?: string
    isSelected?: boolean
    onToggleSelect?: (e: React.MouseEvent) => void
}

export function PhotoThumbnail({
                                   photo,
                                   onClick,
                                   size = 'sm',
                                   lazyLoad = true,
                                   loadingBuffer = '50px',
                                   isSelected = false,
                                   onToggleSelect
                               }: PhotoThumbnailProps) {
    const [isIntersecting, setIsIntersecting] = useState(!lazyLoad)
    const elementRef = useRef<HTMLDivElement>(null)

    const {imageUrl, isLoading, hasError, retry} = useImageLoader({
        photo,
        enabled: isIntersecting,
        onError: (error) => console.error('Thumbnail load error:', error)
    })

    const sizeClasses = {
        sm: 'w-12 h-12',
        md: 'w-16 h-16',
        lg: 'w-24 h-24'
    }

    // Intersection Observer setup
    useEffect(() => {
        if (!lazyLoad || !elementRef.current) return

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0]
                if (entry.isIntersecting) {
                    setIsIntersecting(true)
                    observer.disconnect()
                }
            },
            {
                rootMargin: loadingBuffer,
                threshold: 0.1
            }
        )

        observer.observe(elementRef.current)

        return () => {
            observer.disconnect()
        }
    }, [lazyLoad, loadingBuffer])

    const handleRetry = (e: React.MouseEvent) => {
        e.stopPropagation()
        retry()
    }

    const handleToggleSelect = (e: React.MouseEvent) => {
        e.stopPropagation()
        onToggleSelect?.(e)
    }

    return (
        <div
            ref={elementRef}
            className={`${sizeClasses[size]} bg-gray-200 rounded cursor-pointer hover:bg-gray-300 transition-colors flex items-center justify-center group relative overflow-hidden ${
                isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
            }`}
            onClick={onClick}
            title={photo.name}
        >
            {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
            ) : imageUrl && !hasError ? (
                <img
                    src={imageUrl}
                    alt={photo.name}
                    className="w-full h-full object-cover rounded"
                    onError={() => console.error('Image display error for', photo.name)}
                />
            ) : hasError ? (
                <div
                    className="text-xs text-red-600 text-center p-1 break-words cursor-pointer hover:text-red-800"
                    onClick={handleRetry}
                    title="Click to retry loading"
                >
                    ⚠️ Retry
                </div>
            ) : !isIntersecting && lazyLoad ? (
                <div className="text-xs text-gray-400 text-center p-1 break-words">
                    {photo.name.split('.')[0].substring(0, 6)}...
                </div>
            ) : (
                <div className="text-xs text-gray-600 text-center p-1 break-words">
                    {photo.name.split('.')[0].substring(0, 8)}
                </div>
            )}

            {/* Selection checkbox */}
            {onToggleSelect && (
                <div className="absolute top-1 right-1 z-10">
                    <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                            isSelected
                                ? 'bg-blue-500 border-blue-500'
                                : 'bg-white border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={handleToggleSelect}
                    >
                        {isSelected && (
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>
                </div>
            )}

            {/* Hover overlay */}
            <div
                className="absolute inset-0 bg-black group-hover:bg-opacity-90 opacity-0 group-hover:opacity-40 duration-200 transition-opacity flex items-center justify-center pointer-events-none">
                <div className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    View
                </div>
            </div>
            {/* Loading indicator for lazy loading */}
            {lazyLoad && !isIntersecting && (
                <div className="absolute bottom-1 right-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full opacity-50"></div>
                </div>
            )}
        </div>
    )
}