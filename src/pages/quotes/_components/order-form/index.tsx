import { Box, Button, TextField, Typography } from '@mui/material'
import dayjs from 'dayjs'
import { useState } from 'react'

import {
  Autocomplete,
  CurrencyInput,
  FamilyForm,
  Modal,
  ProductForm,
  SellerForm,
  SupplierForm,
  type TModalProps
} from '@/components'
import { MAX_NUMERIC_VALUE, MAX_OBSERVATIONS_LENGTH } from '@/constants'
import type { TOrder, TQuoteItem } from '@/models'
import { formatCurrency, formatNumericValue, selectOnFocus } from '@/utils'

import * as S from './style'
import { useFormHandler } from './use-form-handler'

type TOrderFormProps = {
  quoteItem: TQuoteItem | null
  order: TOrder | null
  setFormOrder: (order: TOrder | null) => void
} & Pick<TModalProps, 'isOpened' | 'handleClose'>

export const OrderForm = ({
  isOpened,
  quoteItem,
  order,
  setFormOrder,
  handleClose
}: TOrderFormProps) => {
  const {
    register,
    onSubmit,
    errors,
    control,
    suppliers,
    sellers,
    selectableProducts,
    selectedProduct,
    lastOrder
  } = useFormHandler(quoteItem, order, setFormOrder, handleClose)

  const [quickCreateSupplier, setQuickCreateSupplier] = useState(false)
  const [quickCreateSeller, setQuickCreateSeller] = useState(false)
  const [quickCreateProduct, setQuickCreateProduct] = useState(false)
  const [quickCreateFamily, setQuickCreateFamily] = useState(false)

  const title = order ? 'Editar Pedido' : 'Novo Pedido'

  return (
    <>
      <Modal title={title} isOpened={isOpened} handleClose={handleClose}>
        <Box sx={S.Wrapper} component="form" onSubmit={onSubmit} noValidate>
          <Autocomplete
            name="productId"
            control={control}
            options={selectableProducts}
            getOptionLabel={(p) => p.description}
            getOptionValue={(p) => p.id}
            label="Produto"
            error={!!errors.productId}
            helperText={errors.productId?.message}
            addLabel="Novo Produto"
            handleAddClick={() => setQuickCreateProduct(true)}
            sx={S.FullWidth}
          />
          {selectedProduct?.price != null && (
            <TextField
              label="Preço de Venda"
              value={formatCurrency(selectedProduct.price)}
              sx={S.ThreeCol}
              slotProps={{ input: { readOnly: true } }}
            />
          )}
          <CurrencyInput
            name="price"
            control={control}
            label="Preço de Custo"
            error={!!errors.price}
            helperText={errors.price?.message}
            sx={S.ThreeCol}
            onFocus={selectOnFocus}
          />
          <TextField
            {...register('quantity', { valueAsNumber: true })}
            label="Quantidade"
            type="number"
            error={!!errors.quantity}
            helperText={errors.quantity?.message}
            sx={S.ThreeCol}
            onFocus={selectOnFocus}
            slotProps={{
              htmlInput: { min: 1, max: MAX_NUMERIC_VALUE, step: 1 }
            }}
          />
          <TextField
            {...register('packing')}
            label="Embalagem"
            error={!!errors.packing}
            helperText={errors.packing?.message}
            sx={S.ThreeCol}
            onFocus={selectOnFocus}
          />
          <TextField
            {...register('date')}
            label="Data"
            type="date"
            error={!!errors.date}
            helperText={errors.date?.message}
            sx={S.ThreeCol}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Autocomplete
            name="supplierId"
            control={control}
            options={suppliers}
            getOptionLabel={(s) => s.tradeName}
            getOptionValue={(s) => s.id}
            label="Fornecedor"
            error={!!errors.supplierId}
            helperText={errors.supplierId?.message}
            addLabel="Novo Fornecedor"
            handleAddClick={() => setQuickCreateSupplier(true)}
            sx={S.ThreeCol}
          />
          <Autocomplete
            name="sellerId"
            control={control}
            options={sellers}
            getOptionLabel={(s) => s.name}
            getOptionValue={(s) => s.id}
            label="Vendedor"
            addLabel="Novo Vendedor"
            handleAddClick={() => setQuickCreateSeller(true)}
            sx={S.ThreeCol}
          />
          <TextField
            {...register('observations')}
            label="Observações"
            multiline
            minRows={2}
            error={!!errors.observations}
            helperText={errors.observations?.message}
            sx={S.FullWidth}
            onFocus={selectOnFocus}
            slotProps={{ htmlInput: { maxLength: MAX_OBSERVATIONS_LENGTH } }}
          />
          {lastOrder && (
            <Box sx={S.LastOrder}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                Último pedido:
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {[
                  dayjs(lastOrder.date).format('DD/MM/YYYY'),
                  lastOrder.supplierName.toUpperCase(),
                  lastOrder.sellerName?.toUpperCase(),
                  formatCurrency(lastOrder.price),
                  formatNumericValue(lastOrder.quantity),
                  lastOrder.packing.toUpperCase()
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Typography>
            </Box>
          )}
          <Box sx={S.Actions}>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Salvar
            </Button>
          </Box>
        </Box>
      </Modal>
      <SupplierForm
        isOpened={quickCreateSupplier}
        supplier={null}
        setFormSupplier={() => {}}
        handleClose={() => setQuickCreateSupplier(false)}
      />
      <SellerForm
        isOpened={quickCreateSeller}
        seller={null}
        setFormSeller={() => {}}
        handleClose={() => setQuickCreateSeller(false)}
      />
      <ProductForm
        isOpened={quickCreateProduct}
        product={null}
        setFormProduct={() => {}}
        handleClose={() => setQuickCreateProduct(false)}
        setQuickCreateFamily={setQuickCreateFamily}
      />
      <FamilyForm
        isOpened={quickCreateFamily}
        family={null}
        setFormFamily={() => {}}
        handleClose={() => setQuickCreateFamily(false)}
      />
    </>
  )
}
