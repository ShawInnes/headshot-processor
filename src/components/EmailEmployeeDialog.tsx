import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { ScrollArea } from './ui/scroll-area'
import { Mail, FileText } from 'lucide-react'
import { Employee } from '../types/employee'
import { toast } from 'sonner'

interface EmailEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee
  onSendEmail: (employee: Employee, emailAddress: string) => Promise<void>
}

export function EmailEmployeeDialog({ 
  open, 
  onOpenChange, 
  employee, 
  onSendEmail 
}: EmailEmployeeDialogProps) {
  const [emailAddress, setEmailAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!emailAddress.trim()) {
      toast.error('Please enter an email address')
      return
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailAddress.trim())) {
      toast.error('Please enter a valid email address')
      return
    }
    
    setIsLoading(true)
    try {
      await onSendEmail(employee, emailAddress.trim())
      onOpenChange(false)
      setEmailAddress('') // Reset for next use
      toast.success(`Photos emailed to ${employee.name}`)
    } catch (error) {
      toast.error('Failed to send email: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (!isLoading) {
      setEmailAddress('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Photos to {employee.name}
          </DialogTitle>
          <DialogDescription>
            Send all {employee.photoCount} photos as email attachments
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="employee@company.com"
              disabled={isLoading}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Photos to be attached ({employee.photoCount} files)
            </Label>
            <ScrollArea className="h-24 border rounded-lg p-3">
              <div className="text-sm text-gray-600 space-y-1">
                {employee.photos.map((photo, index) => (
                  <div key={photo.path} className="font-mono">
                    {index + 1}. {photo.name}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Note:</strong> All photos will be attached to a single email message. 
              Make sure the recipient can receive emails with multiple attachments.
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={!emailAddress.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Mail className="w-4 h-4 mr-2" />
            {isLoading ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}