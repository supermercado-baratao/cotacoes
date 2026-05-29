import { DataView, FamilyForm, PageHeader, ProductForm } from '@/components'

import { Table } from './_components'
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
      <DataView
        isFetching={isFetching}
        isEmpty={!hasProducts}
        emptyMessage="Você ainda não tem nenhum produto. Cadastre um para começar!"
      >
        <Table products={filteredProducts ?? []} handleEdit={handleFormEdit} />
      </DataView>
      <ProductForm
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
