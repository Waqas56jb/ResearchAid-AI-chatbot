import { useState, useRef } from 'react'
import { FaSpinner, FaBook, FaSearch } from 'react-icons/fa'
import { API_BASE } from '../config/api'

function ResearchAidMain() {
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [streamedText, setStreamedText] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [wordCount, setWordCount] = useState(1000)
  const streamEndRef = useRef(null)
  const scrollThrottleRef = useRef(0)

  const scrollToStreamEnd = () => {
    const now = Date.now()
    if (now - scrollThrottleRef.current < 120) return
    scrollThrottleRef.current = now
    streamEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!query.trim()) {
      setError('Please enter a topic or research request.')
      return
    }
    setError(null)
    setLoading(true)
    setStreaming(false)
    setStreamedText('')
    setResult(null)

    try {
      const res = await fetch(`${API_BASE}/research/assignment/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentText: query.trim(),
          wordCount: wordCount || 1000
        })
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Request failed: ${res.status}`)
      }
      setStreaming(true)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullText = ''
      let finalWordCount = 0
      let finalModel = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const data = JSON.parse(line)
            if (data.content) {
              fullText += data.content
              setStreamedText(fullText)
              setTimeout(scrollToStreamEnd, 0)
            }
            if (data.done) {
              finalWordCount = data.wordCount ?? 0
              finalModel = data.model ?? ''
            }
            if (data.error) throw new Error(data.error)
          } catch (parseErr) {
            if (parseErr.message && parseErr.message !== 'Unexpected end of JSON input') throw parseErr
          }
        }
      }
      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer)
          if (data.content) {
            fullText += data.content
            setStreamedText(fullText)
          }
          if (data.done) {
            finalWordCount = data.wordCount ?? 0
            finalModel = data.model ?? ''
          }
        } catch (_) {}
      }

      setResult({
        response: fullText,
        wordCount: finalWordCount || fullText.split(/\s+/).filter(w => w.length > 0).length,
        model: finalModel || 'gpt-4-turbo-preview'
      })
    } catch (err) {
      setError(err.message || 'Failed to generate Research Aid report.')
      setStreaming(false)
      setStreamedText('')
    } finally {
      setLoading(false)
      setStreaming(false)
    }
  }

  const showStreaming = streaming || (loading && streamedText)
  const { bodyText, references } = parseResponse(result?.response ?? (showStreaming ? streamedText : ''))

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-800 tracking-tight mb-1">
          Research Aid Main
        </h2>
        <p className="text-slate-600 text-base leading-relaxed">
          Get a comprehensive, academic-style summary on any topic. Specify your topic and desired word count for a formal report with references.
        </p>
      </div>

      {!result && !showStreaming ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Topic or research request
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Give me a comprehensive summary of AI using only academic sources. Formal report, 1000 words."
                className="input-field min-h-[140px] resize-y text-slate-800 placeholder-slate-400 rounded-xl border-slate-200 focus:border-primary-500 focus:ring-primary-500/20"
                disabled={loading}
              />
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Word count</span>
                  <input
                    type="number"
                    min={500}
                    max={5000}
                    step={100}
                    value={wordCount}
                    onChange={(e) => setWordCount(Number(e.target.value) || 1000)}
                    className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    disabled={loading}
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-sm"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Connecting…
                    </>
                  ) : (
                    <>
                      <FaSearch />
                      Generate report
                    </>
                  )}
                </button>
              </div>
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-primary-600">
                <FaBook className="text-lg" />
                <span className="text-sm font-medium">
                  {showStreaming ? 'Generating report…' : 'Report generated'}
                </span>
              </div>
              {result && (
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span><strong className="text-slate-800">{result.wordCount?.toLocaleString()}</strong> words</span>
                  <span className="text-slate-400">|</span>
                  <span>{result.model}</span>
                </div>
              )}
              {result && (
                <button
                  type="button"
                  onClick={() => { setResult(null); setError(null); setQuery(''); setStreamedText(''); }}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  New report
                </button>
              )}
            </div>
            <div className="p-6">
              {showStreaming ? (
                <div className="research-aid-body text-slate-700 leading-relaxed whitespace-pre-wrap min-h-[200px] max-h-[70vh] overflow-y-auto">
                  {streamedText}
                  <span ref={streamEndRef} className="inline-block w-2 h-4 ml-0.5 bg-primary-500 animate-pulse align-text-bottom" aria-hidden="true" />
                </div>
              ) : (
                <div className="prose prose-slate max-w-none">
                  <div
                    className="research-aid-body text-slate-700 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: formatBody(bodyText) }}
                  />
                </div>
              )}
            </div>
          </div>

          {result && references.length > 0 && (
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
              <h3 className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 text-lg font-semibold text-slate-800">
                References
              </h3>
              <ul className="p-6 space-y-3">
                {references.map((ref, i) => (
                  <li
                    key={i}
                    className="references-hover group flex gap-3 text-sm border-l-2 border-slate-200 pl-4 py-2 hover:border-primary-400 hover:bg-primary-50/50 rounded-r-lg transition-colors"
                  >
                    <span className="font-medium text-slate-500 tabular-nums shrink-0">{i + 1}.</span>
                    <a
                      href={getReferenceUrl(ref)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 group-hover:text-slate-800 underline decoration-primary-300/50 hover:decoration-primary-500 transition-colors break-words"
                      title={ref.text}
                    >
                      {ref.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Allowed domains for reference links (verified academic sources)
const ALLOWED_LINK_HOSTS = [
  'doi.org', 'scholar.google.com', 'scholar.google.co.uk',
  'arxiv.org', 'pubmed.ncbi.nlm.nih.gov', 'ncbi.nlm.nih.gov',
  'jstor.org', 'ieee.org', 'acm.org', 'springer.com', 'sciencedirect.com',
  'nature.com', 'science.org', 'plos.org', 'wiley.com', 'tandfonline.com',
  'cambridge.org', 'oxford.ac.uk', 'researchgate.net', 'semanticscholar.org',
  'eric.ed.gov', 'gov', 'edu', 'org'
]

function isAllowedUrl(href) {
  if (!href || !href.startsWith('https://')) return false
  try {
    const host = new URL(href).hostname.toLowerCase()
    return ALLOWED_LINK_HOSTS.some(allowed =>
      host === allowed || host.endsWith('.' + allowed)
    )
  } catch {
    return false
  }
}

function getReferenceUrl(ref) {
  if (ref.url && isAllowedUrl(ref.url)) return ref.url
  const query = encodeURIComponent(ref.text.replace(/\s+/g, ' ').trim())
  return `https://scholar.google.com/scholar?q=${query}`
}

function parseResponse(text) {
  if (!text || typeof text !== 'string') return { bodyText: '', references: [] }
  const refMarkers = [
    /\n\s*References\s*\n/i,
    /\n\s*\d+\.\s+References\s*\n/i,
    /\n\s*References\s*$/im
  ]
  let refStart = -1
  for (const re of refMarkers) {
    const m = text.match(re)
    if (m && m.index !== undefined) {
      refStart = m.index
      break
    }
  }
  if (refStart === -1) return { bodyText: text.trim(), references: [] }
  const bodyText = text.slice(0, refStart).trim()
  const refBlock = text.slice(refStart).replace(/^[\s\S]*?References\s*\n?\s*/i, '').trim()
  const urlPattern = /\s+(?:URL|Available at|Link):\s*(https:\/\/[^\s]+)/i
  const references = refBlock
    .split(/\n+/)
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean)
    .map(line => {
      const match = line.match(urlPattern)
      const url = match ? match[1].replace(/[.,;:)]+$/, '') : null
      const text = match ? line.slice(0, match.index).trim() : line
      return { text: text || line, url: url && url.startsWith('https://') ? url : null }
    })
  return { bodyText, references }
}

function formatBody(text) {
  if (!text) return ''
  const blocks = text.split(/\n\n+/)
  return blocks.map(block => {
    const trimmed = block.trim()
    if (!trimmed) return ''
    const isSingleLine = trimmed.indexOf('\n') === -1
    if (isSingleLine && /^\d+(?:\.\d+)*\s+.+$/.test(trimmed)) {
      return `<h3 class="mt-6 mb-2 text-lg font-semibold text-slate-800">${escapeHtml(trimmed)}</h3>`
    }
    const html = escapeHtml(trimmed).replace(/\n/g, '<br/>')
    return `<p class="mb-4 leading-relaxed">${html}</p>`
  }).join('')
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export default ResearchAidMain
