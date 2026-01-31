function Navigation({ features, activeFeature, setActiveFeature }) {
  return (
    <nav className="bg-white border-b border-slate-200/80 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto gap-0 scrollbar-thin">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setActiveFeature(feature.id)}
              className={`
                px-5 py-3.5 text-sm font-medium whitespace-nowrap
                transition-colors duration-200 border-b-2
                ${activeFeature === feature.id
                  ? 'border-primary-600 text-primary-600 bg-primary-50/60'
                  : 'border-transparent text-slate-600 hover:text-primary-600 hover:border-slate-300 hover:bg-slate-50/50'
                }
              `}
            >
              <span className="mr-2 opacity-90">{feature.icon}</span>
              {feature.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
