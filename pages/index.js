import Head from 'next/head'
import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Constantes ───────────────────────────────────────────────
const TAXA_PRAZO = 0.10
const prazoPreco = (v) => Number(v) * (1 + TAXA_PRAZO)
const fmtBRL = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtDate = (d) => d.toLocaleDateString('pt-BR')
const pad = (n) => String(n).padStart(2, '0')

// Ícones SVG por categoria (arquivos estáticos em /public/icons/)
const CAT_ICON_B64 = {
  motherboard: '/icons/motherboard.svg',
  cpu:         '/icons/cpu.svg',
  ram:         '/icons/ram.svg',
  gpu:         '/icons/gpu.svg',
  ssd:         '/icons/ssd.svg',
  psu:         '/icons/psu.svg',
  gabinete:    '/icons/gabinete.svg',
  cooler:      '/icons/cooler.svg',
}

