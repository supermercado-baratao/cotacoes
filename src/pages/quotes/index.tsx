import { FamilyForm, ProductForm } from '@/components'
import { DataView } from '@/components'

import { Form, Header, OrderForm, Table } from './_components'
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
    handleProductFormOpen,
    handleProductFormClose,
    formOrder,
    setFormOrder,
    isOrderFormOpen,
    orderProductId,
    handleOrderFormClose,
    handleOrderEdit,
    quickCreateFamily,
    setQuickCreateFamily
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
        onYearChange={onYearChange}
        onMonthChange={onMonthChange}
        onDayChange={onDayChange}
        handleQuoteFormOpen={handleQuoteFormOpen}
      />
      <DataView
        isFetching={isFetching}
        isEmpty={!hasQuoteRows}
        emptyMessage="Nenhum produto nesta cotação. Crie uma cotação ou adicione produtos!"
      >
        {quote && (
          <Table quote={quote} rows={quoteRows} handleEdit={handleOrderEdit} />
        )}
      </DataView>
      <Form
        isOpened={isQuoteFormOpen}
        quote={formQuote}
        setFormQuote={setFormQuote}
        handleClose={handleQuoteFormClose}
        setQuickCreateProduct={handleProductFormOpen}
      />
      <OrderForm
        isOpened={isOrderFormOpen}
        order={formOrder}
        setFormOrder={setFormOrder}
        productId={orderProductId}
        handleClose={handleOrderFormClose}
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
    </>
  )
}
