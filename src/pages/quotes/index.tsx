import {
  DataView,
  DeleteDialog,
  FamilyForm,
  Loader,
  ProductForm
} from '@/components'

import {
  AiReferenceModal,
  Form,
  Header,
  NfImportDialog,
  Table
} from './_components'
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
    isNfImportOpen,
    handleNfImportOpen,
    handleNfImportClose,
    handlePrint,
    isPrinting,
    search,
    setSearch,
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
        onYearChange={onYearChange}
        onMonthChange={onMonthChange}
        onDayChange={onDayChange}
        handleQuoteFormOpen={handleQuoteFormOpen}
        handleDeleteQuote={handleDeleteQuote}
        handleAiReferenceOpen={handleAiReferenceOpen}
        handleNfImportOpen={handleNfImportOpen}
        handlePrint={handlePrint}
        isPrinting={isPrinting}
        search={search}
        setSearch={setSearch}
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
        <NfImportDialog
          isOpened={isNfImportOpen}
          quote={quote}
          handleClose={handleNfImportClose}
        />
      )}
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
