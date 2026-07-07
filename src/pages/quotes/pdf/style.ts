import { StyleSheet } from '@react-pdf/renderer'

export const COL_NUM = '6%'

export const COL_PRODUCT = '54%'

export const COL_ORDER = '40%'

export const S = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    padding: 30
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: '#111111',
    borderBottomStyle: 'solid',
    marginBottom: 16
  },
  headerTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  headerMeta: {
    alignItems: 'flex-end'
  },
  headerDate: {
    fontSize: 10,
    color: '#444444'
  },
  headerSub: {
    fontSize: 8,
    color: '#888888',
    marginTop: 2
  },
  department: {
    marginBottom: 20
  },
  departmentHeader: {
    borderBottomWidth: 2,
    borderBottomColor: '#111111',
    borderBottomStyle: 'solid',
    paddingBottom: 6,
    marginBottom: 12
  },
  departmentLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#111111'
  },
  section: {
    marginBottom: 12
  },
  sectionHeader: {
    marginBottom: 8
  },
  sectionLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#555555'
  },
  group: {
    marginBottom: 16
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderLeftWidth: 3,
    borderLeftColor: '#555555',
    borderLeftStyle: 'solid',
    padding: 8,
    marginBottom: 8
  },
  groupLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#333333'
  },
  tableHead: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
    borderBottomStyle: 'solid',
    backgroundColor: '#fafafa'
  },
  thCell: {
    paddingHorizontal: 6,
    paddingVertical: 8
  },
  thText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#999999'
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ebebeb',
    borderBottomStyle: 'solid'
  },
  rowLast: {
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc'
  },
  cellNum: {
    width: COL_NUM,
    padding: 8,
    borderRightWidth: 0.5,
    borderRightColor: '#e0e0e0',
    borderRightStyle: 'solid',
    flexDirection: 'row',
    alignItems: 'center'
  },
  cellNumText: {
    fontSize: 8,
    color: '#aaaaaa'
  },
  cellProduct: {
    width: COL_PRODUCT,
    padding: 8,
    paddingVertical: 16
  },
  cellProductName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: '#111111'
  },
  cellProductRef: {
    fontSize: 8,
    color: '#888888',
    marginTop: 4
  },
  cellOrder: {
    width: COL_ORDER,
    borderLeftWidth: 1,
    borderLeftColor: '#cccccc',
    borderLeftStyle: 'solid',
    paddingLeft: 8,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingBottom: 16
  },
  orderLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#d8d8d8',
    borderBottomStyle: 'solid',
    flex: 1,
    marginTop: 12
  }
})
