import { Alert, Box, Button, Typography } from '@mui/material'

import { Loader } from '@/components/ui/loader'
import { Modal } from '@/components/ui/modal'
import { DropZone } from '@/pages/price-adjustments/_components/drop-zone'
import { useAppStore } from '@/stores/use-app-store'

import * as S from './style'
import { useImportDialogHandler } from './use-import-dialog-handler'

type TImportDialogProps = {
  isOpened: boolean
  handleClose: () => void
  onImported: () => void
}

export const ImportDialog = ({
  isOpened,
  handleClose,
  onImported
}: TImportDialogProps) => {
  const { products, quotes, invoices, suppliers } = useAppStore()

  const { status, errorMessage, handleFileSelect, handleReset } =
    useImportDialogHandler(
      {
        products: products ?? [],
        quotes: quotes ?? [],
        invoices: invoices ?? [],
        suppliers: suppliers ?? []
      },
      onImported
    )

  const handleCloseAndReset = () => {
    handleClose()
    handleReset()
  }

  return (
    <Modal
      isOpened={isOpened}
      title="Importar Arquivo de Reajuste"
      handleClose={handleCloseAndReset}
    >
      {status === 'idle' && <DropZone onFileSelect={handleFileSelect} />}

      {status === 'processing' && (
        <Box sx={S.Processing}>
          <Loader />
          <Typography color="text.secondary">
            Processando arquivo e cruzando dados...
          </Typography>
        </Box>
      )}

      {status === 'error' && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleReset}>
              Tentar novamente
            </Button>
          }
        >
          {errorMessage}
        </Alert>
      )}
    </Modal>
  )
}
