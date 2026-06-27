import { AutoFixHigh, CheckCircle, Edit } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material'

import { Modal, type TModalProps } from '@/components'
import type { TQuote } from '@/models'
import { formatCurrency } from '@/utils'

import { ProductReferenceForm } from '../table/product-reference-form'
import * as S from './style'
import { useAiReference } from './use-ai-reference'

type TAiReferenceModalProps = {
  quote: TQuote
  onClose: () => void
} & Pick<TModalProps, 'isOpened'>

export const AiReferenceModal = ({
  isOpened,
  quote,
  onClose
}: TAiReferenceModalProps) => {
  const formatElapsed = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const {
    rows,
    uncachedItems,
    isAnalyzing,
    statusMessage,
    elapsedSeconds,
    error,
    acceptedCount,
    editingItem,
    editingSuggestion,
    handleEdit,
    handleAnalyze,
    toggleAccepted,
    handleApply,
    handleClose,
    handleEditClose
  } = useAiReference(quote, isOpened, onClose)

  const isAlreadyReferenced = (itemId: string) =>
    (quote.items.find((i) => i.id === itemId)?.priceRef ?? null) !== null

  const hasRows = rows.length > 0
  const analyzeLabel =
    uncachedItems.length === 1 ? '1 item' : `${uncachedItems.length} itens`

  return (
    <>
      <Modal
        title="Sugestões da IA"
        isOpened={isOpened}
        handleClose={handleClose}
      >
        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}

        {!hasRows && isAnalyzing && (
          <Box sx={S.LoaderWrapper}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary">
              {statusMessage}
            </Typography>
            {elapsedSeconds > 0 && (
              <Typography variant="caption" color="text.disabled">
                Analisando há {formatElapsed(elapsedSeconds)}
              </Typography>
            )}
          </Box>
        )}

        {!hasRows && !isAnalyzing && (
          <Box sx={S.EmptyState}>
            <Typography variant="body2" color="text.secondary">
              Nenhuma análise salva para esta cotação.
            </Typography>
            {uncachedItems.length > 0 && (
              <>
                <Box component="ul" sx={S.UncachedItemList}>
                  {uncachedItems.map((i) => (
                    <Typography
                      key={i.id}
                      component="li"
                      variant="caption"
                      color="text.secondary"
                    >
                      {i.description}
                    </Typography>
                  ))}
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AutoFixHigh />}
                  onClick={handleAnalyze}
                >
                  Analisar {analyzeLabel}
                </Button>
              </>
            )}
          </Box>
        )}

        {hasRows && (
          <>
            <Box sx={S.List}>
              {rows.map(({ item, suggestion, refName, refPrice, accepted }) => {
                const referenced = isAlreadyReferenced(item.id)
                const hasSuggestion = suggestion.type !== null

                return (
                  <Box key={item.id} sx={S.Row}>
                    <Checkbox
                      checked={!referenced && accepted && hasSuggestion}
                      disabled={referenced || !hasSuggestion}
                      onChange={() => toggleAccepted(item.id)}
                      size="small"
                    />
                    <Box sx={S.RowContent}>
                      <Typography
                        variant="body2"
                        noWrap
                        title={item.description}
                      >
                        {item.description}
                      </Typography>
                      <Box sx={S.SuggestionLine}>
                        {referenced ? (
                          <Box sx={S.ReferencedBadge}>
                            <CheckCircle sx={{ fontSize: 12 }} />
                            Referenciado
                          </Box>
                        ) : hasSuggestion && refName ? (
                          <>
                            <Box sx={S.ReferenceChip(suggestion.type!)}>
                              {suggestion.type === 'product'
                                ? 'Produto'
                                : 'Família'}
                            </Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                              title={refName}
                              sx={{ flex: 1, minWidth: 0 }}
                            >
                              {refName}
                            </Typography>
                            {refPrice != null && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ flexShrink: 0 }}
                              >
                                {formatCurrency(refPrice)}
                              </Typography>
                            )}
                          </>
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            Sem sugestão
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Tooltip title="Editar manualmente">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(item.id)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )
              })}
            </Box>

            {uncachedItems.length > 0 && !isAnalyzing && (
              <Box sx={S.UncachedNotice}>
                <Typography variant="caption" color="text.secondary">
                  {analyzeLabel} não
                  {uncachedItems.length === 1 ? ' está' : ' estão'} na análise:
                </Typography>
                <Box component="ul" sx={S.UncachedItemList}>
                  {uncachedItems.map((i) => (
                    <Typography
                      key={i.id}
                      component="li"
                      variant="caption"
                      color="text.secondary"
                    >
                      {i.description}
                    </Typography>
                  ))}
                </Box>
                <Box>
                  <Button
                    size="small"
                    startIcon={<AutoFixHigh />}
                    onClick={handleAnalyze}
                  >
                    Analisar {analyzeLabel}
                  </Button>
                </Box>
              </Box>
            )}

            {isAnalyzing && (
              <Box sx={S.AnalyzeBanner}>
                <CircularProgress size={16} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {statusMessage}
                  </Typography>
                  {elapsedSeconds > 0 && (
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ ml: 1 }}
                    >
                      {formatElapsed(elapsedSeconds)}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            <Box sx={S.Actions}>
              <Button onClick={handleClose}>Cancelar</Button>
              <Button
                variant="contained"
                disabled={acceptedCount === 0 || isAnalyzing}
                onClick={handleApply}
              >
                Aplicar {acceptedCount > 0 ? `${acceptedCount} aceitos` : ''}
              </Button>
            </Box>
          </>
        )}
      </Modal>

      <ProductReferenceForm
        isOpened={!!editingItem}
        quoteItem={editingItem}
        quote={quote}
        initialSuggestion={editingSuggestion}
        handleClose={handleEditClose}
      />
    </>
  )
}
