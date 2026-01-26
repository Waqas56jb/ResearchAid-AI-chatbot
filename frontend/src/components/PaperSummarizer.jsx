import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FaCloudUploadAlt, FaFilePdf, FaSpinner, FaCheckCircle, FaDownload } from 'react-icons/fa'
import apiClient from '../config/api'

function PaperSummarizer() {
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setError(null)
    setLoading(true)
    setSummary(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await apiClient.post('/research/summarize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setSummary(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to summarize paper. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024,
    disabled: loading,
  })

  const [downloading, setDownloading] = useState(false)

  const handleDownload = async (format) => {
    if (!summary) return

    setDownloading(true)
    
    try {
      if (format === 'md') {
        // Download as markdown
        const content = summary.summary
        const blob = new Blob([content], { type: 'text/markdown' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'paper_summary.md'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        // Download as PDF via API
        const response = await apiClient.post(
          '/research/assignment/download',
          {
            content: summary.summary,
            format: format,
          },
          {
            responseType: 'blob',
          }
        )

        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `paper_summary.${format}`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download document. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Paper Summarization</h2>
        <p className="text-gray-600">
          Upload an academic paper (PDF or DOCX) to get an AI-powered comprehensive summary
        </p>
      </div>

      {!summary ? (
        <div className="card">
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
                <p className="text-lg font-semibold text-gray-700">
                  Analyzing and summarizing paper...
                </p>
              </div>
            ) : (
              <>
                <FaCloudUploadAlt className="mx-auto text-5xl text-gray-400 mb-4" />
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  {isDragActive ? 'Drop your paper here' : 'Drag & drop your academic paper here'}
                </p>
                <p className="text-sm text-gray-500 mb-4">or</p>
                <button className="btn-primary">Browse Files</button>
                <div className="mt-6 flex justify-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <FaFilePdf className="text-red-600" />
                    <span>PDF or DOCX</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-600">
              <FaCheckCircle />
              <span className="text-sm font-medium">Summary generated successfully!</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload('md')}
                disabled={downloading}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                <FaDownload className="inline mr-2" />
                Markdown
              </button>
              <button
                onClick={() => handleDownload('pdf')}
                disabled={downloading}
                className="btn-primary text-sm disabled:opacity-50"
              >
                <FaFilePdf className="inline mr-2" />
                {downloading ? 'Downloading...' : 'PDF'}
              </button>
            </div>
          </div>
          
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Project Summary</h2>
            <div 
              className="bg-gray-50 p-6 rounded-lg border"
              dangerouslySetInnerHTML={{ 
                __html: summary.summary.replace(/\n/g, '<br>') 
              }}
            />
          </div>

          <div className="mt-4 pt-4 border-t flex gap-4">
            <button
              onClick={() => {
                setSummary(null)
                setError(null)
              }}
              className="btn-secondary"
            >
              Upload Another Paper
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload('md')}
                disabled={downloading}
                className="btn-secondary disabled:opacity-50"
              >
                <FaDownload className="inline mr-2" />
                Download MD
              </button>
              <button
                onClick={() => handleDownload('pdf')}
                disabled={downloading}
                className="btn-primary disabled:opacity-50"
              >
                <FaFilePdf className="inline mr-2" />
                {downloading ? 'Downloading...' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaperSummarizer
