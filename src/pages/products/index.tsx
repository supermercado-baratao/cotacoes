import { Typography } from '@mui/material'

import { DeleteDialog, FamilyForm, Loader, PageHeader } from '@/components'

import { Form, Table } from './_components'
import { useProductsHandler } from './use-products-handler'

export const Products = () => {
  const {
    isFetching,
    hasProducts,
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
    formProduct,
    setFormProduct,
    productToDelete,
    quickCreateFamily,
    setQuickCreateFamily
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
      {isFetching ? (
        <Loader />
      ) : hasProducts ? (
        <Table
          products={filteredProducts!}
          handleEdit={handleOpenEdit}
          handleDelete={handleOpenDelete}
        />
      ) : (
        <Typography sx={{ mt: 2 }}>
          Você ainda não tem nenhum produto. Cadastre um para começar!
        </Typography>
      )}
      <Form
        isOpened={isFormOpen}
        product={formProduct}
        setFormProduct={setFormProduct}
        handleClose={handleCloseForm}
        setQuickCreateFamily={setQuickCreateFamily}
      />
      <FamilyForm
        isOpened={quickCreateFamily}
        family={null}
        setFormFamily={() => {}}
        handleClose={() => setQuickCreateFamily(false)}
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
