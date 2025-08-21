import {app, BrowserWindow, dialog, ipcMain} from 'electron'
import {fileURLToPath} from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'
import {glob} from 'glob'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
    win = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
        },
    })

    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString())
    })

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        // win.loadFile('dist/index.html')
        win.loadFile(path.join(RENDERER_DIST, 'index.html'))
    }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
        win = null
    }
})

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

app.whenReady().then(createWindow)

// IPC handlers for file operations
ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(win!, {
        properties: ['openDirectory'],
        title: 'Select folder containing photos'
    })

    if (result.canceled || result.filePaths.length === 0) {
        return null
    }

    return result.filePaths[0]
})

ipcMain.handle('discover-photos', async (_, folderPath: string) => {
    try {
        // Find all JPEG files in the selected folder
        const jpegPatterns = ['**/*.jpg', '**/*.jpeg', '**/*.JPG', '**/*.JPEG']
        const files: string[] = []

        for (const pattern of jpegPatterns) {
            const foundFiles = await glob(pattern, {
                cwd: folderPath,
                absolute: true,
                nodir: true
            })
            files.push(...foundFiles)
        }

        // Remove duplicates and sort
        const uniqueFiles = [...new Set(files)].sort()

        // Get file stats for each file
        const fileInfos = await Promise.all(
            uniqueFiles.map(async (filePath) => {
                try {
                    const stats = await fs.stat(filePath)
                    return {
                        path: filePath,
                        name: path.basename(filePath),
                        size: stats.size,
                        modified: stats.mtime.toISOString(),
                        directory: path.dirname(filePath)
                    }
                } catch (error) {
                    console.error(`Error reading file stats for ${filePath}:`, error)
                    return null
                }
            })
        )

        // Filter out any null results from failed stat operations
        return fileInfos.filter(info => info !== null)
    } catch (error) {
        console.error('Error discovering photos:', error)
        throw error
    }
})

ipcMain.handle('read-file-buffer', async (_, filePath: string) => {
    try {
        const buffer = await fs.readFile(filePath)
        return buffer
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error)
        throw error
    }
})

ipcMain.handle('file-exists', async (_, filePath: string) => {
    try {
        await fs.access(filePath)
        return true
    } catch {
        return false
    }
})

ipcMain.handle('read-json-file', async (_, filePath: string) => {
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
})

ipcMain.handle('write-json-file', async (_, filePath: string, data: any) => {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
})

ipcMain.handle('rename-file', async (_, oldPath: string, newPath: string) => {
    try {
        await fs.rename(oldPath, newPath)
        return { success: true }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
})

ipcMain.handle('batch-rename-files', async (_, operations: any[]) => {
    const results = []
    for (const op of operations) {
        try {
            await fs.rename(op.originalPath, op.newPath)
            results.push({ ...op, success: true })
        } catch (error) {
            results.push({ 
                ...op, 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error' 
            })
        }
    }
    return results
})

ipcMain.handle('check-file-exists', async (_, filePath: string) => {
    try {
        await fs.access(filePath)
        return true
    } catch {
        return false
    }
})
