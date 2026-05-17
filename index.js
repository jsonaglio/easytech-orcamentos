import Head from 'next/head'
import { useState, useEffect, useRef, useCallback } from 'react'

const TAXA_PRAZO = 0.10
const prazoPreco = (v) => Number(v) * (1 + TAXA_PRAZO)
const fmtBRL = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtDate = (d) => d.toLocaleDateString('pt-BR')
const pad = (n) => String(n).padStart(2, '0')

const CAT_ICON_B64 = {
  motherboard: '/icons/motherboard.svg', cpu: '/icons/cpu.svg',
  ram: '/icons/ram.svg', gpu: '/icons/gpu.svg', ssd: '/icons/ssd.svg',
  psu: '/icons/psu.svg', gabinete: '/icons/gabinete.svg', cooler: '/icons/cooler.svg',
  monitor: '/icons/monitor.svg', teclado: '/icons/teclado.svg',
  mouse: '/icons/mouse.svg', headset: '/icons/headset.svg', montagem: '/icons/montagem.svg',
}

const CatIcon = ({ cat, size=20, style={} }) => {
  const map = {
    'Placa-Mãe': CAT_ICON_B64.motherboard, 'Processador': CAT_ICON_B64.cpu,
    'Memória RAM': CAT_ICON_B64.ram, 'Placa de Vídeo': CAT_ICON_B64.gpu,
    'Armazenamento': CAT_ICON_B64.ssd, 'Fonte': CAT_ICON_B64.psu,
    'Gabinete': CAT_ICON_B64.gabinete, 'Cooler': CAT_ICON_B64.cooler,
    'Monitor': CAT_ICON_B64.monitor, 'Teclado': CAT_ICON_B64.teclado,
    'Mouse': CAT_ICON_B64.mouse, 'Headset': CAT_ICON_B64.headset,
    'Montagem': CAT_ICON_B64.montagem,
  }
  const src = map[cat]
  const fallback = { 'Webcam':'📸','Mousepad':'🖱','Notebook':'💻','Smartphone':'📱','Instalação SO':'💾','Manutenção':'🔩','Acessório':'🔗','Outro':'📦' }
  if (src) return <img src={src} alt={cat} style={{ width:size, height:size, objectFit:'contain', ...style }} />
  return <span style={{ fontSize:size, ...style }}>{fallback[cat]||'📦'}</span>
}

const CATEGORIES = {
  '🖥 Componentes PC': ['Placa-Mãe','Processador','Memória RAM','Placa de Vídeo','Armazenamento','Fonte','Gabinete','Cooler'],
  '🖱 Periféricos': ['Monitor','Teclado','Mouse','Headset','Webcam','Mousepad'],
  '💻 Portáteis': ['Notebook','Smartphone'],
  '🔧 Serviços': ['Montagem','Instalação SO','Manutenção'],
  '📦 Outros': ['Acessório','Outro'],
}

const STEPS = [
  { key: 'Placa-Mãe', label: 'Placa-Mãe', sub: 'Base do setup', required: true },
  { key: 'Processador', label: 'Processador', sub: 'O cérebro do computador', required: true },
  { key: 'Memória RAM', label: 'Memória RAM', sub: 'Velocidade e multitarefa', required: true },
  { key: 'Placa de Vídeo', label: 'Placa de Vídeo', sub: 'Games, design e renderização', required: false },
  { key: 'Armazenamento', label: 'Armazenamento', sub: 'SSD ou HD', required: true },
  { key: 'Fonte', label: 'Fonte', sub: 'Alimente tudo com segurança', required: true },
  { key: 'Gabinete', label: 'Gabinete', sub: 'Visual e ventilação do setup', required: false },
  { key: 'Cooler', label: 'Cooler', sub: 'Temperaturas sob controle', required: false },
  { key: 'Monitor', label: 'Monitor', sub: 'A janela do setup', required: false },
  { key: 'Teclado', label: 'Teclado', sub: 'Periférico de entrada', required: false },
  { key: 'Mouse', label: 'Mouse', sub: 'Precisão nos movimentos', required: false },
  { key: 'Headset', label: 'Headset', sub: 'Áudio imersivo', required: false },
  { key: 'Montagem', label: 'Montagem', sub: 'Montagem profissional Easy Tech', required: false },
]

