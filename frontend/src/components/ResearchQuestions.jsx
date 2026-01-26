import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FaCloudUploadAlt, FaFilePdf, FaSpinner, FaQuestionCircle, FaDownload } from 'react-icons/fa'
import apiClient from '../config/api'

function ResearchQuestions() {
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState(null)
  const [error, setError] = useState(null)
  const [inputType, setInputType] = useState('topic') // 'topic' or 'paper'
  const [topic, setTopic] = useState('')

  const handleTopicSubmit = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic')
      return
    }

    setError(null)
    setLoading(true)
    setQuestions(null)

    try {
      const response = await apiClient.post('/research/questions', {
        topic: topic.trim()
      })

      setQuestions(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate research questions.')
    } finally {
      setLoading(false)
    }
  }

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setError(null)
    setLoading(true)
    setQuestions(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await apiClient.post('/research/questions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setQuestions(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate research questions.')
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
    if (!questions) return

    setDownloading(true)
    
    try {
      if (format === 'md') {
        // Download as markdown
        const content = questions.questions
        const blob = new Blob([content], { type: 'text/markdown' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'research_questions.md'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        // Download as PDF via API
        const response = await apiClient.post(
          '/research/assignment/download',
          {
            content: questions.questions,
            format: format,
          },
          {
            responseType: 'blob',
          }
        )

        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `research_questions.${format}`)
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Research Questions Generator</h2>
        <p className="text-gray-600">
          Generate research questions from a topic or based on an academic paper
        </p>
      </div>

      {!questions ? (
        <div className="card">
          <div className="mb-6">
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setInputType('topic')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  inputType === 'topic'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Enter Topic
              </button>
              <button
                onClick={() => setInputType('paper')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  inputType === 'paper'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Upload Paper
              </button>
            </div>

            {inputType === 'topic' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Research Topic
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Impact of Artificial Intelligence on Healthcare"
                  className="input-field h-32 mb-4"
                />
                <button
                  onClick={handleTopicSubmit}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin inline mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaQuestionCircle className="inline mr-2" />
                      Generate Questions
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
                      Analyzing paper and generating questions...
                    </p>
                  </div>
                ) : (
                  <>
                    <FaCloudUploadAlt className="mx-auto text-5xl text-gray-400 mb-4" />
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                      {isDragActive ? 'Drop your paper here' : 'Drag & drop your paper here'}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">or</p>
                    <button className="btn-primary">Browse Files</button>
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
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-600">
              <FaQuestionCircle />
              <span className="text-sm font-medium">
                Generated {questions.count} research questions
              </span>
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Research Questions</h2>
            <div 
              className="bg-gray-50 p-6 rounded-lg border"
              dangerouslySetInnerHTML={{ 
                __html: questions.questions.replace(/\n/g, '<br>') 
              }}
            />
          </div>

          <div className="mt-4 pt-4 border-t flex gap-4">
            <button
              onClick={() => {
                setQuestions(null)
                setError(null)
                setTopic('')
              }}
              className="btn-secondary"
            >
              Generate New Questions
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

export default ResearchQuestions
