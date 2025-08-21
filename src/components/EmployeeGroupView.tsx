import { EmployeeGroup, Employee } from '../types/employee'
import { PhotoWithExif } from '../lib/exif'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { EmployeeCard } from './EmployeeCard'
import { UnknownPhotosCard } from './UnknownPhotosCard'

interface EmployeeGroupViewProps {
  employeeGroup: EmployeeGroup
  onPhotoSelect: (photo: PhotoWithExif) => void
  onEmployeeRename?: (employee: Employee, newName: string) => void
}

export function EmployeeGroupView({ employeeGroup, onPhotoSelect, onEmployeeRename }: EmployeeGroupViewProps) {
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Summary</CardTitle>
          <CardDescription>
            Overview of detected employees and photo distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{employeeGroup.employeeCount}</div>
              <div className="text-sm text-blue-800">Employees</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {employeeGroup.totalPhotos - employeeGroup.unknownPhotos.length}
              </div>
              <div className="text-sm text-green-800">Assigned Photos</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{employeeGroup.unknownPhotos.length}</div>
              <div className="text-sm text-orange-800">Unassigned Photos</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{employeeGroup.totalPhotos}</div>
              <div className="text-sm text-purple-800">Total Photos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Groups */}
      {employeeGroup.employees.map(employee => (
        <EmployeeCard 
          key={employee.id}
          employee={employee}
          onPhotoSelect={onPhotoSelect}
          onRename={onEmployeeRename}
        />
      ))}
      
      {/* Unknown Photos */}
      <UnknownPhotosCard 
        photos={employeeGroup.unknownPhotos}
        onPhotoSelect={onPhotoSelect}
      />
    </div>
  )
}