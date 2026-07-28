import { Box, TextField } from '@mui/material'

import { DataView, PageHeader } from '@/components'

import { ImportDialog, Table } from './_components'
import * as S from './style'
import { usePriceAdjustmentsHandler } from './use-price-adjustments-handler'

export const PriceAdjustments = () => {
  const {
    isFetching,
    hasRows,
    search,
    setSearch,
    groups,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isImportOpen,
    handleImportOpen,
    handleImportClose
  } = usePriceAdjustmentsHandler()

  return (
    <>
      <PageHeader
        title="Reajustes de Preços"
        buttonLabel="Importar Arquivo"
        searchPlaceholder="Buscar por código ou descrição..."
        search={search}
        setSearch={setSearch}
        handleFormOpen={handleImportOpen}
      />
      {hasRows && (
        <Box sx={S.DateRangeWrapper}>
          <TextField
            label="Início do período"
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            sx={S.DateField}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Fim do período"
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            sx={S.DateField}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
      )}
      <DataView
        isFetching={isFetching}
        isEmpty={!hasRows}
        emptyMessage="Nenhum arquivo importado. Clique em 'Importar Arquivo' para começar."
      >
        <Table groups={groups ?? []} />
      </DataView>
      <ImportDialog
        isOpened={isImportOpen}
        handleClose={handleImportClose}
        onImported={handleImportClose}
      />
    </>
  )
}
