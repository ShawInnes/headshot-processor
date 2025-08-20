import exifr from 'exifr'

export interface ExifData {
    employeeName?: string
    dateTime?: string
    make?: string
    model?: string
    software?: string
    orientation?: number
    imageWidth?: number
    imageHeight?: number
    xResolution?: number
    yResolution?: number
    resolutionUnit?: number

    [key: string]: any
}

export interface PhotoWithExif {
    path: string
    name: string
    size: number
    modified: string
    directory: string
    exif: ExifData | null
    hasError: boolean
    errorMessage?: string
}

export async function readExifData(buffer: ArrayBuffer): Promise<ExifData | null> {
    try {
        const exifData = await exifr.parse(buffer, {
            // Parse all available EXIF data
            tiff: true,
            exif: true,
            gps: false,
            interop: true,
            ifd1: true,
            // Include maker notes which might contain employee information
            makerNote: true,
            userComment: true,
            // Parse XMP data which might contain custom metadata
            xmp: true,
            // Parse IPTC data which might contain keywords or descriptions
            iptc: true
        })

        if (!exifData) {
            return null
        }

        // Extract common fields and look for employee name in various places
        const result: ExifData = {
            dateTime: exifData.DateTime || exifData.DateTimeOriginal || exifData.DateTimeDigitized,
            make: exifData.Make,
            model: exifData.Model,
            software: exifData.Software,
            orientation: exifData.Orientation,
            imageWidth: exifData.ImageWidth || exifData.PixelXDimension,
            imageHeight: exifData.ImageLength || exifData.PixelYDimension,
            xResolution: exifData.XResolution,
            yResolution: exifData.YResolution,
            resolutionUnit: exifData.ResolutionUnit
        }

        // Look for employee name in various possible fields
        const possibleEmployeeFields = [
            'UserComment',
        ]

        for (const field of possibleEmployeeFields) {
            if (exifData[field] && typeof exifData[field] === 'string' && exifData[field].trim()) {
                result.employeeName = exifData[field].trim()
                break
            }
        }

        // Store all raw EXIF data for debugging purposes
        result._raw = exifData

        return result
    } catch (error) {
        console.error('Error reading EXIF data:', error)
        return null
    }
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDate(dateString: string): string {
    try {
        return new Date(dateString).toLocaleString()
    } catch {
        return dateString
    }
}