import { DeleteDialog, Loader } from '@/components'

import { Form, Header, Table } from './_components'
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
    supplierToDelete
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
      <Form
        isOpened={isFormOpen}
        supplier={formSupplier}
        setFormSupplier={setFormSupplier}
        handleClose={handleCloseForm}
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
