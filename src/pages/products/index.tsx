import { Tab, Tabs } from '@mui/material'

import { CatalogImport } from '@/components/blocks/catalog-import'
import { DataView } from '@/components/blocks/data-view'
import { FamilyForm } from '@/components/blocks/family-form'
import { PageHeader } from '@/components/blocks/page-header'
import { ProductForm } from '@/components/blocks/product-form'

import { AssociateProductDialog } from './_components/associate-product-dialog'
import { IgnoredTable } from './_components/ignored-table'
import { Table } from './_components/table'
import { UnmatchedTable } from './_components/unmatched-table'
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
        onChange={(_event, value) => setActiveTab(value)}
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
