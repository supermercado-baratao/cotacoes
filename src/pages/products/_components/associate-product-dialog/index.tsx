import { Autocomplete, Box, Button, TextField } from '@mui/material'
import { useState } from 'react'

import { Modal } from '@/components/ui/modal'
import type { TProduct } from '@/models/product-model/types'
import { matchesSearch } from '@/utils/search'

import type { TUnmatchedProductItem } from '../../utils'
import * as S from './style'

type TAssociateProductDialogProps = {
  item: TUnmatchedProductItem | null
  products: TProduct[]
  handleClose: () => void
  handleConfirm: (product: TProduct) => void
}

export const AssociateProductDialog = ({
  item,
  products,
  handleClose,
  handleConfirm
}: TAssociateProductDialogProps) => {
  const [product, setProduct] = useState<TProduct | null>(null)

  const handleCloseAndReset = () => {
    setProduct(null)
    handleClose()
  }

  const handleConfirmClick = () => {
    if (!product) return
    handleConfirm(product)
    setProduct(null)
  }

  return (
    <Modal
      isOpened={!!item}
      title="Associar Produto"
      handleClose={handleCloseAndReset}
    >
      <Box sx={S.Wrapper}>
        <Autocomplete
          options={products}
          getOptionLabel={(p) => p.description}
          filterOptions={(options, { inputValue }) =>
            options.filter((option) =>
              matchesSearch(inputValue, option.description)
            )
          }
          isOptionEqualToValue={(o, v) => o.id === v.id}
          value={product}
          onChange={(_, selected: TProduct | null) => setProduct(selected)}
          renderInput={(params) => (
            <TextField {...params} label="Produto" autoFocus />
          )}
        />
        <Box sx={S.Actions}>
          <Button onClick={handleCloseAndReset}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={!product}
            onClick={handleConfirmClick}
          >
            Associar
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}
