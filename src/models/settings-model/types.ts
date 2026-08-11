import { Timestamp } from 'firebase/firestore'

export type TSettings = {
  id: string
  pdfDepartmentOrder: string[]
  lastCatalogImportAt: Timestamp | null
  lastInvoiceImportAt: Timestamp | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
