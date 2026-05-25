import { Typography } from '@mui/material'

import {
  DeleteDialog,
  Loader,
  PageHeader,
  SellerForm,
  SupplierForm
} from '@/components'

import { Table } from './_components'
import { useSellersHandler } from './use-sellers-handler'

export const Sellers = () => {
  const {
    isFetching,
    hasSellers,
    search,
    setSearch,
    handleFormOpen,
    filteredSellers,
    handleFormEdit,
    handleDeleteDialogOpen,
    handleFormClose,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm,
    isFormOpen,
    setFormSeller,
    formSeller,
    sellerToDelete,
    quickCreateSupplier,
    setQuickCreateSupplier
  } = useSellersHandler()

  return (
    <>
      <PageHeader
        title="Vendedores"
        buttonLabel="Novo Vendedor"
        searchPlaceholder="Buscar vendedor..."
        search={search}
        setSearch={setSearch}
        handleFormOpen={handleFormOpen}
      />
      {isFetching ? (
        <Loader />
      ) : hasSellers ? (
        <Table
          sellers={filteredSellers!}
          handleEdit={handleFormEdit}
          handleDelete={handleDeleteDialogOpen}
        />
      ) : (
        <Typography sx={{ mt: 2 }}>
          Você ainda não tem nenhum vendedor. Cadastre um para começar!
        </Typography>
      )}
      <SellerForm
        isOpened={isFormOpen}
        seller={formSeller}
        setFormSeller={setFormSeller}
        handleClose={handleFormClose}
        setQuickCreateSupplier={setQuickCreateSupplier}
      />
      <SupplierForm
        isOpened={quickCreateSupplier}
        supplier={null}
        setFormSupplier={() => {}}
        handleClose={() => setQuickCreateSupplier(false)}
      />
      <DeleteDialog
        open={!!sellerToDelete}
        title="Excluir Vendedor"
        item={sellerToDelete?.name ?? ''}
        handleConfirm={handleDeleteDialogConfirm}
        handleClose={handleDeleteDialogClose}
      />
    </>
  )
}
