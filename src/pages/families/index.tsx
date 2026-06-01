import { DataView, FamilyForm, PageHeader } from '@/components'

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
      <DataView
        isFetching={isFetching}
        isEmpty={!hasFamilies}
        emptyMessage="Você ainda não tem nenhuma família. Crie uma para começar!"
      >
        <Table families={filteredFamilies ?? []} handleEdit={handleFormOpen} />
      </DataView>
      <FamilyForm
        isOpened={isFormOpen}
        family={formFamily}
        setFormFamily={setFormFamily}
        handleClose={handleFormClose}
      />
    </>
  )
}
