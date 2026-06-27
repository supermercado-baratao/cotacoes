import { DataView, DeleteDialog, FamilyForm, ProductForm } from '@/components'

import { AiReferenceModal, Form, Header, Table } from './_components'
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
    hasUnreferenced,
    handleAiReferenceOpen,
    handleAiReferenceClose,
    handlePrint,
    quoteToDelete,
    handleDeleteQuote,
    handleDeleteDialogClose,
    handleDeleteDialogConfirm,
    handleSuccess
  } = useQuotesHandler()

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
        hasUnreferenced={hasUnreferenced}
        onYearChange={onYearChange}
        onMonthChange={onMonthChange}
        onDayChange={onDayChange}
        handleQuoteFormOpen={handleQuoteFormOpen}
        handleDeleteQuote={handleDeleteQuote}
        handleAiReferenceOpen={handleAiReferenceOpen}
        handlePrint={handlePrint}
      />
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
