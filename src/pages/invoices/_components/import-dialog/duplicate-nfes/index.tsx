import { Close } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material'
import { useState } from 'react'

import type { TParsedNfe } from '@/pages/invoices/utils'

type TDuplicateNfesVariant = 'ignored' | 'completable'

const buildMessage = (variant: TDuplicateNfesVariant, count: number) => {
  const isSingular = count === 1
  if (variant === 'completable') {
    return isSingular
      ? 'nota já importada será completada com os dados fiscais do XML (CFOP, natureza da operação e custo com impostos) — vínculos e conferência são mantidos'
      : 'notas já importadas serão completadas com os dados fiscais do XML (CFOP, natureza da operação e custo com impostos) — vínculos e conferência são mantidos'
  }
  return isSingular
    ? 'nota já foi importada anteriormente e será ignorada'
    : 'notas já foram importadas anteriormente e serão ignoradas'
}

type TProps = {
  duplicateNfes: TParsedNfe[]
  variant?: TDuplicateNfesVariant
  handleRemoveDuplicate: (accessKey: string) => void
}

export const DuplicateNfes = ({
  duplicateNfes,
  variant = 'ignored',
  handleRemoveDuplicate
}: TProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (duplicateNfes.length === 0) return null

  const handleToggleExpanded = () => setIsExpanded((previous) => !previous)

  return (
    <Paper variant="outlined" sx={{ mb: 1 }}>
      <Alert
        severity={variant === 'completable' ? 'success' : 'info'}
        action={
          <Button size="small" onClick={handleToggleExpanded}>
            {isExpanded ? 'Ocultar' : 'Ver detalhes'}
          </Button>
        }
      >
        {duplicateNfes.length} {buildMessage(variant, duplicateNfes.length)}
      </Alert>
      <Collapse in={isExpanded} mountOnEnter>
        <Divider />
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nº</TableCell>
                <TableCell>Série</TableCell>
                <TableCell>Fornecedor</TableCell>
                <TableCell>Chave de Acesso</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {duplicateNfes.map((nfe) => (
                <TableRow key={nfe.accessKey}>
                  <TableCell>{nfe.number}</TableCell>
                  <TableCell>{nfe.series}</TableCell>
                  <TableCell>
                    {(nfe.supplierName || nfe.supplierCnpj).toUpperCase()}
                  </TableCell>
                  <TableCell>{nfe.accessKey}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveDuplicate(nfe.accessKey)}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Collapse>
    </Paper>
  )
}
