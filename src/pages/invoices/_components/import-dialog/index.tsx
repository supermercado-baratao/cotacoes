import {
  Block,
  Close,
  CloudUpload,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material'
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
  Tooltip,
  Typography
} from '@mui/material'
import dayjs from 'dayjs'
import { useMemo, useRef, useState, useTransition } from 'react'

import { Modal } from '@/components'
import { findSupplierByCnpj, formatCurrency, formatNumericValue } from '@/utils'

import { DuplicateNfes } from './duplicate-nfes'
import { IgnoredSupplierNfes } from './ignored-supplier-nfes'
import * as S from './style'
import { useImportDialogHandler } from './use-import-dialog-handler'

type TImportDialogProps = {
  isOpened: boolean
  handleClose: () => void
}

export const ImportDialog = ({ isOpened, handleClose }: TImportDialogProps) => {
  const {
    parsedNfes,
    duplicateNfes,
    ignoredNfes,
    parseErrors,
    products,
    suppliers,
    handleFilesChange,
    handleRemoveNfe,
    handleRemoveDuplicate,
    handleRemoveIgnored,
    handleRemoveError,
    handleIgnoreSupplier,
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
      maxWidth={1200}
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

      <DuplicateNfes
        duplicateNfes={duplicateNfes}
        handleRemoveDuplicate={handleRemoveDuplicate}
      />

      <IgnoredSupplierNfes
        ignoredNfes={ignoredNfes}
        handleRemoveIgnored={handleRemoveIgnored}
      />

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
            <Box sx={S.NfeHeader}>
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
                <Box sx={S.ChipRow}>
                  <Chip
                    label={`${matchedCount}/${totalCount} produtos cadastrados`}
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
              <Tooltip title="Ignorar fornecedor permanentemente">
                <IconButton
                  size="small"
                  onClick={() => handleIgnoreSupplier(nfe)}
                >
                  <Block fontSize="small" />
                </IconButton>
              </Tooltip>
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
                      <TableCell>Cód. Embalagem</TableCell>
                      <TableCell align="right">Qtd</TableCell>
                      <TableCell align="right">Preço</TableCell>
                      <TableCell>Produto</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {nfe.items.map((item) => (
                      <TableRow key={item.itemNumber}>
                        <TableCell>{item.itemNumber}</TableCell>
                        <TableCell sx={S.ItemDescriptionCell}>
                          {item.description.toUpperCase()}
                        </TableCell>
                        <TableCell>
                          {item.barcode
                            ? `${item.barcode}${
                                item.calculatedBarcode === item.barcode
                                  ? ' (calculado)'
                                  : ''
                              }`
                            : '—'}
                        </TableCell>
                        <TableCell>{item.packageBarcode ?? '—'}</TableCell>
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
                              Não cadastrado
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

      <Box sx={S.Actions}>
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
