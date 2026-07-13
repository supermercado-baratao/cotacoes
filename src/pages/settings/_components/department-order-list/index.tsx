import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowDownward, ArrowUpward, DragIndicator } from '@mui/icons-material'
import { IconButton, List, ListItem, Paper, Typography } from '@mui/material'

import * as S from './style'

type TDepartmentOrderListProps = {
  order: string[]
  handleMove: (index: number, direction: -1 | 1) => void
  handleReorder: (fromIndex: number, toIndex: number) => void
}

type TRowProps = {
  department: string
  index: number
  total: number
  handleMove: (index: number, direction: -1 | 1) => void
}

const Row = ({ department, index, total, handleMove }: TRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: department })

  return (
    <ListItem
      ref={setNodeRef}
      component={Paper}
      variant="outlined"
      sx={S.Row}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <IconButton
        size="small"
        aria-label="Arrastar"
        {...attributes}
        {...listeners}
      >
        <DragIndicator fontSize="small" />
      </IconButton>
      <Typography sx={{ flex: 1 }}>{department}</Typography>
      <IconButton
        size="small"
        aria-label="Mover para cima"
        disabled={index === 0}
        onClick={() => handleMove(index, -1)}
      >
        <ArrowUpward fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        aria-label="Mover para baixo"
        disabled={index === total - 1}
        onClick={() => handleMove(index, 1)}
      >
        <ArrowDownward fontSize="small" />
      </IconButton>
    </ListItem>
  )
}

export const DepartmentOrderList = ({
  order,
  handleMove,
  handleReorder
}: TDepartmentOrderListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const fromIndex = order.indexOf(String(active.id))
    const toIndex = order.indexOf(String(over.id))
    if (fromIndex === -1 || toIndex === -1) return

    handleReorder(fromIndex, toIndex)
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <List sx={S.List}>
          {order.map((department, index) => (
            <Row
              key={department}
              department={department}
              index={index}
              total={order.length}
              handleMove={handleMove}
            />
          ))}
        </List>
      </SortableContext>
    </DndContext>
  )
}
