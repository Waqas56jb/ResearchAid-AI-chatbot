import { useState } from 'react'
import Header from './components/Header'
import Navigation from './components/Navigation'
import PaperSummarizer from './components/PaperSummarizer'
import ResearchQuestions from './components/ResearchQuestions'
import ArgumentCritique from './components/ArgumentCritique'
import CitationGenerator from './components/CitationGenerator'
import DissertationOutline from './components/DissertationOutline'
import AssignmentGenerator from './components/AssignmentGenerator'

function App() {
  const [activeFeature, setActiveFeature] = useState('summarize')

  const features = [
    { id: 'summarize', name: 'Paper Summarization', icon: '📄' },
    { id: 'questions', name: 'Research Questions', icon: '❓' },
    { id: 'critique', name: 'Argument Critique', icon: '🔍' },
    { id: 'citations', name: 'Citation Generator', icon: '📚' },
    { id: 'outline', name: 'Dissertation Outline', icon: '📋' },
    { id: 'assignment', name: 'Assignment Generator', icon: '📝' }
  ]

  const renderActiveFeature = () => {
    switch (activeFeature) {
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
      case 'assignment':
        return <AssignmentGenerator />
      default:
        return <PaperSummarizer />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
