import { CheckCircleOutlined } from '@mui/icons-material'
import { Box, Button, Typography } from '@mui/material'

import { DataPreview, DropZone, SqlQuery } from './_components'
import * as S from './style'
import { useImportHandler } from './use-import-handler'

export const Import = () => {
  const {
    file,
    handleFileSelect,
    handleFileRemove,
    importData,
    selectedIds,
    setSelectedIds,
    productStatuses,
    handleImportClick
  } = useImportHandler()
  return (
    <>
      <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
        Importação
      </Typography>
      {!file ? (
        <>
          <SqlQuery />
          <DropZone onFileSelect={handleFileSelect} />
        </>
      ) : (
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
              {selectedIds.length !== 1 ? 's' : ''}
            </Button>
          </Box>
        </>
      )}
    </>
  )
}
