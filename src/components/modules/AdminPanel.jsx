import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabaseClient'
import * as XLSX from 'xlsx'
import {
  Users, TrendingUp, DollarSign, Clock,
  Download, RefreshCw, Shield, Search, X,
  AlertCircle, ChevronRight,
  EyeOff, Eye, ArrowUpDown, ArrowUp, ArrowDown, Copy, CheckCheck
} from 'lucide-react'

export const ADMIN_EMAILS = ['brocherojulian72@gmail.com', 'nicoflucia1@gmail.com']

/* ── helpers ── */
const fDate = iso => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
const fMoney = n => n ? '$' + parseFloat(n).toLocaleString('es-AR', { minimumFractionDigits: 0 }) : '—'

const getStatus = row => {
  const now = new Date()
  if (row.is_exempt)          return { label: 'Exento',         color: '#fff',    bg: '#7c3aed', border: '#6d28d9' }
  if (row.manually_suspended) return { label: 'Suspendido',     color: '#fff',    bg: '#dc2626', border: '#b91c1c' }
  if (!row.trial_until && !row.paid_until) return { label: 'Nuevo',  color: '#374151', bg: '#f3f4f6', border: '#d1d5db' }
  const paidOk  = row.paid_until  && new Date(row.paid_until)  >= now
  const trialOk = row.trial_until && new Date(row.trial_until) >= now
  if (paidOk)  return { label: 'PRO Activo',     color: '#fff',    bg: '#059669', border: '#047857' }
  if (trialOk) return { label: 'Trial activo',   color: '#fff',    bg: '#d97706', border: '#b45309' }
  if (row.paid_until) return { label: 'PRO Expirado',  color: '#fff',    bg: '#ea580c', border: '#c2410c' }
  return { label: 'Trial expirado',              color: '#fff',    bg: '#6b7280', border: '#4b5563' }
}

const FILTROS = [
  { id: 'todos',    label: 'Todos',           color: '#282A28' },
  { id: 'nuevo',   label: 'Nuevos',          color: '#6b7280' },
  { id: 'trial',   label: 'Trial activo',    color: '#d97706' },
  { id: 'pro',     label: 'PRO activo',      color: '#059669' },
  { id: 'expirado',label: 'Expirados',       color: '#dc2626' },
]

