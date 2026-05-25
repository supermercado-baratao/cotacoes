import { Typography } from '@mui/material'

import { DeleteDialog, FamilyForm, Loader, PageHeader } from '@/components'

import { Table } from './_components'
import { useFamiliesHandler } from './use-families-handler'

export const Families = () => {
  const {
    isFetching,
    hasFamilies,
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
      {isFetching ? (
        <Loader />
      ) : hasFamilies ? (
        <Table
          families={filteredFamilies!}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      ) : (
        <Typography sx={{ mt: 2 }}>
          Você ainda não tem nenhuma família. Crie uma para começar!
        </Typography>
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
