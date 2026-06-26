export const buildQuery = (date: string) => `
  SELECT
    p.id                          AS id_produto,
    p.descricaocompleta,
    p.datacadastro               AS datacadastro_produto,
    barcodes_info.codigos_barras,
    barcodes_info.tipos_embalagem,

    m1.descricao                  AS departamento,
    m2.descricao                  AS secao,
    m3.descricao                  AS grupo,

    fp.id                         AS id_familia,
    fp.descricao                  AS familia,

    f.id                          AS id_fornecedor,
    f.razaosocial,
    f.nomefantasia,
    f.cnpj,
    f.telefone,
    f.datacadastro               AS datacadastro_fornecedor,
    contato_info.email,

    pc.precovenda,
    pc.estoque

  FROM (
    SELECT DISTINCT nei.id_produto, ne.id_fornecedor
    FROM notaentradaitem nei
    JOIN notaentrada ne ON ne.id = nei.id_notaentrada
    WHERE ne.dataemissao >= '${date}'
  ) AS combinacoes

  JOIN produto p               ON p.id = combinacoes.id_produto
  JOIN fornecedor f            ON f.id = combinacoes.id_fornecedor

  LEFT JOIN mercadologico m1   ON m1.mercadologico1 = p.mercadologico1
    AND m1.mercadologico2 = 0
    AND m1.nivel = 1

  LEFT JOIN mercadologico m2   ON m2.mercadologico1 = p.mercadologico1
    AND m2.mercadologico2 = p.mercadologico2
    AND m2.mercadologico3 = 0
    AND m2.nivel = 2

  LEFT JOIN mercadologico m3   ON m3.mercadologico1 = p.mercadologico1
    AND m3.mercadologico2 = p.mercadologico2
    AND m3.mercadologico3 = p.mercadologico3
    AND m3.nivel = 3

  LEFT JOIN familiaproduto fp  ON fp.id = p.id_familiaproduto

  LEFT JOIN produtocomplemento pc ON pc.id_produto = p.id
    AND pc.id_loja = 1

  LEFT JOIN LATERAL (
    SELECT
      string_agg(pa.codigobarras::text, '|' ORDER BY pa.qtdembalagem ASC) AS codigos_barras,
      string_agg(te.descricao,          '|' ORDER BY pa.qtdembalagem ASC) AS tipos_embalagem
    FROM produtoautomacao pa
    LEFT JOIN tipoembalagem te ON te.id = pa.id_tipoembalagem
    WHERE pa.id_produto = p.id
  ) AS barcodes_info ON true

  LEFT JOIN LATERAL (
    SELECT fc.email
    FROM fornecedorcontato fc
    WHERE fc.id_fornecedor = f.id
      AND fc.email IS NOT NULL
      AND fc.email <> ''
    LIMIT 1
  ) AS contato_info ON true;
`
