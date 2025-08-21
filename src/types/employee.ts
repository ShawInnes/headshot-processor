import { PhotoWithExif } from '../lib/exif'

export interface Employee {
  id: string // Generated from name
  name: string
  photoCount: number
  photos: PhotoWithExif[]
  firstSeen: Date
  lastSeen: Date
}

export interface EmployeeGroup {
  employees: Employee[]
  unknownPhotos: PhotoWithExif[]
  totalPhotos: number
  employeeCount: number
}