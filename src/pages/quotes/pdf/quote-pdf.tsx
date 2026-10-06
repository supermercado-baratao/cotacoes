import 'dayjs/locale/pt-br'

import { Document, Page, Text, View } from '@react-pdf/renderer'
import dayjs from 'dayjs'

import { formatCurrency } from '@/utils/formatters'

import { COL_NUM, COL_ORDER, COL_PRODUCT, S } from './style'

export type TPdfItem = {
  index: number
  description: string
  refDescription: string | null
  salePrice: number | null
}

export type TPdfGroup = {
  label: string
  items: TPdfItem[]
}

export type TPdfSection = {
  label: string
  groups: TPdfGroup[]
}

export type TPdfDepartment = {
  label: string
  sections: TPdfSection[]
}

type TProps = {
  date: string
  totalItems: number
  departments: TPdfDepartment[]
}

type TRowProps = {
  item: TPdfItem
  isLast: boolean
}

const Row = ({ item, isLast }: TRowProps) => {
  const refLine = [
    item.refDescription,
    item.salePrice != null ? formatCurrency(item.salePrice) : null
  ]
    .filter(Boolean)
    .join('  ·  ')

  return (
    <View wrap={false} style={{ ...S.row, ...(isLast ? S.rowLast : {}) }}>
      <View style={S.cellNum}>
        <Text style={S.cellNumText}>{item.index}</Text>
      </View>
      <View style={S.cellProduct}>
        <Text style={S.cellProductName}>{item.description}</Text>
        {refLine ? <Text style={S.cellProductRef}>{refLine}</Text> : null}
      </View>
      <View style={S.cellOrder}>
        <View style={S.orderLine} />
        <View style={S.orderLine} />
        <View style={S.orderLine} />
      </View>
    </View>
  )
}

type TGroupProps = {
  group: TPdfGroup
}

const Group = ({ group }: TGroupProps) => (
  <View style={S.group}>
    <View wrap={false}>
      {group.label ? (
        <View style={S.groupHeader}>
          <Text style={S.groupLabel}>{group.label}</Text>
        </View>
      ) : null}
      <View style={S.tableHead}>
        <View style={[S.thCell, { width: COL_NUM }]}>
          <Text style={S.thText}>Nº</Text>
        </View>
        <View style={[S.thCell, { width: COL_PRODUCT }]}>
          <Text style={S.thText}>Produto</Text>
        </View>
        <View style={[S.thCell, { width: COL_ORDER }]}>
          <Text style={S.thText}>Dados do Pedido</Text>
        </View>
      </View>
      {group.items[0] && (
        <Row item={group.items[0]} isLast={group.items.length === 1} />
      )}
    </View>
    {group.items.slice(1).map((item, i) => (
      <Row key={item.index} item={item} isLast={i === group.items.length - 2} />
    ))}
  </View>
)

type TSectionProps = {
  section: TPdfSection
}

const Section = ({ section }: TSectionProps) => (
  <View style={S.section}>
    {section.label ? (
      <View style={S.sectionHeader}>
        <Text style={S.sectionLabel}>{section.label}</Text>
      </View>
    ) : null}
    {section.groups.map((group) => (
      <Group key={group.label} group={group} />
    ))}
  </View>
)

type TDepartmentProps = {
  department: TPdfDepartment
  break?: boolean
}

const Department = ({ department, break: pageBreak }: TDepartmentProps) => (
  <View style={S.department} break={pageBreak}>
    <View style={S.departmentHeader}>
      <Text style={S.departmentLabel}>{department.label}</Text>
    </View>
    {department.sections.map((section) => (
      <Section key={section.label} section={section} />
    ))}
  </View>
)

export const QuotePDF = ({ date, totalItems, departments }: TProps) => {
  const itemsLabel = `${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`

  return (
    <Document>
      <Page size="A4" style={S.page}>
        <View style={S.header} fixed>
          <Text style={S.headerTitle}>Cotação</Text>
          <View style={S.headerMeta}>
            <Text style={S.headerDate}>
              {dayjs(date)
                .locale('pt-br')
                .format('dddd, DD [de] MMMM [de] YYYY')}
            </Text>
            <Text
              style={S.headerSub}
              render={({ pageNumber, totalPages }) =>
                `${itemsLabel}  ·  pág. ${pageNumber} / ${totalPages}`
              }
            />
          </View>
        </View>
        {departments.map((department, i) => (
          <Department
            key={department.label}
            department={department}
            break={i > 0}
          />
        ))}
      </Page>
    </Document>
  )
}
