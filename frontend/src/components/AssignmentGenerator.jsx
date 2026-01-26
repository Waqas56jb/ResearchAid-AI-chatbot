import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FaCloudUploadAlt, FaFilePdf, FaSpinner, FaFileAlt, FaDownload } from 'react-icons/fa'
import apiClient from '../config/api'

function AssignmentGenerator() {
  const [loading, setLoading] = useState(false)
  const [assignmentResponse, setAssignmentResponse] = useState(null)
  const [error, setError] = useState(null)
  const [inputType, setInputType] = useState('file') // 'file' or 'text'
  const [assignmentText, setAssignmentText] = useState('')

  const handleTextSubmit = async () => {
    if (!assignmentText.trim()) {
      setError('Please enter assignment requirements')
      return
    }

    setError(null)
    setLoading(true)
    setAssignmentResponse(null)

    try {
      const response = await apiClient.post('/research/assignment', {
        assignmentText: assignmentText.trim()
      })

      setAssignmentResponse(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate assignment response.')
    } finally {
      setLoading(false)
    }
  }

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setError(null)
    setLoading(true)
    setAssignmentResponse(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await apiClient.post('/research/assignment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setAssignmentResponse(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate assignment response.')
    } finally {
      setLoading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 10 * 1024 * 1024,
    disabled: loading,
  })

  const [downloading, setDownloading] = useState(false)

  const handleDownload = async (format) => {
    if (!assignmentResponse) return

    setDownloading(true)
    
    try {
      if (format === 'md') {
        // Download as markdown
        const content = assignmentResponse.response
        const blob = new Blob([content], { type: 'text/markdown' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'assignment_response.md'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        // Download as PDF or DOCX via API
        const response = await apiClient.post(
          '/research/assignment/download',
          {
            content: assignmentResponse.response,
            format: format,
          },
          {
            responseType: 'blob',
          }
        )

        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `assignment_response.${format}`)
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
    <div className="max-w-6xl mx-auto">
      <div className="card mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Assignment Response Generator</h2>
        <p className="text-gray-600">
          Upload an assignment brief or paste requirements to generate a comprehensive, well-structured academic response
        </p>
      </div>

      {!assignmentResponse ? (
        <div className="card">
          <div className="mb-6">
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setInputType('file')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  inputType === 'file'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Upload File
              </button>
              <button
                onClick={() => setInputType('text')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  inputType === 'text'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Paste Text
              </button>
            </div>

            {inputType === 'text' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Brief/Requirements
                </label>
                <textarea
                  value={assignmentText}
                  onChange={(e) => setAssignmentText(e.target.value)}
                  placeholder="Paste your assignment brief, requirements, or instructions here..."
                  className="input-field h-64 mb-4 font-mono text-sm"
                />
                <button
                  onClick={handleTextSubmit}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin inline mr-2" />
                      Generating Assignment Response...
                    </>
                  ) : (
                    <>
                      <FaFileAlt className="inline mr-2" />
                      Generate Assignment Response
                    </>
                  )}
                </button>
              </div>
            ) : (
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
                      Analyzing requirements and generating comprehensive assignment response...
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      This may take 30-60 seconds
                    </p>
                  </div>
                ) : (
                  <>
                    <FaCloudUploadAlt className="mx-auto text-5xl text-gray-400 mb-4" />
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                      {isDragActive ? 'Drop your assignment brief here' : 'Drag & drop your assignment brief here'}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">or</p>
                    <button className="btn-primary">Browse Files</button>
                    <div className="mt-6 flex justify-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <FaFilePdf className="text-red-600" />
                        <span>PDF, DOCX, or TXT</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-green-600">
                <FaFileAlt />
                <span className="text-sm font-medium">Assignment response generated successfully!</span>
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
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Word Count</p>
                <p className="text-2xl font-bold text-blue-600">{assignmentResponse.wordCount.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Sections</p>
                <p className="text-2xl font-bold text-blue-600">{assignmentResponse.sections?.length || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Model</p>
                <p className="text-lg font-semibold text-blue-600">{assignmentResponse.model}</p>
              </div>
            </div>
          </div>

          {/* Sections Overview */}
          {assignmentResponse.sections && assignmentResponse.sections.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Document Structure</h3>
              <div className="space-y-2">
                {assignmentResponse.sections.map((section, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 text-sm text-gray-700"
                    style={{ paddingLeft: `${(section.level - 1) * 20}px` }}
                  >
                    <span className="text-blue-600">•</span>
                    <span>{section.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Response */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Complete Assignment Response</h3>
            <div className="prose max-w-none">
              <div 
                className="bg-gray-50 p-6 rounded-lg border max-h-[800px] overflow-y-auto"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {assignmentResponse.response}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setAssignmentResponse(null)
                  setError(null)
                  setAssignmentText('')
                }}
                className="btn-secondary"
              >
                Generate New Response
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
        </div>
      )}
    </div>
  )
}

// Format markdown to HTML with proper styling
function formatMarkdown(text) {
  if (!text) return '';
  
  let html = text;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="font-bold text-xl mt-6 mb-3">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="font-bold text-2xl mt-8 mb-4">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="font-bold text-3xl mt-10 mb-6">$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
  
  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-200 px-2 py-1 rounded text-sm">$1</code>');
  
  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>');
  
  // Wrap consecutive list items in ul/ol
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => {
    if (match.includes('list-decimal')) {
      return '<ol class="my-2 space-y-1">' + match + '</ol>';
    }
    return '<ul class="my-2 space-y-1">' + match + '</ul>';
  });
  
  // Paragraphs
  html = html.split('\n\n').map(para => {
    para = para.trim();
    if (!para || para.startsWith('<')) return para;
    return `<p class="mb-4 leading-relaxed">${para}</p>`;
  }).join('\n');
  
  // Line breaks
  html = html.replace(/\n/g, '<br>');
  
  return html;
}

export default AssignmentGenerator
