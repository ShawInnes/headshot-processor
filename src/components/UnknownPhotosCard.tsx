import { PhotoWithExif } from '../lib/exif'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { PhotoThumbnail } from './PhotoThumbnail'
import { AlertCircle, CheckSquare, Square, Download, Mail } from 'lucide-react'
import { toast } from 'sonner'

interface UnknownPhotosCardProps {
  photos: PhotoWithExif[]
  onPhotoSelect: (photo: PhotoWithExif) => void
  selectedPhotos?: Set<string>
  onPhotoToggle?: (photoPath: string) => void
  onSelectAll?: (photos: PhotoWithExif[]) => void
  onDeselectAll?: (photos: PhotoWithExif[]) => void
  onExportUnknown?: (photos: PhotoWithExif[]) => void
  onEmailUnknown?: (photos: PhotoWithExif[]) => void
}

export function UnknownPhotosCard({
  photos,
  onPhotoSelect,
  selectedPhotos = new Set(),
  onPhotoToggle,
  onSelectAll,
  onDeselectAll,
  onExportUnknown,
  onEmailUnknown
}: UnknownPhotosCardProps) {
  if (photos.length === 0) return null

  const selectedCount = photos.filter(photo => selectedPhotos.has(photo.path)).length
  const allSelected = selectedCount === photos.length

  const handleSelectToggle = () => {
    if (allSelected) {
      onDeselectAll?.(photos)
    } else {
      onSelectAll?.(photos)
    }
  }

  const handleExport = () => {
    if (selectedCount === 0) {
      toast.warning('Please select photos to export')
      return
    }
    const selectedPhotoList = photos.filter(photo => selectedPhotos.has(photo.path))
    onExportUnknown?.(selectedPhotoList)
  }

  const handleEmail = () => {
    if (selectedCount === 0) {
      toast.warning('Please select photos to email')
      return
    }
    const selectedPhotoList = photos.filter(photo => selectedPhotos.has(photo.path))
    onEmailUnknown?.(selectedPhotoList)
  }

  return (
    <Card className="border-orange-200 bg-orange-50/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-orange-900">Unknown Photos</CardTitle>
            <p className="text-sm text-orange-700">
              {photos.length} photos without employee information
                {selectedCount > 0 && (
                  <span className="ml-2 text-orange-800 font-medium">
                    ({selectedCount} selected)
                  </span>
                )}
              </p>
        </div>
            </div>

          <div className="flex gap-2">
            {onPhotoToggle && onSelectAll && onDeselectAll && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectToggle}
                title={allSelected ? "Deselect all photos" : "Select all photos"}
              >
                {allSelected ? <Square className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
              </Button>
            )}
            {onEmailUnknown && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEmail}
                title="Email unknown photos"
              >
                <Mail className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              title="Export unknown photos"
            >
              <Download className="w-4 h-4" />
            </Button>
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