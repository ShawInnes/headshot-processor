"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // ...
});
electron.contextBridge.exposeInMainWorld("electronAPI", {
  selectFolder: () => electron.ipcRenderer.invoke("select-folder"),
  discoverPhotos: (folderPath) => electron.ipcRenderer.invoke("discover-photos", folderPath),
  readFileBuffer: (filePath) => electron.ipcRenderer.invoke("read-file-buffer", filePath),
  fileExists: (filePath) => electron.ipcRenderer.invoke("file-exists", filePath),
  readJsonFile: (filePath) => electron.ipcRenderer.invoke("read-json-file", filePath),
  writeJsonFile: (filePath, data) => electron.ipcRenderer.invoke("write-json-file", filePath, data),
  renameFile: (oldPath, newPath) => electron.ipcRenderer.invoke("rename-file", oldPath, newPath),
  batchRenameFiles: (operations) => electron.ipcRenderer.invoke("batch-rename-files", operations),
  checkFileExists: (filePath) => electron.ipcRenderer.invoke("check-file-exists", filePath)
});
