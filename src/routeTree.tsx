import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { DossierList } from './pages/DossierList'
import { DossierView } from './pages/DossierView'

const ConciergeView = lazy(() => import('./pages/ConciergeView'))
const DelegateView = lazy(() => import('./pages/DelegateView'))

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-bg text-text hud-grid">
      <Outlet />
    </div>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-muted">Loading…</div>}>
      <ConciergeView />
    </Suspense>
  ),
})

const dossierRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dossier/$jobId',
  component: DossierView,
})

const conciergeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/concierge/$projectId',
  component: ConciergeView,
})

const delegateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/delegate/$token',
  component: DelegateView,
})

export const routeTree = rootRoute.addChildren([indexRoute, dossierRoute, conciergeRoute, delegateRoute])
