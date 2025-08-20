import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Folder, Upload } from 'lucide-react'

interface FolderSelectorProps {
  onFolderSelected: (folderPath: string) => void
  isLoading?: boolean
}

export function FolderSelector({ onFolderSelected, isLoading = false }: FolderSelectorProps) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

  const handleSelectFolder = async () => {
    try {
      const folderPath = await window.electronAPI.selectFolder()
      if (folderPath) {
        setSelectedFolder(folderPath)
        onFolderSelected(folderPath)
      }
    } catch (error) {
      console.error('Error selecting folder:', error)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Folder className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle>Select Photo Folder</CardTitle>
        <CardDescription>
          Choose the folder containing your headshot photos to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedFolder && (
          <div className="p-3 bg-gray-50 rounded-lg border">
            <p className="text-sm text-gray-600 font-medium">Selected folder:</p>
            <p className="text-sm text-gray-800 truncate" title={selectedFolder}>
              {selectedFolder}
            </p>
          </div>
        )}
        
        <Button 
          onClick={handleSelectFolder} 
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Upload className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Folder className="w-4 h-4 mr-2" />
              {selectedFolder ? 'Change Folder' : 'Select Folder'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}