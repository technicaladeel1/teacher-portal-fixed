'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import type { Book } from '@/types/database'
import { X, Upload, FileText, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface UploadBookModalProps {
  onClose: () => void
  onUploaded: (book: Book) => void
}

export default function UploadBookModal({ onClose, onUploaded }: UploadBookModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdf = acceptedFiles[0]
    if (pdf) {
      setFile(pdf)
      // Auto-fill title from filename
      const name = pdf.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ')
      setTitle(prev => prev || name.charAt(0).toUpperCase() + name.slice(1))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    onDropRejected: (rejectedFiles) => {
      const err = rejectedFiles[0]?.errors[0]
      if (err?.code === 'file-too-large') toast.error('File too large. Maximum 50MB.')
      else toast.error('Only PDF files are accepted.')
    }
  })

  async function handleUpload() {
    if (!file || !title.trim()) {
      toast.error('Please select a file and enter a title')
      return
    }

    setUploading(true)
    setProgress(20)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title.trim())
      formData.append('description', description.trim())

      setProgress(50)

      const res = await fetch('/api/books', {
        method: 'POST',
        body: formData,
      })

      setProgress(90)

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')

      setProgress(100)
      toast.success(`"${title}" uploaded! Extracting topics...`)
      onUploaded(data.book)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      toast.error(message)
      setProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const fileSizeMB = file ? (file.size / 1024 / 1024).toFixed(1) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-elevated w-full max-w-lg animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-chalk-100">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-board">Upload PDF Book</h2>
            <p className="text-chalk-500 text-sm mt-0.5">Topics will be extracted automatically</p>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-2 rounded-lg hover:bg-chalk-100 text-chalk-400 hover:text-chalk-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? 'dropzone-active border-amber-glow bg-amber-glow/5'
                : file
                ? 'border-emerald-300 bg-emerald-50'
                : 'border-chalk-200 hover:border-chalk-300 hover:bg-chalk-50'
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle size={20} className="text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-board text-sm">{file.name}</p>
                  <p className="text-chalk-500 text-xs">{fileSizeMB} MB</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null) }}
                  className="ml-auto p-1 rounded-lg hover:bg-emerald-100 text-chalk-400"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-chalk-100 flex items-center justify-center mx-auto mb-3">
                  {isDragActive ? (
                    <Upload size={22} className="text-amber-glow animate-bounce" />
                  ) : (
                    <FileText size={22} className="text-chalk-400" />
                  )}
                </div>
                <p className="font-medium text-chalk-600 text-sm">
                  {isDragActive ? 'Drop your PDF here' : 'Drag & drop a PDF book'}
                </p>
                <p className="text-chalk-400 text-xs mt-1">or click to browse · Max 50MB</p>
              </>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-chalk-600 mb-1.5">
              Book Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Chemistry"
              className="input-base"
              disabled={uploading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-chalk-600 mb-1.5">
              Description <span className="text-chalk-400">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this book..."
              rows={2}
              className="input-base resize-none"
              disabled={uploading}
            />
          </div>

          {/* Progress */}
          {uploading && (
            <div>
              <div className="h-1.5 bg-chalk-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-glow rounded-full transition-all duration-500 progress-animate"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-chalk-500 mt-1.5 text-center">
                {progress < 50 ? 'Preparing upload...' : progress < 90 ? 'Uploading to storage...' : 'Finalizing...'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            disabled={uploading}
            className="btn-ghost"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || !title.trim() || uploading}
            className="btn-primary min-w-32"
          >
            {uploading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={15} />
                Upload Book
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
