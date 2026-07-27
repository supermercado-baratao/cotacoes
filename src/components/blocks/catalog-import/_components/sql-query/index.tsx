import {
  CheckCircleOutlined,
  ContentCopyOutlined,
  LightbulbOutlined,
  StorageOutlined
} from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { codeToHtml } from 'shiki'

import { buildQuery } from './query'
import * as S from './style'

export const SqlQuery = () => {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [copied, setCopied] = useState(false)
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null)

  const query = buildQuery(date)

  useEffect(() => {
    codeToHtml(query, { lang: 'sql', theme: 'dark-plus' }).then(
      setHighlightedHtml
    )
  }, [query])

  const handleCopyClick = async () => {
    await navigator.clipboard.writeText(query)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Box sx={S.Banner}>
        <LightbulbOutlined color="primary" />
        <Box sx={S.BannerText}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Precisa dos dados do VR?
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Gere a query SQL, execute no REP e exporte o arquivo .xlsx para
            importar aqui.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<StorageOutlined />}
          onClick={() => setOpen(true)}
        >
          Gerar Query
        </Button>
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Query SQL — VR Software</DialogTitle>
        <DialogContent>
          <Box sx={S.DateCenter}>
            <TextField
              label="Produtos com entrada a partir de"
              type="date"
              size="small"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              sx={S.DialogDateField}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
          <Box sx={S.CodeWrapper}>
            <Tooltip title={copied ? 'Copiado!' : 'Copiar query'}>
              <IconButton
                size="small"
                onClick={handleCopyClick}
                sx={S.CopyButton}
                color={copied ? 'success' : 'default'}
              >
                {copied ? (
                  <CheckCircleOutlined fontSize="small" />
                ) : (
                  <ContentCopyOutlined fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
            {highlightedHtml ? (
              <Box
                sx={S.ShikiOutput}
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />
            ) : (
              <Box component="pre" sx={S.FallbackCode}>
                {query}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
