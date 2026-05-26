import { Typography } from '@mui/material'

import { Loader, PageHeader, SellerForm, SupplierForm } from '@/components'

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
    handleFormEdit,
    handleFormClose,
    isFormOpen,
    setFormSupplier,
    formSupplier,
    quickCreateSeller,
    setQuickCreateSeller
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
      />
      {isFetching ? (
        <Loader />
      ) : hasSuppliers ? (
        <Table suppliers={filteredSuppliers!} handleEdit={handleFormEdit} />
      ) : (
        <Typography sx={{ mt: 2 }}>
          Você ainda não tem nenhum fornecedor. Cadastre um para começar!
        </Typography>
      )}
      <SupplierForm
        isOpened={isFormOpen}
        supplier={formSupplier}
        setFormSupplier={setFormSupplier}
        handleClose={handleFormClose}
        setQuickCreateSeller={setQuickCreateSeller}
      />
      <SellerForm
        isOpened={quickCreateSeller}
        seller={null}
        setFormSeller={() => {}}
        handleClose={() => setQuickCreateSeller(false)}
      />
    </>
  )
}
