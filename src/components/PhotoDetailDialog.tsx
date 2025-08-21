import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from './ui/dialog'
import {Badge} from './ui/badge'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from './ui/card'
import {ScrollArea} from './ui/scroll-area'
import {formatDate, formatFileSize, PhotoWithExif} from '../lib/exif'
import {useImageLoader} from '../hooks/useImageLoader'
import {AlertCircle, Camera, FileText, Image, User} from 'lucide-react'

interface PhotoDetailDialogProps {
    photo: PhotoWithExif | null
    open: boolean
    onOpenChange: (open: boolean) => void
}


export function PhotoDetailDialog({photo, open, onOpenChange}: PhotoDetailDialogProps) {
    const {imageUrl, isLoading: imageLoading, hasError: imageError} = useImageLoader({
        photo,
        enabled: open,
        onError: (error) => console.error('Detail image load error:', error)
    })

    if (!photo) return null

    const exif = photo.exif

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col">
                {/* Fixed Header */}
                <div className="p-6 pb-4 border-b">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <Image className="w-5 h-5"/>
                            {photo.name}
                        </DialogTitle>
                        <DialogDescription>
                            Photo details and metadata
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Scrollable Content */}

                <div className="flex-1 min-h-0 overflow-x-auto">
                    <ScrollArea className="h-full">
                        <div className="p-6 pt-4 space-y-6">
                            {/* Image Preview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Preview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {imageLoading ? (
                                        <div
                                            className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <div className="text-center text-gray-500">
                                                <div
                                                    className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto mb-2"></div>
                                                <p className="text-sm">Loading image...</p>
                                            </div>
                                        </div>
                                    ) : imageUrl && !imageError ? (
                                        <img
                                            src={imageUrl}
                                            alt={photo.name}
                                            className="w-full h-auto max-h-64 object-contain rounded-lg border"
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
                                                    <pre className="text-xs whitespace-pre-wrap">
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
                </div>
            </DialogContent>
        </Dialog>
    )
}