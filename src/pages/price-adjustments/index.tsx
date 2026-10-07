import { Box, Button, Tab, Tabs, TextField, Typography } from '@mui/material'

import { DataView } from '@/components/blocks/data-view'
import { PageHeader } from '@/components/blocks/page-header'

import { ImportDialog } from './_components/import-dialog'
import { ProductList } from './_components/product-list'
import { Table } from './_components/table'
import * as S from './style'
import {
  PRICE_ADJUSTMENTS_TABS,
  usePriceAdjustmentsHandler
} from './use-price-adjustments-handler'

export const PriceAdjustments = () => {
  const {
    isFetching,
    hasRows,
    search,
    setSearch,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isImportOpen,
    handleImportOpen,
    handleImportClose,
    activeTab,
    setActiveTab,
    familyGroups,
    noFamilyRows,
    unregisteredGroups,
    hasFamilyGroups,
    hasNoFamilyRows,
    hasUnregisteredGroups,
    isFirstTab,
    isLastTab,
    handlePreviousTab,
    handleNextTab
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
            onChange={(event) => setStartDate(event.target.value)}
            sx={S.DateField}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Fim do período"
            type="date"
            size="small"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
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
        <Tabs
          value={activeTab}
          onChange={(_event, value) => setActiveTab(value)}
          sx={{ mb: 2 }}
        >
          {PRICE_ADJUSTMENTS_TABS.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>

        {activeTab === 'families' &&
          (hasFamilyGroups ? (
            <Table groups={familyGroups} />
          ) : (
            <Typography>
              Nenhuma família de preços encontrada para o período selecionado.
            </Typography>
          ))}

        {activeTab === 'products' &&
          (hasNoFamilyRows ? (
            <ProductList rows={noFamilyRows} />
          ) : (
            <Typography>
              Nenhum produto sem família encontrado para o período selecionado.
            </Typography>
          ))}

        {activeTab === 'unregistered' &&
          (hasUnregisteredGroups ? (
            <Table groups={unregisteredGroups} />
          ) : (
            <Typography>Nenhum produto não cadastrado encontrado.</Typography>
          ))}

        <Box sx={S.TabNavigation}>
          <Button disabled={isFirstTab} onClick={handlePreviousTab}>
            Anterior
          </Button>
          <Button disabled={isLastTab} onClick={handleNextTab}>
            Próxima
          </Button>
        </Box>
      </DataView>
      <ImportDialog
        isOpened={isImportOpen}
        handleClose={handleImportClose}
        onImported={handleImportClose}
      />
    </>
  )
}
