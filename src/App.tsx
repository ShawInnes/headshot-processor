import { useState } from 'react'
import { FolderSelector } from './components/FolderSelector'
import { PhotoList } from './components/PhotoList'
import { PhotoDetailDialog } from './components/PhotoDetailDialog'
import { PhotoFile } from './types/electron'
import { PhotoWithExif } from './lib/exif'
import { toast } from 'sonner'
import './App.css'

function App() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [photos, setPhotos] = useState<PhotoFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithExif | null>(null)
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false)

  const handleFolderSelected = async (folderPath: string) => {
    setIsLoading(true)
    setPhotos([])

    try {
      toast.info('Scanning folder for photos...', {
        duration: 2000
      })

      const discoveredPhotos = await window.electronAPI.discoverPhotos(folderPath)

      if (discoveredPhotos.length === 0) {
        toast.warning('No JPEG photos found in the selected folder')
      } else {
        toast.success(`Found ${discoveredPhotos.length} photos`)
        setPhotos(discoveredPhotos)
        setSelectedFolder(folderPath)
      }
    } catch (error) {
      console.error('Error discovering photos:', error)
      toast.error('Failed to scan folder for photos')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoSelect = (photo: PhotoWithExif) => {
    setSelectedPhoto(photo)
    setIsPhotoDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Headshot Photo Processor
          </h1>
          <p className="text-gray-600">
            Select a folder to analyze your headshot photos and extract employee information
          </p>
        </div>

        {/* Main Content */}
        {photos.length === 0 ? (
          <FolderSelector
            onFolderSelected={handleFolderSelected}
            isLoading={isLoading}
          />
        ) : (
          <div className="space-y-6">
            {/* Folder Info */}
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Selected Folder</h3>
                  <p className="text-sm text-gray-600 truncate" title={selectedFolder || ''}>
                    {selectedFolder}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPhotos([])
                    setSelectedFolder(null)
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Change Folder
                </button>
              </div>
            </div>

            {/* Photo List */}
            <PhotoList
              photos={photos}
              onPhotoSelect={handlePhotoSelect}
            />
          </div>
        )}

        {/* Photo Detail Dialog */}
        <PhotoDetailDialog
          photo={selectedPhoto}
          open={isPhotoDialogOpen}
          onOpenChange={setIsPhotoDialogOpen}
        />
      </div>
    </div>
  )
}

export default App
