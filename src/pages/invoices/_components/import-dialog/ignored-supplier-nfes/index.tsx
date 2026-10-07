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

import type { TParsedNfe } from '../../../utils'

type TProps = {
  ignoredNfes: TParsedNfe[]
  handleRemoveIgnored: (accessKey: string) => void
}

export const IgnoredSupplierNfes = ({
  ignoredNfes,
  handleRemoveIgnored
}: TProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (ignoredNfes.length === 0) return null

  const handleToggleExpanded = () => setIsExpanded((previous) => !previous)

  return (
    <Paper variant="outlined" sx={{ mb: 1 }}>
      <Alert
        severity="warning"
        action={
          <Button size="small" onClick={handleToggleExpanded}>
            {isExpanded ? 'Ocultar' : 'Ver detalhes'}
          </Button>
        }
      >
        {ignoredNfes.length}{' '}
        {ignoredNfes.length === 1
          ? 'nota é de um fornecedor ignorado e não será importada'
          : 'notas são de fornecedores ignorados e não serão importadas'}
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
              {ignoredNfes.map((nfe) => (
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
                      onClick={() => handleRemoveIgnored(nfe.accessKey)}
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
