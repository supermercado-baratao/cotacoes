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
import type { TInvoice, TOrder, TProduct, TQuoteItem } from '@/models'
import { formatCurrency, formatNumericValue, selectOnFocus } from '@/utils'

import * as S from './style'
import { useFormHandler } from './use-form-handler'

type TInvoiceRef = { invoice: TInvoice; itemNumber: number }

type TOrderFormProps = {
  quoteItem: TQuoteItem | null
  order: TOrder | null
  setFormOrder: (order: TOrder | null) => void
  invoiceRef?: TInvoiceRef | null
} & Pick<TModalProps, 'isOpened' | 'handleClose'>

export const OrderForm = ({
  isOpened,
  quoteItem,
  order,
  setFormOrder,
  invoiceRef,
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
    lastOrder,
    invoiceItem,
    handleProductCreated,
    handleSupplierCreated,
    handleSellerCreated
  } = useFormHandler(quoteItem, order, setFormOrder, handleClose, invoiceRef)

  const [quickCreateSupplier, setQuickCreateSupplier] = useState(false)
  const [quickCreateSeller, setQuickCreateSeller] = useState(false)
  const [quickCreateProduct, setQuickCreateProduct] = useState(false)
  const [quickCreateFamily, setQuickCreateFamily] = useState(false)
  const [productToEdit, setProductToEdit] = useState<TProduct | null>(null)

  const title = order ? 'Editar Pedido' : 'Novo Pedido'

  return (
    <>
      <Modal title={title} isOpened={isOpened} handleClose={handleClose}>
        <Box sx={S.Wrapper} component="form" onSubmit={onSubmit} noValidate>
          {quoteItem && (
            <Box sx={S.ItemBanner}>
              <Typography variant="caption" sx={S.ItemLabel}>
                item
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {quoteItem.description}
              </Typography>
            </Box>
          )}
          {invoiceItem && invoiceRef && (
            <Box sx={S.ItemBanner}>
              <Typography variant="caption" sx={S.ItemLabel}>
                item da NF {invoiceRef.invoice.number}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {invoiceItem.description}
              </Typography>
            </Box>
          )}
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
            editLabel="Editar Produto"
            handleEditClick={(product) => setProductToEdit(product)}
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
            sx={S.TwoCol}
            onFocus={selectOnFocus}
            slotProps={{
              htmlInput: { min: 1, max: MAX_NUMERIC_VALUE, step: 1 }
            }}
          />
          <TextField
            {...register('packingQuantity', {
              setValueAs: (v) =>
                v === '' || v === null || v === undefined
                  ? null
                  : parseInt(v, 10)
            })}
            label="Qtd. Embalagem"
            type="number"
            error={!!errors.packingQuantity}
            helperText={errors.packingQuantity?.message}
            sx={S.TwoCol}
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
            sx={S.TwoCol}
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
        onCreated={(supplier) => {
          handleSupplierCreated(supplier)
          setQuickCreateSupplier(false)
        }}
      />
      <SellerForm
        isOpened={quickCreateSeller}
        seller={null}
        setFormSeller={() => {}}
        handleClose={() => setQuickCreateSeller(false)}
        onCreated={(seller) => {
          handleSellerCreated(seller)
          setQuickCreateSeller(false)
        }}
      />
      <ProductForm
        isOpened={quickCreateProduct || !!productToEdit}
        product={productToEdit}
        draft={null}
        setFormProduct={() => {}}
        handleClose={() => {
          setQuickCreateProduct(false)
          setProductToEdit(null)
        }}
        setQuickCreateFamily={setQuickCreateFamily}
        onCreated={(product) => {
          handleProductCreated(product)
          setQuickCreateProduct(false)
        }}
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
