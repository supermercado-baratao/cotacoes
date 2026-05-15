import { DeleteDialog, FamilyForm, Loader, PageHeader } from '@/components'

import { Table } from './_components'
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
      <PageHeader
        title="Famílias"
        buttonLabel="Nova Família"
        searchPlaceholder="Buscar família..."
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
      <FamilyForm
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
