import type { TProductImportStatus } from '@/components/blocks/catalog-import/utils'
import type { TImportData } from '@/models/import/types'

import { Header } from './header'
import { Table } from './table'

type TDataPreviewProps = {
  fileName: string
  importData: TImportData
  selectedIds: string[]
  handleSelectionChange: (ids: string[]) => void
  productStatuses: Map<string, TProductImportStatus>
  handleFileRemove: () => void
}

export const DataPreview = ({
  fileName,
  importData,
  selectedIds,
  handleSelectionChange,
  productStatuses,
  handleFileRemove
}: TDataPreviewProps) => {
  return (
    <>
      <Header
        fileName={fileName}
        importData={importData}
        productStatuses={productStatuses}
        handleRemove={handleFileRemove}
      />
      <Table
        importData={importData}
        selectedIds={selectedIds}
        handleSelectionChange={handleSelectionChange}
        productStatuses={productStatuses}
      />
    </>
  )
}
