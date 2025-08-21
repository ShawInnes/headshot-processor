export interface IElectronAPI {
  selectFolder: () => Promise<string | null>
  discoverPhotos: (folderPath: string) => Promise<PhotoFile[]>
  readFileBuffer: (filePath: string) => Promise<Buffer>
  fileExists: (filePath: string) => Promise<boolean>
  readJsonFile: (filePath: string) => Promise<object>
  writeJsonFile: (filePath: string, data: object) => Promise<void>
  renameFile: (oldPath: string, newPath: string) => Promise<{ success: boolean; error?: string }>
  batchRenameFiles: (operations: RenameOperation[]) => Promise<RenameOperation[]>
  checkFileExists: (filePath: string) => Promise<boolean>
  sendEmployeeEmail: (emailData: { to: string, employeeName: string, photoFiles: string[] }) => 
    Promise<{ success: boolean; messageId?: string; error?: string }>
}

export interface PhotoFile {
  path: string
  name: string
  size: number
  modified: string
  directory: string
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}