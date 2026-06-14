import type { TImportData } from '@/models'

import { Header } from './header'
import { Table } from './table'

type TDataPreviewProps = {
  fileName: string
  importData: TImportData
  selectedIds: string[]
  handleSelectionChange: (ids: string[]) => void
  handleFileRemove: () => void
}

export const DataPreview = ({
  fileName,
  importData,
  selectedIds,
  handleSelectionChange,
  handleFileRemove
}: TDataPreviewProps) => {
  return (
    <>
      <Header
        fileName={fileName}
        importData={importData}
        selectedIds={selectedIds}
        handleRemove={handleFileRemove}
      />
      <Table
        importData={importData}
        selectedIds={selectedIds}
        handleSelectionChange={handleSelectionChange}
      />
    </>
  )
}
