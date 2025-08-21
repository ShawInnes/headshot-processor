import { PhotoWithExif } from '../lib/exif'

interface PhotoThumbnailProps {
  photo: PhotoWithExif
  onClick: () => void
  size?: 'sm' | 'md' | 'lg'
}

export function PhotoThumbnail({ photo, onClick, size = 'sm' }: PhotoThumbnailProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }

  return (
    <div 
      className={`${sizeClasses[size]} bg-gray-200 rounded cursor-pointer hover:bg-gray-300 transition-colors flex items-center justify-center group relative overflow-hidden`}
      onClick={onClick}
      title={photo.name}
    >
      {/* Placeholder since we can't display actual image thumbnails in this environment */}
      <div className="text-xs text-gray-600 text-center p-1 break-words">
        {photo.name.split('.')[0].substring(0, 8)}
      </div>
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
        <div className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
          View
        </div>
      </div>
    </div>
  )
}