# Integração com VR Software — Contexto para App de Cotações

## O que é o VR Software

ERP/PDV utilizado no supermercado. Banco de dados **PostgreSQL** (schema `public`). O app de cotações **não escreve** nada no banco do VR — apenas lê via queries SQL para importar dados.

---

## Fluxo geral

```text
VR Software (PostgreSQL)
        │
        │  1. Exportar produtos (ver query-sql.md)
        │  2. Importar XMLs de NF-e
        ▼
App de Cotações
        │
        │  3. Criar cotações por lista de itens
        │  4. Gerar pedidos de compra
        │  5. Conferir pedido vs. NF-e importada
        ▼
Resultado: divergências de quantidade e preço
```

---

## 1. Importação de Produtos

### O que a query retorna

Uma linha por combinação **(produto × fornecedor)**. Se um produto foi comprado de dois fornecedores no período, aparece duas vezes — isso é intencional, pois cotações são feitas por fornecedor. Apenas produtos com nota de entrada emitida a partir da data configurada são incluídos.

A query completa está em [`query-sql.md`](./query-sql.md).

### Campos e seus papéis

| Campo                     | Tipo    | Descrição                                                                                               |
| ------------------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| `id_produto`              | integer | Chave do produto no VR                                                                                  |
| `descricaocompleta`       | text    | Nome completo do produto                                                                                |
| `datacadastro_produto`    | date    | Data de cadastro do produto no VR                                                                       |
| `codigos_barras`          | text    | EANs separados por `\|`, ordenados do menor embalagem para o maior. Ex: `7891234567890\|17891234567897` |
| `tipos_embalagem`         | text    | Tipos de embalagem correspondentes aos barcodes, separados por `\|`. Ex: `UN\|CX`                       |
| `departamento`            | text    | Nível 1 da hierarquia mercadológica                                                                     |
| `secao`                   | text    | Nível 2 da hierarquia mercadológica                                                                     |
| `grupo`                   | text    | Nível 3 da hierarquia mercadológica                                                                     |
| `id_familia`              | integer | ID da família de preço (pode ser nulo)                                                                  |
| `familia`                 | text    | Nome da família de preço (pode ser nulo)                                                                |
| `id_fornecedor`           | integer | Chave do fornecedor no VR                                                                               |
| `razaosocial`             | text    | Razão social do fornecedor                                                                              |
| `nomefantasia`            | text    | Nome fantasia do fornecedor                                                                             |
| `cnpj`                    | numeric | CNPJ do fornecedor (sem formatação)                                                                     |
| `telefone`                | text    | Telefone do fornecedor (pode ser nulo)                                                                  |
| `datacadastro_fornecedor` | date    | Data de cadastro do fornecedor no VR                                                                    |
| `email`                   | text    | Email do fornecedor, vindo de `fornecedorcontato` (pode ser nulo)                                       |
| `precovenda`              | numeric | Preço de venda atual (loja 1), em centavos × 100 — dividir por 10000 para obter o valor real            |
| `estoque`                 | numeric | Saldo em estoque (loja 1), em milésimos — dividir por 1000 para obter a quantidade real                 |

### Observações importantes

- **`cnpj` é numérico**: formatar como string com 14 dígitos com zero à esquerda quando necessário (`LPAD(cnpj::text, 14, '0')`).
- **`codigos_barras` pode ser nulo**: produtos pesáveis (açougue, hortifruti) geralmente não têm EAN cadastrado.
- **`email` pode ser nulo**: nem todos os fornecedores têm contato cadastrado em `fornecedorcontato`.
- **Estoque negativo é real**: indica divergência de inventário no VR, não erro de query.
- **`precovenda` e `estoque` vêm escalados**: `precovenda / 10000` e `estoque / 1000` (formato interno do VR).

---

## 2. Importação de XML de NF-e

Os XMLs das NF-e são importados diretamente no app (não vêm do banco VR). Cada XML contém:

### Campos relevantes por item (`<det>`)

| Tag XML      | Descrição                                  | Uso                           |
| ------------ | ------------------------------------------ | ----------------------------- |
| `<cProd>`    | Código do produto no sistema do fornecedor | Armazenado no item da NF      |
| `<cEAN>`     | Código de barras EAN/GTIN do produto       | Matching com `codigos_barras` |
| `<cEANTrib>` | EAN da unidade tributável                  | Fallback de matching por EAN  |
| `<xProd>`    | Descrição do produto conforme o fornecedor | Exibição                      |
| `<qCom>`     | Quantidade comercial recebida              | Conferência de quantidade     |
| `<uCom>`     | Unidade comercial (UN, CX, KG...)          | Contexto da quantidade        |
| `<vUnCom>`   | Valor unitário comercial                   | Conferência de preço          |
| `<vProd>`    | Valor total do item                        | Conferência de valor total    |

### Campos relevantes do cabeçalho

| Tag XML          | Descrição                                                  |
| ---------------- | ---------------------------------------------------------- |
| `<chNFe>`        | Chave de acesso (44 dígitos) — identificador único da NF-e |
| `<nNF>`          | Número da nota                                             |
| `<serie>`        | Série da nota                                              |
| `<dhEmi>`        | Data/hora de emissão                                       |
| `<CNPJ>` (emit)  | CNPJ do emitente — usado para identificar o fornecedor     |
| `<xFant>` (emit) | Nome fantasia do emitente                                  |
| `<vNF>`          | Valor total da nota                                        |

---

## 3. Matching: item da NF-e → produto do app

Ao importar uma NF-e, cada item do XML é vinculado a um produto cadastrado. A estratégia atual usa **EAN** como único critério.

### Prioridade 1 — EAN (`<cEAN>` / `<cEANTrib>`)

```text
xml.cEAN ∈ produto.barcodes   (tentativa 1)
xml.cEANTrib ∈ produto.barcodes  (tentativa 2, fallback)
```

Mais confiável. Falha quando o produto não tem EAN cadastrado (pesáveis, açougue).

### Itens sem match

Sinalizados como **"produto não cadastrado"** para revisão manual. Não são descartados — pode ser produto novo não importado ainda.

---

## 4. Conferência de pedido vs. NF-e

Após o matching dos itens, comparar:

| Campo            | Pedido (app)     | NF-e (XML)  | Divergência se                    |
| ---------------- | ---------------- | ----------- | --------------------------------- |
| Quantidade       | `order.quantity` | `<qCom>`    | diferença absoluta > tolerância   |
| Preço unitário   | `order.price`    | `<vUnCom>`  | diferença percentual > tolerância |
| Produto presente | item no pedido   | item no XML | item ausente em um dos lados      |

### Tipos de divergência

1. **Quantidade divergente** — pediu X, recebeu Y
2. **Preço divergente** — cotação em R$ A, NF chegou R$ B
3. **Item a mais na NF** — produto na NF que não estava no pedido
4. **Item faltando na NF** — produto no pedido que não veio na NF
5. **Produto não cadastrado** — item da NF sem match com nenhum produto do app
