import {
  Box,
  Button,
  Checkbox,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useState } from 'react'

import { Modal, SearchInput, type TModalProps } from '@/components'
import { MAX_OBSERVATIONS_LENGTH } from '@/constants'
import type { TQuote, TQuoteItemType } from '@/models'

import { TAB_LABELS } from './constants'
import * as S from './style'
import { useFormHandler } from './use-form-handler'

type TFormProps = {
  quote: TQuote | null
  setFormQuote: (quote: TQuote | null) => void
} & Pick<TModalProps, 'isOpened' | 'handleClose'>

const ITEM_HEIGHT = 40

export const Form = ({
  isOpened,
  quote,
  handleClose,
  setFormQuote
}: TFormProps) => {
  const {
    register,
    onSubmit,
    errors,
    search,
    setSearch,
    activeTab,
    setActiveTab,
    filteredOptions,
    isSelected,
    handleItemToggle,
    selectedCount
  } = useFormHandler(quote, setFormQuote, handleClose)

  const [listEl, setListEl] = useState<HTMLDivElement | null>(null)

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => listEl,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5
  })

  useEffect(() => {
    if (listEl) listEl.scrollTop = 0
  }, [filteredOptions, listEl])

  const title = quote ? 'Editar Cotação' : 'Nova Cotação'

  return (
    <Modal title={title} isOpened={isOpened} handleClose={handleClose}>
      <Box sx={S.Wrapper} component="form" onSubmit={onSubmit} noValidate>
        <TextField
          {...register('date')}
          label="Data"
          type="date"
          error={!!errors.date}
          helperText={errors.date?.message}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <Box sx={S.ProductsSection}>
          <Typography variant="subtitle2">Itens</Typography>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v as TQuoteItemType)}
            variant="fullWidth"
          >
            {(Object.keys(TAB_LABELS) as TQuoteItemType[]).map((tab) => (
              <Tab key={tab} value={tab} label={TAB_LABELS[tab]} />
            ))}
          </Tabs>
          <SearchInput
            placeholder={`Buscar ${TAB_LABELS[activeTab].toLowerCase()}...`}
            value={search}
            onValueChange={setSearch}
            sx={{ maxWidth: 'none' }}
          />
          <Box sx={S.ListInfo}>
            <Typography variant="caption" color="text.secondary">
              {filteredOptions.length} itens
            </Typography>
            <Typography variant="caption" color="primary">
              {selectedCount} selecionados
            </Typography>
          </Box>
          <Box ref={setListEl} sx={S.ProductList}>
            <Box
              sx={{
                height: rowVirtualizer.getTotalSize(),
                position: 'relative'
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const item = filteredOptions[virtualItem.index]
                return (
                  <ListItem
                    key={item.id}
                    disablePadding
                    sx={{
                      position: 'absolute',
                      top: virtualItem.start,
                      width: '100%'
                    }}
                  >
                    <ListItemButton
                      dense
                      onClick={() => handleItemToggle(item.id, activeTab)}
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={isSelected(item.id)}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.description}
                        slotProps={{ primary: { variant: 'body2' } }}
                      />
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </Box>
          </Box>
        </Box>
        <TextField
          {...register('observations')}
          label="Observações"
          multiline
          minRows={2}
          error={!!errors.observations}
          helperText={errors.observations?.message}
          slotProps={{ htmlInput: { maxLength: MAX_OBSERVATIONS_LENGTH } }}
        />
        <Box sx={S.Actions}>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" variant="contained">
            Salvar
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}
