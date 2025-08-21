import { PhotoFile } from '../types/electron'
import { FolderCache } from '../types/cache'
import path from 'path'

export class FolderCacheService {
  private static CACHE_FILENAME = 'headshots.json'
  
  static getCachePath(folderPath: string): string {
    return path.join(folderPath, this.CACHE_FILENAME)
  }
  
  static async cacheExists(folderPath: string): Promise<boolean> {
    const cachePath = this.getCachePath(folderPath)
    return await window.electronAPI.fileExists(cachePath)
  }
  
  static async loadCache(folderPath: string): Promise<FolderCache | null> {
    try {
      const cachePath = this.getCachePath(folderPath)
      const cacheData = await window.electronAPI.readJsonFile(cachePath)
      return cacheData as FolderCache
    } catch (error) {
      console.warn('Failed to load cache:', error)
      return null
    }
  }
  
  static async saveCache(folderPath: string, cache: FolderCache): Promise<void> {
    const cachePath = this.getCachePath(folderPath)
    await window.electronAPI.writeJsonFile(cachePath, cache)
  }
  
  // Check if cache needs updating by comparing file modifications
  static async needsUpdate(folderPath: string, currentFiles: PhotoFile[]): Promise<boolean> {
    const cache = await this.loadCache(folderPath)
    if (!cache) return true
    
    // Check if any files are new or modified
    for (const file of currentFiles) {
      const cachedFile = cache.files[file.name]
      if (!cachedFile || 
          cachedFile.size !== file.size || 
          cachedFile.modified !== file.modified) {
        return true
      }
    }
    
    // Check if any cached files no longer exist
    const currentFileNames = new Set(currentFiles.map(f => f.name))
    for (const cachedFileName of Object.keys(cache.files)) {
      if (!currentFileNames.has(cachedFileName)) {
        return true
      }
    }
    
    return false
  }
  
  static createEmptyCache(folderPath: string): FolderCache {
    return {
      version: "1.0.0",
      folderPath,
      lastScan: new Date().toISOString(),
      totalFiles: 0,
      files: {},
      employees: {},
      unknownPhotos: []
    }
  }
}