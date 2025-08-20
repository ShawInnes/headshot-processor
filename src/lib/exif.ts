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
    exif: ExifData | null | undefined
    hasError: boolean
    errorMessage?: string
}

export async function readExifData(buffer: ArrayBuffer): Promise<ExifData | null | undefined> {
    try {
        const exifData = await exifr.parse(buffer, {
            // Parse all available EXIF data
            tiff: true,
            exif: true,
            gps: false,
            interop: true,
            ifd1: true,
            // Include maker notes which might contain employee information
            makerNote: false,
            userComment: true,
            // Parse XMP data which might contain custom metadata
            xmp: false,
            // Parse IPTC data which might contain keywords or descriptions
            iptc: false
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

        // Look for employee name in userComment field
        if (exifData.userComment) {
            let userCommentText = ''
            if (exifData.userComment instanceof Uint8Array) {
                // Convert Uint8Array to string, handling ASCII encoding prefix
                const decoder = new TextDecoder('utf-8')
                userCommentText = decoder.decode(exifData.userComment)
            } else if (typeof exifData.userComment === 'string') {
                userCommentText = exifData.userComment
            }

            // Extract employee name if it follows the pattern "Employee Name: [name]"
            const employeeMatch = userCommentText.match(/Employee Name:\s*(.+)/i)
            if (employeeMatch) {
                result.employeeName = employeeMatch[1].trim()
            }

            result.userComment = userCommentText
        }

        return result;
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