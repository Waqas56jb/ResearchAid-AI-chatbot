import { useState, useEffect } from 'react'
import { FaSave, FaTimes, FaUndo, FaRedo } from 'react-icons/fa'

function DocumentEditor({ content, originalContent, onSave, onCancel }) {
  const [editedContent, setEditedContent] = useState(content)
  const [history, setHistory] = useState([content])
  const [historyIndex, setHistoryIndex] = useState(0)

  useEffect(() => {
    setEditedContent(content)
    setHistory([content])
    setHistoryIndex(0)
  }, [content])

  const handleContentChange = (newContent) => {
    setEditedContent(newContent)
    // Add to history if different from current
    if (newContent !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(newContent)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setEditedContent(history[newIndex])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setEditedContent(history[newIndex])
    }
  }

  const handleSave = () => {
    onSave(editedContent)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Editor Toolbar */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50"
            >
              <FaUndo />
              Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50"
            >
              <FaRedo />
              Redo
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="btn-secondary flex items-center gap-2"
            >
              <FaTimes />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-primary flex items-center gap-2"
            >
              <FaSave />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Rich Text Editor */}
      <div className="card">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Edit Document Content
          </label>
          <div
            contentEditable
            className="min-h-[600px] p-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 prose max-w-none"
            dangerouslySetInnerHTML={{ __html: editedContent }}
            onInput={(e) => handleContentChange(e.target.innerHTML)}
            suppressContentEditableWarning={true}
          />
        </div>
      </div>
    </div>
  )
}

export default DocumentEditor
