'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import type { Topic } from '@/types/database'
import { X, Upload, ImageIcon, CheckCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface InfographicUploadModalProps {
  topic: Topic
  onClose: () => void
  onUploaded: (topic: Topic) => void
}

export default function InfographicUploadModal({ topic, onClose, onUploaded }: InfographicUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const img = acceptedFiles[0]
    if (img) {
      setFile(img)
      const url = URL.createObjectURL(img)
      setPreview(url)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDropRejected: (rejectedFiles) => {
      const err = rejectedFiles[0]?.errors[0]
      if (err?.code === 'file-too-large') toast.error('Image too large. Maximum 10MB.')
      else toast.error('Only JPEG, PNG, WebP and GIF images are accepted.')
    }
  })

  async function handleUpload() {
    if (!file) return
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('topicId', topic.id)

      const res = await fetch('/api/infographics', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')

      toast.success('Infographic uploaded!')
      onUploaded(data.topic)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-elevated w-full max-w-lg animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-chalk-100">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-board">Upload Infographic</h2>
            <p className="text-chalk-500 text-sm mt-0.5 truncate max-w-xs">{topic.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-chalk-100 text-chalk-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Dropzone */}
          {!preview ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? 'dropzone-active border-amber-glow bg-amber-glow/5'
                  : 'border-chalk-200 hover:border-chalk-300 hover:bg-chalk-50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-14 h-14 rounded-2xl bg-chalk-100 flex items-center justify-center mx-auto mb-4">
                {isDragActive ? (
                  <Upload size={26} className="text-amber-glow animate-bounce" />
                ) : (
                  <ImageIcon size={26} className="text-chalk-400" />
                )}
              </div>
              <p className="font-medium text-chalk-600 text-sm">
                {isDragActive ? 'Drop your image here' : 'Drag & drop an infographic image'}
              </p>
              <p className="text-chalk-400 text-xs mt-1.5">
                JPEG, PNG, WebP, or GIF · Max 10MB
              </p>
              {topic.infographic_url && (
                <p className="text-amber-600 text-xs mt-2 font-medium">
                  ⚠️ Uploading will replace the existing infographic
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative rounded-xl overflow-hidden border border-chalk-200 bg-chalk-50">
                <div className="relative h-56">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => { setFile(null); setPreview(null) }}
                    className="p-1.5 rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-chalk-600">
                <CheckCircle size={15} className="text-emerald-500" />
                <span className="truncate">{file?.name}</span>
                <span className="text-chalk-400 flex-shrink-0">
                  {file ? (file.size / 1024 / 1024).toFixed(1) : 0} MB
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} disabled={uploading} className="btn-ghost flex-1">
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="btn-primary flex-1"
          >
            {uploading ? (
              <><Loader2 size={15} className="animate-spin" /> Uploading...</>
            ) : (
              <><Upload size={15} /> Upload Infographic</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
