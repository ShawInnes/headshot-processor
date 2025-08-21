import {useEffect, useState} from 'react'
import {FolderSelector} from './components/FolderSelector'
import {PhotoList} from './components/PhotoList'
import {EmployeeGroupView} from './components/EmployeeGroupView'
import {PhotoDetailDialog} from './components/PhotoDetailDialog'
import {Button} from './components/ui/button'
import {PhotoFile} from './types/electron'
import {PhotoWithExif} from './lib/exif'
import {EmployeeService} from './lib/employeeService'
import {Employee, EmployeeGroup} from './types/employee'
import {toast} from 'sonner'
import './App.css'

type ViewMode = 'list' | 'groups'

function App() {
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
    const [photos, setPhotos] = useState<PhotoFile[]>([])
    const [photosWithExif, setPhotosWithExif] = useState<PhotoWithExif[]>([])
    const [employeeGroup, setEmployeeGroup] = useState<EmployeeGroup | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithExif | null>(null)
    const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false)
    const [viewMode, setViewMode] = useState<ViewMode>('list')

    const handleFolderSelected = async (folderPath: string) => {
        setIsLoading(true)
        setPhotos([])
        setPhotosWithExif([]) // Clear previous EXIF data
        setEmployeeGroup(null) // Clear previous employee data

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

    useEffect(() => {
        if (photosWithExif.length > 0) {
            const groupedEmployees = EmployeeService.groupPhotosByEmployee(photosWithExif)
            setEmployeeGroup(groupedEmployees)
        }
    }, [photosWithExif])

    const handlePhotosProcessed = (processedPhotos: PhotoWithExif[]) => {
        setPhotosWithExif(processedPhotos)
    }

    const handlePhotoSelect = (photo: PhotoWithExif) => {
        setSelectedPhoto(photo)
        setIsPhotoDialogOpen(true)
    }

    const handleEmployeeRename = (employee: Employee, newName: string) => {
        if (!employeeGroup) return

        const updatedEmployees = employeeGroup.employees.map(emp =>
            emp.id === employee.id
                ? {...emp, name: newName, id: EmployeeService.generateEmployeeId(newName)}
                : emp
        )

        const updatedPhotos = photosWithExif.map(photo => {
            if (photo.exif?.employeeName === employee.name) {
                return {
                    ...photo,
                    exif: {
                        ...photo.exif,
                        employeeName: newName
                    }
                }
            }
            return photo
        })

        setPhotosWithExif(updatedPhotos)
        setEmployeeGroup({
            ...employeeGroup,
            employees: updatedEmployees
        })

        toast.success(`Employee renamed to ${newName}`)
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
                        {/* Folder Info & Controls */}
                        <div className="bg-white p-4 rounded-lg border shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-900">Selected Folder</h3>
                                    <p className="text-sm text-gray-600 truncate" title={selectedFolder || ''}>
                                        {selectedFolder}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    {/* View Mode Toggle */}
                                    {photosWithExif.length > 0 && (
                                        <div className="flex bg-gray-100 rounded-lg p-1">
                                            <Button
                                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                                size="sm"
                                                onClick={() => setViewMode('list')}
                                                className="h-8 px-3"
                                            >
                                                List View
                                            </Button>
                                            <Button
                                                variant={viewMode === 'groups' ? 'default' : 'ghost'}
                                                size="sm"
                                                onClick={() => setViewMode('groups')}
                                                className="h-8 px-3"
                                            >
                                                Employee Groups
                                            </Button>
                                        </div>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setPhotos([])
                                            setPhotosWithExif([])
                                            setEmployeeGroup(null)
                                            setSelectedFolder(null)
                                        }}
                                    >
                                        Change Folder
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Content based on view mode */}
                        {viewMode === 'list' ? (
                            <PhotoList
                                photos={photos}
                                onPhotoSelect={handlePhotoSelect}
                                onPhotosProcessed={handlePhotosProcessed}
                            />
                        ) : (
                            employeeGroup && (
                                <EmployeeGroupView
                                    employeeGroup={employeeGroup}
                                    onPhotoSelect={handlePhotoSelect}
                                    onEmployeeRename={handleEmployeeRename}
                                />
                            )
                        )}
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
