import { getProduto, deleteProduto } from '../../../lib/kv'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { id } = req.query

  try {
    if (req.method === 'GET') {
      const produto = await getProduto(id)
      if (!produto) return res.status(404).json({ error: 'Produto não encontrado' })
      return res.status(200).json(produto)
    }

    if (req.method === 'DELETE') {
      await deleteProduto(id)
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Método não permitido' })
  } catch (err) {
    console.error('[API /produtos/[id]]', err)
    return res.status(500).json({ error: err.message })
  }
}
