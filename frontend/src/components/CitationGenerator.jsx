import { useState } from 'react'
import { FaBook, FaCopy, FaCheckCircle, FaDownload, FaFilePdf } from 'react-icons/fa'
import apiClient from '../config/api'

function CitationGenerator() {
  const [loading, setLoading] = useState(false)
  const [citation, setCitation] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  
  const [paperInfo, setPaperInfo] = useState({
    authors: '',
    title: '',
    year: '',
    journal: '',
    volume: '',
    issue: '',
    pages: '',
    doi: '',
    url: ''
  })
  
  const [format, setFormat] = useState('APA')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setCitation(null)
    setCopied(false)

    try {
      const response = await apiClient.post('/research/citations', {
        paperInfo,
        format
      })

      setCitation(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate citation.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (citation) {
      navigator.clipboard.writeText(citation.citation)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = async (format) => {
    if (!citation) return

    setDownloading(true)
    
    try {
      if (format === 'md') {
        // Download as markdown
        const content = citation.citation
        const blob = new Blob([content], { type: 'text/markdown' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `citation_${citation.format}.md`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        // Download as PDF via API
        const response = await apiClient.post(
          '/research/assignment/download',
          {
            content: citation.citation,
            format: format,
          },
          {
            responseType: 'blob',
          }
        )

        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `citation_${citation.format}.${format}`)
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Citation Generator</h2>
        <p className="text-gray-600">
          Generate properly formatted citations in APA, MLA, Harvard, or Chicago style
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Citation Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="input-field"
            >
              <option value="APA">APA (American Psychological Association)</option>
              <option value="MLA">MLA (Modern Language Association)</option>
              <option value="Harvard">Harvard</option>
              <option value="Chicago">Chicago</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Authors *
              </label>
              <input
                type="text"
                value={paperInfo.authors}
                onChange={(e) => setPaperInfo({...paperInfo, authors: e.target.value})}
                placeholder="e.g., Smith, J., & Doe, A."
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year *
              </label>
              <input
                type="text"
                value={paperInfo.year}
                onChange={(e) => setPaperInfo({...paperInfo, year: e.target.value})}
                placeholder="e.g., 2023"
                className="input-field"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={paperInfo.title}
                onChange={(e) => setPaperInfo({...paperInfo, title: e.target.value})}
                placeholder="Paper title"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Journal/Publication
              </label>
              <input
                type="text"
                value={paperInfo.journal}
                onChange={(e) => setPaperInfo({...paperInfo, journal: e.target.value})}
                placeholder="Journal name"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Volume
              </label>
              <input
                type="text"
                value={paperInfo.volume}
                onChange={(e) => setPaperInfo({...paperInfo, volume: e.target.value})}
                placeholder="Volume number"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue
              </label>
              <input
                type="text"
                value={paperInfo.issue}
                onChange={(e) => setPaperInfo({...paperInfo, issue: e.target.value})}
                placeholder="Issue number"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pages
              </label>
              <input
                type="text"
                value={paperInfo.pages}
                onChange={(e) => setPaperInfo({...paperInfo, pages: e.target.value})}
                placeholder="e.g., 123-145"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DOI
              </label>
              <input
                type="text"
                value={paperInfo.doi}
                onChange={(e) => setPaperInfo({...paperInfo, doi: e.target.value})}
                placeholder="10.xxxx/xxxxx"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <input
                type="url"
                value={paperInfo.url}
                onChange={(e) => setPaperInfo({...paperInfo, url: e.target.value})}
                placeholder="https://..."
                className="input-field"
              />
            </div>
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
                <span className="animate-spin inline-block mr-2">⏳</span>
                Generating...
              </>
            ) : (
              <>
                <FaBook className="inline mr-2" />
                Generate Citation
              </>
            )}
          </button>
        </form>

        {citation && (
          <div className="mt-6 pt-6 border-t">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-600">
                <FaCheckCircle />
                <span className="text-sm font-medium">Citation generated ({citation.format} format)</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="btn-secondary text-sm"
                >
                  {copied ? (
                    <>
                      <FaCheckCircle className="inline mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <FaCopy className="inline mr-2" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDownload('md')}
                  disabled={downloading}
                  className="btn-secondary text-sm disabled:opacity-50"
                >
                  <FaDownload className="inline mr-2" />
                  MD
                </button>
                <button
                  onClick={() => handleDownload('pdf')}
                  disabled={downloading}
                  className="btn-primary text-sm disabled:opacity-50"
                >
                  <FaFilePdf className="inline mr-2" />
                  {downloading ? '...' : 'PDF'}
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border font-mono text-sm">
              <pre className="whitespace-pre-wrap">{citation.citation}</pre>
            </div>

            <div className="mt-4 flex gap-4">
              <button
                onClick={() => {
                  setCitation(null)
                  setPaperInfo({
                    authors: '',
                    title: '',
                    year: '',
                    journal: '',
                    volume: '',
                    issue: '',
                    pages: '',
                    doi: '',
                    url: ''
                  })
                }}
                className="btn-secondary"
              >
                Generate Another Citation
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
    </div>
  )
}

export default CitationGenerator
