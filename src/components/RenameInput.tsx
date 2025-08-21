import { useState, useEffect, useRef } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Check, X } from 'lucide-react'

interface RenameInputProps {
  currentName: string
  onSave: (newName: string) => void
  onCancel: () => void
}

export function RenameInput({ currentName, onSave, onCancel }: RenameInputProps) {
  const [value, setValue] = useState(currentName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus and select text when component mounts
    if (inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [])

  const handleSave = () => {
    const trimmedValue = value.trim()
    if (trimmedValue && trimmedValue !== currentName) {
      onSave(trimmedValue)
    } else {
      onCancel()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-8 text-sm"
        placeholder="Enter employee name"
      />
      <Button
        size="sm"
        variant="ghost"
        onClick={handleSave}
        className="h-8 w-8 p-0"
      >
        <Check className="w-4 h-4 text-green-600" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onCancel}
        className="h-8 w-8 p-0"
      >
        <X className="w-4 h-4 text-red-600" />
      </Button>
    </div>
  )
}