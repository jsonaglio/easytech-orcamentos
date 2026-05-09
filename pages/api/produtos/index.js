import { getAllProdutos, upsertProduto } from '../../../lib/kv'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    if (req.method === 'GET') {
      const produtos = await getAllProdutos()
      return res.status(200).json(produtos)
    }

    if (req.method === 'POST') {
      const p = req.body
      if (!p?.id || !p?.nome) {
        return res.status(400).json({ error: 'id e nome são obrigatórios' })
      }
      const saved = await upsertProduto(p)
      return res.status(200).json({ ok: true, produto: saved })
    }

    return res.status(405).json({ error: 'Método não permitido' })
  } catch (err) {
    console.error('[API /produtos]', err)
    return res.status(500).json({ error: err.message })
  }
}
