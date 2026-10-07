import { CheckCircleOutlined } from '@mui/icons-material'
import { Box, Button } from '@mui/material'

import { Modal, type TModalProps } from '@/components/ui/modal'
import { useAppStore } from '@/stores/use-app-store'

import { DataPreview } from './_components/data-preview'
import { DropZone } from './_components/drop-zone'
import { SqlQuery } from './_components/sql-query'
import * as S from './style'
import { useImportHandler } from './use-import-handler'

type TCatalogImportProps = Pick<TModalProps, 'isOpened' | 'handleClose'>

export const CatalogImport = ({
  isOpened,
  handleClose
}: TCatalogImportProps) => {
  const { settings } = useAppStore()
  const {
    file,
    handleFileSelect,
    handleFileRemove,
    importData,
    selectedIds,
    setSelectedIds,
    productStatuses,
    handleImportClick
  } = useImportHandler(handleClose)

  const handleModalClose = () => {
    handleFileRemove()
    handleClose()
  }

  return (
    <Modal
      title="Importar Catálogo"
      isOpened={isOpened}
      handleClose={handleModalClose}
      maxWidth={1200}
    >
      {file ? (
        <>
          {importData && (
            <DataPreview
              fileName={file.name}
              importData={importData}
              selectedIds={selectedIds}
              handleSelectionChange={setSelectedIds}
              productStatuses={productStatuses}
              handleFileRemove={handleFileRemove}
            />
          )}
          <Box sx={S.Actions}>
            <Button variant="outlined" onClick={handleFileRemove}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              startIcon={<CheckCircleOutlined />}
              disabled={selectedIds.length === 0}
              onClick={handleImportClick}
            >
              Importar {selectedIds.length} produto
              {selectedIds.length === 1 ? '' : 's'}
            </Button>
          </Box>
        </>
      ) : (
        <>
          <SqlQuery lastImportAt={settings?.lastCatalogImportAt ?? null} />
          <DropZone onFileSelect={handleFileSelect} />
        </>
      )}
    </Modal>
  )
}
