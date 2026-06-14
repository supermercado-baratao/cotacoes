import { FamilyForm, GroupForm, ProductForm, SupplierForm } from '@/components'
import { DataView } from '@/components'

import { Form, Header, Table } from './_components'
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
    quickCreateGroup,
    setQuickCreateGroup,
    quickCreateSupplier,
    setQuickCreateSupplier
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
      />
      <ProductForm
        isOpened={isProductFormOpen}
        product={formProduct}
        setFormProduct={setFormProduct}
        handleClose={handleProductFormClose}
        setQuickCreateFamily={setQuickCreateFamily}
        setQuickCreateGroup={setQuickCreateGroup}
        setQuickCreateSupplier={setQuickCreateSupplier}
      />
      <FamilyForm
        isOpened={quickCreateFamily}
        family={null}
        setFormFamily={() => {}}
        handleClose={() => setQuickCreateFamily(false)}
      />
      <GroupForm
        isOpened={quickCreateGroup}
        group={null}
        setFormGroup={() => {}}
        handleClose={() => setQuickCreateGroup(false)}
      />
      <SupplierForm
        isOpened={quickCreateSupplier}
        supplier={null}
        setFormSupplier={() => {}}
        handleClose={() => setQuickCreateSupplier(false)}
      />
    </>
  )
}
