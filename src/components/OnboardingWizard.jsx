/**
 * OnboardingWizard.jsx
 * Wizard de 3 preguntas al registrarse por primera vez.
 * Al completarse guarda en user_metadata y dispara el seed de datos demo.
 */
import React, { useState } from 'react'
import {
  Shirt, Cpu, Sofa, Car, CheckCircle2,
  Users, Store, Instagram, Globe, ShoppingBag, ChevronRight
} from 'lucide-react'

const C = {
  primary:    '#334139',
  primaryHov: '#2b352f',
  primarySurf:'#eaf0eb',
  border:     '#e5e7eb',
  borderHov:  '#334139',
  bg:         '#ffffff',
  textDark:   '#111827',
  textMid:    '#6b7280',
  surface:    '#f9fafb',
}

const PASOS = [
  {
    key: 'rubro',
    titulo: '¿Cuál es tu rubro?',
    subtitulo: 'Vamos a precargar productos y pedidos de ejemplo relevantes para tu negocio.',
    opciones: [
      {
        val: 'Tecnología',
        label: 'Tecnología',
        desc: 'Celulares, accesorios, electrónica',
        Icon: Cpu,
      },
      {
        val: 'Ropa',
        label: 'Indumentaria',
        desc: 'Ropa, calzado, accesorios de moda',
        Icon: Shirt,
      },
      {
        val: 'Muebles',
        label: 'Muebles & Deco',
        desc: 'Hogar, diseño interior, decoración',
        Icon: Sofa,
      },
      {
        val: 'Vehículos',
        label: 'Automotor',
        desc: 'Repuestos, accesorios, vehículos',
        Icon: Car,
      },
    ]
  },
  {
    key: 'vendedores',
    titulo: '¿Cuántas personas usarán el sistema?',
    subtitulo: 'Así sabemos qué funciones priorizar para tu equipo.',
    opciones: [
      { val: '1',   label: 'Solo yo',        desc: 'Emprendedor individual', Icon: Users },
      { val: '2-5', label: '2 a 5 personas', desc: 'Equipo pequeño',         Icon: Users },
      { val: '6+',  label: 'Más de 5',       desc: 'Empresa en crecimiento', Icon: Users },
    ]
  },
  {
    key: 'canal',
    titulo: '¿Dónde vendés principalmente?',
    subtitulo: 'Configuramos los canales de venta de tu cuenta automáticamente.',
    opciones: [
      { val: 'Local',      label: 'Tienda física',   desc: 'Local, mostrador, punto de venta', Icon: Store },
      { val: 'Instagram',  label: 'Redes sociales',  desc: 'Instagram, WhatsApp, DMs',         Icon: Instagram },
      { val: 'TiendaNube', label: 'E-commerce',      desc: 'TiendaNube, MercadoLibre u otro',  Icon: ShoppingBag },
      { val: 'Mixto',      label: 'Todos los canales',desc: 'Online y offline combinado',      Icon: Globe },
    ]
  },
]

