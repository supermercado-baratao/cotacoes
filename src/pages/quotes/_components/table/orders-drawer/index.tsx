import { Drawer } from '@mui/material'
import { useState } from 'react'

import { OrderForm } from '@/components/blocks/order-form'
import { DeleteDialog } from '@/components/ui/dialog'
import { useDeleteHandler } from '@/hooks/use-delete-handler'
import { useFormState } from '@/hooks/use-form-state'
import type { TInvoice } from '@/models/invoice/types'
import type { TOrder } from '@/models/order/types'
import type { TQuoteItem } from '@/models/quote/types'
import type { TQuoteRow } from '@/pages/quotes/utils'
import { useAppStore } from '@/stores/use-app-store'

import { Content } from './content'
import { Header } from './header'
import { NfSuggestions } from './nf-suggestions'
import * as S from './style'

type TOrdersDrawerProps = {
  row: TQuoteRow | null
  handleClose: () => void
}

export const OrdersDrawer = ({ row, handleClose }: TOrdersDrawerProps) => {
  const { ordersByQuoteId, deleteOrder, suppliers, sellers, products } =
    useAppStore()

  const {
    formItem: formOrder,
    setFormItem: setFormOrder,
    isFormOpen: isOrderFormOpen,
    handleFormOpen: handleOrderFormOpen,
    handleFormClose: handleOrderFormClose
  } = useFormState<TOrder>()

  const [invoiceRef, setInvoiceRef] = useState<{
    invoice: TInvoice
    itemNumber: number
  } | null>(null)

  const {
    itemToDelete: orderToDelete,
    handleDelete: handleDeleteOrder,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  } = useDeleteHandler<TOrder>(deleteOrder)

  const itemOrders = (ordersByQuoteId ?? []).filter(
    (o) => o.quoteItemId === row?.id
  )

  const quoteItem: TQuoteItem | null = row
    ? {
        id: row.id,
        description: row.description,
        salePrice: row.salePrice,
        priceRef: row.priceRef
      }
    : null

  const handleSelectInvoiceItem = (invoice: TInvoice, itemNumber: number) => {
    setInvoiceRef({ invoice, itemNumber })
    handleOrderFormOpen(null)
  }

  const handleOrderFormCloseWithReset = () => {
    handleOrderFormClose()
    setInvoiceRef(null)
  }

  return (
    <>
      <Drawer
        anchor="right"
        open={!!row}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: S.Paper
          }
        }}
      >
        <Header
          row={row}
          itemOrders={itemOrders}
          handleCloseDrawer={handleClose}
          handleOrderFormOpen={handleOrderFormOpen}
        />
        {quoteItem && (
          <NfSuggestions
            quoteItem={quoteItem}
            onSelectItem={handleSelectInvoiceItem}
          />
        )}
        <Content
          itemOrders={itemOrders}
          products={products ?? []}
          suppliers={suppliers ?? []}
          sellers={sellers ?? []}
          handleOrderFormOpen={handleOrderFormOpen}
          handleDeleteOrder={handleDeleteOrder}
        />
      </Drawer>
      <OrderForm
        isOpened={isOrderFormOpen}
        quoteItem={quoteItem}
        order={formOrder}
        setFormOrder={setFormOrder}
        invoiceRef={invoiceRef}
        handleClose={handleOrderFormCloseWithReset}
      />
      <DeleteDialog
        open={!!orderToDelete}
        title="Excluir pedido"
        item={
          suppliers?.find((s) => s.id === orderToDelete?.supplierId)
            ?.tradeName ?? ''
        }
        handleConfirm={handleDeleteDialogConfirm}
        handleClose={handleDeleteDialogClose}
      />
    </>
  )
}
