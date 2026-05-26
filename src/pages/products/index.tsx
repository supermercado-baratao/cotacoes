import { Typography } from '@mui/material'

import { FamilyForm, Loader, PageHeader } from '@/components'

import { Form, Table } from './_components'
import { useProductsHandler } from './use-products-handler'

export const Products = () => {
  const {
    isFetching,
    hasProducts,
    search,
    setSearch,
    handleFormOpen,
    filteredProducts,
    handleFormEdit,
    handleFormClose,
    isFormOpen,
    formProduct,
    setFormProduct,
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
        handleFormOpen={handleFormOpen}
      />
      {isFetching ? (
        <Loader />
      ) : hasProducts ? (
        <Table products={filteredProducts!} handleEdit={handleFormEdit} />
      ) : (
        <Typography sx={{ mt: 2 }}>
          Você ainda não tem nenhum produto. Cadastre um para começar!
        </Typography>
      )}
      <Form
        isOpened={isFormOpen}
        product={formProduct}
        setFormProduct={setFormProduct}
        handleClose={handleFormClose}
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
