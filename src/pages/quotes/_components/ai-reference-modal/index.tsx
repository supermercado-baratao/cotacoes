import {
  AddLink,
  CheckCircle,
  Edit,
  Refresh,
  TipsAndUpdates
} from '@mui/icons-material'
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

import { Modal, type TModalProps } from '@/components/ui/modal'
import type { TQuote } from '@/models/quote/types'
import { ProductReferenceForm } from '@/pages/quotes/_components/table/product-reference-form'
import { formatCurrency } from '@/utils/formatters'

import * as S from './style'
import { useAiReference } from './use-ai-reference'

type TAiReferenceModalProps = {
  quote: TQuote
  onClose: () => void
} & Pick<TModalProps, 'isOpened'>

const formatElapsed = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export const AiReferenceModal = ({
  isOpened,
  quote,
  onClose
}: TAiReferenceModalProps) => {
  const {
    rows,
    isAnalyzing,
    statusMessage,
    elapsedSeconds,
    error,
    isAiUnavailable,
    acceptedCount,
    editingItem,
    editingSuggestion,
    handleEdit,
    handleRetry,
    toggleAccepted,
    handleApply,
    handleClose,
    handleEditClose
  } = useAiReference(quote, isOpened, onClose)

  const isAlreadyReferenced = (itemId: string) =>
    (quote.items.find((item) => item.id === itemId)?.priceRef ?? null) !== null

  const hasRows = rows.length > 0
  const allReferenced =
    hasRows && rows.every(({ item }) => isAlreadyReferenced(item.id))
  const isProgressMessage =
    !statusMessage.startsWith('Dica:') &&
    !statusMessage.startsWith('Curiosidade:')

  return (
    <>
      <Modal
        title="Sugestões da IA"
        isOpened={isOpened}
        handleClose={handleClose}
      >
        {error && (
          <Alert
            severity="error"
            sx={{ mt: 1 }}
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<Refresh />}
                onClick={handleRetry}
              >
                Tentar novamente
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {!error && !isAnalyzing && isAiUnavailable && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            Não foi possível conectar à IA. As sugestões abaixo foram geradas
            localmente por correspondência de texto.
          </Alert>
        )}

        {isAnalyzing && (
          <Box sx={S.LoaderWrapper}>
            <Box sx={S.MessageBox}>
              <Box sx={S.MessageAccent(isProgressMessage)} />
              <Box sx={S.MessageBoxContent}>
                <Box key={statusMessage} sx={S.MessageContent}>
                  {isProgressMessage ? (
                    <CircularProgress
                      size={18}
                      thickness={4.5}
                      sx={S.SpinnerIcon}
                    />
                  ) : (
                    <TipsAndUpdates
                      fontSize="small"
                      color="warning"
                      sx={{ flexShrink: 0, mt: 0.1 }}
                    />
                  )}
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {statusMessage}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={S.LoaderFooter}>
              <Typography variant="caption" color="text.disabled">
                {formatElapsed(elapsedSeconds)}
              </Typography>
              <Button onClick={handleClose} size="small">
                Cancelar
              </Button>
            </Box>
          </Box>
        )}

        {!isAnalyzing && allReferenced && (
          <>
            <Box sx={S.AllReferencedWrapper}>
              <CheckCircle color="success" sx={{ fontSize: 56 }} />
              <Typography variant="h6">Tudo referenciado!</Typography>
              <Typography variant="body2" color="text.secondary">
                Todos os itens desta cotação já possuem referência de preço.
                <br />
                Para alterar uma referência, use o ícone de vínculo (
                <AddLink sx={{ fontSize: 14, verticalAlign: 'middle' }} />) na
                tabela.
              </Typography>
            </Box>
            <Box sx={S.Actions}>
              <Button variant="contained" onClick={handleClose}>
                Fechar
              </Button>
            </Box>
          </>
        )}

        {!isAnalyzing && hasRows && !allReferenced && (
          <>
            <Box sx={S.List}>
              {rows.map((row) => {
                const {
                  item,
                  suggestion,
                  refName,
                  refPrice,
                  referenceLabel,
                  accepted
                } = row
                const referenced = isAlreadyReferenced(item.id)
                const hasSuggestion = suggestion.type !== null

                return (
                  <Box key={item.id} sx={S.Row}>
                    {referenced ? (
                      <Box sx={S.RowCheckSlot}>
                        <CheckCircle color="success" fontSize="small" />
                      </Box>
                    ) : (
                      <Checkbox
                        checked={accepted && hasSuggestion}
                        disabled={!hasSuggestion}
                        onChange={() => toggleAccepted(item.id)}
                        size="small"
                      />
                    )}
                    <Box sx={S.RowContent}>
                      <Typography
                        variant="body2"
                        noWrap
                        title={item.description}
                      >
                        {item.description}
                      </Typography>
                      <Box sx={S.SuggestionLine}>
                        {referenced && item.priceRef ? (
                          <>
                            <Box sx={S.ReferenceChip(item.priceRef.type)}>
                              {item.priceRef.type === 'product'
                                ? 'Produto'
                                : item.priceRef.type === 'family'
                                  ? 'Família'
                                  : 'Manual'}
                            </Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                              title={referenceLabel ?? undefined}
                              sx={{ flex: 1, minWidth: 0 }}
                            >
                              {referenceLabel}
                            </Typography>
                            {item.salePrice != null && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ flexShrink: 0 }}
                              >
                                {formatCurrency(item.salePrice)}
                              </Typography>
                            )}
                          </>
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
