import { DataView } from '@/components/blocks/data-view'
import { PageHeader } from '@/components/blocks/page-header'
import { SellerForm } from '@/components/blocks/seller-form'
import { SupplierForm } from '@/components/blocks/supplier-form'

import { Table } from './_components/table'
import { useSellersHandler } from './use-sellers-handler'

export const Sellers = () => {
  const {
    isFetching,
    hasSellers,
    search,
    setSearch,
    handleFormOpen,
    filteredSellers,

    handleFormClose,
    isFormOpen,
    setFormSeller,
    formSeller,
    quickCreateSupplier,
    setQuickCreateSupplier
  } = useSellersHandler()

  return (
    <>
      <PageHeader
        title="Vendedores"
        buttonLabel="Novo Vendedor"
        searchPlaceholder="Buscar vendedor..."
        search={search}
        setSearch={setSearch}
        handleFormOpen={handleFormOpen}
      />
      <DataView
        isFetching={isFetching}
        isEmpty={!hasSellers}
        emptyMessage="Você ainda não tem nenhum vendedor. Cadastre um para começar!"
      >
        <Table sellers={filteredSellers ?? []} handleEdit={handleFormOpen} />
      </DataView>
      <SellerForm
        isOpened={isFormOpen}
        seller={formSeller}
        setFormSeller={setFormSeller}
        handleClose={handleFormClose}
        setQuickCreateSupplier={setQuickCreateSupplier}
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
