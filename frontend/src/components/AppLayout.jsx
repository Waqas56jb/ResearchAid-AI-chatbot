import { Link, Outlet } from 'react-router-dom'
import { FaGraduationCap, FaBook, FaFileAlt, FaQuestionCircle, FaSearch, FaQuoteRight, FaListOl } from 'react-icons/fa'

const TOOLS = [
  { path: '/research-aid', name: 'Research Aid', icon: FaBook },
  { path: '/summarize', name: 'Summarize', icon: FaFileAlt },
  { path: '/questions', name: 'Questions', icon: FaQuestionCircle },
  { path: '/critique', name: 'Critique', icon: FaSearch },
  { path: '/citations', name: 'Citations', icon: FaQuoteRight },
  { path: '/outline', name: 'Outline', icon: FaListOl },
]

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 bg-white border-b border-primary-100 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-600 text-white shadow-md">
                <FaGraduationCap className="text-xl" />
              </div>
              <div>
                <span className="font-bold text-slate-800 tracking-tight">ResearchAid AI</span>
                <p className="text-xs text-slate-500">Academic research & writing</p>
              </div>
            </Link>
            <nav className="flex items-center gap-1 overflow-x-auto max-w-full scrollbar-thin">
              <Link to="/" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 whitespace-nowrap">Home</Link>
              {TOOLS.map(({ path, name, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 whitespace-nowrap rounded-lg hover:bg-primary-50 transition-colors"
                >
                  <Icon className="text-sm opacity-80" />
                  {name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">Back to Home</Link>
          <span className="mx-2">·</span>
          <span>© {new Date().getFullYear()} ResearchAid AI</span>
        </div>
      </footer>
    </div>
  )
}
