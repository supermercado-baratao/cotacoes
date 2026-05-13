import { DeleteDialog, Loader } from '@/components'

import { Form, Header, Table } from './_components'
import { useSellersHandler } from './use-sellers-handler'

export const Sellers = () => {
  const {
    search,
    setSearch,
    handleOpenCreate,
    filteredSellers,
    handleOpenEdit,
    handleOpenDelete,
    handleCloseForm,
    handleCloseDelete,
    handleConfirmDelete,
    isFormOpen,
    setFormSeller,
    formSeller,
    sellerToDelete
  } = useSellersHandler()

  return (
    <>
      <Header
        search={search}
        setSearch={setSearch}
        handleOpenCreate={handleOpenCreate}
      />
      {filteredSellers ? (
        <Table
          sellers={filteredSellers}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      ) : (
        <Loader />
      )}
      <Form
        isOpened={isFormOpen}
        seller={formSeller}
        setFormSeller={setFormSeller}
        handleClose={handleCloseForm}
      />
      <DeleteDialog
        open={!!sellerToDelete}
        title="Excluir Vendedor"
        item={sellerToDelete?.name ?? ''}
        handleConfirm={handleConfirmDelete}
        handleClose={handleCloseDelete}
      />
    </>
  )
}
