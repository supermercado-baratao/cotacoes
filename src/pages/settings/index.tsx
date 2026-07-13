import { Box, Button, Typography } from '@mui/material'

import { DataView } from '@/components'

import { DepartmentOrderList } from './_components'
import { useSettingsHandler } from './use-settings-handler'

export const Settings = () => {
  const { isFetching, order, handleMove, handleReorder, handleSave, isDirty } =
    useSettingsHandler()

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
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button variant="contained" disabled={!isDirty} onClick={handleSave}>
            Salvar
          </Button>
        </Box>
      </DataView>
    </>
  )
}
