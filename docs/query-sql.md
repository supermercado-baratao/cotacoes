# Query SQL

Essa query é usada no REP VR Software (o VR limita o texto da query a 3000 caracteres — mantenha-a compacta) e retorna os dados que são exportados no formato `xlsx` e depois importados no app.

```sql
SELECT
  p.id AS id_produto,
  p.descricaocompleta,
  p.datacadastro AS datacadastro_produto,
  b.codigos_barras,
  b.tipos_embalagem,
  b.qtds_embalagem,
  e.embalagens_fornecedor,
  m1.descricao AS departamento,
  m2.descricao AS secao,
  m3.descricao AS grupo,
  fp.id AS id_familia,
  fp.descricao AS familia,
  f.id AS id_fornecedor,
  f.razaosocial,
  f.nomefantasia,
  f.cnpj,
  f.telefone,
  f.datacadastro AS datacadastro_fornecedor,
  c.email,
  pc.precovenda,
  pc.estoque,
  pc.custocomimposto
FROM (
  SELECT DISTINCT nei.id_produto, ne.id_fornecedor
  FROM notaentradaitem nei
  JOIN notaentrada ne ON ne.id = nei.id_notaentrada
  WHERE ne.dataemissao >= '2026-01-01'
) AS x
JOIN produto p ON p.id = x.id_produto
JOIN fornecedor f ON f.id = x.id_fornecedor
LEFT JOIN mercadologico m1 ON m1.mercadologico1 = p.mercadologico1
  AND m1.mercadologico2 = 0 AND m1.nivel = 1
LEFT JOIN mercadologico m2 ON m2.mercadologico1 = p.mercadologico1
  AND m2.mercadologico2 = p.mercadologico2
  AND m2.mercadologico3 = 0 AND m2.nivel = 2
LEFT JOIN mercadologico m3 ON m3.mercadologico1 = p.mercadologico1
  AND m3.mercadologico2 = p.mercadologico2
  AND m3.mercadologico3 = p.mercadologico3 AND m3.nivel = 3
LEFT JOIN familiaproduto fp ON fp.id = p.id_familiaproduto
LEFT JOIN produtocomplemento pc ON pc.id_produto = p.id AND pc.id_loja = 1
LEFT JOIN LATERAL (
  SELECT
    string_agg(pa.codigobarras::text, '|' ORDER BY pa.qtdembalagem) AS codigos_barras,
    string_agg(te.descricao, '|' ORDER BY pa.qtdembalagem) AS tipos_embalagem,
    string_agg(pa.qtdembalagem::text, '|' ORDER BY pa.qtdembalagem) AS qtds_embalagem
  FROM produtoautomacao pa
  LEFT JOIN tipoembalagem te ON te.id = pa.id_tipoembalagem
  WHERE pa.id_produto = p.id
) AS b ON true
LEFT JOIN LATERAL (
  SELECT string_agg(DISTINCT y.cod || ':' || y.qtd, '|') AS embalagens_fornecedor
  FROM (
    SELECT pf.codigoexterno::text AS cod, pf.qtdembalagem::text AS qtd
    FROM produtofornecedor pf
    WHERE pf.id_produto = p.id AND pf.id_fornecedor = f.id
    UNION
    SELECT ce.codigoexterno::text, ce.qtdembalagem::text
    FROM produtofornecedorcodigoexterno ce
    JOIN produtofornecedor pf ON pf.id = ce.id_produtofornecedor
    WHERE pf.id_produto = p.id AND pf.id_fornecedor = f.id
  ) AS y
  WHERE y.cod <> ''
) AS e ON true
LEFT JOIN LATERAL (
  SELECT fc.email
  FROM fornecedorcontato fc
  WHERE fc.id_fornecedor = f.id AND fc.email <> ''
  LIMIT 1
) AS c ON true;
```
