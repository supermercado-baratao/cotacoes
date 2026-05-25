import { Typography } from '@mui/material'

import {
  DeleteDialog,
  Loader,
  PageHeader,
  SellerForm,
  SupplierForm
} from '@/components'

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
    handleDeleteDialogOpen,
    handleFormClose,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm,
    isFormOpen,
    setFormSupplier,
    formSupplier,
    supplierToDelete,
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
        <Table
          suppliers={filteredSuppliers!}
          handleEdit={handleFormEdit}
          handleDelete={handleDeleteDialogOpen}
        />
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
      <DeleteDialog
        open={!!supplierToDelete}
        title="Excluir Fornecedor"
        item={supplierToDelete?.tradeName ?? ''}
        handleConfirm={handleDeleteDialogConfirm}
        handleClose={handleDeleteDialogClose}
      />
    </>
  )
}
