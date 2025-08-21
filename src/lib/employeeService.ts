import {PhotoWithExif} from './exif'
import {Employee, EmployeeGroup} from '../types/employee'

export class EmployeeService {
    static groupPhotosByEmployee(photos: PhotoWithExif[]): EmployeeGroup {
        const employeeMap = new Map<string, Employee>()
        const unknownPhotos: PhotoWithExif[] = []

        photos.forEach(photo => {
            const employeeName = photo.exif?.employeeName

            if (employeeName) {
                const employeeId = this.generateEmployeeId(employeeName)

                if (!employeeMap.has(employeeId)) {
                    employeeMap.set(employeeId, {
                        id: employeeId,
                        name: employeeName,
                        photoCount: 0,
                        photos: [],
                        firstSeen: new Date(photo.modified),
                        lastSeen: new Date(photo.modified)
                    })
                }

                const employee = employeeMap.get(employeeId)!
                employee.photos.push(photo)
                employee.photoCount++

                // Update date range
                const photoDate = new Date(photo.modified)
                if (photoDate < employee.firstSeen) employee.firstSeen = photoDate
                if (photoDate > employee.lastSeen) employee.lastSeen = photoDate
            } else {
                unknownPhotos.push(photo)
            }
        })

        return {
            employees: Array.from(employeeMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
            unknownPhotos,
            totalPhotos: photos.length,
            employeeCount: employeeMap.size
        }
    }

    static generateEmployeeId(name: string): string {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    }

    static formatDateRange(firstSeen: Date, lastSeen: Date): string {
        const first = firstSeen.toLocaleDateString()
        const last = lastSeen.toLocaleDateString()

        if (first === last) {
            return first
        }

        return `${first} - ${last}`
    }
}