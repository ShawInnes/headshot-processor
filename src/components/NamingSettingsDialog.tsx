import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Settings, FileText, Eye } from 'lucide-react'
import { NamingSettings } from '../types/renaming'
import { FileRenamingService } from '../lib/file-renaming'
import { ScrollArea } from './ui/scroll-area'

interface NamingSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentSettings: NamingSettings
  onSettingsChange: (settings: NamingSettings) => void
}

export function NamingSettingsDialog({
  open,
  onOpenChange,
  currentSettings,
  onSettingsChange
}: NamingSettingsDialogProps) {
  const [settings, setSettings] = useState<NamingSettings>(currentSettings)
  const [previewExample, setPreviewExample] = useState('')

  useEffect(() => {
    if (open) {
      setSettings(currentSettings)
      updatePreview(currentSettings)
    }
  }, [open, currentSettings])

  const updatePreview = (newSettings: NamingSettings) => {
    const example = FileRenamingService.generateEmployeeFilename(
      'John Doe',
      1,
      '.jpg',
      newSettings
    )
    setPreviewExample(example)
  }

  const handlePatternChange = (pattern: string) => {
    const newSettings = { ...settings, pattern }
    setSettings(newSettings)
    updatePreview(newSettings)
  }

  const handleCaseChange = (caseHandling: NamingSettings['caseHandling']) => {
    const newSettings = { ...settings, caseHandling }
    setSettings(newSettings)
    updatePreview(newSettings)
  }

  const handleSpecialCharChange = (specialCharReplacement: string) => {
    const newSettings = { ...settings, specialCharReplacement }
    setSettings(newSettings)
    updatePreview(newSettings)
  }

  const handlePaddingChange = (padding: string) => {
    const numberPadding = parseInt(padding) || 3
    const newSettings = { ...settings, numberPadding }
    setSettings(newSettings)
    updatePreview(newSettings)
  }

  const handleConflictResolutionChange = (conflictResolution: NamingSettings['conflictResolution']) => {
    const newSettings = { ...settings, conflictResolution }
    setSettings(newSettings)
  }

  const handleSave = () => {
    onSettingsChange(settings)
    onOpenChange(false)
  }

  const handleReset = () => {
    const defaultSettings = FileRenamingService.DEFAULT_SETTINGS
    setSettings(defaultSettings)
    updatePreview(defaultSettings)
  }

  const patternPresets = [
    { label: 'Employee + Number', pattern: '{employeeName}_{number:003}' },
    { label: 'Employee + Padded Number', pattern: '{employeeName}_{number:0000}' },
    { label: 'Just Employee Name', pattern: '{employeeName}' },
    { label: 'Number + Employee', pattern: '{number:003}_{employeeName}' }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Naming Settings
          </DialogTitle>
          <DialogDescription>
            Configure how files will be renamed based on employee information
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-x-auto">
          <ScrollArea className="h-full">
            <div className="space-y-6">
              {/* Pattern Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Naming Pattern</CardTitle>
                  <CardDescription>
                    Define how files should be named using placeholders
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pattern">Pattern</Label>
                    <Input
                      id="pattern"
                      value={settings.pattern}
                      onChange={(e) => handlePatternChange(e.target.value)}
                      placeholder="{employeeName}_{number:003}"
                    />
                    <div className="text-sm text-gray-600">
                      Available placeholders: <code>{'{employeeName}'}</code>, <code>{'{number}'}</code>, <code>{'{number:003}'}</code> (with padding)
                    </div>
                  </div>

                  {/* Pattern Presets */}
                  <div className="space-y-2">
                    <Label>Quick Presets</Label>
                    <div className="flex flex-wrap gap-2">
                      {patternPresets.map((preset, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handlePatternChange(preset.pattern)}
                          className="text-xs"
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">Preview</span>
                    </div>
                    <div className="font-mono text-sm bg-white p-2 rounded border">
                      {previewExample}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Format Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Format Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="case">Case Handling</Label>
                      <Select value={settings.caseHandling} onValueChange={handleCaseChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lowercase">lowercase</SelectItem>
                          <SelectItem value="uppercase">UPPERCASE</SelectItem>
                          <SelectItem value="title">Title Case</SelectItem>
                          <SelectItem value="preserve">Preserve Original</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="padding">Number Padding</Label>
                      <Select value={settings.numberPadding.toString()} onValueChange={handlePaddingChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 (no padding)</SelectItem>
                          <SelectItem value="2">2 (01, 02, ...)</SelectItem>
                          <SelectItem value="3">3 (001, 002, ...)</SelectItem>
                          <SelectItem value="4">4 (0001, 0002, ...)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialChar">Special Character Replacement</Label>
                    <Input
                      id="specialChar"
                      value={settings.specialCharReplacement}
                      onChange={(e) => handleSpecialCharChange(e.target.value)}
                      placeholder="_"
                      maxLength={1}
                    />
                    <div className="text-sm text-gray-600">
                      Character to replace spaces and special characters in employee names
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="conflicts">Conflict Resolution</Label>
                    <Select value={settings.conflictResolution} onValueChange={handleConflictResolutionChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="append">Append numbers (_1, _2, ...)</SelectItem>
                        <SelectItem value="skip">Skip conflicting files</SelectItem>
                        <SelectItem value="overwrite">Overwrite existing files</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>


          </ScrollArea>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <FileText className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}