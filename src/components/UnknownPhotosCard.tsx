import { PhotoWithExif } from '../lib/exif'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { AlertCircle } from 'lucide-react'

interface UnknownPhotosCardProps {
  photos: PhotoWithExif[]

}

export function UnknownPhotosCard({
  photos,
}: UnknownPhotosCardProps) {
  if (photos.length === 0) return null

  return (
    <Card className="border-orange-200 bg-orange-50/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-orange-900">Unidentified Photos</CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="">
          <p className="text-sm text-orange-700">
            {photos.length} photos without employee information
          </p>
        </div>
      </CardContent>
    </Card>
  )
}