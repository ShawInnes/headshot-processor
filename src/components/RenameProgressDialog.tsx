import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { ScrollArea } from './ui/scroll-area'
import { Badge } from './ui/badge'
import { CheckCircle, XCircle, RefreshCw, FileText, Undo2 } from 'lucide-react'
import { RenameOperation } from '../types/renaming'

interface RenameProgressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  operations: RenameOperation[]
  onStartRename: () => Promise<RenameOperation[]>
  onUndo?: (operations: RenameOperation[]) => void
}

export function RenameProgressDialog({ 
  open, 
  onOpenChange, 
  operations,
  onStartRename,
  onUndo
}: RenameProgressDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<RenameOperation[]>([])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (open && operations.length > 0 && !isProcessing && !isComplete) {
      startRenaming()
    }
  }, [open, operations])

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setIsProcessing(false)
      setIsComplete(false)
      setCurrentIndex(0)
      setResults([])
      setProgress(0)
    }
  }, [open])

  const startRenaming = async () => {
    setIsProcessing(true)
    setProgress(0)
    
    try {
      const renameResults = await onStartRename()
      setResults(renameResults)
      setProgress(100)
      setIsComplete(true)
    } catch (error) {
      console.error('Error during rename operation:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUndo = () => {
    if (onUndo && results.length > 0) {
      const successfulOperations = results.filter(op => op.success)
      onUndo(successfulOperations)
      onOpenChange(false)
    }
  }

  const successCount = results.filter(op => op.success).length
  const errorCount = results.filter(op => !op.success).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isProcessing ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : isComplete ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
            {isProcessing ? 'Renaming Files...' : isComplete ? 'Rename Complete' : 'Rename Files'}
          </DialogTitle>
          <DialogDescription>
            {isProcessing 
              ? `Processing ${operations.length} files...`
              : isComplete 
                ? `Renamed ${successCount} files successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`
                : `Ready to rename ${operations.length} files`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Summary Stats */}
          {isComplete && (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{successCount}</div>
                <div className="text-sm text-green-800">Successful</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">{errorCount}</div>
                <div className="text-sm text-red-800">Failed</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{operations.length}</div>
                <div className="text-sm text-blue-800">Total</div>
              </div>
            </div>
          )}

          {/* Results List */}
          {results.length > 0 && (
            <ScrollArea className="h-[300px] border rounded-lg p-4">
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-2 rounded text-sm ${
                      result.success ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs truncate">
                        {result.originalName} → {result.newName}
                      </div>
                      {result.error && (
                        <div className="text-red-600 text-xs mt-1">
                          {result.error}
                        </div>
                      )}
                    </div>
                    <div className="ml-2">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex justify-between">
          <div>
            {isComplete && successCount > 0 && onUndo && (
              <Button variant="outline" onClick={handleUndo}>
                <Undo2 className="w-4 h-4 mr-2" />
                Undo Rename
              </Button>
            )}
          </div>
          <div>
            <Button 
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              {isComplete ? 'Close' : 'Cancel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}