export default function Home() {
  const [tab, setTab] = useState('builder')
  const [catalog, setCatalog] = useState([])
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState({ text: 'Carregando…', color: '#f59e0b' })
  const [toast, setToast] = useState('')
  const nextId = useRef(1)
  const [step, setStep] = useState(0)
  const [cart, setCart] = useState({})
  const [search, setSearch] = useState('')
  const [avNome, setAvNome] = useState('')
  const [avPreco, setAvPreco] = useState('')
  const [discPct, setDiscPct] = useState('')
  const [discVal, setDiscVal] = useState('')
  const [cli, setCli] = useState({ nome:'', tel:'', email:'', obs:'' })
  const [form, setForm] = useState({ nome:'', cat:'Placa-Mãe', marca:'', desc:'', stock:'1', custo:'', preco:'' })
  const [editModal, setEditModal] = useState(null)
  const [editForm, setEditForm] = useState({})

  const openEdit = (p) => { setEditForm({ nome:p.nome, cat:p.cat, marca:p.marca||'', desc:p.desc||'', stock:String(p.stock||0), custo:String(p.custo||''), preco:String(p.preco) }); setEditModal(p) }
  const saveEdit = async () => {
    if (!editForm.nome||!editForm.preco) { showToast('⚠️ Nome e preço são obrigatórios'); return }
    const preco = parseFloat(editForm.preco)
    const updated = { ...editModal, ...editForm, preco, prazo:prazoPreco(preco), custo:parseFloat(editForm.custo)||0, stock:parseInt(editForm.stock)||0 }
    setCatalog(c => c.map(p => p.id===updated.id ? updated : p))
    setEditModal(null); showToast('✅ Produto atualizado!')
    try { await fetch('/api/produtos', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(updated) }) } catch {}
  }

  const showToast = useCallback((msg) => { setToast(msg); setTimeout(()=>setToast(''),2500) }, [])

  const loadCatalog = useCallback(async () => {
    setSyncing(true); setSyncMsg({ text:'Carregando…', color:'#f59e0b' })
    try {
      const res = await fetch('/api/produtos'); const data = await res.json()
      if (Array.isArray(data)) {
        const normalized = data.map(p=>({...p, prazo:p.prazo||prazoPreco(p.preco)}))
        setCatalog(normalized); nextId.current = normalized.reduce((m,p)=>Math.max(m,Number(p.id)||0),0)+1
        setSyncMsg({ text:`${normalized.length} produtos`, color:'#22c55e' })
      }
    } catch { setSyncMsg({ text:'Erro de conexão', color:'#ef4444' }) }
    finally { setSyncing(false) }
  }, [])

  useEffect(() => { loadCatalog() }, [loadCatalog])

  const addProduct = async () => {
    if (!form.nome.trim()||!form.preco) { showToast('⚠️ Nome e preço são obrigatórios'); return }
    const preco = parseFloat(form.preco)
    const produto = { id:nextId.current++, nome:form.nome.trim(), cat:form.cat, marca:form.marca.trim(), desc:form.desc.trim(), stock:parseInt(form.stock)||0, custo:parseFloat(form.custo)||0, preco, prazo:prazoPreco(preco) }
    setCatalog(c=>[...c,produto]); setForm(f=>({...f,nome:'',marca:'',desc:'',stock:'1',custo:'',preco:''})); showToast(`✅ ${produto.nome} adicionado!`)
    try { await fetch('/api/produtos', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(produto) }); setSyncMsg({text:`${produto.nome} salvo`,color:'#22c55e'}) } catch {}
  }

  const deleteProduct = async (id) => { setCatalog(c=>c.filter(p=>p.id!==id)); showToast('🗑 Removido'); try { await fetch(`/api/produtos/${id}`,{method:'DELETE'}) } catch {} }

  // ALTERADO: adiciona qty:1 ao item do carrinho
  const selectProd = (prodId) => {
    const s=STEPS[step]; const prod=catalog.find(p=>p.id===prodId); if (!prod) return
    setCart(c=>{const nc={...c}; if(nc[s.key]?.prodId===prodId) delete nc[s.key]; else nc[s.key]={prodId,nome:prod.nome,preco:prod.preco,prazo:prod.prazo||prazoPreco(prod.preco),desc:prod.desc,marca:prod.marca,cat:s.key,avulso:false,qty:1}; return nc}); setSearch('')
  }

  // ALTERADO: adiciona qty:1 ao item avulso
  const addAvulso = () => {
    if (!avNome.trim()||!avPreco) { showToast('⚠️ Preencha nome e valor'); return }
    const preco=parseFloat(avPreco); const s=STEPS[step]
    setCart(c=>({...c,[s.key]:{prodId:null,nome:avNome.trim(),preco,prazo:prazoPreco(preco),desc:'',marca:'',cat:s.label,avulso:true,qty:1}})); setAvNome(''); setAvPreco(''); showToast(`✅ ${avNome} adicionado`)
  }

  const removeCart = (key) => setCart(c=>{const nc={...c};delete nc[key];return nc})

  // Helper para alterar quantidade
  const changeQty = (key, delta) => {
    setCart(c => {
      const item = c[key]
      if (!item) return c
      const newQty = (item.qty || 1) + delta
      if (newQty <= 0) { const nc={...c}; delete nc[key]; return nc }
      return { ...c, [key]: { ...item, qty: newQty } }
    })
  }

  const cartItems = STEPS.filter(s=>cart[s.key]).map(s=>({...cart[s.key],stepLabel:s.label}))

  // ALTERADO: multiplica por qty
  const subtotal = cartItems.reduce((a,c)=>a+c.preco*(c.qty||1),0)
  const subtotalPrazo = cartItems.reduce((a,c)=>a+(c.prazo||prazoPreco(c.preco))*(c.qty||1),0)
  const desconto = Math.max(parseFloat(discVal)||0,subtotal*(parseFloat(discPct)||0)/100)
  const total = Math.max(0,subtotal-desconto)
  const totalPrazo = Math.max(0,subtotalPrazo-desconto*(1+TAXA_PRAZO))
  const done = STEPS.filter(s=>cart[s.key]).length
  const progPct = Math.round((done/STEPS.length)*100)
  const stepProds = catalog.filter(p=>p.cat===STEPS[step].key&&(p.nome?.toLowerCase().includes(search.toLowerCase())||(p.marca||'').toLowerCase().includes(search.toLowerCase())||(p.desc||'').toLowerCase().includes(search.toLowerCase())))

  const exportPDF = async () => {
    if (!cartItems.length) { showToast('Adicione itens ao orcamento'); return }
    if (!window.jspdf) { await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s)}) }
    const {jsPDF}=window.jspdf; const doc=new jsPDF({unit:'pt',format:'a4'}); const W=595,H=842,M=28
    const rgb=(h)=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]
    const fill=(h)=>{const[r,g,b]=rgb(h);doc.setFillColor(r,g,b)}
    const clr=(h)=>{const[r,g,b]=rgb(h);doc.setTextColor(r,g,b)}
    const strk=(h)=>{const[r,g,b]=rgb(h);doc.setDrawColor(r,g,b)}
    const box=(x,y,w,h)=>doc.rect(x,y,w,h,'F')
    const rbox=(x,y,w,h,r)=>doc.roundedRect(x,y,w,h,r,r,'F')
    const txt=(t,x,y)=>doc.text(String(t),x,y)
    const safe=(s)=>(s||'').replace(/[^\x00-\x7E\xC0-\xFF]/g,'').trim()
    let logoB64=null; try{const res=await fetch('/logo.png');const blob=await res.blob();logoB64=await new Promise(r=>{const rd=new FileReader();rd.onload=e=>r(e.target.result);rd.readAsDataURL(blob)})}catch{}
    fill('#0D0D0D');box(0,0,W,H)
    const HDR_H=110;fill('#1A1A1A');box(0,0,W,HDR_H);fill('#22C55E');box(0,HDR_H-3,W,3)
    if(logoB64)doc.addImage(logoB64,'PNG',M,14,82,82)
    doc.setFont('helvetica','bold');doc.setFontSize(30);clr('#22C55E');let cx=M+100
    for(const ch of 'EASYTECH'){txt(ch,cx,62);cx+=doc.getTextWidth(ch)+3}
    doc.setFont('helvetica','normal');doc.setFontSize(8);clr('#555555');txt('S T O R E',M+100,78)
    const nowDate=new Date();doc.setFontSize(9);clr('#A0A0A0');txt(fmtDate(nowDate),W-M-doc.getTextWidth(fmtDate(nowDate)),22)
    const CLI_Y=HDR_H+4,CLI_H=64;fill('#222222');box(0,CLI_Y,W,CLI_H);fill('#2A2A2A');box(0,CLI_Y,W,1);box(0,CLI_Y+CLI_H-1,W,1)
    doc.setFont('helvetica','normal');doc.setFontSize(7.5);clr('#555555');txt('CLIENTE',M,CLI_Y+18);txt('TELEFONE',W/2,CLI_Y+18)
    doc.setFont('helvetica','bold');doc.setFontSize(13);clr('#F0F0F0');txt(safe(cli.nome)||'CLIENTE',M,CLI_Y+42);txt(safe(cli.tel)||'-',W/2,CLI_Y+42)
    const LBL_Y=CLI_Y+CLI_H+22;doc.setFont('helvetica','bold');doc.setFontSize(10);clr('#22C55E');txt('DESCRICAO DO PRODUTO',M,LBL_Y);fill('#22C55E');box(M,LBL_Y+4,162,1.5)
    const ITEM_ROW_H=36,BOX_H=16+cartItems.length*ITEM_ROW_H+10,BOX_Y=LBL_Y+12
    fill('#1E1E1E');strk('#2A2A2A');doc.setLineWidth(1);doc.roundedRect(M,BOX_Y,W-2*M,BOX_H,5,5,'FD')
    let iy=BOX_Y+24
    cartItems.forEach((item,i)=>{
      const qty = item.qty || 1
      const itemPreco = item.preco * qty
      const itemPrazo = (item.prazo || prazoPreco(item.preco)) * qty
      doc.setFont('helvetica','bold');doc.setFontSize(8);clr('#22C55E');txt(item.stepLabel.toUpperCase(),M+12,iy-10)
      doc.setFont('helvetica','bold');doc.setFontSize(10);clr('#F0F0F0')
      // ALTERADO: mostra quantidade no nome se > 1
      const nomeExibido = safe(item.nome)+(item.marca?' - '+safe(item.marca):'')+(qty>1?` (x${qty})`:'')
      txt(nomeExibido,M+12,iy)
      const prazo=itemPrazo;clr('#22C55E');doc.setFontSize(10)
      const pStr=fmtBRL(itemPreco);txt(pStr,W-M-12-doc.getTextWidth(pStr),iy)
      clr('#A0A0A0');doc.setFont('helvetica','normal');doc.setFontSize(8);const iStr='12x '+fmtBRL(prazo/12);txt(iStr,W-M-12-doc.getTextWidth(iStr),iy+13)
      if(i<cartItems.length-1){fill('#2A2A2A');box(M+12,iy+20,W-2*M-24,0.5)};iy+=ITEM_ROW_H
    })
    let totY=BOX_Y+BOX_H+16
    if(desconto>0){doc.setFont('helvetica','normal');doc.setFontSize(9);clr('#A0A0A0');txt('Subtotal',M,totY);txt(fmtBRL(subtotal),W-M-doc.getTextWidth(fmtBRL(subtotal)),totY);totY+=16;clr('#22C55E');txt('Desconto',M,totY);const dStr='- '+fmtBRL(desconto);txt(dStr,W-M-doc.getTextWidth(dStr),totY);totY+=16}
    doc.setFont('helvetica','normal');doc.setFontSize(9);clr('#A0A0A0');const instTotal='ou 12x de '+fmtBRL(totalPrazo/12)+' (total '+fmtBRL(totalPrazo)+')';txt(instTotal,W/2-doc.getTextWidth(instTotal)/2,totY+14)
    if(cli.obs){clr('#555555');doc.setFontSize(8);txt('Obs: '+safe(cli.obs),M,totY+28)}
    const VAL_Y=totY+24,VAL_H=54;fill('#22C55E');rbox(M,VAL_Y,W-2*M,VAL_H,27)
    doc.setFont('helvetica','bold');doc.setFontSize(11);clr('#000000');txt('VALOR A VISTA',M+26,VAL_Y+VAL_H/2+4);doc.setFontSize(18);const vs=fmtBRL(total);txt(vs,W-M-doc.getTextWidth(vs)-26,VAL_Y+VAL_H/2+6)
    const FTR_H=72,FTR_Y=H-FTR_H;fill('#1A1A1A');box(0,FTR_Y,W,FTR_H);fill('#22C55E');box(0,FTR_Y,W,2)
    if(logoB64)doc.addImage(logoB64,'PNG',M,FTR_Y+12,44,44)
    doc.setFont('helvetica','bold');doc.setFontSize(9);clr('#F0F0F0');txt('EASYTECH STORE',M+54,FTR_Y+26)
    doc.setFontSize(8);clr('#22C55E');txt('INSTAGRAM: @EASYTECHSTORERS',M+54,FTR_Y+38);txt('WHATSAPP: (54) 99137-0566',M+54,FTR_Y+49);txt('WWW.EASYTECHSTORE.COM.BR',M+54,FTR_Y+60)
    const validDate=new Date(nowDate);validDate.setDate(validDate.getDate()+7)
    doc.setFont('helvetica','normal');doc.setFontSize(8);clr('#A0A0A0');const vLabel='VALIDADE DO ORCAMENTO: '+fmtDate(validDate);txt(vLabel,W-M-doc.getTextWidth(vLabel),FTR_Y+36)
    const numOrcPDF='ORC-'+nowDate.getFullYear()+pad(nowDate.getMonth()+1)+pad(nowDate.getDate())+'-'+String(Math.floor(Math.random()*1000)).padStart(3,'0')
    clr('#555555');doc.setFontSize(7);txt(numOrcPDF,W-M-doc.getTextWidth(numOrcPDF),FTR_Y+48)
    doc.save('Orcamento_EasyTech_'+(cli.nome?cli.nome.replace(/\s+/g,'_'):'cliente')+'.pdf');showToast('PDF gerado!')
  }

  const inpStyle={width:'100%',padding:'9px 12px',background:'var(--surface2)',border:'1px solid var(--border2)',borderRadius:'var(--radius)',fontSize:13,color:'var(--text)',outline:'none'}
  const btnGreen={background:'var(--green)',border:'none',borderRadius:'var(--radius)',color:'#000',fontSize:13,fontWeight:700,padding:'10px',cursor:'pointer'}

  return (
    <>
      <Head>
        <title>Easy Tech — Monte seu PC</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}:root{--bg:#0d0d0d;--surface:#161616;--surface2:#1e1e1e;--surface3:#272727;--border:rgba(255,255,255,.07);--border2:rgba(255,255,255,.13);--green:#22c55e;--green-dim:#16a34a;--green-glow:rgba(34,197,94,.18);--green-dark:#052e16;--text:#f0f0f0;--text2:#a0a0a0;--text3:#555;--red:#ef4444;--amber:#f59e0b;--blue:#3b82f6;--radius:10px;--radius-lg:14px}body{font-family:'Montserrat',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;-webkit-font-smoothing:antialiased}input,select,textarea,button{font-family:'Montserrat',sans-serif}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px}`}</style>
      </Head>

      <div style={{position:'fixed',bottom:24,left:'50%',transform:`translateX(-50%) translateY(${toast?'0':'8px'})`,background:'var(--surface)',border:'1px solid var(--border2)',color:'var(--text)',padding:'10px 20px',borderRadius:50,fontSize:13,fontWeight:500,zIndex:999,opacity:toast?1:0,transition:'all .25s',pointerEvents:'none',whiteSpace:'nowrap'}}>{toast}</div>

      <header style={{height:60,background:'var(--surface)',borderBottom:'1px solid var(--border2)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <img src="/logo.png" alt="Easy Tech" style={{height:36,objectFit:'contain'}} onError={e=>e.target.style.display='none'}/>
          <span style={{fontWeight:800,fontSize:16}}>Easy<span style={{color:'var(--green)'}}>Tech</span></span>
        </div>
        <div style={{display:'flex',gap:4,background:'var(--bg)',borderRadius:10,padding:4,border:'1px solid var(--border)'}}>
          {[['builder','🖥 Monte seu PC'],['catalog','📦 Catálogo']].map(([p,label])=>(
            <button key={p} onClick={()=>setTab(p)} style={{padding:'6px 18px',border:'none',borderRadius:7,fontSize:13,fontWeight:500,cursor:'pointer',background:tab===p?'var(--surface2)':'transparent',color:tab===p?'var(--green)':'var(--text2)'}}>{label}</button>
          ))}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:11,color:syncMsg.color,display:'flex',alignItems:'center',gap:4}}><span style={{width:7,height:7,borderRadius:'50%',background:syncMsg.color,display:'inline-block'}}/>{syncMsg.text}</span>
          <button onClick={loadCatalog} disabled={syncing} style={{background:'none',border:'1px solid var(--border2)',borderRadius:7,color:'var(--text2)',fontSize:12,padding:'5px 10px',cursor:'pointer'}}>{syncing?'…':'↻ Sync'}</button>
        </div>
      </header>

      {tab==='builder'&&(
        <div style={{display:'grid',gridTemplateColumns:'260px 1fr 320px',minHeight:'calc(100vh - 60px)'}}>
          <aside style={{background:'var(--surface)',borderRight:'1px solid var(--border)',position:'sticky',top:60,height:'calc(100vh - 60px)',overflowY:'auto'}}>
            <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border)',marginBottom:8}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--text3)',marginBottom:6}}><span>Progresso</span><span style={{color:'var(--green)',fontWeight:600}}>{progPct}%</span></div>
              <div style={{height:4,background:'var(--surface3)',borderRadius:2,overflow:'hidden'}}><div style={{height:'100%',width:`${progPct}%`,background:'var(--green)',borderRadius:2,transition:'width .4s'}}/></div>
            </div>
            <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:'var(--text3)',padding:'0 18px 10px'}}>Componentes</div>
            {STEPS.map((s,i)=>{const isActive=i===step,isDone=!!cart[s.key];return(
              <div key={s.key} onClick={()=>{setStep(i);setSearch('')}} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 18px',cursor:'pointer',borderLeft:`3px solid ${isActive?'var(--green)':'transparent'}`,background:isActive?'var(--green-dark)':isDone?'rgba(34,197,94,.04)':'transparent'}}>
                <div style={{width:26,height:26,borderRadius:'50%',border:`2px solid ${isActive?'var(--green)':isDone?'var(--green-dim)':'var(--border2)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0,color:isActive?'#000':isDone?'var(--green)':'var(--text3)',background:isActive?'var(--green)':isDone?'var(--green-dark)':'transparent'}}>{isDone&&!isActive?'✓':i+1}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:isActive?'var(--green)':isDone?'var(--text)':'var(--text2)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',display:'flex',alignItems:'center',gap:6}}><CatIcon cat={s.key} size={14}/>{s.label}{!s.required&&<span style={{fontSize:9,opacity:.4}}>opc.</span>}</div>
                  {cart[s.key]&&<div style={{fontSize:10,color:'var(--green)',opacity:.8,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',marginTop:1}}>{cart[s.key].nome.slice(0,22)}{cart[s.key].nome.length>22&&'…'}{(cart[s.key].qty||1)>1&&<span style={{marginLeft:4,background:'var(--green)',color:'#000',borderRadius:4,padding:'0 4px',fontSize:9,fontWeight:700}}>x{cart[s.key].qty}</span>}</div>}
                </div>
                {isDone&&<span style={{color:'var(--green)',fontSize:12}}>✓</span>}
              </div>
            )})}
          </aside>

          <main style={{padding:28,overflowY:'auto'}}>
            <div style={{marginBottom:22}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:'var(--green)',marginBottom:6}}>Passo {step+1} de {STEPS.length}</div>
              <div style={{fontSize:24,fontWeight:800,letterSpacing:'-.5px'}}>{STEPS[step].label}</div>
              <div style={{fontSize:13,color:'var(--text2)',marginTop:6}}>{STEPS[step].sub}</div>
            </div>
            <div style={{position:'relative',marginBottom:16}}>
              <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text3)',pointerEvents:'none'}}>🔎</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar produto…" style={{...inpStyle,paddingLeft:36}} onFocus={e=>e.target.style.borderColor='var(--green)'} onBlur={e=>e.target.style.borderColor='var(--border2)'}/>
            </div>
            {!stepProds.length?(
              <div style={{textAlign:'center',padding:'48px 24px',color:'var(--text3)',border:'1px dashed var(--border2)',borderRadius:'var(--radius-lg)'}}>
                <CatIcon cat={STEPS[step].key} size={36} style={{display:'block',margin:'0 auto 10px'}}/>
                <div style={{fontSize:14,marginBottom:8}}>Nenhum <strong>{STEPS[step].label}</strong> no catálogo</div>
                <div style={{fontSize:12}}><span style={{color:'var(--green)',cursor:'pointer'}} onClick={()=>setTab('catalog')}>Cadastre no Catálogo</span> ou adicione avulso abaixo.</div>
              </div>
            ):(
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))',gap:12,marginBottom:24}}>
                {stepProds.map(p=>{const isSel=cart[STEPS[step].key]?.prodId===p.id,out=p.stock!==undefined&&p.stock<=0;return(
                  <div key={p.id} onClick={()=>!out&&selectProd(p.id)} style={{background:isSel?'var(--green-dark)':'var(--surface)',border:`1px solid ${isSel?'var(--green)':'var(--border)'}`,borderRadius:'var(--radius-lg)',padding:14,cursor:out?'not-allowed':'pointer',opacity:out?.4:1,position:'relative',transition:'all .2s'}}>
                    {isSel&&<div style={{position:'absolute',top:10,right:10,background:'var(--green)',color:'#000',borderRadius:'50%',width:20,height:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800}}>✓</div>}
                    <CatIcon cat={p.cat} size={28} style={{display:'block',marginBottom:8}}/>
                    {p.marca&&<div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:.8,color:'var(--text3)',marginBottom:4}}>{p.marca}</div>}
                    <div style={{fontSize:13,fontWeight:600,lineHeight:1.3,marginBottom:4}}>{p.nome}</div>
                    {p.desc&&<div style={{fontSize:11,color:'var(--text3)',marginBottom:8,lineHeight:1.4}}>{p.desc}</div>}
                    <div style={{fontFamily:'DM Mono,monospace',fontSize:13,fontWeight:600,color:'var(--green)'}}>{fmtBRL(p.preco)} <span style={{fontSize:10,color:'var(--text3)',fontWeight:400}}>à vista</span></div>
                    <div style={{fontSize:10,color:'var(--text3)',marginTop:2}}>ou 12x de {fmtBRL((p.prazo||prazoPreco(p.preco))/12)}</div>
                    {p.stock!==undefined&&<div style={{fontSize:10,marginTop:4,fontWeight:700,color:p.stock<=0?'var(--red)':p.stock<=3?'var(--amber)':'var(--text3)'}}>{p.stock<=0?'⚠️ Sem estoque':p.stock<=3?`⚡ ${p.stock} un.`:`✓ ${p.stock} un.`}</div>}
                  </div>
                )})}
              </div>
            )}
            <div style={{border:'1px dashed var(--border2)',borderRadius:'var(--radius-lg)',padding:18,marginTop:4}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:.6,color:'var(--text3)',marginBottom:12}}>✏️ Item fora do catálogo</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                <div><label style={{display:'block',fontSize:11,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:.5,marginBottom:5}}>Descrição</label><input value={avNome} onChange={e=>setAvNome(e.target.value)} placeholder="Nome do produto" style={inpStyle}/></div>
                <div><label style={{display:'block',fontSize:11,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:.5,marginBottom:5}}>Valor à vista (R$)</label><input type="number" value={avPreco} onChange={e=>setAvPreco(e.target.value)} placeholder="0,00" style={inpStyle}/></div>
              </div>
              <button onClick={addAvulso} style={{background:'transparent',border:'1px solid var(--border2)',borderRadius:'var(--radius)',color:'var(--text2)',fontSize:13,fontWeight:600,padding:'9px 18px',cursor:'pointer'}}>➕ Adicionar avulso</button>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:24,paddingTop:18,borderTop:'1px solid var(--border)'}}>
              <button onClick={()=>{if(step>0){setStep(s=>s-1);setSearch('')}}} disabled={step===0} style={{padding:'9px 18px',border:'1px solid var(--border2)',borderRadius:'var(--radius)',background:'transparent',color:'var(--text2)',fontSize:13,fontWeight:600,cursor:step===0?'not-allowed':'pointer',opacity:step===0?.3:1}}>← Anterior</button>
              <span style={{fontSize:12,color:'var(--text3)'}}>{STEPS[step].required?'⚠️ Obrigatório':'Opcional — pode pular'}</span>
              <button onClick={()=>{if(step<STEPS.length-1){setStep(s=>s+1);setSearch('')}else showToast('🎉 Configuração concluída!')}} style={{padding:'9px 22px',border:'none',borderRadius:'var(--radius)',background:'var(--green)',color:'#000',fontSize:13,fontWeight:700,cursor:'pointer'}}>{step===STEPS.length-1?'✅ Finalizar':'Próximo →'}</button>
            </div>
          </main>

          <aside style={{background:'var(--surface)',borderLeft:'1px solid var(--border)',position:'sticky',top:60,height:'calc(100vh - 60px)',display:'flex',flexDirection:'column',overflow:'hidden'}}>
            <div style={{padding:16,borderBottom:'1px solid var(--border)',flexShrink:0}}>
              <div style={{fontWeight:800,fontSize:14,display:'flex',alignItems:'center',justifyContent:'space-between'}}>Resumo <span style={{fontSize:12,fontWeight:500,color:'var(--text3)'}}>{cartItems.length} itens</span></div>
              <div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>Itens do orçamento</div>
            </div>
            <div style={{flex:1,overflowY:'auto'}}>
              {!cartItems.length?<div style={{padding:'40px 16px',textAlign:'center',color:'var(--text3)',fontSize:13}}>Selecione componentes para montar o orçamento.</div>
              :cartItems.map(item=>{
                const qty = item.qty || 1
                return(
                <div key={item.cat} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'9px 14px',borderBottom:'1px solid var(--border)'}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',color:'var(--green)',marginBottom:1,display:'flex',alignItems:'center',gap:4}}><CatIcon cat={item.cat} size={12}/>{item.stepLabel}</div>
                    <div style={{fontSize:12,fontWeight:600,lineHeight:1.3}}>{item.nome}{item.avulso&&<em style={{fontSize:10,opacity:.5}}> avulso</em>}</div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    {/* ALTERADO: mostra preço total se qty > 1 */}
                    <div style={{fontFamily:'DM Mono,monospace',fontSize:12,color:'var(--text2)'}}>{fmtBRL(item.preco * qty)}</div>
                    {qty > 1 && <div style={{fontSize:10,color:'var(--text3)'}}>{fmtBRL(item.preco)} × {qty}</div>}
                    <div style={{fontSize:10,color:'var(--amber)'}}>{fmtBRL((item.prazo||prazoPreco(item.preco))*qty/12)}/x</div>
                  </div>
                  {/* ALTERADO: controle de quantidade substituindo o botão ✕ */}
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,flexShrink:0}}>
                    <button
                      onClick={()=>changeQty(item.cat, 1)}
                      style={{background:'var(--surface3)',border:'1px solid var(--border2)',borderRadius:5,color:'var(--text)',fontSize:12,width:22,height:22,cursor:'pointer',lineHeight:1,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}
                    >+</button>
                    <span style={{fontFamily:'DM Mono,monospace',fontSize:11,color:'var(--text2)',fontWeight:700,minWidth:16,textAlign:'center'}}>{qty}</span>
                    <button
                      onClick={()=>changeQty(item.cat, -1)}
                      style={{background:'var(--surface3)',border:`1px solid ${qty<=1?'rgba(239,68,68,.3)':'var(--border2)'}`,borderRadius:5,color:qty<=1?'var(--red)':'var(--text)',fontSize:12,width:22,height:22,cursor:'pointer',lineHeight:1,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}
                    >{qty<=1?'✕':'−'}</button>
                  </div>
                </div>
              )})}
            </div>
            <div style={{borderTop:'1px solid var(--border2)',padding:14,flexShrink:0}}>
              <div style={{display:'flex',gap:6,alignItems:'center',marginBottom:12}}>
                <span style={{fontSize:11,color:'var(--text3)',fontWeight:600}}>Desc.%</span>
                <input type="number" value={discPct} onChange={e=>setDiscPct(e.target.value)} placeholder="0" style={{width:60,background:'var(--surface2)',border:'1px solid var(--border2)',borderRadius:7,padding:'5px 8px',fontFamily:'DM Mono,monospace',fontSize:12,color:'var(--text)',outline:'none'}}/>
                <span style={{fontSize:11,color:'var(--text3)',fontWeight:600}}>R$</span>
                <input type="number" value={discVal} onChange={e=>setDiscVal(e.target.value)} placeholder="0" style={{width:70,background:'var(--surface2)',border:'1px solid var(--border2)',borderRadius:7,padding:'5px 8px',fontFamily:'DM Mono,monospace',fontSize:12,color:'var(--text)',outline:'none'}}/>
              </div>
              {cartItems.length>0&&<>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--text2)',marginBottom:4}}><span>Subtotal</span><span style={{fontFamily:'DM Mono,monospace'}}>{fmtBRL(subtotal)}</span></div>
                {desconto>0&&<div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--green)',marginBottom:4}}><span>Desconto</span><span style={{fontFamily:'DM Mono,monospace'}}>− {fmtBRL(desconto)}</span></div>}
                <div style={{display:'flex',justifyContent:'space-between',fontSize:16,fontWeight:700,marginTop:10,paddingTop:10,borderTop:'1px solid var(--border)'}}><span>Total à vista</span><span style={{fontFamily:'DM Mono,monospace',color:'var(--green)'}}>{fmtBRL(total)}</span></div>
                <div style={{fontSize:11,color:'var(--amber)',textAlign:'right',marginTop:4,fontStyle:'italic'}}>ou 12x de {fmtBRL(totalPrazo/12)} (total {fmtBRL(totalPrazo)})</div>
              </>}
              <div style={{display:'flex',flexDirection:'column',gap:7,margin:'12px 0'}}>
                {[['nome','👤 Nome do cliente'],['tel','📱 WhatsApp'],['email','✉️ E-mail']].map(([k,ph])=>(
                  <input key={k} placeholder={ph} value={cli[k]} onChange={e=>setCli(c=>({...c,[k]:e.target.value}))} style={{width:'100%',background:'var(--surface2)',border:'1px solid var(--border2)',borderRadius:7,padding:'7px 10px',fontSize:12,color:'var(--text)',outline:'none'}}/>
                ))}
                <textarea placeholder="📝 Observações…" value={cli.obs} onChange={e=>setCli(c=>({...c,obs:e.target.value}))} style={{width:'100%',background:'var(--surface2)',border:'1px solid var(--border2)',borderRadius:7,padding:'7px 10px',fontSize:12,color:'var(--text)',outline:'none',resize:'vertical',minHeight:48}}/>
              </div>
              <button onClick={exportPDF} style={{...btnGreen,width:'100%'}}>📄 Gerar PDF</button>
              <div style={{fontSize:10,color:'var(--text3)',textAlign:'center',marginTop:6}}>Validade: 7 dias</div>
            </div>
          </aside>
        </div>
      )}

      {tab==='catalog'&&(
        <div style={{maxWidth:1200,margin:'0 auto',padding:'28px 24px',display:'grid',gridTemplateColumns:'360px 1fr',gap:24,alignItems:'start'}}>
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',overflow:'hidden'}}>
            <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:26,height:26,borderRadius:7,background:'var(--green-dark)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>➕</div>
              <span style={{fontSize:13,fontWeight:700}}>Cadastrar Produto</span>
            </div>
            <div style={{padding:20}}>
              <div style={{marginBottom:13}}>
                <label style={{display:'block',fontSize:11,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:.5,marginBottom:5}}>Categoria</label>
                <select value={form.cat} onChange={e=>setForm(f=>({...f,cat:e.target.value}))} style={inpStyle}>
                  {Object.entries(CATEGORIES).map(([grp,cats])=>(<optgroup key={grp} label={grp}>{cats.map(c=><option key={c} value={c}>{c}</option>)}</optgroup>))}
                </select>
              </div>
              <div style={{marginBottom:13}}>
                <label style={{display:'block',fontSize:11,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:.5,marginBottom:5}}>Nome *</label>
                <input value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} placeholder="Ex: RTX 5060 8GB" style={inpStyle}/>
              </div>
              {[['marca','Marca','Ex: NVIDIA, ASUS…'],['desc','Especificações','Ex: 8GB GDDR7…']].map(([k,lbl,ph])=>(
                <div key={k} style={{marginBottom:13}}>
                  <label style={{display:'block',fontSize:11,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:.5,marginBottom:5}}>{lbl}</label>
                  <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={ph} style={inpStyle}/>
                </div>
              ))}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:13}}>
                {[['stock','Estoque','1'],['custo','Custo (R$)','0,00'],['preco','À Vista (R$) *','0,00']].map(([k,lbl,ph])=>(
                  <div key={k}><label style={{display:'block',fontSize:10,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:.4,marginBottom:5}}>{lbl}</label><input type="number" value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={ph} style={{...inpStyle,padding:'9px 10px'}}/></div>
                ))}
              </div>
              {form.preco&&<div style={{fontSize:11,color:'var(--green)',marginBottom:12,padding:'8px 12px',background:'var(--green-dark)',borderRadius:7}}>À vista: <strong>{fmtBRL(parseFloat(form.preco)||0)}</strong> · 12x de <strong>{fmtBRL(prazoPreco(parseFloat(form.preco)||0)/12)}</strong> (+10%)</div>}
              <button onClick={addProduct} style={{...btnGreen,width:'100%'}}>➕ Adicionar ao Catálogo</button>
            </div>
          </div>

          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',overflow:'hidden'}}>
            <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:26,height:26,borderRadius:7,background:'var(--green-dark)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>📋</div>
                <span style={{fontSize:13,fontWeight:700}}>Produtos Cadastrados</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:12,color:'var(--text3)'}}>{catalog.length} itens</span>
                <span style={{width:1,height:14,background:'var(--border2)'}}/>
                <span style={{fontSize:11,color:syncMsg.color}}>{syncMsg.text}</span>
              </div>
            </div>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead><tr>{['Produto','Categoria','Estoque','Custo','À Vista','12x (+10%)','Margem',''].map(h=><th key={h} style={{textAlign:'left',padding:'10px 14px',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:.6,color:'var(--text3)',borderBottom:'1px solid var(--border)',background:'var(--surface2)',whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
                <tbody>
                  {!catalog.length?<tr><td colSpan={8} style={{textAlign:'center',padding:40,color:'var(--text3)'}}>Nenhum produto cadastrado</td></tr>
                  :catalog.map((p,i)=>{
                    const prazo=p.prazo||prazoPreco(p.preco),margem=p.custo>0?Math.round(((p.preco-p.custo)/p.preco)*100):null
                    const mc=margem===null?'var(--text3)':margem>=30?'var(--green)':margem>=15?'var(--amber)':'var(--red)'
                    const sc=!p.stock?'var(--red)':p.stock<=3?'var(--amber)':'var(--green)'
                    return(<tr key={p.id} style={{background:i%2===0?'transparent':'rgba(255,255,255,.02)'}}>
                      <td style={{padding:'11px 14px',borderBottom:'1px solid var(--border)'}}>
                        <div style={{fontWeight:600,display:'flex',alignItems:'center',gap:6}}><CatIcon cat={p.cat} size={16}/>{p.nome}</div>
                        {p.marca&&<div style={{fontSize:11,color:'var(--text3)'}}>{p.marca}</div>}
                        {p.desc&&<div style={{fontSize:11,color:'var(--text3)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.desc}</div>}
                      </td>
                      <td style={{padding:'11px 14px',borderBottom:'1px solid var(--border)'}}><span style={{display:'inline-block',padding:'2px 9px',borderRadius:20,fontSize:11,fontWeight:600,background:'var(--green-dark)',color:'var(--green)'}}>{p.cat}</span></td>
                      <td style={{padding:'11px 14px',borderBottom:'1px solid var(--border)',fontWeight:700,color:sc}}>{p.stock??'—'} un</td>
                      <td style={{padding:'11px 14px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace',color:'var(--text3)'}}>{p.custo>0?fmtBRL(p.custo):'—'}</td>
                      <td style={{padding:'11px 14px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace',color:'var(--green)',fontWeight:700}}>{fmtBRL(p.preco)}</td>
                      <td style={{padding:'11px 14px',borderBottom:'1px solid var(--border)',fontFamily:'DM Mono,monospace',color:'var(--amber)',fontSize:12}}>{fmtBRL(prazo/12)}/x</td>
                      <td style={{padding:'11px 14px',borderBottom:'1px solid var(--border)',fontWeight:700,color:mc}}>{margem!==null?`${margem}%`:'—'}</td>
                      <td style={{padding:'11px 14px',borderBottom:'1px solid var(--border)'}}>
                        <div style={{display:'flex',gap:6}}>
                          <button onClick={()=>openEdit(p)} style={{background:'transparent',border:'1px solid rgba(34,197,94,.2)',borderRadius:7,color:'var(--green)',fontSize:12,padding:'4px 10px',cursor:'pointer'}}>✏️</button>
                          <button onClick={()=>deleteProduct(p.id)} style={{background:'transparent',border:'1px solid rgba(239,68,68,.2)',borderRadius:7,color:'var(--red)',fontSize:12,padding:'4px 10px',cursor:'pointer'}}>🗑</button>
                        </div>
                      </td>
                    </tr>)
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {editModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:16,padding:28,width:520,maxWidth:'95vw',maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{fontWeight:800,fontSize:16,marginBottom:4}}>✏️ Editar Produto</div>
            <div style={{fontSize:12,color:'var(--text2)',marginBottom:20}}>{editModal.nome}</div>
            <div style={{marginBottom:13}}>
              <label style={{display:'block',fontSize:11,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:.5,marginBottom:5}}>Categoria</label>
              <select value={editForm.cat} onChange={e=>setEditForm(f=>({...f,cat:e.target.value}))} style={inpStyle}>
                {Object.entries(CATEGORIES).map(([grp,cats])=>(<optgroup key={grp} label={grp}>{cats.map(c=><option key={c} value={c}>{c}</option>)}</optgroup>))}
              </select>
            </div>
            {[['nome','Nome *'],['marca','Marca'],['desc','Especificações']].map(([k,lbl])=>(
              <div key={k} style={{marginBottom:13}}>
                <label style={{display:'block',fontSize:11,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:.5,marginBottom:5}}>{lbl}</label>
                <input value={editForm[k]} onChange={e=>setEditForm(f=>({...f,[k]:e.target.value}))} style={inpStyle}/>
              </div>
            ))}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:13}}>
              {[['stock','Estoque'],['custo','Custo (R$)'],['preco','À Vista (R$) *']].map(([k,lbl])=>(
                <div key={k}><label style={{display:'block',fontSize:10,fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:.4,marginBottom:5}}>{lbl}</label><input type="number" value={editForm[k]} onChange={e=>setEditForm(f=>({...f,[k]:e.target.value}))} style={{...inpStyle,padding:'9px 10px'}}/></div>
              ))}
            </div>
            {editForm.preco&&<div style={{fontSize:11,color:'var(--green)',marginBottom:16,padding:'8px 12px',background:'var(--green-dark)',borderRadius:7}}>À vista: <strong>{fmtBRL(parseFloat(editForm.preco)||0)}</strong> · 12x de <strong>{fmtBRL(prazoPreco(parseFloat(editForm.preco)||0)/12)}</strong> (+10%)</div>}
            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button onClick={()=>setEditModal(null)} style={{padding:'9px 20px',border:'1px solid var(--border2)',borderRadius:'var(--radius)',background:'transparent',color:'var(--text2)',fontSize:13,fontWeight:600,cursor:'pointer'}}>Cancelar</button>
              <button onClick={saveEdit} style={{...btnGreen,padding:'9px 20px'}}>💾 Salvar alterações</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
