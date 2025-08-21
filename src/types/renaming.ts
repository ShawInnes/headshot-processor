export interface RenameOperation {
  originalPath: string
  newPath: string
  originalName: string
  newName: string
  employeeName: string
  sequenceNumber: number
  success?: boolean
  error?: string
}

export interface RenamePreview {
  operations: RenameOperation[]
  conflicts: RenameConflict[]
  alreadyRenamed: RenameOperation[]
  totalFiles: number
  affectedEmployees: string[]
}

export interface RenameConflict {
  newPath: string
  conflictingFiles: string[]
  suggestedResolution: string
  type: 'duplicate' | 'invalid_chars' | 'too_long' | 'exists'
}

export interface RenameResult {
  operation: RenameOperation
  success: boolean
  error?: string
}

export interface NamingSettings {
  pattern: string // e.g., '{employeeName}_{number:003}'
  numberPadding: number
  caseHandling: 'lowercase' | 'uppercase' | 'title' | 'preserve'
  specialCharReplacement: string
  conflictResolution: 'skip' | 'append' | 'overwrite' | 'manual'
}