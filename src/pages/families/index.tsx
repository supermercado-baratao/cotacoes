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
    handleFormOpen,
    filteredFamilies,
    handleFormEdit,
    handleDeleteDialogOpen,
    handleFormClose,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm,
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
        handleFormOpen={handleFormOpen}
      />
      {isFetching ? (
        <Loader />
      ) : hasFamilies ? (
        <Table
          families={filteredFamilies!}
          handleEdit={handleFormEdit}
          handleDelete={handleDeleteDialogOpen}
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
        handleClose={handleFormClose}
      />
      <DeleteDialog
        open={!!familyToDelete}
        title="Excluir Família"
        item={familyToDelete?.description ?? ''}
        handleConfirm={handleDeleteDialogConfirm}
        handleClose={handleDeleteDialogClose}
      />
    </>
  )
}
