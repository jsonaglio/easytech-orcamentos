import { kv } from '@vercel/kv'

const PREFIX = 'produto:'

export async function getAllProdutos() {
  const keys = await kv.keys(`${PREFIX}*`)
  if (!keys.length) return []
  const items = await Promise.all(keys.map(k => kv.get(k)))
  return items
    .filter(Boolean)
    .sort((a, b) => a.cat.localeCompare(b.cat) || a.nome.localeCompare(b.nome))
}

export async function getProduto(id) {
  return kv.get(`${PREFIX}${id}`)
}

export async function upsertProduto(produto) {
  if (!produto.prazo && produto.preco) {
    produto.prazo = Number(produto.preco) * 1.1
  }
  await kv.set(`${PREFIX}${produto.id}`, produto)
  return produto
}

export async function deleteProduto(id) {
  await kv.del(`${PREFIX}${id}`)
}

export async function syncAll(produtos) {
  const pipeline = kv.pipeline()
  for (const p of produtos) {
    if (!p.prazo && p.preco) p.prazo = Number(p.preco) * 1.1
    pipeline.set(`${PREFIX}${p.id}`, p)
  }
  await pipeline.exec()
  return produtos.length
}
