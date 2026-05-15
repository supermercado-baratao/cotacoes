import {
  DeleteDialog,
  FamilyForm,
  Loader,
  PageHeader,
  SellerForm,
  SupplierForm
} from '@/components'

import { Form, Table } from './_components'
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
    productToDelete,
    quickCreate,
    setQuickCreate
  } = useProductsHandler()

  return (
    <>
      <PageHeader
        title="Produtos"
        buttonLabel="Novo Produto"
        searchPlaceholder="Buscar produto..."
        search={search}
        setSearch={setSearch}
        handleOpenCreate={handleOpenCreate}
      />
      {filteredProducts ? (
        <Table
          products={filteredProducts}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      ) : (
        <Loader />
      )}
      <Form
        isOpened={isFormOpen}
        product={formProduct}
        setFormProduct={setFormProduct}
        handleClose={handleCloseForm}
        setQuickCreate={setQuickCreate}
      />
      <SupplierForm
        isOpened={quickCreate === 'supplier'}
        supplier={null}
        setFormSupplier={() => {}}
        handleClose={() => setQuickCreate(null)}
      />
      <SellerForm
        isOpened={quickCreate === 'seller'}
        seller={null}
        setFormSeller={() => {}}
        handleClose={() => setQuickCreate(null)}
      />
      <FamilyForm
        isOpened={quickCreate === 'family'}
        family={null}
        setFormFamily={() => {}}
        handleClose={() => setQuickCreate(null)}
      />
      <DeleteDialog
        open={!!productToDelete}
        title="Excluir Produto"
        item={productToDelete?.description ?? ''}
        handleConfirm={handleConfirmDelete}
        handleClose={handleCloseDelete}
      />
    </>
  )
}
