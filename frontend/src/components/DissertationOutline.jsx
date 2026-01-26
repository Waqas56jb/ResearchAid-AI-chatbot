import { useState } from 'react'
import { FaFileAlt, FaSpinner, FaCheckCircle, FaDownload, FaFilePdf } from 'react-icons/fa'
import apiClient from '../config/api'

function DissertationOutline() {
  const [loading, setLoading] = useState(false)
  const [outline, setOutline] = useState(null)
  const [error, setError] = useState(null)
  const [topic, setTopic] = useState('')
  const [field, setField] = useState('Computer Science')
  const [downloading, setDownloading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!topic.trim()) {
      setError('Please enter a dissertation topic')
      return
    }

    setError(null)
    setLoading(true)
    setOutline(null)

    try {
      const response = await apiClient.post('/research/outline', {
        topic: topic.trim(),
        field: field
      })

      setOutline(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate dissertation outline.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (format) => {
    if (!outline) return

    setDownloading(true)
    
    try {
      if (format === 'md') {
        // Download as markdown
        const content = outline.outline
        const blob = new Blob([content], { type: 'text/markdown' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'dissertation_outline.md'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        // Download as PDF via API
        const response = await apiClient.post(
          '/research/assignment/download',
          {
            content: outline.outline,
            format: format,
          },
          {
            responseType: 'blob',
          }
        )

        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `dissertation_outline.${format}`)
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Dissertation Outline Generator</h2>
        <p className="text-gray-600">
          Generate a comprehensive dissertation outline based on your research topic
        </p>
      </div>

      {!outline ? (
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Research Field
              </label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="input-field"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Engineering">Engineering</option>
                <option value="Business">Business</option>
                <option value="Education">Education</option>
                <option value="Medicine">Medicine</option>
                <option value="Social Sciences">Social Sciences</option>
                <option value="Natural Sciences">Natural Sciences</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dissertation Topic *
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., The Impact of Machine Learning on Healthcare Diagnostics"
                className="input-field h-32"
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin inline mr-2" />
                  Generating Outline...
                </>
              ) : (
                <>
                  <FaFileAlt className="inline mr-2" />
                  Generate Outline
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-600">
              <FaCheckCircle />
              <span className="text-sm font-medium">Outline generated successfully!</span>
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
          
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-1"><strong>Topic:</strong> {outline.topic}</p>
            <p className="text-sm text-gray-600"><strong>Field:</strong> {outline.field}</p>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Dissertation Outline</h2>
            <div 
              className="bg-gray-50 p-6 rounded-lg border"
              dangerouslySetInnerHTML={{ 
                __html: outline.outline.replace(/\n/g, '<br>') 
              }}
            />
          </div>

          <div className="mt-4 pt-4 border-t flex gap-4">
            <button
              onClick={() => {
                setOutline(null)
                setError(null)
                setTopic('')
              }}
              className="btn-secondary"
            >
              Generate New Outline
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

export default DissertationOutline
