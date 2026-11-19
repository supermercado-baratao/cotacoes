# Teste manual local

Como conferir cada funcionalidade à mão, contra os emuladores do Firebase. Os arquivos citados ficam em `src/tests/_mocks/`, os mesmos usados pelos testes e2e.

## Preparar o ambiente

```bash
pnpm db:seed   # sobe os emuladores, se preciso, e popula um usuário novo
pnpm dev       # servidor em http://localhost:5173
```

O `pnpm db:seed` cria um usuário com e-mail verificado e grava o e-mail e a senha em `seed-credentials.json`, ignorado pelo git. Cada execução cria outro usuário e sobrescreve o arquivo. O seed só roda com um project ID `demo-`, que o Firebase nunca liga a recursos reais.

O usuário já vem com:

- o catálogo do `import-data.xlsx`: 495 produtos, 232 famílias, 78 fornecedores e os departamentos;
- as três cotações de `quotes/`, com os itens de cada `quote.txt` ainda sem referência: as duas primeiras fechadas e a terceira aberta;
- as 20 notas da terceira cotação (`quotes/quote-3-2026-06-01-2026-07-09/*.xml`), pendentes e sem pedidos;
- margem mínima de 20% e máxima de 40% em Configurações, para o Dashboard já mostrar alertas.

As datas das cotações e das notas são deslocadas para que a nota mais recente caia no dia do seed. Assim elas entram no período padrão das páginas (últimos 30 dias), mantendo os intervalos entre elas. As quatro notas mais antigas ficam fora desse período.

Os dados ficam na memória do emulador: sobrevivem a reinícios do `pnpm dev` e somem no `pnpm services:down` e no `pnpm test:e2e`. Para recomeçar do zero, rode `pnpm services:down` e depois `pnpm db:seed`.

## Conta

1. **Cadastro:** em `/signup`, crie uma conta com qualquer e-mail. O app leva para `/verify-email`.
2. **Verificação de e-mail:** o emulador não envia e-mail; o link aparece no `firebase-emulators.log` (procure por `To verify the email address`). Abra o link e clique em **Já verifiquei, entrar**.
3. **Login:** em `/signin`, entre com as credenciais do `seed-credentials.json`.

## Cadastros

Produtos, Fornecedores, Vendedores, Famílias e Departamentos seguem o mesmo padrão:

1. Crie um registro pelo botão **Novo** e confira o alerta e a linha na tabela.
2. Edite pelo ícone de lápis e exclua pelo de lixeira, que pede confirmação.
3. Use a busca para filtrar a tabela.
4. Vendedores começa vazio: cadastre um para usar nos pedidos.

Além disso:

- **Importar catálogo** (Produtos, Fornecedores, Famílias e Departamentos): clique em **Importar** e envie `edited-import-data.xlsx`. Só os produtos alterados em relação ao `import-data.xlsx` vêm marcados. **Gerar Query** mostra a consulta SQL que gera a planilha no VR.
- **Produtos → Sem Cadastro:** lista os itens das notas sem produto cadastrado. Teste **Cadastrar**, **Associar a produto existente** e **Ignorar**, e confira o item na aba **Ignorados**.
- **Fornecedores → Ignorados:** um fornecedor ignorado some da importação de notas.

## Cotações

1. Abra a cotação aberta (a mais recente).
2. Clique em **Referenciar com IA**. Fora de produção as sugestões vêm do fallback local, depois de uns 30 segundos. Aceite ou recuse cada uma e aplique os aceitos.
3. Em um item, clique em **Editar manualmente** e referencie uma família ou um produto específico.
4. Em um item referenciado, crie um pedido (**Novo Pedido**) com fornecedor, vendedor, embalagem e preço.
5. Edite a lista de faltas: as referências dos itens mantidos continuam lá.
6. Remova um item com pedido: o pedido também é excluído.
7. Crie uma cotação com **Nova Cotação**, colando as linhas de outro `quote.txt` em **Lista de faltas**.
8. Exclua uma cotação: os pedidos dela também são excluídos.

## Notas de Entrada

1. Confira as notas do período padrão e amplie o período (**De** e **Até**) para ver as 20.
2. **Importar Notas:** envie os XMLs de `quotes/quote-2-2026-04-01-2026-05-31/`. Reenviar um XML já importado mostra a nota como duplicada, e um XML sem chave de acesso aparece como erro. Em uma nota de fornecedor desconhecido, teste **Ignorar fornecedor permanentemente**.
3. Abra uma nota e use **Vincular pedidos**: itens da mesma família com a mesma embalagem vão para **Confirmar pedidos em lote**, e um item sozinho abre o formulário de pedido.
4. Corrija a quantidade da embalagem de um item (**Corrigir Qtd. Embalagem**) e remova a correção.
5. **Aprovar nota** só fica habilitado quando todos os itens têm pedido. Um item deixado em **Não vincular** mantém a nota pendente.
6. O botão **Voltar** retorna para a página de onde a nota foi aberta (lista ou Dashboard).

## Reajustes de Preços

1. **Importar Arquivo de Reajuste:** envie `price-adjustments-small.xlsx`.
2. Confira o cruzamento com a cotação mais recente, que prioriza o preço da nota, os grupos **Não cadastrado** e **Sem cotação recente** e o aviso de preços divergentes na mesma família.
3. Depois da importação, os preços dos produtos aparecem atualizados na página Produtos.

## Dashboard

1. Confira os totais: produtos cadastrados, cotações abertas e notas pendentes.
2. Confira os produtos abaixo e acima da margem. Desligue **Filtrar por entrada no período** para considerar todos os produtos, inclusive os sem entrada recente.
3. Margens muito negativas costumam ser custo por caixa sem conversão: abra a nota em **Ver notas** e corrija a Qtd. Embalagem do item.
4. Troque a fonte do custo na coluna de custo e confira o recálculo da margem.
5. Em um produto, **Ver notas** abre as notas com entrada no período.

## Configurações

1. Altere a margem mínima e a máxima e confira o efeito nos alertas do Dashboard.
2. Adicione um override de margem por departamento e remova-o.
3. Reordene os departamentos, arrastando ou pelas setas, e confira a nova ordem no PDF de uma cotação (**Imprimir**).
