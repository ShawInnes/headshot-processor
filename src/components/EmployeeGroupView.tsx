import { useState } from 'react'
import { EmployeeGroup} from '../types/employee'
import { PhotoWithExif } from '../lib/exif'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { EmployeeCard } from './EmployeeCard'
import { UnknownPhotosCard } from './UnknownPhotosCard'
import { RenamePreviewDialog } from './RenamePreviewDialog'
import { NamingSettingsDialog } from './NamingSettingsDialog'
import { RenameProgressDialog } from './RenameProgressDialog'
import { FileRenamingService } from '../lib/file-renaming'
import { RenameOperation, NamingSettings } from '../types/renaming'
import { FolderCacheService } from '../lib/folder-cache'
import { FileText, Settings } from 'lucide-react'
import { toast } from 'sonner'

interface EmployeeGroupViewProps {
  employeeGroup: EmployeeGroup
  onPhotoSelect: (photo: PhotoWithExif) => void
  onFilesRenamed?: (renamedFiles: RenameOperation[]) => void
}

export function EmployeeGroupView({ employeeGroup, onPhotoSelect, onFilesRenamed }: EmployeeGroupViewProps) {
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [showNamingSettings, setShowNamingSettings] = useState(false)
  const [showRenameProgress, setShowRenameProgress] = useState(false)
  const [namingSettings, setNamingSettings] = useState<NamingSettings>(FileRenamingService.DEFAULT_SETTINGS)
  const [renameOperations, setRenameOperations] = useState<RenameOperation[]>([])
  const [renameHistory, setRenameHistory] = useState<RenameOperation[][]>([])

  const handleRenameConfirm = async (operations: RenameOperation[]) => {
    setRenameOperations(operations)
    setShowRenameDialog(false)
    setShowRenameProgress(true)
  }

  const handleStartRename = async (): Promise<RenameOperation[]> => {
    try {
      const results = await window.electronAPI.batchRenameFiles(renameOperations)
      
      // Update cache with new file paths if any were successful
      const successfulOps = results.filter((r: any) => r.success)
      if (successfulOps.length > 0 && employeeGroup.employees.length > 0) {
        const folderPath = employeeGroup.employees[0].photos[0]?.directory
        if (folderPath) {
          await updateCacheAfterRename(folderPath, successfulOps)
        }
      }
      
      // Notify parent component
      if (onFilesRenamed && successfulOps.length > 0) {
        onFilesRenamed(successfulOps)
      }
      
      setRenameHistory(prev => [...prev, successfulOps])
      
      const failedCount = results.length - successfulOps.length
      if (failedCount === 0) {
        toast.success(`Successfully renamed ${successfulOps.length} files`)
      } else {
        toast.warning(`Renamed ${successfulOps.length} files, ${failedCount} failed`)
      }
      
      return results
      
    } catch (error) {
      toast.error('Failed to rename files: ' + (error instanceof Error ? error.message : 'Unknown error'))
      throw error
    }
  }

  const handleUndo = async (operations: RenameOperation[]) => {
    try {
      const undoOperations = FileRenamingService.generateUndoOperations(operations)
      await window.electronAPI.batchRenameFiles(undoOperations)
      
      // Update cache
      if (employeeGroup.employees.length > 0) {
        const folderPath = employeeGroup.employees[0].photos[0]?.directory
        if (folderPath) {
          await updateCacheAfterRename(folderPath, undoOperations)
        }
      }
      
      setRenameHistory(prev => prev.slice(0, -1))
      toast.success('Rename operations undone')
    } catch (error) {
      toast.error('Failed to undo rename operations')
    }
  }

  const updateCacheAfterRename = async (folderPath: string, operations: RenameOperation[]) => {
    try {
      const cache = await FolderCacheService.loadCache(folderPath)
      if (!cache) return
      
      // Create path mapping
      const pathMappings = new Map<string, string>()
      operations.forEach(op => {
        pathMappings.set(op.originalName, op.newName)
      })
      
      // Update file entries with new names
      const updatedFiles: typeof cache.files = {}
      for (const [fileName, fileInfo] of Object.entries(cache.files)) {
        const newName = pathMappings.get(fileName) || fileName
        updatedFiles[newName] = fileInfo
      }
      
      cache.files = updatedFiles
      cache.lastScan = new Date().toISOString()
      
      await FolderCacheService.saveCache(folderPath, cache)
    } catch (error) {
      console.error('Failed to update cache after rename:', error)
    }
  }

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
          
          {/* Rename Actions */}
          <div className="mt-6 flex gap-3 justify-center">
            <Button
              onClick={() => setShowRenameDialog(true)}
              disabled={employeeGroup.employees.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              Rename Files by Employee
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowNamingSettings(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Naming Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employee Groups */}
      {employeeGroup.employees.map(employee => (
        <EmployeeCard 
          key={employee.id}
          employee={employee}
          onPhotoSelect={onPhotoSelect}
        />
      ))}
      
      {/* Unknown Photos */}
      <UnknownPhotosCard 
        photos={employeeGroup.unknownPhotos}
      />
      
      {/* Rename Dialogs */}
      <RenamePreviewDialog
        open={showRenameDialog}
        onOpenChange={setShowRenameDialog}
        employeeGroup={employeeGroup}
        namingSettings={namingSettings}
        onConfirmRename={handleRenameConfirm}
      />
      
      <NamingSettingsDialog
        open={showNamingSettings}
        onOpenChange={setShowNamingSettings}
        currentSettings={namingSettings}
        onSettingsChange={setNamingSettings}
      />
      
      <RenameProgressDialog
        open={showRenameProgress}
        onOpenChange={setShowRenameProgress}
        operations={renameOperations}
        onStartRename={handleStartRename}
        onUndo={renameHistory.length > 0 ? handleUndo : undefined}
      />
    </div>
  )
}