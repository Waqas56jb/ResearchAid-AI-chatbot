import { FaGraduationCap } from 'react-icons/fa'

function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <FaGraduationCap className="text-blue-600 text-2xl" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              ResearchAid AI
            </h1>
            <p className="text-sm text-gray-500">
              GPT-Powered Assistant for Automated Academic Analysis and Writing Support
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
