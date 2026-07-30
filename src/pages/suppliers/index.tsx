import { Tab, Tabs } from '@mui/material'

import { CatalogImport, DataView, PageHeader, SupplierForm } from '@/components'

import { IgnoredTable, Table } from './_components'
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
    handleImportClose,
    activeTab,
    setActiveTab,
    filteredIgnoredSuppliers,
    isFetchingIgnored,
    hasIgnoredSuppliers
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
      <Tabs
        value={activeTab}
        onChange={(_e, value) => setActiveTab(value)}
        sx={{ mb: 2 }}
      >
        <Tab label="Cadastrados" value="registered" />
        <Tab label="Ignorados" value="ignored" />
      </Tabs>
      {activeTab === 'registered' ? (
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
      ) : (
        <DataView
          isFetching={isFetchingIgnored}
          isEmpty={!hasIgnoredSuppliers}
          emptyMessage="Nenhum fornecedor ignorado."
        >
          <IgnoredTable ignoredSuppliers={filteredIgnoredSuppliers} />
        </DataView>
      )}
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
