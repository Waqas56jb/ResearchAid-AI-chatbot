import { Link } from 'react-router-dom'
import { FaGraduationCap, FaBook, FaFileAlt, FaQuestionCircle, FaSearch, FaQuoteRight, FaListOl, FaChevronRight, FaCheckCircle, FaArrowRight } from 'react-icons/fa'

const FEATURES = [
  {
    id: 'research-aid',
    path: '/research-aid',
    name: 'Research Aid Main',
    icon: FaBook,
    short: 'Comprehensive academic reports with real-time streaming, 10–15 references, and clickable links.',
    detail: 'Enter any topic and receive a formal, sourced report. Streams token-by-token. Includes introduction, body sections, conclusion, and a references list with verifiable links (DOI, Scholar, publishers).'
  },
  {
    id: 'summarize',
    path: '/summarize',
    name: 'Paper Summarization',
    icon: FaFileAlt,
    short: 'Paragraph-based overviews of papers: main topic, findings, methodology, conclusions.',
    detail: 'Upload a PDF, DOCX, or paste text. Get a concise 300–500 word summary in flowing paragraphs—no bullets or headings—suitable for quick comprehension and citations.'
  },
  {
    id: 'questions',
    path: '/questions',
    name: 'Research Questions',
    icon: FaQuestionCircle,
    short: '5–8 researchable questions from a topic or paper for literature review and thesis development.',
    detail: 'Generate specific, answerable research questions from a topic or an uploaded paper. Covers theoretical, methodological, and applied angles for academic rigor.'
  },
  {
    id: 'critique',
    path: '/critique',
    name: 'Argument Critique',
    icon: FaSearch,
    short: 'Critical analysis of arguments: strengths, weaknesses, evidence, and improvement suggestions.',
    detail: 'Upload a paper and receive a structured critique: main arguments, strength of evidence, limitations, and constructive suggestions. Objective, academic tone.'
  },
  {
    id: 'citations',
    path: '/citations',
    name: 'Citation Generator',
    icon: FaQuoteRight,
    short: 'APA, MLA, Harvard, Chicago—in-text and full reference from paper details.',
    detail: 'Enter author, title, year, journal, and other details. Get correctly formatted in-text and full reference in your chosen style. No more manual formatting errors.'
  },
  {
    id: 'outline',
    path: '/outline',
    name: 'Dissertation Outline',
    icon: FaListOl,
    short: 'Chapter-by-chapter dissertation outline with sections and brief guidance.',
    detail: 'Provide your topic and field. Receive a detailed outline: abstract, introduction, literature review, methodology, results, discussion, conclusion, references—with subsections and short descriptions.'
  }
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ========== Sticky Header ========== */}
      <header className="sticky top-0 z-50 bg-white border-b border-primary-100 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary-600 text-white shadow-md">
                <FaGraduationCap className="text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">ResearchAid AI</h1>
                <p className="text-xs text-slate-500">Academic research & writing assistant</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">How it works</a>
              <a href="#tools" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Tools</a>
              <Link to="/research-aid" className="btn-primary text-sm py-2 px-4 rounded-lg">Get Started</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ========== Hero ========== */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 drop-shadow-sm leading-tight">
              State-of-the-Art Academic Research, One Platform
            </h2>
            <p className="text-lg md:text-xl text-primary-100 mb-10 leading-relaxed max-w-3xl mx-auto">
              From topic to dissertation: comprehensive reports with references, paper summarization, research questions, argument critique, citations, and dissertation outlines—powered by GPT. Built for students, researchers, and lecturers.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/research-aid" className="bg-white text-primary-700 font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-primary-50 transition-colors inline-flex items-center gap-2 text-base">
                Start Research Aid <FaChevronRight className="text-sm" />
              </Link>
              <a href="#tools" className="border-2 border-white/80 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors text-base">
                Explore All Tools
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-14 bg-white rounded-t-3xl" />
      </section>

      {/* ========== Problem ========== */}
      <section className="py-16 md:py-24 bg-white scroll-mt-20" id="problem">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">The Academic Research Challenge</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              Literature reviews and dissertation planning demand hours of reading, note-taking, and structuring. Sourcing high-quality references, formatting citations correctly, and turning a topic into a clear research plan can slow down even experienced researchers.
            </p>
            <p className="text-slate-600 leading-relaxed">
              ResearchAid AI automates the heavy lifting: generate comprehensive topic reports with real-time streaming, summarize papers in seconds, derive research questions, critique arguments, format citations, and build dissertation outlines—all in one place, with a consistent blue & white, industry-level interface.
            </p>
          </div>
        </div>
      </section>

      {/* ========== Solution / Why ResearchAid ========== */}
      <section className="py-16 md:py-24 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-bold text-slate-800 text-center mb-12">How ResearchAid AI Solves It</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                <FaCheckCircle className="text-xl" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Real-Time Streaming</h4>
                <p className="text-sm text-slate-600">See reports and summaries appear token-by-token—no waiting for the full response. Faster feedback and a modern experience.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                <FaCheckCircle className="text-xl" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Academic Sources & References</h4>
                <p className="text-sm text-slate-600">Reports cite sources in a standard format. References include verifiable links (DOI, Scholar, publishers) so you can research further.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                <FaCheckCircle className="text-xl" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Six Integrated Tools</h4>
                <p className="text-sm text-slate-600">Research Aid, Summarization, Questions, Critique, Citations, and Dissertation Outline—each on its own page, all under one platform.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Features Deep-Dive (cards with links to tool pages) ========== */}
      <section className="py-16 md:py-24 bg-white scroll-mt-20" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h3 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">Everything You Need for Academic Work</h3>
            <p className="text-slate-600 max-w-2xl mx-auto">Six dedicated tools for literature review, writing, and dissertation planning. Each tool has its own page—focused, professional, and easy to use.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <Link
                  key={feature.id}
                  to={feature.path}
                  className="group block p-6 rounded-2xl border-2 border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary-300 text-left"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 text-primary-600 group-hover:bg-primary-200 transition-colors">
                      <Icon className="text-xl" />
                    </div>
                    <h4 className="font-semibold text-slate-800 group-hover:text-primary-700 transition-colors">{feature.name}</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{feature.short}</p>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{feature.detail}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-primary-600">
                    Open tool <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ========== How It Works ========== */}
      <section className="py-16 md:py-24 bg-slate-50 border-y border-slate-200 scroll-mt-20" id="how-it-works">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-bold text-slate-800 text-center mb-12">How It Works</h3>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex gap-6 items-start">
              <span className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center">1</span>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Choose a tool</h4>
                <p className="text-slate-600 text-sm">Go to the tool you need: Research Aid Main, Paper Summarization, Research Questions, Argument Critique, Citation Generator, or Dissertation Outline. Each has its own page.</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <span className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center">2</span>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Enter your input</h4>
                <p className="text-slate-600 text-sm">Type a topic or research request, upload a PDF/DOCX, or paste text—depending on the tool. Set options (e.g. word count for Research Aid).</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <span className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center">3</span>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Get results</h4>
                <p className="text-slate-600 text-sm">Reports stream in real time. Summaries, questions, critiques, citations, and outlines are generated in seconds. Use the output in your writing or research workflow.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Use Cases ========== */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-bold text-slate-800 text-center mb-12">Built for Your Workflow</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <h4 className="font-semibold text-slate-800 mb-2">Students</h4>
              <p className="text-sm text-slate-600">Speed up literature reviews, get research questions for your thesis, and structure dissertations with clear outlines and citations.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <h4 className="font-semibold text-slate-800 mb-2">Researchers</h4>
              <p className="text-sm text-slate-600">Summarize papers quickly, critique arguments, and format references in APA, MLA, Harvard, or Chicago without manual errors.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <h4 className="font-semibold text-slate-800 mb-2">Lecturers & Advisors</h4>
              <p className="text-sm text-slate-600">Generate topic overviews and dissertation outlines to guide students. Use critique and citation tools for teaching and feedback.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Stats / Trust strip ========== */}
      <section className="py-12 bg-primary-600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16 text-center">
            <div>
              <span className="block text-2xl md:text-3xl font-bold">6</span>
              <span className="text-sm text-primary-100">Integrated tools</span>
            </div>
            <div>
              <span className="block text-2xl md:text-3xl font-bold">Real-time</span>
              <span className="text-sm text-primary-100">Streaming reports</span>
            </div>
            <div>
              <span className="block text-2xl md:text-3xl font-bold">Academic</span>
              <span className="text-sm text-primary-100">Sources & references</span>
            </div>
            <div>
              <span className="block text-2xl md:text-3xl font-bold">GPT-powered</span>
              <span className="text-sm text-primary-100">State-of-the-art AI</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Tools CTA (links to all tool pages) ========== */}
      <section className="py-16 md:py-24 bg-slate-50 scroll-mt-20" id="tools">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Use the Tools</h3>
            <p className="text-slate-600 max-w-xl mx-auto">Each tool has its own page. Click to open and start using.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {FEATURES.map(({ path, name, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-medium hover:border-primary-400 hover:text-primary-700 hover:shadow-md transition-all"
              >
                <Icon className="text-primary-600" />
                {name}
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/research-aid" className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base">
              Start with Research Aid Main <FaChevronRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== Footer ========== */}
      <footer className="bg-primary-900 text-primary-100 py-14">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white">
                <FaGraduationCap className="text-xl" />
              </div>
              <div>
                <span className="font-bold text-white">ResearchAid AI</span>
                <p className="text-xs text-primary-200">Academic research & writing assistant</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link to="/research-aid" className="text-primary-200 hover:text-white transition-colors">Research Aid</Link>
              <Link to="/summarize" className="text-primary-200 hover:text-white transition-colors">Summarize</Link>
              <Link to="/questions" className="text-primary-200 hover:text-white transition-colors">Questions</Link>
              <Link to="/critique" className="text-primary-200 hover:text-white transition-colors">Critique</Link>
              <Link to="/citations" className="text-primary-200 hover:text-white transition-colors">Citations</Link>
              <Link to="/outline" className="text-primary-200 hover:text-white transition-colors">Outline</Link>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-primary-800 text-center text-sm text-primary-300">
            © {new Date().getFullYear()} ResearchAid AI. GPT-powered assistant for automated academic analysis and writing support.
          </div>
        </div>
      </footer>
    </div>
  )
}
