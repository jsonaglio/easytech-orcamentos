import { syncAll } from '../../lib/kv'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { produtos } = req.body
    if (!Array.isArray(produtos) || !produtos.length) {
      return res.status(400).json({ error: 'Envie um array de produtos' })
    }
    const count = await syncAll(produtos)
    return res.status(200).json({ ok: true, synced: count })
  } catch (err) {
    console.error('[API /sync]', err)
    return res.status(500).json({ error: err.message })
  }
}
