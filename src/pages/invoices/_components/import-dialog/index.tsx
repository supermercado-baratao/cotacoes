import { CloudUpload } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material'
import dayjs from 'dayjs'
import { useRef } from 'react'

import { Modal } from '@/components'
import { formatCurrency } from '@/utils'

import { useImportDialogHandler } from './use-import-dialog-handler'

type TImportDialogProps = {
  isOpened: boolean
  handleClose: () => void
}

export const ImportDialog = ({ isOpened, handleClose }: TImportDialogProps) => {
  const {
    origin,
    setOrigin,
    parsedNfe,
    parseError,
    handleFileSelect,
    handleReset,
    handleImport
  } = useImportDialogHandler(handleClose)

  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
    e.target.value = ''
  }

  const matchedCount = parsedNfe?.items.filter((i) => i.productId).length ?? 0
  const totalCount = parsedNfe?.items.length ?? 0

  return (
    <Modal
      isOpened={isOpened}
      title="Importar Nota Fiscal"
      handleClose={handleClose}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Tipo de nota:
        </Typography>
        <ToggleButtonGroup
          value={origin}
          exclusive
          onChange={(_, v) => v && setOrigin(v)}
          size="small"
        >
          <ToggleButton value="issued">Emitida</ToggleButton>
          <ToggleButton value="posted">Lançada</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <input
        ref={inputRef}
        type="file"
        accept=".xml"
        hidden
        onChange={handleFileChange}
      />

      {!parsedNfe && !parseError && (
        <Button
          variant="outlined"
          startIcon={<CloudUpload />}
          onClick={() => inputRef.current?.click()}
          fullWidth
          sx={{ mb: 2 }}
        >
          Selecionar arquivo XML
        </Button>
      )}

      {parseError && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error">{parseError}</Alert>
          <Button
            variant="text"
            size="small"
            sx={{ mt: 1 }}
            onClick={() => {
              handleReset()
              inputRef.current?.click()
            }}
          >
            Tentar outro arquivo
          </Button>
        </Box>
      )}

      {parsedNfe && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            NF nº {parsedNfe.number} — Série {parsedNfe.series}
          </Typography>
          <Typography variant="body2">
            <strong>Fornecedor:</strong>{' '}
            {parsedNfe.supplierName || parsedNfe.supplierCnpj}
          </Typography>
          {!parsedNfe.supplierId && (
            <Typography variant="body2" color="warning.main" sx={{ mt: 0.5 }}>
              Fornecedor não encontrado no sistema (CNPJ:{' '}
              {parsedNfe.supplierCnpj})
            </Typography>
          )}
          <Typography variant="body2">
            <strong>Emissão:</strong>{' '}
            {dayjs(parsedNfe.emissionDate).format('DD/MM/YYYY')}
          </Typography>
          <Typography variant="body2">
            <strong>Total NF:</strong> {formatCurrency(parsedNfe.totalValue)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Typography variant="body2">
              <strong>Itens:</strong> {totalCount}
            </Typography>
            <Chip
              label={`${matchedCount}/${totalCount} produtos identificados`}
              color={matchedCount === totalCount ? 'success' : 'warning'}
              size="small"
            />
          </Box>
          <Button
            variant="text"
            size="small"
            sx={{ mt: 1 }}
            onClick={() => {
              handleReset()
              inputRef.current?.click()
            }}
          >
            Trocar arquivo
          </Button>
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={!parsedNfe}
          onClick={handleImport}
        >
          Importar
        </Button>
      </Box>
    </Modal>
  )
}
