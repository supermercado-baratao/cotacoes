import { DataView, GroupForm, PageHeader } from '@/components'

import { Table } from './_components'
import { useGroupsHandler } from './use-groups-handler'

export const Groups = () => {
  const {
    isFetching,
    hasGroups,
    search,
    setSearch,
    handleFormOpen,
    filteredGroups,
    handleFormClose,
    isFormOpen,
    formGroup,
    setFormGroup
  } = useGroupsHandler()

  return (
    <>
      <PageHeader
        title="Grupos"
        buttonLabel="Novo Grupo"
        searchPlaceholder="Buscar grupo..."
        search={search}
        setSearch={setSearch}
        handleFormOpen={handleFormOpen}
      />
      <DataView
        isFetching={isFetching}
        isEmpty={!hasGroups}
        emptyMessage="Você ainda não tem nenhum grupo. Crie um para começar!"
      >
        <Table groups={filteredGroups ?? []} handleEdit={handleFormOpen} />
      </DataView>
      <GroupForm
        isOpened={isFormOpen}
        group={formGroup}
        setFormGroup={setFormGroup}
        handleClose={handleFormClose}
      />
    </>
  )
}
