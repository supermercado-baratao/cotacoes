import { WarningAmber } from '@mui/icons-material'
import { Alert, Button } from '@mui/material'
import { useNavigate } from 'react-router'

import {
  DataView,
  DeleteDialog,
  FamilyForm,
  Loader,
  ProductForm
} from '@/components'

import { AiReferenceModal, Form, Header, Table } from './_components'
import * as S from './style'
import { useQuotesHandler } from './use-quotes-handler'

export const Quotes = () => {
  const {
    isFetching,
    quote,
    hasQuoteRows,
    quoteRows,
    availableYears,
    year,
    onYearChange,
    availableMonths,
    month,
    onMonthChange,
    availableDays,
    day,
    onDayChange,
    formQuote,
    setFormQuote,
    isQuoteFormOpen,
    handleQuoteFormOpen,
    handleQuoteFormClose,
    formProduct,
    setFormProduct,
    isProductFormOpen,
    handleProductFormClose,
    quickCreateFamily,
    setQuickCreateFamily,
    isAiReferenceOpen,
    handleAiReferenceOpen,
    handleAiReferenceClose,
    handlePrint,
    isPrinting,
    search,
    setSearch,
    pendingInvoices,
    quoteToDelete,
    handleDeleteQuote,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm,
    handleSuccess
  } = useQuotesHandler()

  const navigate = useNavigate()

  const handleReviewPendingInvoices = () => {
    if (pendingInvoices.length === 1) {
      navigate(`/invoices/${pendingInvoices[0].id}`)
      return
    }
    navigate('/invoices')
  }

  return (
    <>
      <Header
        availableYears={availableYears}
        availableMonths={availableMonths}
        availableDays={availableDays}
        year={year}
        month={month}
        day={day}
        quote={quote}
        onYearChange={onYearChange}
        onMonthChange={onMonthChange}
        onDayChange={onDayChange}
        handleQuoteFormOpen={handleQuoteFormOpen}
        handleDeleteQuote={handleDeleteQuote}
        handleAiReferenceOpen={handleAiReferenceOpen}
        handlePrint={handlePrint}
        isPrinting={isPrinting}
        search={search}
        setSearch={setSearch}
      />
      {quote && pendingInvoices.length > 0 && (
        <Alert
          severity="warning"
          icon={<WarningAmber />}
          sx={S.PendingInvoicesAlert}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleReviewPendingInvoices}
            >
              Revisar
            </Button>
          }
        >
          {pendingInvoices.length === 1
            ? '1 nota fiscal pendente de aprovação nesta cotação'
            : `${pendingInvoices.length} notas fiscais pendentes de aprovação nesta cotação`}
        </Alert>
      )}
      <DataView
        isFetching={isFetching}
        isEmpty={!hasQuoteRows}
        emptyMessage="Nenhum item nesta cotação. Crie uma cotação ou adicione itens!"
      >
        {quote && <Table quote={quote} rows={quoteRows} />}
      </DataView>
      <Form
        isOpened={isQuoteFormOpen}
        quote={formQuote}
        setFormQuote={setFormQuote}
        handleClose={handleQuoteFormClose}
        handleSuccess={handleSuccess}
      />
      <ProductForm
        isOpened={isProductFormOpen}
        product={formProduct}
        draft={null}
        setFormProduct={setFormProduct}
        handleClose={handleProductFormClose}
        setQuickCreateFamily={setQuickCreateFamily}
      />
      <FamilyForm
        isOpened={quickCreateFamily}
        family={null}
        setFormFamily={() => {}}
        handleClose={() => setQuickCreateFamily(false)}
      />
      {quote && (
        <AiReferenceModal
          isOpened={isAiReferenceOpen}
          quote={quote}
          onClose={handleAiReferenceClose}
        />
      )}
      <Loader open={isPrinting} />
      <DeleteDialog
        open={!!quoteToDelete}
        title="Excluir cotação"
        item={quoteToDelete?.date ?? ''}
        handleConfirm={handleDeleteDialogConfirm}
        handleClose={handleDeleteDialogClose}
      />
    </>
  )
}
