import { Timestamp } from 'firebase/firestore'

export type TMarginTolerance = {
  below: number
  above: number
}

export type TSettings = {
  id: string
  pdfDepartmentOrder: string[]
  marginTolerance: TMarginTolerance
  departmentMarginTolerances: Record<string, TMarginTolerance>
  lastCatalogImportAt: Timestamp | null
  lastInvoiceImportAt: Timestamp | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
