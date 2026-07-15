import { Search } from '@mui/icons-material'
import { Box, Button, TextField } from '@mui/material'

import { DataView, PageHeader } from '@/components'

import { ImportDialog, Table } from './_components'
import * as S from './style'
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
    handleImportClose,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    canSearchDateRange,
    handleDateRangeSearch
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
      <Box sx={S.DateRangeWrapper}>
        <TextField
          label="De"
          type="date"
          size="small"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          sx={S.DateField}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Até"
          type="date"
          size="small"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          sx={S.DateField}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Button
          variant="outlined"
          startIcon={<Search />}
          disabled={!canSearchDateRange}
          onClick={handleDateRangeSearch}
        >
          Buscar
        </Button>
      </Box>
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
