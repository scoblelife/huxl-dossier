import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: DossierList,
})

function DossierList() {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Huxl Factory Dossiers</h1>
      <p className="text-gray-400 mb-8">Live workflow execution dashboard</p>
      
      <div className="space-y-4">
        <Link
          to="/dossier/$jobId"
          params={{ jobId: 'sample' }}
          className="block p-6 bg-card border border-border rounded-lg hover:border-accent transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">Sample Dossier (In Progress)</h2>
              <p className="text-sm text-gray-400">Rate limiter service • ImplementationDenoise pass • 1 backpressure event</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-sm bg-blue-500/20 text-blue-400 animate-pulse">
                Denoising
              </span>
              <span className="text-gray-400">→</span>
            </div>
          </div>
        </Link>

        <Link
          to="/dossier/$jobId"
          params={{ jobId: 'complete' }}
          className="block p-6 bg-card border border-border rounded-lg hover:border-accent transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">Complete Dossier</h2>
              <p className="text-sm text-gray-400">Web service • All passes complete • $0.68 total cost</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-sm bg-success/20 text-success">
                Complete
              </span>
              <span className="text-gray-400">→</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
