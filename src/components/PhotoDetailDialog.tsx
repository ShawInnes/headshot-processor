import {useEffect, useState} from 'react'
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from './ui/dialog'
import {Badge} from './ui/badge'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from './ui/card'
import {ScrollArea} from './ui/scroll-area'
import {formatDate, formatFileSize, PhotoWithExif} from '../lib/exif'
import {AlertCircle, Camera, FileText, Image, User} from 'lucide-react'

interface PhotoDetailDialogProps {
    photo: PhotoWithExif | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function PhotoDetailDialog({photo, open, onOpenChange}: PhotoDetailDialogProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [imageError, setImageError] = useState(false)

    useEffect(() => {
        if (photo && open) {
            // Create a file URL for the image preview
            setImageUrl(`file://${photo.path}`)
            setImageError(false)
        } else {
            setImageUrl(null)
            setImageError(false)
        }
    }, [photo, open])

    if (!photo) return null

    const exif = photo.exif
    console.log(exif)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Image className="w-5 h-5"/>
                        {photo.name}
                    </DialogTitle>
                    <DialogDescription>
                        Photo details and metadata
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-6">
                    <div className="space-y-6">
                        {/* Image Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Preview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {imageUrl && !imageError ? (
                                    <img
                                        src={imageUrl}
                                        alt={photo.name}
                                        className="w-full h-auto max-h-64 object-contain rounded-lg border"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <div
                                        className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <div className="text-center text-gray-500">
                                            <AlertCircle className="w-8 h-8 mx-auto mb-2"/>
                                            <p className="text-sm">Unable to load preview</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* File Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FileText className="w-4 h-4"/>
                                    File Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-600">Size:</span>
                                        <p>{formatFileSize(photo.size)}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Modified:</span>
                                        <p>{formatDate(photo.modified)}</p>
                                    </div>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600">Path:</span>
                                    <p className="text-xs text-gray-500 break-all">{photo.path}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-600">Status:</span>
                                    {photo.hasError ? (
                                        <Badge variant="destructive">Error</Badge>
                                    ) : exif ? (
                                        <Badge variant="default">EXIF Available</Badge>
                                    ) : (
                                        <Badge variant="secondary">No EXIF Data</Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* EXIF Data Section */}
                        {photo.hasError ? (
                            <Card className="border-red-200">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2 text-red-700">
                                        <AlertCircle className="w-4 h-4"/>
                                        Error Reading Metadata
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-red-600 text-sm">{photo.errorMessage}</p>
                                </CardContent>
                            </Card>
                        ) : exif ? (
                            <>
                                {/* Employee Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <User className="w-4 h-4"/>
                                            Employee Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {exif.employeeName ? (
                                            <div className="flex items-center gap-2">
                                                <Badge variant="default">{exif.employeeName}</Badge>
                                            </div>
                                        ) : (
                                            <p className="text-orange-600 text-sm flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4"/>
                                                No employee name found in metadata
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Camera Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Camera className="w-4 h-4"/>
                                            Camera Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="grid grid-cols-1 gap-2 text-sm">
                                            {exif.make && (
                                                <div>
                                                    <span className="font-medium text-gray-600">Make:</span>
                                                    <span className="ml-2">{exif.make}</span>
                                                </div>
                                            )}
                                            {exif.model && (
                                                <div>
                                                    <span className="font-medium text-gray-600">Model:</span>
                                                    <span className="ml-2">{exif.model}</span>
                                                </div>
                                            )}
                                            {exif.software && (
                                                <div>
                                                    <span className="font-medium text-gray-600">Software:</span>
                                                    <span className="ml-2">{exif.software}</span>
                                                </div>
                                            )}
                                            {exif.dateTime && (
                                                <div>
                                                    <span className="font-medium text-gray-600">Date Taken:</span>
                                                    <span className="ml-2">{formatDate(exif.dateTime)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Image Properties */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Image className="w-4 h-4"/>
                                            Image Properties
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        {(exif.imageWidth && exif.imageHeight) && (
                                            <div>
                                                <span className="font-medium text-gray-600">Dimensions:</span>
                                                <span
                                                    className="ml-2">{exif.imageWidth} × {exif.imageHeight} pixels</span>
                                            </div>
                                        )}
                                        {exif.orientation && (
                                            <div>
                                                <span className="font-medium text-gray-600">Orientation:</span>
                                                <span className="ml-2">{exif.orientation}</span>
                                            </div>
                                        )}
                                        {(exif.xResolution && exif.yResolution) && (
                                            <div>
                                                <span className="font-medium text-gray-600">Resolution:</span>
                                                <span
                                                    className="ml-2">{exif.xResolution} × {exif.yResolution} DPI</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* All EXIF Data */}
                                {exif._raw && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">All Metadata</CardTitle>
                                            <CardDescription>
                                                Complete EXIF data (for debugging)
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ScrollArea className="h-32 w-full rounded border p-2">
                        <pre className="text-xs">
                          {JSON.stringify(exif._raw, null, 2)}
                        </pre>
                                            </ScrollArea>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4"/>
                                        No Metadata Available
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 text-sm">
                                        This file does not contain EXIF metadata or the metadata could not be read.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}