import { useState } from 'react'
import { Employee } from '../types/employee'
import { PhotoWithExif } from '../lib/exif'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { PhotoThumbnail } from './PhotoThumbnail'
import { RenameInput } from './RenameInput'
import { EmployeeService } from '../lib/employeeService'
import { User, Edit, Download, CheckSquare, Square, Mail } from 'lucide-react'
import { toast } from 'sonner'

interface EmployeeCardProps {
  employee: Employee
  onPhotoSelect: (photo: PhotoWithExif) => void
  onRename?: (employee: Employee, newName: string) => void
  selectedPhotos?: Set<string>
  onPhotoToggle?: (photoPath: string) => void
  onSelectAll?: (employee: Employee) => void
  onDeselectAll?: (employee: Employee) => void
  onExportEmployee?: (employee: Employee) => void
  onEmailEmployee?: (employee: Employee) => void
}

export function EmployeeCard({
  employee,
  onPhotoSelect,
  onRename,
  selectedPhotos = new Set(),
  onPhotoToggle,
  onSelectAll,
  onDeselectAll,
  onExportEmployee,
  onEmailEmployee
}: EmployeeCardProps) {
  const [isRenaming, setIsRenaming] = useState(false)

  const handleRename = (newName: string) => {
    if (onRename) {
      onRename(employee, newName)
    }
    setIsRenaming(false)
  }

  const selectedCount = employee.photos.filter(photo => selectedPhotos.has(photo.path)).length
  const allSelected = selectedCount === employee.photos.length

  const handleSelectToggle = () => {
    if (allSelected) {
      onDeselectAll?.(employee)
    } else {
      onSelectAll?.(employee)
    }
  }

  const handleExport = () => {
    if (selectedCount === 0) {
      toast.warning('Please select photos to export')
      return
    }
    onExportEmployee?.(employee)
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
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              {isRenaming ? (
                <RenameInput 
                  currentName={employee.name}
                  onSave={handleRename}
                  onCancel={() => setIsRenaming(false)}
                />
              ) : (
                <CardTitle>{employee.name}</CardTitle>
              )}
              <p className="text-sm text-gray-600">
                {employee.photoCount} photos • {EmployeeService.formatDateRange(employee.firstSeen, employee.lastSeen)}
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
                {allSelected ? <Square className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
            </Button>
          )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRenaming(true)}
              disabled={isRenaming}
            >
              <Edit className="w-4 h-4" />
            </Button>
            {onEmailEmployee && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEmail}
                title="Email employee photos"
              >
                <Mail className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              title="Export employee photos"
            >
              <Download className="w-4 h-4" />
            </Button>
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
            <div className="aspect-square bg-gray-100 rounded flex items-center justify-center text-xs text-gray-600 border">
              +{employee.photos.length - 20}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}