export default function OnboardingWizard({ onComplete }) {
  const [paso, setPaso] = useState(0)
  const [respuestas, setRespuestas] = useState({})
  const [hovIdx, setHovIdx] = useState(-1)
  const [cargando, setCargando] = useState(false)

  const pasoActual = PASOS[paso]
  const progreso   = Math.round((paso / PASOS.length) * 100)

  const handleSelect = async (valor) => {
    const nuevas = { ...respuestas, [pasoActual.key]: valor }
    setRespuestas(nuevas)
    setHovIdx(-1)

    if (paso + 1 < PASOS.length) {
      setPaso(paso + 1)
    } else {
      setCargando(true)
      await onComplete(nuevas)
    }
  }

  /* ── Pantalla de carga ── */
  if (cargando) {
    return (
      <div style={{
        minHeight:'100vh', background:'#f8f9fb', display:'flex',
        alignItems:'center', justifyContent:'center',
        fontFamily:"'Inter',sans-serif",
      }}>
        <div style={{ textAlign:'center' }}>
          <div style={{
            width:72, height:72, borderRadius:'50%',
            background:'#F0FDF4', border:'2.5px solid #86EFAC',
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 20px',
          }}>
            <CheckCircle2 size={36} style={{ color:'#16A34A' }}/>
          </div>
          <h2 style={{ margin:'0 0 8px', fontSize:20, fontWeight:700, color:C.textDark }}>
            Preparando tu cuenta...
          </h2>
          <p style={{ margin:0, color:C.textMid, fontSize:14 }}>
            Cargando datos de ejemplo para que empieces enseguida
          </p>
          <div style={{
            width:32, height:32,
            border:'3px solid #e5e7eb',
            borderTopColor:C.primary,
            borderRadius:'50%',
            animation:'spin .7s linear infinite',
            margin:'20px auto 0',
          }}/>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight:'100vh', background:'#f8f9fb', display:'flex',
      alignItems:'center', justifyContent:'center', padding:20,
      fontFamily:"'Inter',sans-serif",
    }}>
      <div style={{
        width:'100%', maxWidth:520,
        background:C.bg, borderRadius:18,
        border:`1px solid ${C.border}`,
        boxShadow:'0 12px 40px rgba(0,0,0,0.08)',
        padding:'36px 36px 30px',
      }}>

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32 }}>
          <img src="/favicon.png" alt="Gestify" style={{ height:36, objectFit:'contain' }} />
          <span style={{ fontSize:18, fontWeight:700, color:C.textDark, letterSpacing:'-0.3px' }}>
            Gestify
          </span>
        </div>

        {/* Progress */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
            <span style={{ fontSize:11, fontWeight:700, color:C.textMid, letterSpacing:'0.06em', textTransform:'uppercase' }}>
              Paso {paso + 1} de {PASOS.length}
            </span>
            <span style={{ fontSize:11, fontWeight:600, color:C.primary }}>{progreso}%</span>
          </div>
          <div style={{ height:3, background:'#e5e7eb', borderRadius:999, overflow:'hidden' }}>
            <div style={{
              height:'100%', background:C.primary, borderRadius:999,
              width:`${progreso}%`, transition:'width 0.35s cubic-bezier(.4,0,.2,1)',
            }}/>
          </div>
        </div>

        {/* Pregunta */}
        <div style={{ marginBottom:22 }}>
          <h2 style={{ margin:'0 0 5px', fontSize:21, fontWeight:700, color:C.textDark, letterSpacing:'-0.3px', lineHeight:1.25 }}>
            {pasoActual.titulo}
          </h2>
          <p style={{ margin:0, fontSize:13, color:C.textMid, lineHeight:1.55 }}>
            {pasoActual.subtitulo}
          </p>
        </div>

        {/* Opciones */}
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {pasoActual.opciones.map((op, idx) => {
            const isHov = hovIdx === idx
            const { Icon } = op
            return (
              <button
                key={op.val}
                onClick={() => handleSelect(op.val)}
                onMouseEnter={() => setHovIdx(idx)}
                onMouseLeave={() => setHovIdx(-1)}
                style={{
                  display:'flex', alignItems:'center', gap:14,
                  padding:'14px 16px', borderRadius:12, cursor:'pointer',
                  border:`1.5px solid ${isHov ? C.primary : C.border}`,
                  background: isHov ? C.primarySurf : C.surface,
                  color: isHov ? C.primary : C.textDark,
                  textAlign:'left', fontFamily:"'Inter',sans-serif",
                  transition:'all 0.12s ease',
                }}
              >
                <div style={{
                  width:40, height:40, borderRadius:10, flexShrink:0,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  background: isHov ? 'rgba(51,65,57,0.12)' : '#fff',
                  border: `1px solid ${isHov ? C.primary : C.border}`,
                  transition:'all 0.12s ease',
                }}>
                  <Icon size={18} color={isHov ? C.primary : C.textMid} strokeWidth={1.75}/>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600, lineHeight:1.2 }}>{op.label}</div>
                  <div style={{ fontSize:12, color: isHov ? C.primary : C.textMid, opacity: isHov ? 0.75 : 1, marginTop:2 }}>
                    {op.desc}
                  </div>
                </div>
                <ChevronRight size={15} color={isHov ? C.primary : '#d1d5db'} style={{ flexShrink:0, transition:'all .12s' }}/>
              </button>
            )
          })}
        </div>

        {/* Skip */}
        {paso === 0 && (
          <button
            onClick={() => onComplete({})}
            style={{
              marginTop:18, width:'100%', background:'none', border:'none',
              color:C.textMid, fontSize:12, cursor:'pointer', padding:'6px 0',
              fontFamily:"'Inter',sans-serif", transition:'color .12s',
            }}
            onMouseEnter={e=>e.currentTarget.style.color=C.textDark}
            onMouseLeave={e=>e.currentTarget.style.color=C.textMid}
          >
            Saltar configuración →
          </button>
        )}
      </div>
    </div>
  )
}
