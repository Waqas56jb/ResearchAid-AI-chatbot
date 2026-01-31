import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import LandingPage from './components/LandingPage'
import ResearchAidMain from './components/ResearchAidMain'
import PaperSummarizer from './components/PaperSummarizer'
import ResearchQuestions from './components/ResearchQuestions'
import ArgumentCritique from './components/ArgumentCritique'
import CitationGenerator from './components/CitationGenerator'
import DissertationOutline from './components/DissertationOutline'

function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<AppLayout />}>
          <Route path="research-aid" element={<ResearchAidMain />} />
          <Route path="summarize" element={<PaperSummarizer />} />
          <Route path="questions" element={<ResearchQuestions />} />
          <Route path="critique" element={<ArgumentCritique />} />
          <Route path="citations" element={<CitationGenerator />} />
          <Route path="outline" element={<DissertationOutline />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
