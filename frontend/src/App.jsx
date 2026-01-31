import { useState } from 'react'
import Header from './components/Header'
import Navigation from './components/Navigation'
import ResearchAidMain from './components/ResearchAidMain'
import PaperSummarizer from './components/PaperSummarizer'
import ResearchQuestions from './components/ResearchQuestions'
import ArgumentCritique from './components/ArgumentCritique'
import CitationGenerator from './components/CitationGenerator'
import DissertationOutline from './components/DissertationOutline'

function App() {
  const [activeFeature, setActiveFeature] = useState('research-aid')

  const features = [
    { id: 'research-aid', name: 'Research Aid Main', icon: '🎯' },
    { id: 'summarize', name: 'Paper Summarization', icon: '📄' },
    { id: 'questions', name: 'Research Questions', icon: '❓' },
    { id: 'critique', name: 'Argument Critique', icon: '🔍' },
    { id: 'citations', name: 'Citation Generator', icon: '📚' },
    { id: 'outline', name: 'Dissertation Outline', icon: '📋' },
  ]

  const renderActiveFeature = () => {
    switch (activeFeature) {
      case 'research-aid':
        return <ResearchAidMain />
      case 'summarize':
        return <PaperSummarizer />
      case 'questions':
        return <ResearchQuestions />
      case 'critique':
        return <ArgumentCritique />
      case 'citations':
        return <CitationGenerator />
      case 'outline':
        return <DissertationOutline />
      default:
        return <ResearchAidMain />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <Navigation 
        features={features}
        activeFeature={activeFeature}
        setActiveFeature={setActiveFeature}
      />
      <main className="container mx-auto px-4 py-8">
        {renderActiveFeature()}
      </main>
    </div>
  )
}

export default App
