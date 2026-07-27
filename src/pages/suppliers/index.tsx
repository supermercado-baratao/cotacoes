import { CatalogImport, DataView, PageHeader, SupplierForm } from '@/components'

import { Table } from './_components'
import { useSuppliersHandler } from './use-suppliers-handler'

export const Suppliers = () => {
  const {
    isFetching,
    hasSuppliers,
    search,
    setSearch,
    handleFormOpen,
    filteredSuppliers,

    handleFormClose,
    isFormOpen,
    setFormSupplier,
    formSupplier,
    isImportOpen,
    handleImportOpen,
    handleImportClose
  } = useSuppliersHandler()

  return (
    <>
      <PageHeader
        title="Fornecedores"
        buttonLabel="Novo Fornecedor"
        searchPlaceholder="Buscar fornecedor..."
        search={search}
        setSearch={setSearch}
        handleFormOpen={handleFormOpen}
        handleImportOpen={handleImportOpen}
      />
      <DataView
        isFetching={isFetching}
        isEmpty={!hasSuppliers}
        emptyMessage="Você ainda não tem nenhum fornecedor. Cadastre um para começar!"
      >
        <Table
          suppliers={filteredSuppliers ?? []}
          handleEdit={handleFormOpen}
        />
      </DataView>
      <SupplierForm
        isOpened={isFormOpen}
        supplier={formSupplier}
        setFormSupplier={setFormSupplier}
        handleClose={handleFormClose}
      />
      <CatalogImport isOpened={isImportOpen} handleClose={handleImportClose} />
    </>
  )
}
