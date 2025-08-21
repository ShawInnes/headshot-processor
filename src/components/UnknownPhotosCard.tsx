import { PhotoWithExif } from '../lib/exif'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { PhotoThumbnail } from './PhotoThumbnail'
import { AlertCircle } from 'lucide-react'

interface UnknownPhotosCardProps {
  photos: PhotoWithExif[]
  onPhotoSelect: (photo: PhotoWithExif) => void
}

export function UnknownPhotosCard({ photos, onPhotoSelect }: UnknownPhotosCardProps) {
  if (photos.length === 0) return null

  return (
    <Card className="border-orange-200 bg-orange-50/30">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-orange-900">Unknown Photos</CardTitle>
            <p className="text-sm text-orange-700">
              {photos.length} photos without employee information
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {photos.slice(0, 20).map(photo => (
            <PhotoThumbnail 
              key={photo.path}
              photo={photo}
              onClick={() => onPhotoSelect(photo)}
            />
          ))}
          {photos.length > 20 && (
            <div className="aspect-square bg-orange-100 rounded flex items-center justify-center text-xs text-orange-700 border border-orange-200">
              +{photos.length - 20}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}