import { Close, ExpandLess, ExpandMore, UploadFile } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  Link,
  Paper,
  Typography
} from '@mui/material'
import dayjs from 'dayjs'
import { useRef } from 'react'

import { Modal } from '@/components'
import type { TQuote } from '@/models'
import { formatCurrency } from '@/utils'

import { REASON_LABELS } from './constants'
import { useNfImportHandler } from './use-nf-import-handler'

type TNfImportDialogProps = {
  isOpened: boolean
  quote: TQuote
  handleClose: () => void
}

export const NfImportDialog = ({
  isOpened,
  quote,
  handleClose
}: TNfImportDialogProps) => {
  const {
    parsedNfes,
    parseErrors,
    matchResult,
    nfeStats,
    isUnmatchedOpen,
    setIsUnmatchedOpen,
    handleFilesChange,
    handleRemoveNfe,
    handleRemoveError,
    handleReset,
    handleImport
  } = useNfImportHandler(quote, handleClose)

  const handleCloseAndReset = () => {
    handleClose()
    handleReset()
  }

  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFilesChange(e.target.files)
    e.target.value = ''
  }

  const hasContent = parsedNfes.length > 0 || parseErrors.length > 0
  const matchedCount = matchResult?.matched.length ?? 0
  const unmatchedCount = matchResult?.unmatched.length ?? 0

  return (
    <Modal
      title="Importar Notas Fiscais"
      isOpened={isOpened}
      handleClose={handleCloseAndReset}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <input
          ref={inputRef}
          type="file"
          accept=".xml"
          multiple
          hidden
          onChange={handleFileInputChange}
        />

        <Button
          variant="outlined"
          startIcon={<UploadFile />}
          onClick={() => inputRef.current?.click()}
          fullWidth
        >
          {hasContent ? 'Adicionar mais arquivos' : 'Selecionar arquivos XML'}
        </Button>

        {parseErrors.map((e, i) => (
          <Alert key={i} severity="error" onClose={() => handleRemoveError(i)}>
            <strong>{e.filename}:</strong> {e.message}
          </Alert>
        ))}

        {parsedNfes.map((nfe) => {
          const stats = nfeStats.get(nfe.accessKey)!
          const chipColor =
            stats.matched === stats.total
              ? 'success'
              : stats.matched > 0
                ? 'warning'
                : 'error'

          return (
            <Paper key={nfe.accessKey} variant="outlined" sx={{ p: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}
              >
                <Box>
                  <Typography variant="subtitle2">
                    NF {nfe.number} · Série {nfe.series}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {nfe.supplierName || nfe.supplierCnpj}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(nfe.emissionDate).format('DD/MM/YYYY')} ·{' '}
                    {formatCurrency(nfe.totalValue)}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={`${stats.matched} de ${stats.total} itens correspondidos`}
                      color={chipColor}
                      size="small"
                    />
                  </Box>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveNfe(nfe.accessKey)}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          )
        })}

        {matchResult && (
          <Box
            sx={{
              px: 1.5,
              py: 1,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'action.hover'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 0.5
              }}
            >
              <Typography variant="body2">
                <strong>{matchedCount}</strong>{' '}
                {matchedCount === 1
                  ? 'pedido será criado'
                  : 'pedidos serão criados'}
              </Typography>
              {unmatchedCount > 0 && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    ·
                  </Typography>
                  <Link
                    component="button"
                    variant="body2"
                    color="warning.main"
                    onClick={() => setIsUnmatchedOpen((v) => !v)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.25,
                      textDecoration: 'none'
                    }}
                  >
                    {unmatchedCount} sem correspondência
                    {isUnmatchedOpen ? (
                      <ExpandLess fontSize="inherit" />
                    ) : (
                      <ExpandMore fontSize="inherit" />
                    )}
                  </Link>
                </>
              )}
            </Box>

            <Collapse in={isUnmatchedOpen}>
              <Box
                sx={{
                  mt: 1,
                  maxHeight: 200,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5
                }}
              >
                {matchResult.unmatched.map((u, i) => (
                  <Typography key={i} variant="caption" color="text.secondary">
                    {u.description}{' '}
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.disabled"
                    >
                      (NF {u.nfNumber})
                    </Typography>{' '}
                    — {REASON_LABELS[u.reason]}
                  </Typography>
                ))}
              </Box>
            </Collapse>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={handleCloseAndReset}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={!matchedCount}
            onClick={handleImport}
          >
            {matchedCount
              ? `Criar ${matchedCount} ${matchedCount === 1 ? 'Pedido' : 'Pedidos'}`
              : 'Criar Pedidos'}
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}
