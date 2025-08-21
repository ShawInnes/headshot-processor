import {useEffect, useRef, useState} from 'react'
import {PhotoWithExif} from '../lib/exif'
import {useImageLoader} from '../hooks/useImageLoader'

interface PhotoThumbnailProps {
    photo: PhotoWithExif
    onClick: () => void
    size?: 'sm' | 'md' | 'lg'
    lazyLoad?: boolean
    loadingBuffer?: string
}

export function PhotoThumbnail({
                                   photo,
                                   onClick,
                                   size = 'sm',
                                   lazyLoad = true,
                                   loadingBuffer = '50px'
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

    return (
        <div
            ref={elementRef}
            className={`${sizeClasses[size]} bg-gray-200 rounded cursor-pointer hover:bg-gray-300 transition-colors flex items-center justify-center group relative overflow-hidden`}
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