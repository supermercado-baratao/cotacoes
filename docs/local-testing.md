# Local manual testing

How to check each feature by hand, against the Firebase emulators. The files mentioned are in `src/tests/_mocks/`, the same ones the e2e tests use. Buttons, tabs and fields are named as the UI shows them, in Portuguese.

## Prepare the environment

```bash
pnpm db:seed   # starts the emulators, if needed, and fills in a new user
pnpm dev       # server at http://localhost:5173
```

`pnpm db:seed` creates a user with a verified email and writes the email and password to `seed-credentials.json`, which git ignores. Each run creates another user and overwrites the file. The seed only runs with a `demo-` project ID, which Firebase never connects to real resources.

The user comes with:

- the catalog from `import-data.xlsx`: 495 products, 232 families, 78 suppliers and the departments;
- the three quotes in `quotes/`, with the items of each `quote.txt` not yet referenced: the first two closed and the third open;
- the 20 invoices of the third quote (`quotes/quote-3-2026-06-01-2026-07-09/*.xml`), pending and with no orders;
- a minimum margin of 20% and a maximum of 40% in Configurações, so the Dashboard already shows alerts.

The dates of the quotes and invoices are shifted so the most recent invoice falls on the day of the seed. They then fall within the pages' default period (the last 30 days), keeping the intervals between them. The four oldest invoices fall outside that period.

The data lives in the emulator's memory: it survives restarts of `pnpm dev` and is gone after `pnpm services:down` and `pnpm test:e2e`. To start over, run `pnpm services:down` and then `pnpm db:seed`.

## Account

1. **Sign-up:** at `/signup`, create an account with any email. The app takes you to `/verify-email`.
2. **Email verification:** the emulator sends no email; the link shows up in `firebase-emulators.log` (search for `To verify the email address`). Open the link and click **Já verifiquei, entrar**.
3. **Sign-in:** at `/signin`, sign in with the credentials in `seed-credentials.json`.

## Catalog

Produtos, Fornecedores, Vendedores, Famílias and Departamentos follow the same pattern:

1. Create a record with the **Novo** button and check the alert and the row in the table.
2. Edit with the pencil icon and delete with the trash icon, which asks for confirmation.
3. Use the search to filter the table.
4. Vendedores starts empty: add one to use in the orders.

Also:

- **Importar catálogo** (Produtos, Fornecedores, Famílias and Departamentos): click **Importar** and upload `edited-import-data.xlsx`. Only the products changed from `import-data.xlsx` come checked. **Gerar Query** shows the SQL query that produces the spreadsheet in VR.
- **Produtos → Sem Cadastro:** lists the invoice items with no registered product. Try **Cadastrar**, **Associar a produto existente** and **Ignorar**, and find the item in the **Ignorados** tab.
- **Fornecedores → Ignorados:** an ignored supplier disappears from the invoice import.

## Quotes (Cotações)

1. Open the open quote (the most recent one).
2. Click **Referenciar com IA**. Outside production the suggestions come from the local fallback, after about 30 seconds. Accept or reject each one and apply the accepted ones.
3. On an item, click **Editar manualmente** and reference a family or a specific product.
4. On a referenced item, create an order (**Novo Pedido**) with supplier, seller, packing and price.
5. Edit the shortage list (**Lista de faltas**): the references of the items kept are still there.
6. Remove an item with an order: the order is deleted too.
7. Create a quote with **Nova Cotação**, pasting the lines of another `quote.txt` into **Lista de faltas**.
8. Delete a quote: its orders are deleted too.

## Invoices (Notas de Entrada)

1. Check the invoices of the default period and widen the period (**De** and **Até**) to see all 20.
2. **Importar Notas:** upload the XMLs in `quotes/quote-2-2026-04-01-2026-05-31/`. Uploading an XML already imported shows the invoice as a duplicate, and an XML without an access key shows up as an error. On an invoice from an unknown supplier, try **Ignorar fornecedor permanentemente**.
3. Open an invoice and use **Vincular pedidos**: items of the same family with the same packing go to **Confirmar pedidos em lote**, and a single item opens the order form.
4. Fix the packing quantity of an item (**Corrigir Qtd. Embalagem**) and remove the fix.
5. **Aprovar nota** is only enabled when every item has an order. An item left on **Não vincular** keeps the invoice pending.
6. The **Voltar** button returns to the page the invoice was opened from (the list or the Dashboard).

## Price adjustments (Reajustes de Preços)

1. **Importar Arquivo de Reajuste:** upload `price-adjustments-small.xlsx`.
2. Check the match against the most recent quote, which prefers the invoice price, the **Não cadastrado** and **Sem cotação recente** groups and the warning about different prices within the same family.
3. After the import, the product prices show up updated on the Produtos page.

## Dashboard

1. Check the totals: registered products, open quotes and pending invoices.
2. Check the products below and above the margin. Turn off **Filtrar por entrada no período** to consider every product, including the ones with no recent entry.
3. Very negative margins are usually a cost per box with no conversion: open the invoice in **Ver notas** and fix the item's Qtd. Embalagem.
4. Switch the cost source in the cost column and check that the margin is recalculated.
5. On a product, **Ver notas** opens the invoices with an entry in the period.

## Settings (Configurações)

1. Change the minimum and maximum margins and check the effect on the Dashboard alerts.
2. Add a margin override per department and remove it.
3. Reorder the departments, by dragging or with the arrows, and check the new order in a quote's PDF (**Imprimir**).
