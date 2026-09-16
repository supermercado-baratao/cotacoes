import { ExpandMore } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Typography
} from '@mui/material'
import { useState } from 'react'

import { Table as _Table } from '@/components'

import type {
  TPriceAdjustmentDisplayRow,
  TPriceAdjustmentGroup
} from '../../utils'
import { columns } from './columns'
import * as S from './style'

type TTableProps = {
  groups: TPriceAdjustmentGroup<TPriceAdjustmentDisplayRow>[]
}

const getGroupKey = (
  group: TPriceAdjustmentGroup<TPriceAdjustmentDisplayRow>
) => group.familyId ?? group.kind

export const Table = ({ groups }: TTableProps) => {
  // Todo grupo começa expandido, exceto "não cadastrado" — não há o que
  // conferir num produto que nem existe no catálogo, então some da vista
  // até o usuário decidir abrir.
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    () =>
      new Set(groups.filter((g) => g.kind !== 'unregistered').map(getGroupKey))
  )

  const toggleExpanded = (key: string) =>
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  return (
    <Box>
      {groups.map((group) => {
        const key = getGroupKey(group)
        const isExpanded = expandedKeys.has(key)

        return (
          <Accordion
            key={key}
            expanded={isExpanded}
            onChange={() => toggleExpanded(key)}
            disableGutters
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={S.SummaryContent}>
                <Typography sx={{ fontWeight: 600 }}>
                  {group.familyDescription.toUpperCase()}
                </Typography>
                <Chip
                  label={`${group.rows.length} ${group.rows.length === 1 ? 'produto' : 'produtos'}`}
                  size="small"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {/* Só monta o DataGrid quando expandido — com muitos grupos,
                  instanciar todos de uma vez (mesmo colapsados) é caro. */}
              {isExpanded && (
                <_Table
                  columns={columns}
                  items={group.rows}
                  getRowId={(row) => row.code}
                  autosizeOnMount={false}
                />
              )}
            </AccordionDetails>
          </Accordion>
        )
      })}
    </Box>
  )
}
