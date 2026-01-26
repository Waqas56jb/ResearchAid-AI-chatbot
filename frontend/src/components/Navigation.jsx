function Navigation({ features, activeFeature, setActiveFeature }) {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto space-x-1">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setActiveFeature(feature.id)}
              className={`
                px-6 py-3 text-sm font-medium whitespace-nowrap
                transition-colors duration-200
                border-b-2
                ${
                  activeFeature === feature.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300'
                }
              `}
            >
              <span className="mr-2">{feature.icon}</span>
              {feature.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
