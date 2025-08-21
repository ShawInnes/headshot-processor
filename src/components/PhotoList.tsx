import {useEffect, useState} from 'react'

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from './ui/card'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from './ui/table'
import {Progress} from './ui/progress'
import {Badge} from './ui/badge'
import {Button} from './ui/button'
import {AlertCircle, Calendar, Eye, HardDrive, RefreshCw, User} from 'lucide-react'
import {formatDate, formatFileSize, PhotoWithExif, readExifData} from '../lib/exif'
import {PhotoFile} from '@/types/electron'
import {FolderCacheService} from '../lib/folder-cache'
import {FolderCache} from '../types/cache'
import {EmployeeService} from '../lib/employeeService'

interface PhotoListProps {
    photos: PhotoFile[]
    onPhotoSelect?: (photo: PhotoWithExif) => void
    onPhotosProcessed?: (photos: PhotoWithExif[]) => void
}

export function PhotoList({photos, onPhotoSelect, onPhotosProcessed}: PhotoListProps) {
    const [photosWithExif, setPhotosWithExif] = useState<PhotoWithExif[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (photos.length > 0) {
            if (processPhotosWithCaching) {
                processPhotosWithCaching()
            }
        }
    }, [photos])

    const processPhotosWithCaching = async () => {
        if (photos.length === 0) return

        setIsProcessing(true)
        setProgress(0)
        setError(null)

        const processedPhotos: PhotoWithExif[] = []

        try {
            // Load existing cache if available
            const folderPath = photos[0]?.directory || ''
            const existingCache = await FolderCacheService.loadCache(folderPath)

            for (let i = 0; i < photos.length; i++) {
                const photo = photos[i]
                const cachedFile = existingCache?.files[photo.name]

                // Use cache if file hasn't changed
                if (cachedFile &&
                    cachedFile.size === photo.size &&
                    cachedFile.modified === photo.modified) {

                    const photoWithExif: PhotoWithExif = {
                        ...photo,
                        exif: cachedFile.exifData,
                        hasError: cachedFile.hasError,
                        errorMessage: cachedFile.errorMessage
                    }
                    processedPhotos.push(photoWithExif)
                } else {
                    // Process fresh
                    const photoWithExif = await processPhotoFresh(photo)
                    processedPhotos.push(photoWithExif)
                }

                setProgress(((i + 1) / photos.length) * 100)
            }

            setPhotosWithExif(processedPhotos)
            onPhotosProcessed?.(processedPhotos)

            // Save to cache
            await saveCacheFromProcessedPhotos(folderPath, processedPhotos)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error processing photos')
        } finally {
            setIsProcessing(false)
        }
    }

    const processPhotoFresh = async (photo: PhotoFile): Promise<PhotoWithExif> => {
        let exifData = null
        let hasError = false
        let errorMessage = undefined

        try {
            // Read the file buffer
            const buffer = await window.electronAPI.readFileBuffer(photo.path)

            // Convert Buffer to ArrayBuffer for exifr
            const arrayBuffer = new ArrayBuffer(buffer.length)
            const view = new Uint8Array(arrayBuffer)
            for (let i = 0; i < buffer.length; i++) {
                view[i] = buffer[i]
            }

            // Extract EXIF data
            exifData = await readExifData(arrayBuffer)
        } catch (err) {
            hasError = true
            errorMessage = err instanceof Error ? err.message : 'Unknown error reading EXIF data'
            console.error(`Error processing photo ${photo.name}:`, err)
        }

        return {
            ...photo,
            exif: exifData,
            hasError,
            errorMessage
        }
    }

    const saveCacheFromProcessedPhotos = async (folderPath: string, processedPhotos: PhotoWithExif[]) => {
        try {
            const cache: FolderCache = {
                version: "1.0.0",
                folderPath,
                lastScan: new Date().toISOString(),
                totalFiles: processedPhotos.length,
                files: {},
                employees: {},
                unknownPhotos: []
            }

            // Convert processed photos to cache format
            processedPhotos.forEach(photo => {
                cache.files[photo.name] = {
                    size: photo.size,
                    modified: photo.modified,
                    exifData: photo.exif,
                    hasError: photo.hasError,
                    errorMessage: photo.errorMessage,
                    processed: new Date().toISOString()
                }

                if (!photo.exif?.employeeName) {
                    cache.unknownPhotos.push(photo.name)
                }
            })

            // Group employees
            const employeeGroup = EmployeeService.groupPhotosByEmployee(processedPhotos)
            employeeGroup.employees.forEach(employee => {
                cache.employees[employee.id] = {
                    id: employee.id,
                    name: employee.name,
                    photoCount: employee.photoCount,
                    photoFiles: employee.photos.map(p => p.name),
                    firstSeen: employee.firstSeen.toISOString(),
                    lastSeen: employee.lastSeen.toISOString()
                }
            })

            await FolderCacheService.saveCache(folderPath, cache)
            console.log('Cache saved successfully')
        } catch (error) {
            console.error('Failed to save cache:', error)
            // Don't show error to user - caching is optional
        }
    }

    const getEmployeeStats = () => {
        const employeeMap = new Map<string, number>()
        let unknownCount = 0

        photosWithExif.forEach(photo => {
            if (photo.exif?.employeeName) {
                const name = photo.exif.employeeName
                employeeMap.set(name, (employeeMap.get(name) || 0) + 1)
            } else {
                unknownCount++
            }
        })

        return {employeeMap, unknownCount}
    }

    const {employeeMap, unknownCount} = getEmployeeStats()

    if (isProcessing) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin"/>
                        Processing Photos
                    </CardTitle>
                    <CardDescription>
                        Reading EXIF data from {photos.length} photos...
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Progress value={progress} className="w-full"/>
                        <p className="text-sm text-gray-600 text-center">
                            {Math.round(progress)}% complete
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="w-full border-red-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-5 h-5"/>
                        Error Processing Photos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={processPhotosWithCaching} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2"/>
                        Retry
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Summary Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle>Photo Summary</CardTitle>
                    <CardDescription>
                        Found {photosWithExif.length} photos
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{employeeMap.size}</div>
                            <div className="text-sm text-blue-800">Employees Found</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {photosWithExif.filter(p => p.exif?.employeeName).length}
                            </div>
                            <div className="text-sm text-green-800">Photos with Employee Data</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">{unknownCount}</div>
                            <div className="text-sm text-orange-800">Photos without Employee Data</div>
                        </div>
                    </div>

                    {employeeMap.size > 0 && (
                        <div className="mt-4">
                            <h4 className="font-medium mb-2">Employees detected:</h4>
                            <div className="flex flex-wrap gap-2">
                                {Array.from(employeeMap.entries()).map(([name, count]) => (
                                    <Badge key={name} variant="secondary">
                                        {name} ({count})</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Photo Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Photo Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>File Name</TableHead>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Date Modified</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {photosWithExif.map((photo) => (
                                    <TableRow key={photo.path} className="cursor-pointer hover:bg-gray-50">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                {photo.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {photo.exif?.employeeName ? (
                                                <div className="flex items-center gap-1">
                                                    <User className="w-4 h-4 text-green-600"/>
                                                    <span className="text-green-700">{photo.exif.employeeName}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4 text-orange-500"/>
                                                    <span className="text-orange-600">Unknown</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <HardDrive className="w-4 h-4 text-gray-500"/>
                                                {formatFileSize(photo.size)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4 text-gray-500"/>
                                                {formatDate(photo.modified)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {photo.hasError ? (
                                                <Badge variant="destructive">Error</Badge>
                                            ) : photo.exif ? (
                                                <Badge variant="default">EXIF Read</Badge>
                                            ) : (
                                                <Badge variant="secondary">No EXIF</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onPhotoSelect?.(photo)}
                                            >
                                                <Eye className="w-4 h-4 mr-1"/>
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}