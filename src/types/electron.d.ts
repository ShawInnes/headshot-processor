export interface IElectronAPI {
  selectFolder: () => Promise<string | null>
  discoverPhotos: (folderPath: string) => Promise<PhotoFile[]>
  readFileBuffer: (filePath: string) => Promise<Buffer>
  fileExists: (filePath: string) => Promise<boolean>
  readJsonFile: (filePath: string) => Promise<any>
  writeJsonFile: (filePath: string, data: any) => Promise<void>
  renameFile: (oldPath: string, newPath: string) => Promise<{ success: boolean; error?: string }>
  batchRenameFiles: (operations: any[]) => Promise<any[]>
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