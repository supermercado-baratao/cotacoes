import { CheckCircle, Edit } from '@mui/icons-material'
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
    isLoading,
    statusMessage,
    elapsedSeconds,
    error,
    acceptedCount,
    editingItem,
    editingSuggestion,
    handleEdit,
    toggleAccepted,
    handleApply,
    handleClose,
    handleEditClose
  } = useAiReference(quote, isOpened, onClose)

  const isAlreadyReferenced = (itemId: string) =>
    (quote.items.find((i) => i.id === itemId)?.priceRef ?? null) !== null

  return (
    <>
      <Modal
        title="Sugestões da IA"
        isOpened={isOpened}
        handleClose={handleClose}
      >
        {isLoading && (
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

        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}

        {!isLoading && !error && (
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

            <Box sx={S.Actions}>
              <Button onClick={handleClose}>Cancelar</Button>
              <Button
                variant="contained"
                disabled={acceptedCount === 0}
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
