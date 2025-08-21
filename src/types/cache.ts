import { ExifData } from '../lib/exif'

export interface FolderCache {
  version: string
  folderPath: string
  lastScan: string
  totalFiles: number
  files: {
    [fileName: string]: {
      size: number
      modified: string
      checksum?: string
      exifData: ExifData | null
      hasError: boolean
      errorMessage?: string
      processed: string
    }
  }
  employees: {
    [employeeId: string]: {
      id: string
      name: string
      photoCount: number
      photoFiles: string[] // Array of filenames
      firstSeen: string
      lastSeen: string
    }
  }
  unknownPhotos: string[] // Array of filenames
}