import {Employee} from '../types/employee'
import {PhotoWithExif} from '../lib/exif'
import {Card, CardContent, CardHeader, CardTitle} from './ui/card'
import {Button} from './ui/button'
import {Badge} from './ui/badge'
import {PhotoThumbnail} from './PhotoThumbnail'
import {EmployeeService} from '../lib/employeeService'
import {CheckSquare, Mail, Square, User, FileText} from 'lucide-react'
import {toast} from 'sonner'

interface EmployeeCardProps {
    employee: Employee
    onPhotoSelect: (photo: PhotoWithExif) => void
    selectedPhotos?: Set<string>
    onPhotoToggle?: (photoPath: string) => void
    onSelectAll?: (employee: Employee) => void
    onDeselectAll?: (employee: Employee) => void
    onEmailEmployee?: (employee: Employee) => void
    pendingRenames?: number
}

export function EmployeeCard({
                                 employee,
                                 onPhotoSelect,
                                 selectedPhotos = new Set(),
                                 onPhotoToggle,
                                 onSelectAll,
                                 onDeselectAll,
                                 onEmailEmployee,
                                 pendingRenames = 0
                             }: EmployeeCardProps) {
    const selectedCount = employee.photos.filter(photo => selectedPhotos.has(photo.path)).length
    const allSelected = selectedCount === employee.photos.length

    const handleSelectToggle = () => {
        if (allSelected) {
            onDeselectAll?.(employee)
        } else {
            onSelectAll?.(employee)
        }
    }

    

    const handleEmail = () => {
        if (selectedCount === 0) {
            toast.warning('Please select photos to email')
            return
        }
        onEmailEmployee?.(employee)
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600"/>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <CardTitle>{employee.name}</CardTitle>
                                {pendingRenames > 0 && (
                                    <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
                                        <FileText className="w-3 h-3 mr-1" />
                                        {pendingRenames} to rename
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-gray-600">
                                {employee.photoCount} photos
                                • {EmployeeService.formatDateRange(employee.firstSeen, employee.lastSeen)}
                                {selectedCount > 0 && (
                                    <span className="ml-2 text-blue-600 font-medium">
                    ({selectedCount} selected)
                  </span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {onPhotoToggle && onSelectAll && onDeselectAll && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSelectToggle}
                                title={allSelected ? "Deselect all photos" : "Select all photos"}
                            >
                                {allSelected ? <Square className="w-4 h-4"/> : <CheckSquare className="w-4 h-4"/>}
                            </Button>
                        )}
                        {onEmailEmployee && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleEmail}
                                title="Email employee photos"
                            >
                                <Mail className="w-4 h-4"/>
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                    {employee.photos.slice(0, 20).map(photo => (
                        <PhotoThumbnail
                            key={photo.path}
                            photo={photo}
                            size={'md'}
                            onClick={() => onPhotoSelect(photo)}
                        />
                    ))}
                    {employee.photos.length > 20 && (
                        <div
                            className="aspect-square bg-gray-100 rounded flex items-center justify-center text-xs text-gray-600 border">
                            +{employee.photos.length - 20}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}