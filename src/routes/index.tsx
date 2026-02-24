import { createFileRoute } from '@tanstack/react-router'
import { DossierList as DossierListPage } from '~/pages/DossierList'

export const Route = createFileRoute('/')({
  component: DossierListPage,
})
