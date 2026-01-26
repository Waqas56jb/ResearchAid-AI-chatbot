import { useState } from 'react'
import { FaEdit, FaDownload, FaFilePdf, FaFileWord, FaUndo, FaCheckCircle } from 'react-icons/fa'
import apiClient from '../config/api'

function DocumentPreview({ documentData, onEdit, onReset, setLoading }) {
  const [downloading, setDownloading] = useState(false)
  const [viewMode, setViewMode] = useState('formatted') // 'formatted' or 'original'

  const handleDownload = async (format) => {
    setDownloading(true)
    setLoading(true)
    
    try {
      const response = await apiClient.post(
        '/download',
        {
          documentId: documentData.documentId,
          format: format,
        },
        {
          responseType: 'blob',
        }
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `formatted_document.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download document. Please try again.')
    } finally {
      setDownloading(false)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Action Bar */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onEdit}
              className="btn-primary flex items-center gap-2"
            >
              <FaEdit />
              Edit Document
            </button>
            <button
              onClick={onReset}
              className="btn-secondary flex items-center gap-2"
            >
              <FaUndo />
              Upload New
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2 border rounded-lg p-1">
              <button
                onClick={() => setViewMode('formatted')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  viewMode === 'formatted'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Formatted
              </button>
              <button
                onClick={() => setViewMode('original')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  viewMode === 'original'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Original
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleDownload('pdf')}
                disabled={downloading}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <FaFilePdf />
                {downloading ? 'Downloading...' : 'PDF'}
              </button>
              <button
                onClick={() => handleDownload('docx')}
                disabled={downloading}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <FaFileWord />
                {downloading ? 'Downloading...' : 'DOCX'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview */}
      <div className="card">
        <div className="mb-4 flex items-center gap-2 text-green-600">
          <FaCheckCircle />
          <span className="text-sm font-medium">Document formatted successfully!</span>
        </div>

        <div className="border rounded-lg p-8 bg-white min-h-[600px]">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: viewMode === 'formatted' 
                ? documentData.formattedContent 
                : documentData.originalContent
            }}
          />
        </div>
      </div>

      {/* Formatting Summary */}
      {documentData.formattingSummary && (
        <div className="card mt-6">
          <h3 className="text-lg font-semibold mb-4">Formatting Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(documentData.formattingSummary).map(([key, value]) => (
              <div key={key} className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                <p className="text-2xl font-bold text-blue-600">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentPreview
