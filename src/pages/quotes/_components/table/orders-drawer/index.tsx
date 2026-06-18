import { Drawer } from '@mui/material'

import { DeleteDialog } from '@/components'
import { useDeleteHandler, useFormState } from '@/hooks'
import type { TOrder, TQuoteItem } from '@/models'
import { useAppStore } from '@/stores'

import type { TQuoteRow } from '../../../utils'
import { OrderForm } from '../../order-form'
import { Content } from './content'
import { Header } from './header'
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

  const {
    itemToDelete: orderToDelete,
    handleDelete: handleDeleteOrder,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm
  } = useDeleteHandler<TOrder>((order) => deleteOrder(order.id))

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
        handleClose={handleOrderFormClose}
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
