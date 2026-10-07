import { Delete } from '@mui/icons-material'
import {
  Autocomplete,
  Box,
  IconButton,
  Paper,
  TextField,
  Typography
} from '@mui/material'

import { MAX_MARGIN_TOLERANCE } from '@/constants/margin'
import type { TDepartment } from '@/models/department-model/types'
import type { TMarginTolerance } from '@/models/settings-model/types'

import type { TDepartmentMarginOverrideRow } from '../../utils'
import * as S from './style'

type TMarginToleranceProps = {
  marginTolerance: TMarginTolerance
  handleMarginToleranceChange: (
    field: keyof TMarginTolerance,
    value: number
  ) => void
  departmentOverrides: TDepartmentMarginOverrideRow[]
  departments: TDepartment[]
  availableDepartments: TDepartment[]
  handleDepartmentOverrideAdd: (departmentId: string) => void
  handleDepartmentOverrideChange: (
    departmentId: string,
    field: keyof TMarginTolerance,
    value: number
  ) => void
  handleDepartmentOverrideRemove: (departmentId: string) => void
}

const parseToleranceInput = (value: string): number => {
  const n = Number(value)
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), MAX_MARGIN_TOLERANCE) : 0
}

export const MarginTolerance = ({
  marginTolerance,
  handleMarginToleranceChange,
  departmentOverrides,
  departments,
  availableDepartments,
  handleDepartmentOverrideAdd,
  handleDepartmentOverrideChange,
  handleDepartmentOverrideRemove
}: TMarginToleranceProps) => {
  const departmentById = new Map(departments.map((d) => [d.id, d]))

  return (
    <Box sx={S.Wrapper}>
      <Box sx={S.GlobalRow}>
        <TextField
          label="Margem mínima aceitável (%)"
          type="number"
          value={marginTolerance.below}
          onChange={(event) =>
            handleMarginToleranceChange(
              'below',
              parseToleranceInput(event.target.value)
            )
          }
          slotProps={{ htmlInput: { min: 0, max: MAX_MARGIN_TOLERANCE } }}
          sx={S.GlobalToleranceField}
        />
        <TextField
          label="Margem máxima esperada (%)"
          type="number"
          value={marginTolerance.above}
          onChange={(event) =>
            handleMarginToleranceChange(
              'above',
              parseToleranceInput(event.target.value)
            )
          }
          slotProps={{ htmlInput: { min: 0, max: MAX_MARGIN_TOLERANCE } }}
          sx={S.GlobalToleranceField}
        />
      </Box>

      <Typography variant="subtitle2" sx={{ mt: 3 }}>
        Overrides por Departamento
      </Typography>

      <Box sx={S.List}>
        {departmentOverrides.map((row) => {
          const department = departmentById.get(row.departmentId)
          return (
            <Paper key={row.departmentId} variant="outlined" sx={S.Row}>
              <Typography sx={{ flex: 1 }}>
                {(
                  department?.description ?? 'Departamento removido'
                ).toUpperCase()}
              </Typography>
              <TextField
                label="Mínima (%)"
                type="number"
                size="small"
                value={row.tolerance.below}
                onChange={(event) =>
                  handleDepartmentOverrideChange(
                    row.departmentId,
                    'below',
                    parseToleranceInput(event.target.value)
                  )
                }
                slotProps={{ htmlInput: { min: 0, max: MAX_MARGIN_TOLERANCE } }}
                sx={S.OverrideToleranceField}
              />
              <TextField
                label="Máxima (%)"
                type="number"
                size="small"
                value={row.tolerance.above}
                onChange={(event) =>
                  handleDepartmentOverrideChange(
                    row.departmentId,
                    'above',
                    parseToleranceInput(event.target.value)
                  )
                }
                slotProps={{ htmlInput: { min: 0, max: MAX_MARGIN_TOLERANCE } }}
                sx={S.OverrideToleranceField}
              />
              <IconButton
                aria-label="Remover override"
                size="small"
                onClick={() => handleDepartmentOverrideRemove(row.departmentId)}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Paper>
          )
        })}
      </Box>

      <Autocomplete
        sx={S.AddRow}
        options={availableDepartments}
        getOptionLabel={(department) => department.description}
        value={null}
        onChange={(_, selected) =>
          selected && handleDepartmentOverrideAdd(selected.id)
        }
        renderInput={(params) => (
          <TextField {...params} label="Adicionar override por departamento" />
        )}
      />
    </Box>
  )
}
