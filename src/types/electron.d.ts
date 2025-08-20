export interface IElectronAPI {
  selectFolder: () => Promise<string | null>
  discoverPhotos: (folderPath: string) => Promise<PhotoFile[]>
  readFileBuffer: (filePath: string) => Promise<Buffer>
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