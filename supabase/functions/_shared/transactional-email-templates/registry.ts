import type { ComponentType } from 'npm:react@18.3.1'
import { template as generic } from './generic.tsx'
import { template as invitation } from './invitation.tsx'

export interface TemplateEntry<P = any> {
  component: ComponentType<P>
  subject: string | ((data: P) => string)
  displayName?: string
  previewData?: P
  to?: string
}

export const TEMPLATES: Record<string, TemplateEntry<any>> = {
  generic,
  invitation,
}