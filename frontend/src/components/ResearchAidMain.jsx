import { useState } from 'react'
import { FaSpinner, FaBook, FaSearch } from 'react-icons/fa'
import apiClient from '../config/api'

function ResearchAidMain() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [wordCount, setWordCount] = useState(1000)

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!query.trim()) {
      setError('Please enter a topic or research request.')
      return
    }
    setError(null)
    setLoading(true)
    setResult(null)
    try {
      const response = await apiClient.post('/research/assignment', {
        assignmentText: query.trim(),
        wordCount: wordCount || 1000
      })
      setResult(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate Research Aid report.')
    } finally {
      setLoading(false)
    }
  }

  const { bodyText, references } = parseResponse(result?.response)

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

      {!result ? (
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
                      Generating report…
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
                <span className="text-sm font-medium">Report generated</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span><strong className="text-slate-800">{result.wordCount?.toLocaleString()}</strong> words</span>
                <span className="text-slate-400">|</span>
                <span>{result.model}</span>
              </div>
              <button
                type="button"
                onClick={() => { setResult(null); setError(null); setQuery(''); }}
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                New report
              </button>
            </div>
            <div className="p-6">
              <div className="prose prose-slate max-w-none">
                <div
                  className="research-aid-body text-slate-700 leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: formatBody(bodyText) }}
                />
              </div>
            </div>
          </div>

          {references.length > 0 && (
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
              <h3 className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 text-lg font-semibold text-slate-800">
                References
              </h3>
              <ul className="p-6 space-y-3">
                {references.map((ref, i) => (
                  <li
                    key={i}
                    className="references-hover group flex gap-3 text-sm text-slate-600 border-l-2 border-slate-200 pl-4 py-2 hover:border-primary-400 hover:bg-primary-50/50 rounded-r-lg transition-colors"
                    title={ref}
                  >
                    <span className="font-medium text-slate-500 tabular-nums shrink-0">{i + 1}.</span>
                    <span className="group-hover:text-slate-800">{ref}</span>
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
  const references = refBlock
    .split(/\n+/)
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean)
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
