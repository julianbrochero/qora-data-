import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabaseClient'
import * as XLSX from 'xlsx'
import {
  Users, TrendingUp, DollarSign, Clock,
  Download, RefreshCw, Shield, Search, X,
  Pencil, Check, Ban, AlertCircle, Zap,
  EyeOff, Eye, ArrowUpDown, ArrowUp, ArrowDown, Copy, CheckCheck
} from 'lucide-react'

export const ADMIN_EMAILS = ['brocherojulian72@gmail.com', 'nicoflucia1@gmail.com']

/* ── helpers ── */
const fDate = iso => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
const toInputDate = iso => iso ? new Date(iso).toISOString().slice(0, 10) : ''
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

/* ═══════════════════════ MODAL EDICIÓN ═══════════════════════ */
const EditModal = ({ row, onClose, onSaved }) => {
  const st = getStatus(row)
  const [trialUntil,  setTrialUntil]  = useState(toInputDate(row.trial_until))
  const [paidUntil,   setPaidUntil]   = useState(toInputDate(row.paid_until))
  const [isSuspended, setIsSuspended] = useState(!!row.manually_suspended)
  const [saving,      setSaving]      = useState(false)
  const [saveError,   setSaveError]   = useState(null)

  const addDays = (base, days) => {
    const d = base ? new Date(base) : new Date()
    if (isNaN(d)) { const n = new Date(); n.setDate(n.getDate() + days); return n.toISOString().slice(0, 10) }
    d.setDate(d.getDate() + days)
    return d.toISOString().slice(0, 10)
  }

  const handleSave = async () => {
    setSaving(true); setSaveError(null)
    const { error } = await supabase
      .from('subscriptions')
      .update({
        trial_until:        trialUntil || null,
        paid_until:         paidUntil  || null,
        manually_suspended: isSuspended,
        updated_at:         new Date().toISOString(),
      })
      .eq('user_id', row.user_id)
    if (error) { setSaveError(error.message); setSaving(false); return }
    setSaving(false); onSaved(); onClose()
  }

  return (
    <div className="em-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="em-panel">

        {/* Header del modal */}
        <div className="em-hd" style={{ background: st.bg }}>
          <div>
            <p className="em-hd-label">Editando usuario</p>
            <p className="em-hd-email">{row.email}</p>
            <span className="em-hd-badge">{st.label} · Registrado {fDate(row.created_at)}</span>
          </div>
          <button onClick={onClose} className="em-close"><X size={16} /></button>
        </div>

        <div className="em-body">

          {/* ── Trial ── */}
          <div className="em-block em-block-amber">
            <div className="em-block-hd">
              <Clock size={15} style={{ color: '#d97706' }} />
              <span>Período de Trial</span>
            </div>
            <label className="em-lbl">Vence el</label>
            <input type="date" className="em-inp gestify-date-input" value={trialUntil}
              onChange={e => setTrialUntil(e.target.value)} />
            <div className="em-quick-row">
              <button className="em-q em-q-amber" onClick={() => setTrialUntil(addDays(trialUntil, 7))}>+ 7 días</button>
              <button className="em-q em-q-amber" onClick={() => setTrialUntil(addDays(trialUntil, 14))}>+ 14 días</button>
              <button className="em-q em-q-amber" onClick={() => setTrialUntil(addDays(new Date().toISOString(), 7))}>↺ Reiniciar 7d</button>
              <button className="em-q em-q-gray"  onClick={() => setTrialUntil('')}>✕ Limpiar</button>
            </div>
          </div>

          {/* ── PRO ── */}
          <div className="em-block em-block-green">
            <div className="em-block-hd">
              <Zap size={15} style={{ color: '#059669' }} />
              <span>Plan PRO</span>
            </div>
            <label className="em-lbl">Activo hasta</label>
            <input type="date" className="em-inp gestify-date-input" value={paidUntil}
              onChange={e => setPaidUntil(e.target.value)} />
            <div className="em-quick-row">
              <button className="em-q em-q-green" onClick={() => setPaidUntil(addDays(paidUntil || new Date().toISOString(), 30))}>+ 30 días</button>
              <button className="em-q em-q-green" onClick={() => setPaidUntil(addDays(paidUntil || new Date().toISOString(), 365))}>+ 1 año</button>
              <button className="em-q em-q-gray"  onClick={() => setPaidUntil('')}>✕ Limpiar</button>
            </div>
          </div>

          {/* ── Toggles ── */}
          <div className="em-toggles">
            <button onClick={() => setIsSuspended(v => !v)}
              className={`em-toggle${isSuspended ? ' em-toggle-on em-toggle-red' : ''}`}>
              <div className="em-toggle-ico-wrap" style={{ background: isSuspended ? '#fee2e2' : '#f3f4f6' }}>
                <Ban size={16} style={{ color: isSuspended ? '#dc2626' : '#9ca3af' }} />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p className="em-toggle-t">Cuenta suspendida</p>
                <p className="em-toggle-s">Bloquea el acceso manualmente</p>
              </div>
              <div className={`em-sw${isSuspended ? ' on' : ''}`} style={isSuspended ? { background: '#dc2626' } : {}}>
                <div className="em-sw-thumb" />
              </div>
            </button>
          </div>

          {saveError && (
            <div className="em-error">
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              {saveError}
            </div>
          )}
        </div>

        <div className="em-footer">
          <button onClick={onClose} className="em-btn-cancel">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="em-btn-save">
            {saving
              ? <><div className="em-mini-spin" /> Guardando...</>
              : <><Check size={14} /> Guardar cambios</>}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════ PANEL PRINCIPAL ═══════════════════════ */
const AdminPanel = () => {
  const [rows,       setRows]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [filtro,     setFiltro]     = useState('todos')
  const [search,     setSearch]     = useState('')
  const [editRow,    setEditRow]    = useState(null)
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
      {editRow && (
        <EditModal row={editRow} onClose={() => setEditRow(null)} onSaved={() => { setEditRow(null); fetchData() }} />
      )}

      {/* ══ HEADER ══ */}
      <header className="adm-header">
        <div className="adm-header-l">
          <div className="adm-header-ico"><Shield size={18} strokeWidth={2.5} style={{ color: '#4ADE80' }} /></div>
          <div>
            <p className="adm-eyebrow">Panel de administración</p>
            <h2 className="adm-title">Usuarios & Suscripciones</h2>
          </div>
        </div>
        <div className="adm-header-r">
          <button onClick={fetchData} className="adm-btn-refresh" disabled={loading}>
            <RefreshCw size={13} style={{ animation: loading ? 'adm-spin 1s linear infinite' : 'none' }} />
            Actualizar
          </button>
          <button onClick={exportExcel} className="adm-btn-export" disabled={!rowsFiltrados.length}>
            <Download size={13} strokeWidth={2.5} />
            Exportar Excel
          </button>
        </div>
      </header>

      <main className="adm-main">

        {/* ══ STAT CARDS ══ */}
        <div className="adm-stats">
          {[
            { icon: Users,      num: total,           lbl: 'Total registrados',  accent: '#3b82f6', light: '#dbeafe' },
            { icon: Clock,      num: enTrial,         lbl: 'En trial ahora',     accent: '#f59e0b', light: '#fef3c7' },
            { icon: TrendingUp, num: proActivo,       lbl: 'PRO activo',         accent: '#10b981', light: '#d1fae5' },
            { icon: DollarSign, num: fMoney(ingresos),lbl: 'Ingresos mensuales', accent: '#6366f1', light: '#ede9fe' },
          ].map(({ icon: Icon, num, lbl, accent, light }) => (
            <div key={lbl} className="adm-stat-card">
              <div className="adm-stat-ico-box" style={{ background: light }}>
                <Icon size={20} strokeWidth={2} style={{ color: accent }} />
              </div>
              <div>
                <p className="adm-stat-num" style={{ color: '#111827' }}>{num}</p>
                <p className="adm-stat-lbl" style={{ color: '#6b7280' }}>{lbl}</p>
              </div>
              <div className="adm-stat-accent-bar" style={{ background: accent }} />
            </div>
          ))}
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
                    <th style={{ textAlign: 'center' }}>ACCIONES</th>
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
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <button className="adm-edit-btn" onClick={() => setEditRow(r)}>
                              <Pencil size={12} /> Editar
                            </button>
                            <button
                              className={`adm-hide-btn${hiddenIds.has(r.user_id) ? ' is-hidden' : ''}`}
                              onClick={() => toggleHide(r.user_id)}
                              title={hiddenIds.has(r.user_id) ? 'Mostrar en lista' : 'Ocultar de la lista'}>
                              {hiddenIds.has(r.user_id) ? <Eye size={13} /> : <EyeOff size={13} />}
                            </button>
                          </div>
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
        @keyframes em-in    { from { opacity:0; transform:scale(.96) translateY(12px) } to { opacity:1; transform:none } }

        /* ── Root ── */
        .adm-root { height:100vh; height:100dvh; display:flex; flex-direction:column; background:#eef0ef; font-family:'Inter',-apple-system,sans-serif; overflow:hidden; -webkit-font-smoothing:antialiased; }

        /* ── Header ── */
        .adm-header { background:#1a1c1a; border-bottom:3px solid #4ADE80; padding:0 28px; height:58px; flex-shrink:0; display:flex; align-items:center; justify-content:space-between; gap:16px; }
        .adm-header-l { display:flex; align-items:center; gap:12px; }
        .adm-header-r { display:flex; align-items:center; gap:10px; }
        .adm-header-ico { width:36px; height:36px; border-radius:10px; background:rgba(74,222,128,.12); border:1.5px solid rgba(74,222,128,.3); display:flex; align-items:center; justify-content:center; }
        .adm-eyebrow { font-size:10px; font-weight:700; color:rgba(255,255,255,.4); margin:0 0 1px; letter-spacing:.1em; text-transform:uppercase; }
        .adm-title { font-size:18px; font-weight:800; color:#fff; margin:0; letter-spacing:-.02em; }
        .adm-btn-refresh { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; background:rgba(255,255,255,.08); border:1.5px solid rgba(255,255,255,.15); color:rgba(255,255,255,.7); transition:all .13s; font-family:'Inter',sans-serif; }
        .adm-btn-refresh:hover:not(:disabled) { background:rgba(255,255,255,.14); color:#fff; }
        .adm-btn-refresh:disabled { opacity:.35; cursor:not-allowed; }
        .adm-btn-export { display:inline-flex; align-items:center; gap:7px; padding:8px 18px; border-radius:8px; font-size:13px; font-weight:800; cursor:pointer; background:#4ADE80; border:none; color:#0A1A0E; transition:all .13s; font-family:'Inter',sans-serif; letter-spacing:-.01em; }
        .adm-btn-export:hover:not(:disabled) { background:#22c55e; box-shadow:0 4px 14px rgba(74,222,128,.35); }
        .adm-btn-export:disabled { opacity:.35; cursor:not-allowed; }

        /* ── Main ── */
        .adm-main { flex:1; overflow-y:auto; padding:22px 28px; display:flex; flex-direction:column; gap:18px; min-height:0; }
        .adm-main::-webkit-scrollbar { width:5px; }
        .adm-main::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:4px; }

        /* ── Stat Cards ── */
        .adm-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; flex-shrink:0; }
        .adm-stat-card { background:#fff; border:2px solid #e5e7eb; border-radius:14px; padding:18px 20px; display:flex; align-items:center; gap:14px; box-shadow:0 2px 8px rgba(0,0,0,.05); position:relative; overflow:hidden; }
        .adm-stat-ico-box { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .adm-stat-num { font-size:28px; font-weight:900; margin:0 0 3px; letter-spacing:-.04em; line-height:1; }
        .adm-stat-lbl { font-size:12px; margin:0; font-weight:600; }
        .adm-stat-accent-bar { position:absolute; left:0; top:0; bottom:0; width:4px; border-radius:0 2px 2px 0; }

        /* ── Toolbar ── */
        .adm-toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-shrink:0; flex-wrap:wrap; }
        .adm-filtros { display:flex; gap:6px; flex-wrap:wrap; }
        .adm-f-btn { display:inline-flex; align-items:center; gap:7px; padding:7px 16px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; background:#fff; border:2px solid #e5e7eb; color:#374151; transition:all .13s; font-family:'Inter',sans-serif; }
        .adm-f-btn:hover { border-color:#9ca3af; }
        .adm-f-cnt { display:inline-flex; align-items:center; justify-content:center; min-width:19px; height:19px; padding:0 5px; border-radius:20px; font-size:10px; font-weight:800; background:#f3f4f6; color:#6b7280; }
        .adm-search-wrap { position:relative; display:flex; align-items:center; }
        .adm-search-ico { position:absolute; left:12px; color:#9ca3af; pointer-events:none; }
        .adm-search { height:38px; padding:0 36px 0 36px; border:2px solid #e5e7eb; border-radius:10px; font-size:13px; color:#374151; outline:none; background:#fff; font-family:'Inter',sans-serif; width:250px; transition:all .12s; }
        .adm-search:focus { border-color:#334139; box-shadow:0 0 0 3px rgba(51,65,57,.1); }
        .adm-search::placeholder { color:#b0bab5; }
        .adm-search-x { position:absolute; right:10px; display:flex; align-items:center; justify-content:center; width:20px; height:20px; background:#f3f4f6; border:none; cursor:pointer; color:#6b7280; border-radius:5px; }
        .adm-search-x:hover { background:#e5e7eb; }

        /* ── Card / Tabla ── */
        .adm-card { background:#fff; border:2px solid #d1d5db; border-radius:14px; overflow:hidden; flex:1; min-height:0; display:flex; flex-direction:column; box-shadow:0 2px 8px rgba(0,0,0,.06); }
        .adm-card-hd { padding:12px 20px; background:#282A28; border-bottom:2px solid #4ADE80; flex-shrink:0; }
        .adm-card-ttl { font-size:12px; font-weight:700; color:rgba(255,255,255,.7); letter-spacing:.04em; text-transform:uppercase; }
        .adm-table-wrap { overflow-y:auto; overflow-x:auto; flex:1; }
        .adm-table { width:100%; border-collapse:collapse; min-width:750px; }
        .adm-table thead tr { background:#f1f5f3; border-bottom:2px solid #d1d5db; position:sticky; top:0; z-index:1; }
        .adm-table th { padding:11px 16px; font-size:10px; font-weight:800; color:#374151; text-transform:uppercase; letter-spacing:.08em; text-align:left; white-space:nowrap; border-right:1px solid #e5e7eb; }
        .adm-table th:last-child { border-right:none; }
        .adm-tr td { padding:12px 16px; border-bottom:1px solid #e9ecea; border-right:1px solid #e9ecea; vertical-align:middle; }
        .adm-tr td:last-child { border-right:none; }
        .adm-tr-alt td { background:#f9fafb; }
        .adm-tr:hover td { background:#eef5f1 !important; }
        .adm-tr:last-child td { border-bottom:none; }

        .adm-td-email { font-size:13px; font-weight:700; color:#111827; white-space:nowrap; }
        .adm-td-fecha { font-size:12px; color:#374151; white-space:nowrap; font-weight:500; }
        .adm-td-monto { font-size:13px; white-space:nowrap; }

        .adm-st-badge { display:inline-flex; align-items:center; padding:4px 12px; border-radius:6px; font-size:11px; font-weight:800; border:2px solid; white-space:nowrap; letter-spacing:.02em; }

        .adm-edit-btn { display:inline-flex; align-items:center; gap:5px; padding:6px 14px; border-radius:7px; font-size:11px; font-weight:800; cursor:pointer; background:#3b82f6; border:none; color:#fff; transition:all .12s; font-family:'Inter',sans-serif; letter-spacing:.02em; }
        .adm-edit-btn:hover { background:#2563eb; box-shadow:0 3px 10px rgba(59,130,246,.35); transform:translateY(-1px); }
        .adm-hide-btn { display:inline-flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:7px; cursor:pointer; background:#f3f4f6; border:2px solid #e5e7eb; color:#6b7280; transition:all .12s; }
        .adm-hide-btn:hover { background:#fef9c3; border-color:#fcd34d; color:#92400e; }
        .adm-hide-btn.is-hidden { background:#dcfce7; border-color:#6ee7b7; color:#059669; }
        .adm-copy-btn { display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:5px; cursor:pointer; background:transparent; border:1.5px solid transparent; color:#9ca3af; transition:all .12s; flex-shrink:0; }
        .adm-copy-btn:hover { background:#eff6ff; border-color:#bfdbfe; color:#3b82f6; }
        .adm-copy-btn.copied { background:#dcfce7; border-color:#6ee7b7; color:#059669; }
        .adm-hidden-btn { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; background:#fff; border:2px solid #e5e7eb; color:#6b7280; transition:all .13s; font-family:'Inter',sans-serif; white-space:nowrap; }
        .adm-hidden-btn:hover { border-color:#9ca3af; color:#374151; }
        .adm-hidden-btn.active { background:#fef9c3; border-color:#fcd34d; color:#92400e; }

        /* ── Estado ── */
        .adm-state-box { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px; gap:6px; }
        .adm-spinner { width:32px; height:32px; border:3px solid #e5e7eb; border-top-color:#4ADE80; border-radius:50%; animation:adm-spin .8s linear infinite; margin-bottom:8px; }

        /* ═══════════ EDIT MODAL ═══════════ */
        .em-overlay { position:fixed; inset:0; z-index:1000; background:rgba(10,20,14,.6); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; padding:20px; }
        .em-panel { background:#fff; border-radius:18px; width:100%; max-width:500px; box-shadow:0 24px 70px rgba(0,0,0,.25); animation:em-in .22s ease; display:flex; flex-direction:column; max-height:90vh; overflow:hidden; border:2px solid #e5e7eb; }

        .em-hd { padding:20px 22px 16px; display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-shrink:0; }
        .em-hd-label { font-size:10px; font-weight:700; color:rgba(255,255,255,.6); margin:0 0 4px; letter-spacing:.1em; text-transform:uppercase; }
        .em-hd-email { font-size:16px; font-weight:800; color:#fff; margin:0 0 6px; word-break:break-all; letter-spacing:-.01em; }
        .em-hd-badge { font-size:11px; font-weight:700; color:rgba(255,255,255,.85); background:rgba(255,255,255,.15); border-radius:20px; padding:3px 10px; }
        .em-close { width:30px; height:30px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,.15); border:none; border-radius:8px; cursor:pointer; color:#fff; flex-shrink:0; }
        .em-close:hover { background:rgba(255,255,255,.25); }

        .em-body { padding:18px 22px; overflow-y:auto; display:flex; flex-direction:column; gap:14px; flex:1; }

        .em-block { border-radius:12px; padding:14px 16px; display:flex; flex-direction:column; gap:10px; border:2px solid; }
        .em-block-amber { background:#fffbeb; border-color:#fcd34d; }
        .em-block-green  { background:#f0fdf4; border-color:#6ee7b7; }
        .em-block-hd { display:flex; align-items:center; gap:7px; font-size:13px; font-weight:800; color:#1f2937; }
        .em-lbl { font-size:11px; font-weight:700; color:#6b7280; margin:0; text-transform:uppercase; letter-spacing:.05em; }
        .em-inp { width:100%; height:38px; padding:0 12px; border:2px solid #e5e7eb; border-radius:8px; font-size:13px; color:#374151; outline:none; box-sizing:border-box; background:#fff; font-family:'Inter',sans-serif; font-weight:600; transition:border-color .12s; }
        .em-inp:focus { border-color:#334139; box-shadow:0 0 0 3px rgba(51,65,57,.1); }
        .em-quick-row { display:flex; gap:6px; flex-wrap:wrap; }
        .em-q { padding:5px 12px; border-radius:7px; font-size:11px; font-weight:800; cursor:pointer; border:2px solid; transition:all .11s; font-family:'Inter',sans-serif; }
        .em-q-amber { background:#fef3c7; border-color:#fcd34d; color:#92400e; }
        .em-q-amber:hover { background:#fde68a; }
        .em-q-green  { background:#d1fae5; border-color:#6ee7b7; color:#065f46; }
        .em-q-green:hover  { background:#a7f3d0; }
        .em-q-gray   { background:#f3f4f6; border-color:#d1d5db; color:#4b5563; }
        .em-q-gray:hover   { background:#e5e7eb; }

        .em-toggles { display:flex; flex-direction:column; gap:8px; }
        .em-toggle { width:100%; display:flex; align-items:center; gap:12px; padding:12px 14px; border:2px solid #e5e7eb; border-radius:12px; cursor:pointer; background:#fff; text-align:left; transition:all .13s; font-family:'Inter',sans-serif; }
        .em-toggle:hover { border-color:#d1d5db; background:#fafafa; }
        .em-toggle-on { box-shadow:0 2px 10px rgba(0,0,0,.08); }
        .em-toggle-violet.em-toggle-on { border-color:#c4b5fd; background:#faf5ff; }
        .em-toggle-red.em-toggle-on    { border-color:#fca5a5; background:#fff5f5; }
        .em-toggle-ico-wrap { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background .13s; }
        .em-toggle-t { font-size:13px; font-weight:800; margin:0 0 2px; color:#111827; }
        .em-toggle-s { font-size:11px; color:#9ca3af; margin:0; }
        .em-sw { width:38px; height:21px; border-radius:20px; background:#e5e7eb; position:relative; flex-shrink:0; transition:background .2s; }
        .em-sw.on { background:#334139; }
        .em-sw-thumb { position:absolute; top:2.5px; left:2.5px; width:16px; height:16px; border-radius:50%; background:#fff; transition:transform .2s; box-shadow:0 1px 4px rgba(0,0,0,.2); }
        .em-sw.on .em-sw-thumb { transform:translateX(17px); }

        .em-error { display:flex; align-items:center; gap:8px; padding:10px 14px; background:#fee2e2; border:2px solid #fca5a5; border-radius:8px; font-size:12px; color:#dc2626; font-weight:700; }

        .em-footer { padding:14px 22px; border-top:2px solid #f0f2f1; display:flex; justify-content:flex-end; gap:10px; flex-shrink:0; }
        .em-btn-cancel { padding:9px 18px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; background:#fff; border:2px solid #e5e7eb; color:#6b7280; font-family:'Inter',sans-serif; transition:all .12s; }
        .em-btn-cancel:hover { background:#f3f4f6; border-color:#d1d5db; }
        .em-btn-save { display:inline-flex; align-items:center; gap:7px; padding:9px 22px; border-radius:8px; font-size:13px; font-weight:800; cursor:pointer; background:#059669; border:none; color:#fff; font-family:'Inter',sans-serif; transition:all .12s; }
        .em-btn-save:hover:not(:disabled) { background:#047857; box-shadow:0 4px 14px rgba(5,150,105,.3); }
        .em-btn-save:disabled { opacity:.45; cursor:not-allowed; }
        .em-mini-spin { width:13px; height:13px; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:adm-spin .7s linear infinite; }

        /* ── Responsive ── */
        @media(max-width:960px) {
          .adm-stats { grid-template-columns:repeat(2,1fr); }
          .adm-main { padding:14px 16px; }
          .adm-header { padding:0 16px; }
        }
        @media(max-width:600px) {
          .adm-stats { grid-template-columns:1fr 1fr; }
          .adm-toolbar { flex-direction:column; align-items:stretch; }
          .adm-search { width:100%; }
          .adm-search-wrap { width:100%; }
        }
      `}</style>
    </div>
  )
}

export default AdminPanel
