import { EmployeeGroup } from '../types/employee'
import { RenameOperation, RenamePreview, RenameConflict, NamingSettings } from '../types/renaming'

export class FileRenamingService {
  static readonly DEFAULT_SETTINGS: NamingSettings = {
    pattern: '{employeeName}_{number:003}',
    numberPadding: 3,
    caseHandling: 'lowercase',
    specialCharReplacement: '_',
    conflictResolution: 'append'
  }

  /**
   * Generate rename preview without executing
   */
  static generateRenamePreview(employeeGroup: EmployeeGroup, settings: NamingSettings = this.DEFAULT_SETTINGS): RenamePreview {
    const operations: RenameOperation[] = []
    const alreadyRenamed: RenameOperation[] = []
    const affectedEmployees: string[] = []

    // Process each employee's photos
    employeeGroup.employees.forEach(employee => {
      affectedEmployees.push(employee.name)
      
      employee.photos.forEach((photo, index) => {
        const sequenceNumber = index + 1
        const originalExtension = this.getFileExtension(photo.name)
        const newName = this.generateEmployeeFilename(employee.name, sequenceNumber, originalExtension, settings)
        const newPath = photo.path.replace(photo.name, newName)

        const operation: RenameOperation = {
          originalPath: photo.path,
          newPath,
          originalName: photo.name,
          newName,
          employeeName: employee.name,
          sequenceNumber
        }

        // Check if file is already properly named
        if (photo.name === newName) {
          alreadyRenamed.push(operation)
        } else {
          operations.push(operation)
        }
      })
    })

    // Detect conflicts only for files that need renaming
    const conflicts = this.detectNamingConflicts(operations)

    return {
      operations,
      conflicts,
      alreadyRenamed,
      totalFiles: operations.length + alreadyRenamed.length,
      affectedEmployees
    }
  }

  /**
   * Generate employee-specific filename
   */
  static generateEmployeeFilename(employeeName: string, sequenceNumber: number, originalExtension: string, settings: NamingSettings): string {
    let cleanName = this.cleanEmployeeName(employeeName, settings)
    let paddedNumber = sequenceNumber.toString().padStart(settings.numberPadding, '0')
    
    // Replace pattern placeholders
    let filename = settings.pattern
      .replace('{employeeName}', cleanName)
      .replace(/{number:(\d+)}/g, (_, padding) => {
        const padLength = parseInt(padding) || settings.numberPadding
        return sequenceNumber.toString().padStart(padLength, '0')
      })
      .replace('{number}', paddedNumber)

    return filename + originalExtension
  }

  /**
   * Clean employee name for filename use
   */
  static cleanEmployeeName(name: string, settings: NamingSettings): string {
    let cleaned = name
    
    // Handle case
    switch (settings.caseHandling) {
      case 'lowercase':
        cleaned = cleaned.toLowerCase()
        break
      case 'uppercase':
        cleaned = cleaned.toUpperCase()
        break
      case 'title':
        cleaned = cleaned.replace(/\w\S*/g, (txt) => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        )
        break
      // 'preserve' does nothing
    }

    // Replace special characters
    cleaned = cleaned.replace(/[^a-zA-Z0-9]/g, settings.specialCharReplacement)
    
    // Remove multiple consecutive replacement chars
    const replacementChar = settings.specialCharReplacement
    const multiplePattern = new RegExp(`${replacementChar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}{2,}`, 'g')
    cleaned = cleaned.replace(multiplePattern, replacementChar)
    
    // Remove leading/trailing replacement chars
    cleaned = cleaned.replace(new RegExp(`^${replacementChar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}+|${replacementChar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}+$`, 'g'), '')

    return cleaned
  }

  /**
   * Check for naming conflicts
   */
  static detectNamingConflicts(operations: RenameOperation[]): RenameConflict[] {
    const conflicts: RenameConflict[] = []
    const nameCount = new Map<string, string[]>()

    // Group operations by new filename
    operations.forEach(op => {
      const newName = op.newName.toLowerCase()
      if (!nameCount.has(newName)) {
        nameCount.set(newName, [])
      }
      nameCount.get(newName)!.push(op.originalName)
    })

    // Find duplicates
    nameCount.forEach((originalFiles, newName) => {
      if (originalFiles.length > 1) {
        conflicts.push({
          newPath: newName,
          conflictingFiles: originalFiles,
          suggestedResolution: `Append sequence numbers: ${newName.replace(/(\.[^.]+)$/, '_1$1')}, ${newName.replace(/(\.[^.]+)$/, '_2$1')}, etc.`,
          type: 'duplicate'
        })
      }
    })

    return conflicts
  }

  /**
   * Resolve conflicts by appending numbers
   */
  static resolveConflicts(operations: RenameOperation[], conflicts: RenameConflict[]): RenameOperation[] {
    const resolved = [...operations]
    const nameCount = new Map<string, number>()

    conflicts.forEach(conflict => {
      if (conflict.type === 'duplicate') {
        // Find operations that have this conflict
        const conflictingOps = resolved.filter(op => 
          op.newName.toLowerCase() === conflict.newPath.toLowerCase()
        )

        // Rename them with sequence numbers
        conflictingOps.forEach((op, index) => {
          if (index > 0) { // Keep first one as-is, modify others
            const baseName = op.newName.replace(/(\.[^.]+)$/, '')
            const extension = this.getFileExtension(op.newName)
            const newName = `${baseName}_${index + 1}${extension}`
            
            op.newName = newName
            op.newPath = op.originalPath.replace(op.originalName, newName)
          }
        })
      }
    })

    return resolved
  }

  /**
   * Generate undo operations
   */
  static generateUndoOperations(completedOperations: RenameOperation[]): RenameOperation[] {
    return completedOperations
      .filter(op => op.success)
      .map(op => ({
        originalPath: op.newPath,
        newPath: op.originalPath,
        originalName: op.newName,
        newName: op.originalName,
        employeeName: op.employeeName,
        sequenceNumber: op.sequenceNumber
      }))
  }

  /**
   * Get file extension including the dot
   */
  static getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.')
    return lastDot === -1 ? '' : filename.substring(lastDot)
  }

  /**
   * Validate filename for the current OS
   */
  static isValidFilename(filename: string): boolean {
    // Windows invalid characters
    const invalidChars = /[<>:"|?*]/
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..+)?$/i
    
    return !invalidChars.test(filename) && 
           !reservedNames.test(filename) &&
           filename.length > 0 &&
           filename.length <= 255 &&
           !filename.startsWith('.') &&
           !filename.endsWith('.')
  }
}