import { Typography } from '@mui/material'

import { FamilyForm, Loader, PageHeader } from '@/components'

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
    handleFormClose,
    isFormOpen,
    setFormFamily,
    formFamily
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
        <Table families={filteredFamilies!} handleEdit={handleFormEdit} />
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
    </>
  )
}
