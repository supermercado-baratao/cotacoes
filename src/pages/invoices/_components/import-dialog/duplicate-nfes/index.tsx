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
  duplicateNfes: TParsedNfe[]
  handleRemoveDuplicate: (accessKey: string) => void
}

export const DuplicateNfes = ({
  duplicateNfes,
  handleRemoveDuplicate
}: TProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!duplicateNfes.length) return null

  const handleToggleExpanded = () => setIsExpanded((prev) => !prev)

  return (
    <Paper variant="outlined" sx={{ mb: 1 }}>
      <Alert
        severity="info"
        action={
          <Button size="small" onClick={handleToggleExpanded}>
            {isExpanded ? 'Ocultar' : 'Ver detalhes'}
          </Button>
        }
      >
        {duplicateNfes.length}{' '}
        {duplicateNfes.length === 1
          ? 'nota já foi importada anteriormente e será ignorada'
          : 'notas já foram importadas anteriormente e serão ignoradas'}
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
