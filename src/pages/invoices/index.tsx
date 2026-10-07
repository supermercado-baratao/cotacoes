import { Search } from '@mui/icons-material'
import { Box, Button, TextField, Typography } from '@mui/material'
import dayjs from 'dayjs'

import { DataView } from '@/components/blocks/data-view'
import { PageHeader } from '@/components/blocks/page-header'

import { ImportDialog } from './_components/import-dialog'
import { Table } from './_components/table'
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
    handleDateRangeSearch,
    lastImportAt
  } = useInvoicesHandler()

  return (
    <>
      <PageHeader
        title="Notas de Entrada"
        buttonLabel="Importar Notas"
        searchPlaceholder="Buscar por NF, fornecedor ou item..."
        search={search}
        setSearch={setSearch}
        handleFormOpen={handleImportOpen}
      />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mb: 1, display: 'block' }}
      >
        {lastImportAt
          ? `Última importação: ${dayjs(lastImportAt.toDate()).format('DD/MM/YYYY')}`
          : 'Nenhuma importação realizada ainda'}
      </Typography>
      <Box sx={S.DateRangeWrapper}>
        <TextField
          label="De"
          type="date"
          size="small"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          sx={S.DateField}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Até"
          type="date"
          size="small"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
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
