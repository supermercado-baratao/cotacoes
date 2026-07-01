import { Close, CloudUpload, ExpandLess, ExpandMore } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import dayjs from 'dayjs'
import { useMemo, useRef, useState, useTransition } from 'react'

import { Modal } from '@/components'
import { findSupplierByCnpj, formatCurrency, formatNumericValue } from '@/utils'

import { useImportDialogHandler } from './use-import-dialog-handler'

type TImportDialogProps = {
  isOpened: boolean
  handleClose: () => void
}

export const ImportDialog = ({ isOpened, handleClose }: TImportDialogProps) => {
  const {
    parsedNfes,
    parseErrors,
    products,
    suppliers,
    handleFilesChange,
    handleRemoveNfe,
    handleRemoveError,
    handleReset,
    handleImport
  } = useImportDialogHandler(handleClose)

  const inputRef = useRef<HTMLInputElement>(null)
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p.description])),
    [products]
  )

  const handleCloseAndReset = () => {
    handleClose()
    handleReset()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFilesChange(e.target.files)
    e.target.value = ''
  }

  const toggleExpanded = (accessKey: string) => {
    setPendingKey(accessKey)
    startTransition(() => {
      setExpandedKeys((prev) => {
        const next = new Set(prev)
        next.has(accessKey) ? next.delete(accessKey) : next.add(accessKey)
        return next
      })
      setPendingKey(null)
    })
  }

  return (
    <Modal
      isOpened={isOpened}
      title="Importar Notas Fiscais"
      handleClose={handleCloseAndReset}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xml"
        multiple
        hidden
        onChange={handleFileChange}
      />

      <Button
        variant="outlined"
        startIcon={<CloudUpload />}
        onClick={() => inputRef.current?.click()}
        fullWidth
        sx={{ mb: 2 }}
      >
        {parsedNfes.length > 0
          ? 'Adicionar mais arquivos XML'
          : 'Selecionar arquivos XML'}
      </Button>

      {parseErrors.map((err, i) => (
        <Alert
          key={i}
          severity="error"
          sx={{ mb: 1 }}
          action={
            <IconButton size="small" onClick={() => handleRemoveError(i)}>
              <Close fontSize="inherit" />
            </IconButton>
          }
        >
          <strong>{err.filename}:</strong> {err.message}
        </Alert>
      ))}

      {parsedNfes.map((nfe) => {
        const matchedCount = nfe.items.filter((i) => i.productId).length
        const totalCount = nfe.items.length
        const isExpanded = expandedKeys.has(nfe.accessKey)
        const supplier = findSupplierByCnpj(nfe.supplierCnpj, suppliers)

        const chipColor =
          matchedCount === 0
            ? 'error'
            : matchedCount === totalCount
              ? 'success'
              : 'warning'

        return (
          <Paper key={nfe.accessKey} variant="outlined" sx={{ mb: 1 }}>
            <Box
              sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 2 }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  NF nº {nfe.number} — Série {nfe.series}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(nfe.supplierName || nfe.supplierCnpj).toUpperCase()}
                </Typography>
                {!supplier && (
                  <Typography variant="body2" color="warning.main">
                    Fornecedor não encontrado (CNPJ: {nfe.supplierCnpj})
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {dayjs(nfe.emissionDate).format('DD/MM/YYYY')} •{' '}
                  {formatCurrency(nfe.totalValue)}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mt: 0.5
                  }}
                >
                  <Chip
                    label={`${matchedCount}/${totalCount} produtos identificados`}
                    color={chipColor}
                    size="small"
                  />
                  <Button
                    size="small"
                    endIcon={
                      isPending && pendingKey === nfe.accessKey ? (
                        <CircularProgress size={14} />
                      ) : isExpanded ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      )
                    }
                    disabled={isPending && pendingKey === nfe.accessKey}
                    onClick={() => toggleExpanded(nfe.accessKey)}
                    sx={{ ml: 'auto' }}
                  >
                    {isExpanded ? 'Ocultar itens' : 'Ver itens'}
                  </Button>
                </Box>
              </Box>
              <IconButton
                size="small"
                onClick={() => handleRemoveNfe(nfe.accessKey)}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>

            <Collapse in={isExpanded} mountOnEnter>
              <Divider />
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nº</TableCell>
                      <TableCell>Descrição NF</TableCell>
                      <TableCell>Cód. Barras</TableCell>
                      <TableCell align="right">Qtd</TableCell>
                      <TableCell align="right">Preço</TableCell>
                      <TableCell>Produto</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {nfe.items.map((item) => (
                      <TableRow key={item.itemNumber}>
                        <TableCell>{item.itemNumber}</TableCell>
                        <TableCell
                          sx={{
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {item.description.toUpperCase()}
                        </TableCell>
                        <TableCell>{item.barcode ?? '—'}</TableCell>
                        <TableCell align="right">
                          {formatNumericValue(item.quantity)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell>
                          {item.productId ? (
                            <Typography variant="body2" color="success.main">
                              {(
                                productMap.get(item.productId) ?? item.productId
                              ).toUpperCase()}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="error.main">
                              Não identificado
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </Paper>
        )
      })}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
        <Button onClick={handleCloseAndReset}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={!parsedNfes.length}
          onClick={handleImport}
        >
          {parsedNfes.length > 0
            ? `Importar ${parsedNfes.length} ${parsedNfes.length === 1 ? 'nota' : 'notas'}`
            : 'Importar'}
        </Button>
      </Box>
    </Modal>
  )
}
