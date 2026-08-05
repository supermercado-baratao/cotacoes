import { Tab, Tabs } from '@mui/material'

import {
  CatalogImport,
  DataView,
  FamilyForm,
  PageHeader,
  ProductForm
} from '@/components'

import {
  AssociateProductDialog,
  IgnoredTable,
  Table,
  UnmatchedTable
} from './_components'
import { useProductsHandler } from './use-products-handler'

export const Products = () => {
  const {
    isFetching,
    hasProducts,
    search,
    setSearch,
    handleFormOpen,
    filteredProducts,
    handleFormClose,
    isFormOpen,
    formProduct,
    setFormProduct,
    quickCreateFamily,
    setQuickCreateFamily,
    activeTab,
    setActiveTab,
    unmatchedItems,
    isFetchingUnmatched,
    hasUnmatchedItems,
    productDraft,
    handleCreateFromUnmatchedItem,
    handleIgnoreUnmatchedItem,
    isImportOpen,
    handleImportOpen,
    handleImportClose,
    ignoredProducts,
    isFetchingIgnored,
    hasIgnoredProducts,
    itemToAssociate,
    handleAssociateOpen,
    handleAssociateClose,
    handleAssociateConfirm,
    registeredProducts
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
        handleImportOpen={handleImportOpen}
      />
      <Tabs
        value={activeTab}
        onChange={(_e, value) => setActiveTab(value)}
        sx={{ mb: 2 }}
      >
        <Tab label="Cadastrados" value="registered" />
        <Tab label="Sem Cadastro" value="unmatched" />
        <Tab label="Ignorados" value="ignored" />
      </Tabs>
      {activeTab === 'registered' ? (
        <DataView
          isFetching={isFetching}
          isEmpty={!hasProducts}
          emptyMessage="Você ainda não tem nenhum produto. Cadastre um para começar!"
        >
          <Table
            products={filteredProducts ?? []}
            handleEdit={handleFormOpen}
          />
        </DataView>
      ) : activeTab === 'unmatched' ? (
        <DataView
          isFetching={isFetchingUnmatched}
          isEmpty={!hasUnmatchedItems}
          emptyMessage="Nenhum produto sem cadastro encontrado nas notas importadas."
        >
          <UnmatchedTable
            items={unmatchedItems}
            handleCreateProduct={handleCreateFromUnmatchedItem}
            handleIgnoreItem={handleIgnoreUnmatchedItem}
            handleAssociateItem={handleAssociateOpen}
          />
        </DataView>
      ) : (
        <DataView
          isFetching={isFetchingIgnored}
          isEmpty={!hasIgnoredProducts}
          emptyMessage="Nenhum produto ignorado."
        >
          <IgnoredTable items={ignoredProducts} />
        </DataView>
      )}
      <ProductForm
        isOpened={isFormOpen}
        product={formProduct}
        draft={productDraft}
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
      <CatalogImport isOpened={isImportOpen} handleClose={handleImportClose} />
      <AssociateProductDialog
        item={itemToAssociate}
        products={registeredProducts}
        handleClose={handleAssociateClose}
        handleConfirm={handleAssociateConfirm}
      />
    </>
  )
}
