import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { Dossier } from '~/types/dossier'
import { WorkflowHeader } from '~/components/WorkflowHeader'
import { StateMachine } from '~/components/StateMachine'
import { EventHistory } from '~/components/EventHistory'
import { ValidationResults } from '~/components/ValidationResults'
import { Artifacts } from '~/components/Artifacts'
import { PendingActivities } from '~/components/PendingActivities'

export const Route = createFileRoute('/dossier/$jobId')({
  component: DossierView,
})

type Tab = 'summary' | 'history' | 'validation' | 'artifacts'

function DossierView() {
  const { jobId } = Route.useParams()
  const [activeTab, setActiveTab] = useState<Tab>('history')

  const { data: dossier, isLoading } = useQuery<Dossier>({
    queryKey: ['dossier', jobId],
    queryFn: async () => {
      const url = jobId === 'sample' || jobId === 'complete'
        ? `/sample/${jobId}.json`
        : `/api/dossier/${jobId}.json`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch dossier')
      return response.json()
    },
    refetchInterval: 3000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading dossier...</div>
      </div>
    )
  }

  if (!dossier) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-danger">Dossier not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <WorkflowHeader dossier={dossier} />
      
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto">
          <nav className="flex gap-1 px-6">
            {(['summary', 'history', 'validation', 'artifacts'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium capitalize transition-colors relative ${
                  activeTab === tab
                    ? 'text-accent'
                    : 'text-gray-400 hover:text-text'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <StateMachine dossier={dossier} />
            <PendingActivities dossier={dossier} />
            <EventHistory dossier={dossier} limit={5} />
          </div>
        )}

        {activeTab === 'history' && <EventHistory dossier={dossier} />}

        {activeTab === 'validation' && <ValidationResults dossier={dossier} />}

        {activeTab === 'artifacts' && <Artifacts dossier={dossier} />}
      </div>
    </div>
  )
}