/* ═══════════════════════ PANEL PRINCIPAL ═══════════════════════ */
const AdminPanel = () => {
  const [rows,       setRows]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [filtro,     setFiltro]     = useState('todos')
  const [search,     setSearch]     = useState('')
  const [copiedId,   setCopiedId]   = useState(null)
  const copyEmail = (email, id) => {
    navigator.clipboard.writeText(email).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1800)
    })
  }
  const [sortCol,    setSortCol]    = useState('created_at')
  const [sortDir,    setSortDir]    = useState('desc')
  const [showHidden, setShowHidden] = useState(false)
  const [hiddenIds,  setHiddenIds]  = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('adm_hidden') || '[]')) } catch { return new Set() }
  })

  const toggleHide = (userId) => {
    setHiddenIds(prev => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      localStorage.setItem('adm_hidden', JSON.stringify([...next]))
      return next
    })
  }

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <ArrowUpDown size={10} style={{ opacity: .35, marginLeft: 3 }} />
    return sortDir === 'asc'
      ? <ArrowUp   size={10} style={{ marginLeft: 3, color: '#4ADE80' }} />
      : <ArrowDown size={10} style={{ marginLeft: 3, color: '#4ADE80' }} />
  }

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    const { data, error: err } = await supabase
      .from('subscriptions')
      .select('user_id, email, created_at, trial_until, paid_until, plan_price, manually_suspended, is_exempt')
      .order('created_at', { ascending: false })
    if (err) { setError(err.message); setLoading(false); return }
    setRows(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const now       = new Date()
  const total     = rows.length
  const enTrial   = rows.filter(r => r.trial_until && new Date(r.trial_until) >= now && !r.paid_until).length
  const proActivo = rows.filter(r => r.paid_until  && new Date(r.paid_until)  >= now).length
  const expirados = rows.filter(r => {
    const st = getStatus(r).label
    return st.includes('expirado') || st === 'Suspendido'
  }).length
  const ingresos  = rows.filter(r => r.paid_until && new Date(r.paid_until) >= now)
                        .reduce((s, r) => s + (parseFloat(r.plan_price) || 0), 0)

  /* ── Embudo de ventas ── */
  const usuariosActivos  = rows.filter(r => r.trial_until || r.paid_until).length
  const trialsExpirados  = rows.filter(r => {
    if (!r.trial_until) return false
    return new Date(r.trial_until) < now && (!r.paid_until || new Date(r.paid_until) < now) && !r.manually_suspended && !r.is_exempt
  }).length
  const pct = (n, base) => base > 0 ? Math.round((n / base) * 100) : 0

  const rowsFiltrados = [...rows
    .filter(r => showHidden ? hiddenIds.has(r.user_id) : !hiddenIds.has(r.user_id))
    .filter(r => {
      const st = getStatus(r).label
      if (filtro === 'nuevo')    return st === 'Nuevo'
      if (filtro === 'trial')    return st === 'Trial activo'
      if (filtro === 'pro')      return st === 'PRO Activo'
      if (filtro === 'expirado') return st.includes('expirado') || st === 'Suspendido'
      return true
    })
    .filter(r => !search || r.email?.toLowerCase().includes(search.toLowerCase()))
  ].sort((a, b) => {
    let va, vb
    if (sortCol === 'email')       { va = a.email || '';        vb = b.email || '' }
    else if (sortCol === 'trial')  { va = a.trial_until || '';  vb = b.trial_until || '' }
    else if (sortCol === 'paid')   { va = a.paid_until || '';   vb = b.paid_until || '' }
    else if (sortCol === 'status') { va = getStatus(a).label;   vb = getStatus(b).label }
    else if (sortCol === 'monto')  { va = parseFloat(a.plan_price) || 0; vb = parseFloat(b.plan_price) || 0 }
    else                           { va = a.created_at || '';   vb = b.created_at || '' }
    if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va
    return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
  })

  const exportExcel = () => {
    const data = rowsFiltrados.map(r => ({
      'Email':       r.email || '—',
      'Registrado':  fDate(r.created_at),
      'Trial hasta': fDate(r.trial_until),
      'PRO hasta':   fDate(r.paid_until),
      'Estado':      getStatus(r).label,
      'Monto':       r.paid_until ? parseFloat(r.plan_price) || 0 : '',
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    ws['!cols'] = [{ wch:34 },{ wch:12 },{ wch:12 },{ wch:12 },{ wch:16 },{ wch:10 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios')
    XLSX.writeFile(wb, `gestify_usuarios_${new Date().toISOString().slice(0,10)}.xlsx`)
  }

  return (
    <div className="adm-root">

      {/* ══ HEADER PREMIUM ══ */}
      <header className="adm-header">
        <div className="adm-header-content">
          <div className="adm-header-l">
            <div className="adm-header-ico">
              <Shield size={20} strokeWidth={2} style={{ color: '#ffffff' }} />
            </div>
            <div>
              <p className="adm-eyebrow">Gestify POS Kiosco</p>
              <h2 className="adm-title">Panel de Administración</h2>
            </div>
          </div>
          <div className="adm-header-r">
            <button onClick={fetchData} className="adm-btn-refresh" disabled={loading}>
              <RefreshCw size={14} style={{ animation: loading ? 'adm-spin 1s linear infinite' : 'none' }} />
              Actualizar datos
            </button>
            <button onClick={exportExcel} className="adm-btn-export" disabled={!rowsFiltrados.length}>
              <Download size={14} strokeWidth={2.5} />
              Exportar CSV
            </button>
          </div>
        </div>
      </header>

      <main className="adm-main">

        {/* ══ STAT CARDS PREMIUM ══ */}
        <div className="adm-stats">
          {[
            { icon: Users,      num: total,           lbl: 'Total Registrados',  color: '#2563EB', bg: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', border: '#BFDBFE' },
            { icon: Clock,      num: enTrial,         lbl: 'En Trial Activo',    color: '#D97706', bg: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', border: '#FDE68A' },
            { icon: TrendingUp, num: proActivo,       lbl: 'Suscripciones PRO',  color: '#059669', bg: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', border: '#A7F3D0' },
            { icon: DollarSign, num: fMoney(ingresos),lbl: 'Ingresos MRR',       color: '#4F46E5', bg: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', border: '#C7D2FE' },
          ].map(({ icon: Icon, num, lbl, color, bg, border }) => (
            <div key={lbl} className="adm-stat-card">
              <div className="adm-stat-info">
                <p className="adm-stat-lbl">{lbl}</p>
                <p className="adm-stat-num">{num}</p>
              </div>
              <div className="adm-stat-ico-box" style={{ background: bg, border: `1px solid ${border}` }}>
                <Icon size={22} strokeWidth={2} style={{ color: color }} />
              </div>
            </div>
          ))}
        </div>

        {/* ══ EMBUDO DE VENTAS ══ */}
        <div className="adm-funnel-card">
          <div className="adm-funnel-hd">
            <div>
              <h3 className="adm-funnel-title">Embudo de Ventas</h3>
              <p className="adm-funnel-sub">Seguimiento del ciclo de vida de usuarios · {total} registrados en total</p>
            </div>
          </div>

          <div className="adm-funnel-body">
            {/* ── Gráfico visual ── */}
            <div className="adm-funnel-graphic">
              {[
                { color: '#8B5CF6', pctW: 100 },
                { color: '#14B8A6', pctW: total > 0 ? Math.max(15, pct(usuariosActivos, total)) : 80 },
                { color: '#F59E0B', pctW: total > 0 ? Math.max(10, pct(enTrial, total)) : 60 },
                { color: '#F97316', pctW: total > 0 ? Math.max(8,  pct(trialsExpirados, total)) : 45 },
                { color: '#EF4444', pctW: total > 0 ? Math.max(6,  pct(proActivo, total)) : 30 },
              ].map((s, i) => (
                <div key={i} className="adm-funnel-layer" style={{ width: `${s.pctW}%`, background: s.color }} />
              ))}
              <div className="adm-funnel-neck" />
            </div>

            {/* ── Etapas ── */}
            <div className="adm-funnel-steps">
              {[
                {
                  n: 1, color: '#8B5CF6', label: 'REGISTRADOS', count: total,
                  quote: '"Cuánta gente entró al embudo"',
                  bullets: ['Medir si tus anuncios funcionan', 'Ver si estás trayendo tráfico'],
                  note: 'Si esto no sube → problema de marketing',
                  onClick: () => setFiltro('todos'),
                },
                {
                  n: 2, color: '#14B8A6', label: 'USUARIOS ACTIVOS', count: usuariosActivos,
                  quote: '"Cuántos realmente usaron el sistema"',
                  bullets: ['Medir si el producto se entiende', 'Validar onboarding'],
                  note: 'Si es bajo → la gente entra y no entiende nada · Esto es lo MÁS importante ahora',
                  onClick: null,
                },
                {
                  n: 3, color: '#F59E0B', label: 'TRIALS ACTIVOS', count: enTrial,
                  quote: '"Cuántos están en juego ahora"',
                  bullets: ['Saber cuántos pueden convertirse en breve', 'Predecir ingresos futuros'],
                  note: 'Es tu "pipeline" de ventas',
                  onClick: () => setFiltro('trial'),
                },
                {
                  n: 4, color: '#F97316', label: 'TRIALS EXPIRADOS', count: trialsExpirados,
                  quote: '"Cuánta gente perdiste"',
                  bullets: ['Detectar fuga de plata', 'Activar emails / retargeting'],
                  note: 'Si esto es alto → tenés un leak fuerte',
                  onClick: () => setFiltro('expirado'),
                },
                {
                  n: 5, color: '#EF4444', label: 'SUSCRIPCIONES PRO', count: proActivo,
                  quote: '"Cuántos pagan"',
                  bullets: ['Ver si el negocio funciona', 'Medir crecimiento real'],
                  note: 'Esto es validación pura',
                  onClick: () => setFiltro('pro'),
                },
              ].map((step, i, arr) => (
                <div key={step.n} className={`adm-step${step.onClick ? ' adm-step-click' : ''}`}
                  onClick={step.onClick || undefined}>
                  <div className="adm-step-l">
                    <div className="adm-step-num">{step.n}</div>
                    <div className="adm-step-arrow" style={{ background: step.color }}>
                      <span className="adm-step-arrow-lbl">{step.label}</span>
                      <div className="adm-step-arrow-tip" style={{ borderLeftColor: step.color }} />
                    </div>
                    <div className="adm-step-count" style={{ color: step.color }}>
                      {step.count}
                      {i > 0 && arr[i-1].count > 0 && (
                        <span className="adm-step-conv">{pct(step.count, arr[i-1].count)}%</span>
                      )}
                    </div>
                  </div>
                  <div className="adm-step-r">
                    <p className="adm-step-quote">{step.quote}</p>
                    <ul className="adm-step-bullets">
                      {step.bullets.map(b => <li key={b}>{b}</li>)}
                    </ul>
                    <p className="adm-step-note">{step.note}</p>
                  </div>
                  {step.onClick && <ChevronRight size={14} className="adm-step-caret" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ FILTROS + BÚSQUEDA ══ */}
        <div className="adm-toolbar">
          <div className="adm-filtros">
            {FILTROS.map(f => {
              const cnt = f.id === 'todos' ? total
                : f.id === 'nuevo'    ? rows.filter(r => getStatus(r).label === 'Nuevo').length
                : f.id === 'trial'    ? enTrial
                : f.id === 'pro'      ? proActivo
                : expirados
              return (
                <button key={f.id} onClick={() => setFiltro(f.id)}
                  className={`adm-f-btn${filtro === f.id ? ' active' : ''}`}
                  style={filtro === f.id ? { background: f.color, borderColor: f.color, color: '#fff' } : {}}>
                  {f.label}
                  <span className="adm-f-cnt"
                    style={filtro === f.id ? { background: 'rgba(255,255,255,.2)', color: '#fff' } : {}}>
                    {cnt}
                  </span>
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => { setShowHidden(v => !v); setFiltro('todos') }}
              className={`adm-hidden-btn${showHidden ? ' active' : ''}`}>
              {showHidden ? <Eye size={13} /> : <EyeOff size={13} />}
              {showHidden
                ? `Mostrando ocultos (${hiddenIds.size})`
                : hiddenIds.size > 0 ? `${hiddenIds.size} oculto${hiddenIds.size !== 1 ? 's' : ''}` : 'Ocultos'}
            </button>
            <div className="adm-search-wrap">
              <Search size={13} className="adm-search-ico" />
              <input className="adm-search" placeholder="Buscar por email..."
                value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button onClick={() => setSearch('')} className="adm-search-x"><X size={12} /></button>}
            </div>
          </div>
        </div>

        {/* ══ TABLA ══ */}
        <div className="adm-card">
          <div className="adm-card-hd">
            <span className="adm-card-ttl">
              {rowsFiltrados.length} usuario{rowsFiltrados.length !== 1 ? 's' : ''}
              {filtro !== 'todos' ? ` · ${FILTROS.find(f=>f.id===filtro)?.label}` : ''}
              {showHidden ? ' · OCULTOS' : ''}
            </span>
            {showHidden && (
              <span style={{ marginLeft: 'auto', fontSize: 10, color: '#fcd34d', fontWeight: 700, letterSpacing: '.06em' }}>
                VISTA DE OCULTOS — estos usuarios no aparecen en la lista normal
              </span>
            )}
          </div>

          {error ? (
            <div className="adm-state-box">
              <AlertCircle size={32} style={{ color: '#fca5a5', marginBottom: 8 }} />
              <p style={{ fontWeight: 700, color: '#dc2626', fontSize: 14, marginBottom: 4 }}>Error al cargar</p>
              <p style={{ fontSize: 12, color: '#6b7280', maxWidth: 360, textAlign: 'center' }}>{error}</p>
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6, maxWidth: 360, textAlign: 'center' }}>
                Corré el SQL de configuración en Supabase y verificá los permisos de admin.
              </p>
            </div>
          ) : loading ? (
            <div className="adm-state-box">
              <div className="adm-spinner" />
              <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>Cargando usuarios...</p>
            </div>
          ) : rowsFiltrados.length === 0 ? (
            <div className="adm-state-box">
              <Users size={36} strokeWidth={1.2} style={{ color: '#d1d5db', marginBottom: 8 }} />
              <p style={{ color: '#6b7280', fontSize: 13 }}>No hay usuarios en esta categoría</p>
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th style={{ width: '34%', cursor: 'pointer' }} onClick={() => handleSort('email')}>EMAIL <SortIcon col="email" /></th>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('created_at')}>REGISTRADO <SortIcon col="created_at" /></th>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('trial')}>TRIAL HASTA <SortIcon col="trial" /></th>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('paid')}>PRO HASTA <SortIcon col="paid" /></th>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>ESTADO <SortIcon col="status" /></th>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('monto')}>MONTO <SortIcon col="monto" /></th>
                    <th style={{ textAlign: 'center', width: 48 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {rowsFiltrados.map((r, idx) => {
                    const st = getStatus(r)
                    return (
                      <tr key={r.user_id} className={`adm-tr${idx % 2 === 1 ? ' adm-tr-alt' : ''}`}>
                        <td className="adm-td-email">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span>{r.email || <span style={{ color: '#d1d5db' }}>Sin email</span>}</span>
                            {r.email && (
                              <button
                                className={`adm-copy-btn${copiedId === r.user_id ? ' copied' : ''}`}
                                onClick={() => copyEmail(r.email, r.user_id)}
                                title="Copiar email">
                                {copiedId === r.user_id
                                  ? <CheckCheck size={11} />
                                  : <Copy size={11} />}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="adm-td-fecha">{fDate(r.created_at)}</td>
                        <td className="adm-td-fecha">
                          {r.trial_until
                            ? <span style={{ color: new Date(r.trial_until) >= now ? '#b45309' : '#9ca3af' }}>{fDate(r.trial_until)}</span>
                            : <span style={{ color: '#d1d5db' }}>—</span>}
                        </td>
                        <td className="adm-td-fecha">
                          {r.paid_until
                            ? <span style={{ color: new Date(r.paid_until) >= now ? '#059669' : '#9a3412' }}>{fDate(r.paid_until)}</span>
                            : <span style={{ color: '#d1d5db' }}>—</span>}
                        </td>
                        <td>
                          <span className="adm-st-badge" style={{ background: st.bg, color: st.color, borderColor: st.border }}>
                            {st.label}
                          </span>
                        </td>
                        <td className="adm-td-monto">
                          {r.paid_until
                            ? <strong style={{ color: '#059669' }}>{fMoney(r.plan_price)}</strong>
                            : <span style={{ color: '#d1d5db' }}>—</span>}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className={`adm-hide-btn${hiddenIds.has(r.user_id) ? ' is-hidden' : ''}`}
                            onClick={() => toggleHide(r.user_id)}
                            title={hiddenIds.has(r.user_id) ? 'Mostrar en lista' : 'Ocultar de la lista'}>
                            {hiddenIds.has(r.user_id) ? <Eye size={13} /> : <EyeOff size={13} />}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      <style>{`
        @keyframes adm-spin { to { transform:rotate(360deg) } }
        @keyframes fade-in  { from { opacity:0; } to { opacity:1; } }

        /* ── Root ── */
        .adm-root { height:100vh; height:100dvh; display:flex; flex-direction:column; background:#F4F4F5; font-family:'Inter',system-ui,sans-serif; overflow:hidden; -webkit-font-smoothing:antialiased; }

        /* ── Header Premium ── */
        .adm-header { background:#ffffff; border-bottom:1px solid #E4E4E7; display:block; padding:0; flex-shrink:0; position:relative; z-index:10; box-shadow:0 1px 3px rgba(0,0,0,0.02); }
        .adm-header-content { max-width:1600px; margin:0 auto; padding:0 32px; height:70px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
        .adm-header-l { display:flex; align-items:center; gap:16px; }
        .adm-header-r { display:flex; align-items:center; gap:12px; }
        .adm-header-ico { width:40px; height:40px; border-radius:10px; background:linear-gradient(135deg, #18181B 0%, #27272A 100%); display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.1); }
        .adm-eyebrow { font-size:11px; font-weight:600; color:#71717A; margin:0 0 2px; text-transform:uppercase; letter-spacing:1px; }
        .adm-title { font-size:20px; font-weight:700; color:#18181B; margin:0; letter-spacing:-0.4px; }
        
        /* ── Header Buttons ── */
        .adm-btn-refresh { display:inline-flex; align-items:center; gap:8px; padding:0 16px; height:38px; border-radius:8px; font-size:13px; font-weight:500; cursor:pointer; background:#ffffff; border:1px solid #E4E4E7; color:#3F3F46; transition:all .2s ease; box-shadow:0 1px 2px rgba(0,0,0,0.03); }
        .adm-btn-refresh:hover:not(:disabled) { background:#FAFAFA; border-color:#D4D4D8; color:#18181B; }
        .adm-btn-refresh:disabled { opacity:.5; cursor:not-allowed; }
        .adm-btn-export { display:inline-flex; align-items:center; gap:8px; padding:0 18px; height:38px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; background:#18181B; border:1px solid transparent; color:#ffffff; transition:all .2s ease; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); }
        .adm-btn-export:hover:not(:disabled) { background:#27272A; transform:translateY(-1px); box-shadow:0 6px 8px -1px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.06); }
        .adm-btn-export:disabled { opacity:.5; cursor:not-allowed; }

        /* ── Main ── */
        .adm-main { flex:1; overflow-y:auto; padding:32px; display:flex; flex-direction:column; gap:24px; max-width:1600px; margin:0 auto; width:100%; box-sizing:border-box; animation:fade-in 0.4s ease; }
        .adm-main::-webkit-scrollbar { width:6px; }
        .adm-main::-webkit-scrollbar-thumb { background:#D4D4D8; border-radius:4px; }

        /* ── Stat Cards Premium ── */
        .adm-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; flex-shrink:0; }
        .adm-stat-card { background:#ffffff; border:1px solid #E4E4E7; border-radius:12px; padding:24px; display:flex; align-items:center; justify-content:space-between; gap:16px; box-shadow:0 1px 3px rgba(0,0,0,0.02); transition:transform .2s ease, box-shadow .2s ease; }
        .adm-stat-card:hover { transform:translateY(-2px); box-shadow:0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.025); }
        .adm-stat-info { display:flex; flex-direction:column; gap:4px; }
        .adm-stat-lbl { font-size:13px; margin:0; font-weight:500; color:#71717A; }
        .adm-stat-num { font-size:32px; font-weight:700; margin:0; letter-spacing:-1px; color:#18181B; line-height:1.1; }
        .adm-stat-ico-box { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

        /* ── Toolbar ── */
        .adm-toolbar { display:flex; align-items:center; justify-content:space-between; gap:16px; flex-shrink:0; flex-wrap:wrap; padding:6px 0; }
        .adm-filtros { display:flex; gap:8px; flex-wrap:wrap; background:#E4E4E7; padding:4px; border-radius:10px; }
        .adm-f-btn { display:inline-flex; align-items:center; gap:8px; padding:0 16px; height:34px; border-radius:6px; font-size:13px; font-weight:500; cursor:pointer; background:transparent; border:none; color:#52525B; transition:all .2s ease; }
        .adm-f-btn:hover { color:#18181B; }
        .adm-f-btn.active { background:#ffffff; color:#18181B; box-shadow:0 1px 3px rgba(0,0,0,0.05); }
        .adm-f-cnt { display:inline-flex; align-items:center; justify-content:center; min-width:20px; height:20px; padding:0 6px; border-radius:20px; font-size:11px; font-weight:600; background:#F4F4F5; color:#71717A; transition:all .2s ease; }
        .adm-f-btn.active .adm-f-cnt { background:#F4F4F5; color:#18181B; }

        .adm-search-wrap { position:relative; display:flex; align-items:center; }
        .adm-search-ico { position:absolute; left:14px; color:#A1A1AA; pointer-events:none; }
        .adm-search { height:42px; padding:0 40px 0 40px; border:1px solid #E4E4E7; border-radius:10px; font-size:14px; color:#18181B; outline:none; background:#ffffff; width:280px; transition:all .2s ease; box-shadow:0 1px 2px rgba(0,0,0,0.02); }
        .adm-search:focus { border-color:#d4d4d8; box-shadow:0 0 0 3px rgba(24,24,27,.05); }
        .adm-search::placeholder { color:#A1A1AA; }
        .adm-search-x { position:absolute; right:10px; display:flex; align-items:center; justify-content:center; width:22px; height:22px; background:#F4F4F5; border:none; cursor:pointer; color:#71717A; border-radius:6px; transition:background .2s; }
        .adm-search-x:hover { background:#E4E4E7; color:#18181B; }
        .adm-hidden-btn { display:inline-flex; align-items:center; gap:8px; padding:0 16px; height:42px; border-radius:10px; font-size:13px; font-weight:500; cursor:pointer; background:#ffffff; border:1px solid #E4E4E7; color:#71717A; transition:all .2s ease; white-space:nowrap; box-shadow:0 1px 2px rgba(0,0,0,0.02); }
        .adm-hidden-btn:hover { border-color:#D4D4D8; color:#3F3F46; }
        .adm-hidden-btn.active { background:#FEF9C3; border-color:#FEF08A; color:#854D0E; }

        /* ── Card / Tabla Premium ── */
        .adm-card { background:#ffffff; border:1px solid #E4E4E7; border-radius:12px; overflow:hidden; flex:1; min-height:0; display:flex; flex-direction:column; box-shadow:0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -2px rgba(0,0,0,0.02); }
        .adm-card-hd { padding:16px 24px; background:#FAFAFA; border-bottom:1px solid #E4E4E7; flex-shrink:0; display:flex; align-items:center; }
        .adm-card-ttl { font-size:13px; font-weight:600; color:#52525B; letter-spacing:0.5px; text-transform:uppercase; display:flex; gap:6px; align-items:center; }
        .adm-table-wrap { overflow-y:auto; overflow-x:auto; flex:1; }
        .adm-table { width:100%; border-collapse:collapse; min-width:850px; }
        .adm-table thead tr { background:#ffffff; position:sticky; top:0; z-index:1; }
        .adm-table th { padding:14px 24px; font-size:11px; font-weight:600; color:#71717A; text-transform:uppercase; letter-spacing:1px; text-align:left; white-space:nowrap; border-bottom:1px solid #E4E4E7; }
        .adm-tr { transition:background .15s ease; }
        .adm-tr td { padding:14px 24px; border-bottom:1px solid #F4F4F5; vertical-align:middle; color:#3F3F46; }
        .adm-tr:last-child td { border-bottom:none; }
        .adm-tr:hover td { background:#FAFAFA; }

        .adm-td-email { font-size:14px; font-weight:500; color:#18181B; white-space:nowrap; }
        .adm-td-fecha { font-size:13px; color:#52525B; white-space:nowrap; font-weight:400; }
        .adm-td-monto { font-size:14px; white-space:nowrap; font-variant-numeric: tabular-nums; }

        .adm-st-badge { display:inline-flex; align-items:center; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:500; border:1px solid; white-space:nowrap; }

        .adm-edit-btn { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:6px; font-size:12px; font-weight:500; cursor:pointer; background:#ffffff; border:1px solid #E4E4E7; color:#18181B; transition:all .2s ease; }
        .adm-edit-btn:hover { background:#FAFAFA; border-color:#D4D4D8; box-shadow:0 1px 2px rgba(0,0,0,0.05); }
        
        .adm-hide-btn { display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:6px; cursor:pointer; background:#ffffff; border:1px solid #E4E4E7; color:#A1A1AA; transition:all .2s ease; }
        .adm-hide-btn:hover { background:#FAFAFA; border-color:#D4D4D8; color:#52525B; }
        .adm-hide-btn.is-hidden { background:#DCFCE7; border-color:#BBF7D0; color:#166534; }
        
        .adm-copy-btn { display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:6px; cursor:pointer; background:transparent; border:1px solid transparent; color:#A1A1AA; transition:all .2s ease; flex-shrink:0; }
        .adm-copy-btn:hover { background:#F4F4F5; color:#18181B; }
        .adm-copy-btn.copied { background:#DCFCE7; color:#166534; }

        /* ── Estado ── */
        .adm-state-box { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px; gap:8px; }
        .adm-spinner { width:36px; height:36px; border:3px solid #F4F4F5; border-top-color:#18181B; border-radius:50%; animation:adm-spin .8s linear infinite; margin-bottom:12px; }

        /* ══ Embudo de ventas ══ */
        .adm-funnel-card { background:#ffffff; border:1px solid #E4E4E7; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,.02); flex-shrink:0; }
        .adm-funnel-hd { padding:20px 24px 16px; border-bottom:1px solid #F4F4F5; display:flex; align-items:flex-start; justify-content:space-between; }
        .adm-funnel-title { font-size:16px; font-weight:700; color:#18181B; margin:0 0 3px; letter-spacing:-.3px; }
        .adm-funnel-sub { font-size:12px; color:#71717A; margin:0; }
        .adm-funnel-body { display:grid; grid-template-columns:140px 1fr; gap:0; align-items:start; padding:20px 24px 20px 20px; }

        /* Gráfico visual */
        .adm-funnel-graphic { display:flex; flex-direction:column; align-items:center; gap:0; padding-top:18px; }
        .adm-funnel-layer { height:52px; border-radius:4px 4px 0 0; transition:width .4s ease; margin-bottom:2px; opacity:.92; }
        .adm-funnel-layer:first-child { border-radius:16px 16px 0 0; }
        .adm-funnel-neck { width:14%; height:28px; background:linear-gradient(to bottom,#EF4444,#b91c1c); border-radius:0 0 6px 6px; opacity:.85; }

        /* Etapas */
        .adm-funnel-steps { display:flex; flex-direction:column; gap:2px; }
        .adm-step { display:flex; align-items:flex-start; gap:12px; padding:10px 12px; border-radius:8px; transition:background .15s; position:relative; }
        .adm-step-click { cursor:pointer; }
        .adm-step-click:hover { background:#F9FAFB; }
        .adm-step-caret { color:#A1A1AA; flex-shrink:0; margin-top:12px; opacity:0; transition:opacity .15s; }
        .adm-step-click:hover .adm-step-caret { opacity:1; }

        .adm-step-l { display:flex; align-items:center; gap:8px; flex-shrink:0; width:260px; }
        .adm-step-num { width:28px; height:28px; border-radius:50%; background:#18181B; color:#fff; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .adm-step-arrow { position:relative; display:flex; align-items:center; padding:5px 24px 5px 12px; border-radius:4px 0 0 4px; flex-shrink:0; min-width:130px; }
        .adm-step-arrow-lbl { font-size:11px; font-weight:800; color:#fff; letter-spacing:.04em; text-transform:uppercase; white-space:nowrap; }
        .adm-step-arrow-tip { position:absolute; right:-14px; top:0; bottom:0; width:0; height:0; border-top:19px solid transparent; border-bottom:19px solid transparent; border-left:14px solid; }
        .adm-step-count { font-size:22px; font-weight:800; letter-spacing:-1px; min-width:52px; display:flex; align-items:baseline; gap:6px; }
        .adm-step-conv { font-size:11px; font-weight:600; color:#A1A1AA; letter-spacing:0; }

        .adm-step-r { flex:1; padding-left:4px; }
        .adm-step-quote { font-size:11px; color:#52525B; margin:0 0 3px; font-style:italic; }
        .adm-step-bullets { margin:0 0 3px; padding-left:14px; }
        .adm-step-bullets li { font-size:11px; color:#3F3F46; margin-bottom:1px; }
        .adm-step-note { font-size:10.5px; color:#71717A; margin:0; font-weight:500; }

        /* ── Responsive ── */
        @media(max-width:1100px) {
          .adm-stats { grid-template-columns:repeat(2,1fr); }
          .adm-funnel-body { grid-template-columns:110px 1fr; }
          .adm-step-l { width:220px; }
        }
        @media(max-width:768px) {
          .adm-header-content { padding:0 20px; }
          .adm-main { padding:20px; }
          .adm-header { height:auto; padding:16px 0; }
          .adm-header-content { flex-direction:column; align-items:flex-start; height:auto; gap:16px; }
          .adm-toolbar { flex-direction:column; align-items:stretch; }
          .adm-search { width:100%; }
          .adm-search-wrap { width:100%; }
          .adm-filtros { overflow-x:auto; flex-wrap:nowrap; padding-bottom:4px; }
          .adm-f-btn { white-space:nowrap; }
          .adm-funnel-body { grid-template-columns:1fr; }
          .adm-funnel-graphic { flex-direction:row; align-items:flex-end; padding-top:0; margin-bottom:16px; height:60px; }
          .adm-funnel-layer { height:100%; border-radius:4px; margin-bottom:0; margin-right:2px; }
          .adm-funnel-neck { display:none; }
          .adm-step-l { width:auto; }
          .adm-step { flex-wrap:wrap; }
          .adm-step-r { width:100%; padding-left:36px; }
          .adm-step-arrow { min-width:110px; }
        }

      `}</style>
    </div>
  )
}

export default AdminPanel
