import { Box, Button, Typography } from '@mui/material'

import { DataView } from '@/components'

import { DepartmentOrderList, MarginTolerance } from './_components'
import { useSettingsHandler } from './use-settings-handler'

export const Settings = () => {
  const {
    isFetching,
    order,
    handleMove,
    handleReorder,
    handleSave,
    isDirty,
    marginTolerance,
    handleMarginToleranceChange,
    departmentOverrides,
    departments,
    availableDepartments,
    handleDepartmentOverrideAdd,
    handleDepartmentOverrideChange,
    handleDepartmentOverrideRemove
  } = useSettingsHandler()

  return (
    <>
      <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
        Configurações
      </Typography>
      <Typography variant="subtitle1">
        Ordem dos Departamentos na Cotação (PDF)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Arraste ou use as setas para definir a ordem em que os departamentos
        aparecem no PDF da cotação.
      </Typography>
      <DataView
        isFetching={isFetching}
        isEmpty={!order.length}
        emptyMessage="Cadastre produtos com departamento para poder ordená-los aqui."
      >
        <DepartmentOrderList
          order={order}
          handleMove={handleMove}
          handleReorder={handleReorder}
        />
      </DataView>

      <Typography variant="subtitle1" sx={{ mt: 4 }}>
        Margem de Referência
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Define a margem mínima aceitável e a margem máxima esperada para os
        produtos, considerando o custo com imposto cadastrado em cada um.
        Produtos fora desse intervalo geram um alerta de margem abaixo ou acima
        do esperado. Pode ser ajustado globalmente ou por departamento.
      </Typography>
      <MarginTolerance
        marginTolerance={marginTolerance}
        handleMarginToleranceChange={handleMarginToleranceChange}
        departmentOverrides={departmentOverrides}
        departments={departments}
        availableDepartments={availableDepartments}
        handleDepartmentOverrideAdd={handleDepartmentOverrideAdd}
        handleDepartmentOverrideChange={handleDepartmentOverrideChange}
        handleDepartmentOverrideRemove={handleDepartmentOverrideRemove}
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button variant="contained" disabled={!isDirty} onClick={handleSave}>
          Salvar
        </Button>
      </Box>
    </>
  )
}
