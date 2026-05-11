import { DeleteDialog } from '@/components'

import { Form, Header, Table } from './_components'
import { useProductsHandler } from './use-products-handler'

export const Products = () => {
  const {
    search,
    setSearch,
    handleOpenCreate,
    filteredProducts,
    handleOpenEdit,
    handleOpenDelete,
    handleCloseForm,
    handleCloseDelete,
    handleConfirmDelete,
    isFormOpen,
    setFormProduct,
    formProduct,
    productToDelete
  } = useProductsHandler()

  return (
    <>
      <Header
        search={search}
        setSearch={setSearch}
        handleOpenCreate={handleOpenCreate}
      />
      <Table
        products={filteredProducts}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />
      <Form
        isOpened={isFormOpen}
        product={formProduct}
        setFormProduct={setFormProduct}
        handleClose={handleCloseForm}
      />
      <DeleteDialog
        open={!!productToDelete}
        title="Excluir Produto"
        item={productToDelete?.description || ''}
        handleConfirm={handleConfirmDelete}
        handleClose={handleCloseDelete}
      />
    </>
  )
}
