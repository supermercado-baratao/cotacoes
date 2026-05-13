import { DeleteDialog, Loader } from '@/components'

import { Form, Header, Table } from './_components'
import { useFamiliesHandler } from './use-families-handler'

export const Families = () => {
  const {
    search,
    setSearch,
    handleOpenCreate,
    filteredFamilies,
    handleOpenEdit,
    handleOpenDelete,
    handleCloseForm,
    handleCloseDelete,
    handleConfirmDelete,
    isFormOpen,
    setFormFamily,
    formFamily,
    familyToDelete
  } = useFamiliesHandler()

  return (
    <>
      <Header
        search={search}
        setSearch={setSearch}
        handleOpenCreate={handleOpenCreate}
      />
      {filteredFamilies ? (
        <Table
          families={filteredFamilies}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      ) : (
        <Loader />
      )}
      <Form
        isOpened={isFormOpen}
        family={formFamily}
        setFormFamily={setFormFamily}
        handleClose={handleCloseForm}
      />
      <DeleteDialog
        open={!!familyToDelete}
        title="Excluir Família"
        item={familyToDelete?.description ?? ''}
        handleConfirm={handleConfirmDelete}
        handleClose={handleCloseDelete}
      />
    </>
  )
}
