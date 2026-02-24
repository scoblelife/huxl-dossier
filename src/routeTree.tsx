import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router'
import { DossierList } from './pages/DossierList'
import { DossierView } from './pages/DossierView'

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-bg text-text">
      <Outlet />
    </div>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DossierList,
})

const dossierRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dossier/$jobId',
  component: DossierView,
})

export const routeTree = rootRoute.addChildren([indexRoute, dossierRoute])
