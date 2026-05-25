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
    handleOpenCreate,
    filteredSuppliers,
    handleOpenEdit,
    handleOpenDelete,
    handleCloseForm,
    handleCloseDelete,
    handleConfirmDelete,
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
        handleOpenCreate={handleOpenCreate}
      />
      {isFetching ? (
        <Loader />
      ) : hasSuppliers ? (
        <Table
          suppliers={filteredSuppliers!}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
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
        handleClose={handleCloseForm}
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
        handleConfirm={handleConfirmDelete}
        handleClose={handleCloseDelete}
      />
    </>
  )
}
