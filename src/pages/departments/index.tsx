import {
  CatalogImport,
  DataView,
  DepartmentForm,
  PageHeader
} from '@/components'

import { Table } from './_components'
import { useDepartmentsHandler } from './use-departments-handler'

export const Departments = () => {
  const {
    isFetching,
    hasDepartments,
    search,
    setSearch,
    handleFormOpen,
    filteredDepartments,

    handleFormClose,
    isFormOpen,
    setFormDepartment,
    formDepartment,
    isImportOpen,
    handleImportOpen,
    handleImportClose
  } = useDepartmentsHandler()

  return (
    <>
      <PageHeader
        title="Departamentos"
        buttonLabel="Novo Departamento"
        searchPlaceholder="Buscar departamento..."
        search={search}
        setSearch={setSearch}
        handleFormOpen={handleFormOpen}
        handleImportOpen={handleImportOpen}
      />
      <DataView
        isFetching={isFetching}
        isEmpty={!hasDepartments}
        emptyMessage="Você ainda não tem nenhum departamento. Crie um para começar!"
      >
        <Table
          departments={filteredDepartments ?? []}
          handleEdit={handleFormOpen}
        />
      </DataView>
      <DepartmentForm
        isOpened={isFormOpen}
        department={formDepartment}
        setFormDepartment={setFormDepartment}
        handleClose={handleFormClose}
      />
      <CatalogImport isOpened={isImportOpen} handleClose={handleImportClose} />
    </>
  )
}
