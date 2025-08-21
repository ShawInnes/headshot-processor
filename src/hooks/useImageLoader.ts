import { useCallback, useEffect, useRef, useState } from 'react'
import { PhotoWithExif } from '../lib/exif'

interface UseImageLoaderOptions {
  photo: PhotoWithExif | null
  enabled?: boolean // For conditional loading (like when dialog is open)
  onError?: (error: Error) => void
  onSuccess?: (imageUrl: string) => void
}

interface UseImageLoaderReturn {
  imageUrl: string | null
  isLoading: boolean
  hasError: boolean
  retry: () => void
  reset: () => void
}

export function useImageLoader({
  photo,
  enabled = true,
  onError,
  onSuccess
}: UseImageLoaderOptions): UseImageLoaderReturn {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const getMimeType = useCallback((filename: string): string => {
    const extension = filename.toLowerCase().split('.').pop()
    switch (extension) {
      case 'png': return 'image/png'
      case 'gif': return 'image/gif'
      case 'webp': return 'image/webp'
      case 'jpg':
      case 'jpeg':
      default: return 'image/jpeg'
    }
  }, [])

  const convertBufferToDataUrl = useCallback((buffer: ArrayBuffer | Buffer, mimeType: string): string => {
    const uint8Array = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)

    let binary = ''
    const len = uint8Array.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i])
    }
    const base64 = btoa(binary)

    return `data:${mimeType};base64,${base64}`
  }, [])

  const loadImage = useCallback(async () => {
    if (!photo || !enabled) return

    // Cancel any existing load
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    setIsLoading(true)
    setHasError(false)

    try {
      const buffer = await window.electronAPI.readFileBuffer(photo.path)

      if (abortController.signal.aborted) return

      if (!buffer || buffer.length === 0) {
        throw new Error('Empty buffer received')
      }

      const mimeType = getMimeType(photo.name)
      const dataUrl = convertBufferToDataUrl(buffer, mimeType)

      if (!abortController.signal.aborted) {
        setImageUrl(dataUrl)
        onSuccess?.(dataUrl)
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error')
        console.error('Error loading image for', photo.name, ':', errorObj)
        setHasError(true)
        onError?.(errorObj)
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [photo, enabled, getMimeType, convertBufferToDataUrl, onError, onSuccess])

  const retry = useCallback(() => {
    setHasError(false)
    setImageUrl(null)
    loadImage()
  }, [loadImage])

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setImageUrl(null)
    setIsLoading(false)
    setHasError(false)
  }, [])

  // Load image when photo or enabled state changes
  useEffect(() => {
    if (photo && enabled && !imageUrl && !hasError) {
      loadImage()
    }
  }, [photo, enabled, imageUrl, hasError, loadImage])

  // Reset when photo changes
  useEffect(() => {
    if (!photo) {
      reset()
    }
  }, [photo, reset])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    imageUrl,
    isLoading,
    hasError,
    retry,
    reset
  }
}