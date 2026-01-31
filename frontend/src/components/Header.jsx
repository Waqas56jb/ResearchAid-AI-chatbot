import { FaGraduationCap } from 'react-icons/fa'

function Header() {
  return (
    <header className="bg-white border-b border-slate-200/80 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-100 text-primary-600">
            <FaGraduationCap className="text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              ResearchAid AI
            </h1>
            <p className="text-sm text-slate-500">
              GPT-powered assistant for academic research and writing
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
