import { DeleteDialog, Loader, SellerForm } from '@/components'
import { SupplierForm } from '@/components/forms/supplier-form'

import { Header, Table } from './_components'
import { useSuppliersHandler } from './use-suppliers-handler'

export const Suppliers = () => {
  const {
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
      <Header
        search={search}
        setSearch={setSearch}
        handleOpenCreate={handleOpenCreate}
      />
      {filteredSuppliers ? (
        <Table
          suppliers={filteredSuppliers}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      ) : (
        <Loader />
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
