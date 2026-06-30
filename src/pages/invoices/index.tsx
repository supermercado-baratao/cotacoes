import { DataView, PageHeader } from '@/components'

import { ImportDialog, Table } from './_components'
import { useInvoicesHandler } from './use-invoices-handler'

export const Invoices = () => {
  const {
    isFetching,
    hasInvoices,
    search,
    setSearch,
    filteredInvoices,
    isImportOpen,
    handleImportOpen,
    handleImportClose
  } = useInvoicesHandler()

  return (
    <>
      <PageHeader
        title="Notas de Entrada"
        buttonLabel="Importar Notas"
        searchPlaceholder="Buscar por NF ou fornecedor..."
        search={search}
        setSearch={setSearch}
        handleFormOpen={handleImportOpen}
      />
      <DataView
        isFetching={isFetching}
        isEmpty={!hasInvoices}
        emptyMessage="Nenhuma nota importada. Clique em 'Importar Nota' para começar."
      >
        <Table invoices={filteredInvoices ?? []} />
      </DataView>
      <ImportDialog isOpened={isImportOpen} handleClose={handleImportClose} />
    </>
  )
}
