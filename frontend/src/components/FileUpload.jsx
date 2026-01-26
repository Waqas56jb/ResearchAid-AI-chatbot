import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FaCloudUploadAlt, FaFileWord, FaFilePdf, FaSpinner } from 'react-icons/fa'
import apiClient from '../config/api'

function FileUpload({ onDocumentProcessed, loading, setLoading }) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setError(null)
    setLoading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 90) / progressEvent.total
          )
          setUploadProgress(percentCompleted)
        },
      })

      clearInterval(progressInterval)
      setUploadProgress(100)
      
      setTimeout(() => {
        onDocumentProcessed(response.data)
        setLoading(false)
        setUploadProgress(0)
      }, 500)
    } catch (err) {
      clearInterval(progressInterval)
      setError(
        err.response?.data?.error || 
        'Failed to upload and process document. Please try again.'
      )
      setLoading(false)
      setUploadProgress(0)
    }
  }, [onDocumentProcessed, setLoading])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: loading,
  })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Upload Your Document
          </h2>
          <p className="text-gray-600">
            Upload a Word (.docx) or PDF file to get started with AI-powered formatting
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-all duration-200
            ${isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {loading ? (
            <div className="flex flex-col items-center">
              <FaSpinner className="animate-spin text-blue-600 text-5xl mb-4" />
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Processing document...
              </p>
              <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5 mb-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">{uploadProgress}%</p>
            </div>
          ) : (
            <>
              <FaCloudUploadAlt className="mx-auto text-5xl text-gray-400 mb-4" />
              <p className="text-lg font-semibold text-gray-700 mb-2">
                {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
              </p>
              <p className="text-sm text-gray-500 mb-4">or</p>
              <button className="btn-primary">
                Browse Files
              </button>
              <div className="mt-6 flex justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <FaFileWord className="text-blue-600" />
                  <span>Word (.docx)</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaFilePdf className="text-red-600" />
                  <span>PDF (.pdf)</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Maximum file size: 10MB
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default FileUpload
