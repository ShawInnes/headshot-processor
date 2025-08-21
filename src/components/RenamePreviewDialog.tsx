import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { Separator } from './ui/separator'
import { AlertTriangle, FileText, Users, CheckCircle, XCircle } from 'lucide-react'
import { EmployeeGroup } from '../types/employee'
import { RenameOperation, RenamePreview, NamingSettings } from '../types/renaming'
import { FileRenamingService } from '../lib/file-renaming'

interface RenamePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeGroup: EmployeeGroup
  namingSettings: NamingSettings
  onConfirmRename: (operations: RenameOperation[]) => void
}

export function RenamePreviewDialog({ 
  open, 
  onOpenChange, 
  employeeGroup, 
  namingSettings,
  onConfirmRename 
}: RenamePreviewDialogProps) {
  const [preview, setPreview] = useState<RenamePreview | null>(null)
  const [resolvedOperations, setResolvedOperations] = useState<RenameOperation[]>([])

  useEffect(() => {
    if (open && employeeGroup) {
      const generatedPreview = FileRenamingService.generateRenamePreview(employeeGroup, namingSettings)
      setPreview(generatedPreview)
      
      // Auto-resolve conflicts
      const resolved = FileRenamingService.resolveConflicts(generatedPreview.operations, generatedPreview.conflicts)
      setResolvedOperations(resolved)
    }
  }, [open, employeeGroup, namingSettings])

  const handleConfirm = () => {
    if (resolvedOperations.length > 0) {
      onConfirmRename(resolvedOperations)
      onOpenChange(false)
    }
  }

  if (!preview) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Rename Preview
          </DialogTitle>
          <DialogDescription>
            Review the proposed file renames before applying changes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{preview.totalFiles}</div>
              <div className="text-sm text-blue-800">Files to Rename</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{preview.affectedEmployees.length}</div>
              <div className="text-sm text-green-800">Employees</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">{preview.conflicts.length}</div>
              <div className="text-sm text-orange-800">Conflicts</div>
            </div>
          </div>

          {/* Conflicts Alert */}
          {preview.conflicts.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {preview.conflicts.length} naming conflicts detected and automatically resolved by appending sequence numbers.
              </AlertDescription>
            </Alert>
          )}

          {/* Employee Groups */}
          <ScrollArea className="h-[400px] border rounded-lg p-4">
            <div className="space-y-6">
              {employeeGroup.employees.map((employee, employeeIndex) => (
                <div key={employee.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium">{employee.name}</h4>
                    <Badge variant="secondary">{employee.photos.length} files</Badge>
                  </div>
                  
                  <div className="space-y-1 ml-6">
                    {employee.photos.map((photo, photoIndex) => {
                      const operation = resolvedOperations.find(op => op.originalPath === photo.path)
                      if (!operation) return null

                      const hasConflict = preview.conflicts.some(conflict => 
                        conflict.conflictingFiles.includes(operation.originalName)
                      )

                      return (
                        <div key={photo.path} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded text-sm">
                          <div className="flex-1">
                            <div className="font-mono text-gray-600">{operation.originalName}</div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">→</span>
                              <div className={`font-mono ${hasConflict ? 'text-orange-600' : 'text-green-600'}`}>
                                {operation.newName}
                              </div>
                              {hasConflict && (
                                <Badge variant="outline" className="text-xs">
                                  Auto-resolved
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {employeeIndex < employeeGroup.employees.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Naming Pattern Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">
              <strong>Naming Pattern:</strong> {namingSettings.pattern}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Case Handling:</strong> {namingSettings.caseHandling}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Special Characters:</strong> Replace with "{namingSettings.specialCharReplacement}"
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={resolvedOperations.length === 0}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Rename {resolvedOperations.length} Files
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}