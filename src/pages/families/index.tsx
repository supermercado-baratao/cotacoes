import { CatalogImport } from '@/components/blocks/catalog-import'
import { DataView } from '@/components/blocks/data-view'
import { FamilyForm } from '@/components/blocks/family-form'
import { PageHeader } from '@/components/blocks/page-header'

import { Table } from './_components/table'
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
    formFamily,
    isImportOpen,
    handleImportOpen,
    handleImportClose
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
        handleImportOpen={handleImportOpen}
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
      <CatalogImport isOpened={isImportOpen} handleClose={handleImportClose} />
    </>
  )
}
