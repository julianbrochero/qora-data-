import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeModule, setActiveModule] = useState('facturacion');
  const [demoTab, setDemoTab] = useState('dashboard');

  const sidebarActive = (item) => {
    if (demoTab === 'dashboard'  && item === 'dashboard')  return true;
    if (demoTab === 'venta'      && item === 'venta')      return true;
    if (demoTab === 'ventas'     && item === 'ventas')     return true;
    if (demoTab === 'productos'  && item === 'productos')  return true;
    return false;
  };

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleModuleChange = (mod) => {
    setActiveModule(mod);
  };

  return (
    <div className="landing-root">

      {/* ── NAVBAR ── */}
      <nav className={`l-navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container">
          <a href="#" className="nav-logo">
            <img src="/newlogo.png" alt="Gestify" />
            <span className="nav-logo-text">gestify</span>
          </a>
          <ul className="nav-links">
            <li><a href="#features">Funcionalidades</a></li>
            <li><a href="#modules">Módulos</a></li>
            <li><a href="#pricing">Precios</a></li>
            <li><a href="#demo">Demo</a></li>
          </ul>
          <div className="nav-actions">
            <Link to="/login" className="nav-login">Ingresar</Link>
            <Link to="/register" className="btn btn-primary">Empezar gratis →</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-grid"></div>
        <div className="hero-glow"></div>

        <div className="hero-content">
          <div className="hero-inner">
            <div className="hero-top">
              <div className="hero-badge reveal">
                <div className="badge"><span className="badge-dot"></span>Para PyMEs y negocios argentinos que quieren crecer</div>
              </div>
              <h1 className="hero-h1 reveal">Dejá Excel.<br /><em>Empezá a saber si ganás plata de verdad.</em></h1>
              <p className="hero-sub reveal">Controlá tus ingresos, gastos y ganancias en un solo lugar — sin perder horas, sin números que no cierran.</p>
              <div className="hero-actions reveal">
                <Link to="/register" className="btn btn-primary btn-lg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  Empezar gratis — 7 días
                </Link>
                <a href="#demo" className="btn btn-ghost-dark btn-lg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                  Ver demo
                </a>
              </div>
              <p className="hero-note reveal">
                Sin tarjeta de crédito <span className="hero-note-sep">·</span>
                Listo en 5 minutos <span className="hero-note-sep">·</span>
                Soporte en español
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Mockup */}
        <div className="hero-mockup-wrap reveal" id="demo">
          {/* Demo tab nav */}
          <div className="demo-nav">
            {[
              { id:'dashboard', label:'Dashboard', icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
              { id:'venta',     label:'Agregar Venta', icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> },
              { id:'ventas',    label:'Ventas', icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg> },
              { id:'productos', label:'Productos', icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> },
            ].map(t => (
              <button key={t.id} className={`demo-nav-tab${demoTab===t.id?' active':''}`} onClick={() => setDemoTab(t.id)}>
                <span className="demo-nav-dot"></span>{t.icon}{t.label}
              </button>
            ))}
          </div>
          <div className="browser-frame">
            <div className="browser-bar">
              <div className="browser-dots">
                <div className="browser-dot r"></div><div className="browser-dot y"></div><div className="browser-dot g"></div>
              </div>
              <div className="browser-url">
                <span style={{opacity:.4}}>🔒</span> app.gestify.ar/dashboard
              </div>
              <div style={{width:'60px'}}></div>
            </div>

            <div className="browser-body">
              {/* SIDEBAR */}
              <div className="msb">
                <div className="msb-logo">
                  <img src="/newlogo.png" alt="Gestify" />
                </div>
                <div className="msb-nav">
                  <div className="msb-sec-label">Inicio</div>
                  <div className={`msb-item${sidebarActive('dashboard')?' active':''}`}>
                    <svg className="msb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    <span>Dashboard</span>
                  </div>
                  <div className="msb-sec-label">Comercial</div>
                  <div className={`msb-item${sidebarActive('venta')?' active':''}`}>
                    <svg className="msb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    <span>Agregar Venta</span>
                  </div>
                  <div className={`msb-item${sidebarActive('ventas')?' active':''}`}>
                    <svg className="msb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                    <span>Ventas</span>
                    <span className="msb-badge">3</span>
                  </div>
                  <div className="msb-item">
                    <svg className="msb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                    <span>Presupuestos</span>
                  </div>
                  <div className="msb-item">
                    <svg className="msb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    <span>Facturación</span>
                  </div>
                  <div className="msb-sec-label">Contactos</div>
                  <div className="msb-item">
                    <svg className="msb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>Clientes</span>
                  </div>
                  <div className="msb-item">
                    <svg className="msb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                    <span>Proveedores</span>
                  </div>
                  <div className="msb-sec-label">Inventario &amp; Finanzas</div>
                  <div className={`msb-item${sidebarActive('productos')?' active':''}`}>
                    <svg className="msb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                    <span>Productos</span>
                  </div>
                  <div className="msb-item">
                    <svg className="msb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                    <span>Caja</span>
                  </div>
                  <div className="msb-item">
                    <svg className="msb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                    <span>Reportes</span>
                  </div>
                </div>
                <div className="msb-bottom">
                  <div className="msb-pro">
                    <div className="msb-pro-inner">
                      <div className="msb-pro-dot"></div>
                      <span className="msb-pro-label">PLAN PRO ACTIVO</span>
                    </div>
                  </div>
                  <div className="msb-user">
                    <div className="msb-avatar">A</div>
                    <span className="msb-uname">Admin</span>
                  </div>
                </div>
              </div>

              {/* MAIN */}
              <div className="mmain">
                <div className="mmain-header">
                  <div className="mmain-search">
                    <svg className="mmain-search-icon" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <span className="mmain-search-text">Buscar cliente, factura, venta...</span>
                    <span className="mmain-search-kbd">⌘K</span>
                  </div>
                  <div className="mmain-spacer"></div>
                  <span className="mmain-date">Hoy — 25 Mar 2026</span>
                  <div className="mmain-bell">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  </div>
                  <div className="mmain-avatar">A</div>
                </div>
                <div className="mmain-body">

                  {/* ── DASHBOARD ── */}
                  {demoTab === 'dashboard' && <>
                    <div className="mmain-title-row">
                      <div><div className="mmain-page-title">Dashboard</div><div className="mmain-page-sub">Resumen del negocio al día de hoy</div></div>
                      <div style={{display:'flex',gap:'6px'}}>
                        <div style={{background:'#E0E1DD',border:'1px solid rgba(48,54,47,.1)',borderRadius:'6px',padding:'4px 10px',fontSize:'9.5px',fontWeight:'600',color:'#606B6C',cursor:'default'}}>+ Nueva Venta</div>
                        <div style={{background:'#282A28',borderRadius:'6px',padding:'4px 10px',fontSize:'9.5px',fontWeight:'700',color:'#4ADE80',cursor:'default'}}>+ Factura</div>
                      </div>
                    </div>
                    <div className="kpi-row">
                      {[
                        {cls:'g',icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#606B6C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,trend:'+18%',trendCls:'up',val:'$847.200',label:'Ventas del Mes',sub:'vs. $718.000 mes anterior',pct:85,pctLabel:'Meta mensual'},
                        {cls:'a',icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8B8982" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>,trend:'7 abiertas',trendCls:'nt',val:'$124.500',label:'Facturas Pendientes',sub:'Cobro promedio: $17.785',pct:73,pctLabel:'Cobradas'},
                        {cls:'b',icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#373F47" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,trend:'14 activos',trendCls:'nt',val:'14',label:'Pedidos Activos',sub:'3 creados hoy',pct:62,pctLabel:'Completados'},
                        {cls:'n',icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8B8982" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,trend:'+$12k hoy',trendCls:'up',val:'$38.750',label:'Caja del Día',sub:'Actualizado ahora',pct:94,pctLabel:'Vs. ayer'},
                      ].map(k => (
                        <div className={`kpi ${k.cls}`} key={k.label}>
                          <div className="kpi-top"><div className={`kpi-icon-wrap ${k.cls}`}>{k.icon}</div><div className={`kpi-trend ${k.trendCls}`}>{k.trend}</div></div>
                          <div className="kpi-value">{k.val}</div>
                          <div className="kpi-label">{k.label}</div>
                          <div className="kpi-sub">{k.sub}</div>
                          <div className="kpi-prog"><div className="kpi-prog-row"><span className="kpi-prog-label">{k.pctLabel}</span><span className="kpi-prog-pct">{k.pct}%</span></div><div className="kpi-prog-track"><div className="kpi-prog-fill" style={{width:`${k.pct}%`}}></div></div></div>
                        </div>
                      ))}
                    </div>
                    <div className="panels-row">
                      <div className="card-shell">
                        <div className="card-shell-hd"><span className="card-shell-title">Últimas Facturas <span className="card-shell-count">12</span></span><span className="card-shell-action">Ver todas →</span></div>
                        <div className="card-shell-body">
                          <table className="ft">
                            <thead><tr><th>Factura</th><th>Cliente</th><th>Estado</th><th>Total</th></tr></thead>
                            <tbody>
                              <tr><td>FA-000089</td><td>Comercial López</td><td><span className="pill pagada"><span className="pill-dot"></span>Pagada</span></td><td>$18.400</td></tr>
                              <tr><td>FA-000088</td><td>Distribuidora Sur</td><td><span className="pill pendiente"><span className="pill-dot"></span>Pendiente</span></td><td>$32.000</td></tr>
                              <tr><td>FA-000087</td><td>Ferretería Central</td><td><span className="pill pagada"><span className="pill-dot"></span>Pagada</span></td><td>$9.750</td></tr>
                              <tr><td>FA-000086</td><td>Panadería Norte</td><td><span className="pill pendiente"><span className="pill-dot"></span>Pendiente</span></td><td>$14.200</td></tr>
                              <tr><td>FA-000085</td><td>Almacén El Sol</td><td><span className="pill parcial"><span className="pill-dot"></span>Parcial</span></td><td>$22.600</td></tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="card-shell">
                        <div className="card-shell-hd"><span className="card-shell-title">Pedidos Pendientes <span className="card-shell-count">4</span></span><span className="card-shell-action">Ver todos →</span></div>
                        <div className="card-shell-body">
                          {[{name:'Comercial López',code:'PED-000041'},{name:'Panadería Norte',code:'PED-000040'},{name:'Ferretería Central',code:'PED-000039'},{name:'Almacén El Sol',code:'PED-000038'}].map(p => (
                            <div className="pd-item" key={p.code}>
                              <div className="pd-ico"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#606B6C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></div>
                              <div><div className="pd-name">{p.name}</div><div className="pd-code">{p.code}</div></div>
                              <div className="pd-badge"><svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Pendiente</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>}

                  {/* ── AGREGAR VENTA ── */}
                  {demoTab === 'venta' && <>
                    <div className="mmain-title-row">
                      <div><div className="mmain-page-title">Nueva Venta</div><div className="mmain-page-sub">Completá los datos del pedido</div></div>
                      <div style={{display:'flex',gap:'6px'}}>
                        <div style={{background:'#E0E1DD',border:'1px solid rgba(48,54,47,.1)',borderRadius:'6px',padding:'4px 10px',fontSize:'9.5px',fontWeight:'600',color:'#606B6C',cursor:'default'}}>Cancelar</div>
                        <div style={{background:'#4ADE80',borderRadius:'6px',padding:'4px 10px',fontSize:'9.5px',fontWeight:'800',color:'#0A1A0E',cursor:'default'}}>Guardar Pedido</div>
                      </div>
                    </div>
                    <div className="av-cols">
                      {/* Left */}
                      <div className="av-left">
                        {/* Cliente */}
                        <div className="av-card">
                          <div className="av-card-hd">Cliente</div>
                          <div style={{padding:'8px 10px'}}>
                            <div style={{display:'flex',alignItems:'center',gap:'8px',background:'rgba(51,65,57,.06)',border:'1px solid rgba(51,65,57,.2)',borderRadius:'7px',padding:'7px 10px'}}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#334139" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                              <span style={{fontSize:'11px',fontWeight:'700',color:'#1e2320',flex:1}}>Comercial López</span>
                              <span style={{fontSize:'8.5px',color:'#8B8982',fontFamily:'monospace'}}>20-12345678-9</span>
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#8B8982" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </div>
                          </div>
                        </div>
                        {/* Carrito */}
                        <div className="av-card" style={{flex:1}}>
                          <div className="av-card-hd">
                            <span>Carrito <span className="card-shell-count">3</span></span>
                            <div className="av-search-light">
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#8B8982" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                              <span style={{fontSize:'9px',color:'#8B8982'}}>Buscar producto...</span>
                            </div>
                          </div>
                          <table className="av-cart-table">
                            <thead><tr><th>Producto</th><th style={{textAlign:'center'}}>Cant.</th><th style={{textAlign:'right'}}>Precio</th><th style={{textAlign:'right'}}>Subtotal</th><th></th></tr></thead>
                            <tbody>
                              {[
                                {nombre:'Empanadas x12',code:'EMP-012',qty:2,precio:'$2.400',sub:'$4.800'},
                                {nombre:'Medialunas x6',code:'MED-006',qty:3,precio:'$1.200',sub:'$3.600'},
                                {nombre:'Facturas surtidas',code:'FAC-MIX',qty:1,precio:'$3.500',sub:'$3.500'},
                              ].map(item => (
                                <tr key={item.code}>
                                  <td><div style={{fontSize:'10.5px',fontWeight:'600',color:'#1e2320'}}>{item.nombre}</div><div style={{fontSize:'8px',color:'#8B8982',fontFamily:'monospace'}}>{item.code}</div></td>
                                  <td style={{textAlign:'center'}}><div className="av-qty"><span className="av-qty-btn">−</span><span className="av-qty-val">{item.qty}</span><span className="av-qty-btn">+</span></div></td>
                                  <td style={{textAlign:'right',fontSize:'10px',color:'#373F47'}}>{item.precio}</td>
                                  <td style={{textAlign:'right',fontSize:'10px',fontWeight:'700',color:'#1e2320',fontFamily:'monospace'}}>{item.sub}</td>
                                  <td style={{textAlign:'center',color:'rgba(139,137,130,.4)',fontSize:'11px',cursor:'default'}}>×</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      {/* Right */}
                      <div className="av-right">
                        <div className="av-summary">
                          <div style={{fontSize:'7.5px',fontWeight:'700',color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'8px'}}>Resumen del pedido</div>
                          <div className="av-summary-row"><span className="av-summary-label">Subtotal</span><span className="av-summary-val">$11.900</span></div>
                          <div className="av-summary-row"><span className="av-summary-label">Adelanto</span><span style={{color:'rgba(255,255,255,.45)',fontWeight:'600',fontSize:'10px'}}>$5.000</span></div>
                          <div className="av-summary-total"><span className="av-summary-total-label">Saldo</span><span className="av-summary-total-val">$6.900</span></div>
                        </div>
                        <div className="av-mini-card">
                          <div className="av-mini-label">Estado</div>
                          <div className="av-estado-pill">Pendiente <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg></div>
                        </div>
                        <div className="av-mini-card">
                          <div className="av-mini-label">Método de pago</div>
                          <div className="av-metodos">
                            <div className="av-metodo on">Efectivo</div>
                            <div className="av-metodo off">Transfer.</div>
                            <div className="av-metodo off">Mercado P.</div>
                          </div>
                        </div>
                        <div className="av-mini-card" style={{flex:1}}>
                          <div className="av-mini-label">Fecha entrega</div>
                          <div style={{background:'#fff',border:'1px solid rgba(48,54,47,.1)',borderRadius:'6px',padding:'5px 8px',fontSize:'9.5px',fontWeight:'600',color:'#373F47'}}>28/03/2026</div>
                        </div>
                        <div className="av-mini-card" style={{flex:1}}>
                          <div className="av-mini-label">Notas</div>
                          <div style={{background:'#fff',border:'1px solid rgba(48,54,47,.1)',borderRadius:'6px',padding:'5px 8px',fontSize:'9px',color:'rgba(139,137,130,.6)',fontStyle:'italic',minHeight:'32px'}}>Entregar antes de las 18hs...</div>
                        </div>
                        <div className="av-save-btn">Guardar Pedido ↵</div>
                      </div>
                    </div>
                  </>}

                  {/* ── VENTAS ── */}
                  {demoTab === 'ventas' && <>
                    <div className="mmain-title-row">
                      <div><div className="mmain-page-title">Ventas</div><div className="mmain-page-sub">14 pedidos activos este mes</div></div>
                      <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'5px',background:'#fff',border:'1px solid rgba(48,54,47,.12)',borderRadius:'6px',padding:'4px 9px'}}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#8B8982" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                          <span style={{fontSize:'9px',color:'#8B8982'}}>Buscar cliente...</span>
                        </div>
                        <div style={{background:'#282A28',borderRadius:'6px',padding:'4px 10px',fontSize:'9.5px',fontWeight:'700',color:'#4ADE80',cursor:'default'}}>+ Nueva Venta</div>
                      </div>
                    </div>
                    <div className="filter-chips">
                      {['Todos','Pendiente','Preparando','Enviado','Entregado','Cancelado'].map((f,i) => (
                        <div key={f} className={`fchip ${i===0?'on':'off'}`}>{f}</div>
                      ))}
                    </div>
                    <div className="card-shell" style={{flex:1}}>
                      <div className="card-shell-hd">
                        <span className="card-shell-title">Pedidos <span className="card-shell-count">14</span></span>
                        <span className="card-shell-action">Exportar →</span>
                      </div>
                      <div className="card-shell-body">
                        <table className="ft">
                          <thead><tr><th>Nº Pedido</th><th>Cliente</th><th>Estado</th><th>Método</th><th>Total</th><th>Fecha</th></tr></thead>
                          <tbody>
                            {[
                              {id:'PED-000041',cli:'Comercial López',   estado:'Pendiente', estadoCls:'pendiente',met:'Efectivo',  total:'$18.400',fecha:'25/03'},
                              {id:'PED-000040',cli:'Panadería Norte',   estado:'Preparando',estadoCls:'preparando',met:'Transfer.',total:'$9.200', fecha:'25/03'},
                              {id:'PED-000039',cli:'Ferretería Central',estado:'Enviado',   estadoCls:'enviado',   met:'Mercado P.',total:'$32.000',fecha:'24/03'},
                              {id:'PED-000038',cli:'Almacén El Sol',    estado:'Entregado', estadoCls:'entregado', met:'Efectivo', total:'$14.750',fecha:'24/03'},
                              {id:'PED-000037',cli:'Distribuidora Sur', estado:'Pendiente', estadoCls:'pendiente',met:'Transfer.',total:'$22.600',fecha:'23/03'},
                            ].map(p => {
                              const colors = {pendiente:{bg:'#FEF3C7',color:'#92400E'},preparando:{bg:'#DBEAFE',color:'#1E40AF'},enviado:{bg:'#E0E7FF',color:'#3730A3'},entregado:{bg:'#D1FAE5',color:'#065F46'},cancelado:{bg:'#FEE2E2',color:'#991B1B'}};
                              const c = colors[p.estadoCls] || colors.pendiente;
                              return (
                                <tr key={p.id}>
                                  <td style={{fontFamily:'monospace',fontSize:'9px',fontWeight:'700',color:'#30362F'}}>{p.id}</td>
                                  <td style={{fontSize:'10.5px',color:'#1e2320',fontFamily:'inherit',fontWeight:'500'}}>{p.cli}</td>
                                  <td><span style={{display:'inline-flex',alignItems:'center',gap:'4px',padding:'2px 7px',borderRadius:'5px',fontSize:'8.5px',fontWeight:'700',background:c.bg,color:c.color}}><span style={{width:'4px',height:'4px',borderRadius:'50%',background:c.color,flexShrink:0}}></span>{p.estado}</span></td>
                                  <td style={{fontSize:'9.5px',color:'#8B8982'}}>{p.met}</td>
                                  <td style={{textAlign:'right',fontFamily:'monospace',fontWeight:'700',color:'#1e2320',fontSize:'10px'}}>{p.total}</td>
                                  <td style={{fontSize:'9px',color:'#8B8982'}}>{p.fecha}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>}

                  {/* ── PRODUCTOS ── */}
                  {demoTab === 'productos' && <>
                    <div className="mmain-title-row">
                      <div><div className="mmain-page-title">Productos</div><div className="mmain-page-sub">48 productos en inventario</div></div>
                      <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'5px',background:'#fff',border:'1px solid rgba(48,54,47,.12)',borderRadius:'6px',padding:'4px 9px'}}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#8B8982" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                          <span style={{fontSize:'9px',color:'#8B8982'}}>Buscar producto...</span>
                        </div>
                        <div style={{background:'#E0E1DD',border:'1px solid rgba(48,54,47,.1)',borderRadius:'6px',padding:'4px 10px',fontSize:'9.5px',fontWeight:'600',color:'#606B6C',cursor:'default'}}>Categorías</div>
                        <div style={{background:'#282A28',borderRadius:'6px',padding:'4px 10px',fontSize:'9.5px',fontWeight:'700',color:'#4ADE80',cursor:'default'}}>+ Nuevo</div>
                      </div>
                    </div>
                    <div className="filter-chips">
                      {['Todos','Panificados','Bebidas','Lácteos','Fiambres','Sin stock'].map((f,i) => (
                        <div key={f} className={`fchip ${i===0?'on':'off'}`}>{f}</div>
                      ))}
                    </div>
                    <div className="card-shell" style={{flex:1}}>
                      <div className="card-shell-hd">
                        <span className="card-shell-title">Inventario <span className="card-shell-count">48</span></span>
                        <span className="card-shell-action">Exportar →</span>
                      </div>
                      <div className="card-shell-body">
                        <table className="ft">
                          <thead><tr><th>Código</th><th>Nombre</th><th>Categoría</th><th>Precio venta</th><th>Costo</th><th>Stock</th></tr></thead>
                          <tbody>
                            {[
                              {code:'EMP-012',name:'Empanadas x12',  cat:'Panificados',precio:'$2.400',costo:'$1.600',stock:42,  stockCls:'ok'},
                              {code:'MED-006',name:'Medialunas x6',  cat:'Panificados',precio:'$1.200',costo:'$750',  stock:28,  stockCls:'ok'},
                              {code:'FAC-MIX',name:'Facturas surtidas',cat:'Panificados',precio:'$3.500',costo:'$2.100',stock:5,   stockCls:'low'},
                              {code:'LEC-001',name:'Leche entera 1L',cat:'Lácteos',    precio:'$890',  costo:'$620',  stock:0,   stockCls:'out'},
                              {code:'JAM-400',name:'Jamón cocido 400g',cat:'Fiambres',  precio:'$2.800',costo:'$1.900',stock:15,  stockCls:'ok'},
                            ].map(p => (
                              <tr key={p.code}>
                                <td style={{fontFamily:'monospace',fontSize:'9px'}}>{p.code}</td>
                                <td style={{fontSize:'10.5px',fontWeight:'600',color:'#1e2320',fontFamily:'inherit'}}>{p.name}</td>
                                <td><span style={{fontSize:'9px',background:'rgba(48,54,47,.07)',color:'#606B6C',padding:'2px 7px',borderRadius:'4px',fontWeight:'600'}}>{p.cat}</span></td>
                                <td style={{textAlign:'right',fontFamily:'monospace',fontWeight:'700',color:'#1e2320',fontSize:'10px'}}>{p.precio}</td>
                                <td style={{textAlign:'right',fontSize:'9.5px',color:'#8B8982',fontFamily:'monospace'}}>{p.costo}</td>
                                <td style={{textAlign:'right'}}><span className={`stock-badge ${p.stockCls}`}>{p.stockCls==='out'?'Sin stock':p.stock+' u.'}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>}

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <div className="stats-band">
        <div className="stats-inner">
          {[
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, value: '10+', label: 'Módulos integrados' },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>, value: 'PDF', label: 'Generación instantánea' },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, value: '24/7', label: 'Control de caja en vivo' },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>, value: 'MP', label: 'Mercado Pago integrado' },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, value: '100%', label: 'Datos seguros en la nube' },
          ].map((s, i) => (
            <div className="stat-item" key={s.label} style={{ animationDelay: `${i * 80}ms` }}>
              <div className="stat-icon-wrap">{s.icon}</div>
              <div className="stat-text">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PAIN SECTION ── */}
      <section className="section section-pain">
        <div className="container">
          <div className="section-header reveal">
            <p className="section-eyebrow">¿Te suena familiar?</p>
            <h2 className="section-title">El problema no es tu negocio.<br />Es que no tenés los números claros.</h2>
          </div>
          <div className="pain-grid">
            {[
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, text:'"Tengo ventas pero no sé si realmente estoy ganando plata"' },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="9" x2="9" y2="21"/></svg>, text:'"Uso Excel y cada cierre me lleva horas — y aun así no confío en los números"' },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="19" y1="8" x2="23" y2="12"/><line x1="23" y1="8" x2="19" y2="12"/></svg>, text:'"No sé exactamente cuánto me deben mis clientes sin revisar todo"' },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, text:'"Al final del mes no entiendo a dónde fue el dinero"' },
            ].map((p, i) => (
              <div className="pain-card reveal" key={p.text}>
                <div className="pain-icon">{p.icon}</div>
                <p className="pain-text">{p.text}</p>
              </div>
            ))}
          </div>
          <div className="pain-solution reveal">
            <div className="pain-solution-inner">
              <span className="pain-sol-label">La solución</span>
              <p className="pain-sol-text">Gestify te da <strong>claridad total en tiempo real</strong> — sin planillas, sin adivinanzas, sin perder horas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section section-alt" id="features">
        <div className="container">
          <div className="section-header reveal">
            <p className="section-eyebrow">Funcionalidades</p>
            <h2 className="section-title">Pasá de "creo que gano"<br />a "sé exactamente cuánto gano"</h2>
            <p className="section-sub">Cada herramienta diseñada para darte control real — no más datos dispersos, no más sorpresas al cierre del mes.</p>
          </div>
          <div className="features-grid">
            {[
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>, title: 'Cobrás y el PDF llega solo', desc: 'Generá facturas en segundos, el cliente recibe el PDF por email y vos tenés el historial completo por cliente. Sin papel, sin Excel.', tags: ['PDF automático','CUIT','Multi-estado'] },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>, title: 'Sabés cuánto dinero tenés ahora mismo', desc: 'Cada peso que entra o sale queda registrado. Cerrá la caja del día y sabé exactamente tu balance real — no el que esperabas.', tags: ['Cierre diario','Multi-método','Balance real'] },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>, title: 'Ninguna venta se pierde ni se olvida', desc: 'Creá pedidos, seguí su estado de pago y convertílos a factura con un clic. Todo queda registrado, nada se cae por las grietas.', tags: ['Estados de pago','Conversión rápida','Historial'] },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="15" y2="16"/></svg>, title: 'El cliente dice que sí — listo en segundos', desc: 'Generá presupuestos profesionales y cuando el cliente confirma, lo convertís en venta o factura con un clic. Sin volver a cargar nada.', tags: ['Conversión a venta','PDF','Seguimiento'] },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, title: 'Nunca más un cliente que "ya te paga"', desc: 'Cada cliente tiene su saldo actualizado automáticamente. Sabés quién te debe, cuánto y desde cuándo — sin tener que revisar facturas.', tags: ['Saldo de deuda','Historial','CUIT'] },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, title: 'Tomás decisiones con números, no con intuición', desc: 'Dashboards con ventas reales, rentabilidad por producto y tendencias del mes. Sabés qué te conviene hacer — antes de equivocarte.', tags: ['Ventas por período','Rentabilidad','Top clientes'] },
            ].map(f => (
              <div className="feature-card reveal" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
                <div className="feature-tags">{f.tags.map(t => <span className="feature-tag" key={t}>{t}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODULE SHOWCASE ── */}
      <section className="section" id="modules">
        <div className="container">
          <div className="section-header reveal">
            <p className="section-eyebrow">Módulos</p>
            <h2 className="section-title">Explorá cada módulo</h2>
            <p className="section-sub">Cada herramienta diseñada para el flujo real de trabajo de tu negocio.</p>
          </div>
          <div className="module-tabs-wrap reveal">
            <div className="module-tabs">
              {['facturacion','caja','clientes'].map(mod => (
                <button key={mod} className={`module-tab${activeModule === mod ? ' active' : ''}`} onClick={() => handleModuleChange(mod)}>
                  {mod === 'facturacion' ? 'Facturación' : mod === 'caja' ? 'Control de Caja' : 'Clientes'}
                </button>
              ))}
            </div>
          </div>

          {/* Facturación */}
          <div className={`module-panel${activeModule === 'facturacion' ? ' active' : ''}`}>
            <div>
              <div className="module-tag"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>Facturación</div>
              <h3 className="module-title">Todas tus facturas bajo control</h3>
              <p className="module-desc">Generá, enviá y cobrá facturas desde un panel limpio. Con filtros por estado, búsqueda instantánea y exportación a PDF en segundos.</p>
              <ul className="module-list">
                <li><div className="mlc"><CheckIcon /></div>Numeración automática de facturas</li>
                <li><div className="mlc"><CheckIcon /></div>Registro de pagos parciales o totales</li>
                <li><div className="mlc"><CheckIcon /></div>Exportación a PDF con datos de tu empresa</li>
                <li><div className="mlc"><CheckIcon /></div>Anulación con historial de cambios</li>
              </ul>
              <Link to="/register" className="btn btn-primary">Probar gratis →</Link>
            </div>
            <div className="module-visual">
              <div className="module-visual-inner">
                <div className="mf-shell">
                  <div className="mf-hd"><span className="mf-hd-title">Facturación</span><span className="mf-hd-btn">+ Nueva Factura</span></div>
                  <table className="mf-table">
                    <thead><tr><th>Nº</th><th>Cliente</th><th>Estado</th><th>Fecha</th><th>Total</th></tr></thead>
                    <tbody>
                      <tr><td>FA-000089</td><td>Comercial López</td><td><span className="pill pagada"><span className="pill-dot"></span>Pagada</span></td><td style={{fontSize:'9px',color:'#8B8982'}}>25/03</td><td>$18.400</td></tr>
                      <tr><td>FA-000088</td><td>Distribuidora Sur</td><td><span className="pill pendiente"><span className="pill-dot"></span>Pendiente</span></td><td style={{fontSize:'9px',color:'#8B8982'}}>24/03</td><td>$32.000</td></tr>
                      <tr><td>FA-000087</td><td>Ferretería Central</td><td><span className="pill pagada"><span className="pill-dot"></span>Pagada</span></td><td style={{fontSize:'9px',color:'#8B8982'}}>24/03</td><td>$9.750</td></tr>
                      <tr><td>FA-000086</td><td>Panadería Norte</td><td><span className="pill pendiente"><span className="pill-dot"></span>Pendiente</span></td><td style={{fontSize:'9px',color:'#8B8982'}}>23/03</td><td>$14.200</td></tr>
                      <tr><td>FA-000085</td><td>Almacén El Sol</td><td><span className="pill parcial"><span className="pill-dot"></span>Parcial</span></td><td style={{fontSize:'9px',color:'#8B8982'}}>22/03</td><td>$22.600</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Caja */}
          <div className={`module-panel${activeModule === 'caja' ? ' active' : ''}`}>
            <div>
              <div className="module-tag"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>Control de Caja</div>
              <h3 className="module-title">Sabé exactamente cuánto tenés</h3>
              <p className="module-desc">Registrá cada movimiento de dinero, cerrá la caja al final del día y obtené un historial claro de todos tus ingresos y egresos.</p>
              <ul className="module-list">
                <li><div className="mlc"><CheckIcon /></div>Balance en tiempo real con apertura y cierre diario</li>
                <li><div className="mlc"><CheckIcon /></div>Categorías de movimientos personalizables</li>
                <li><div className="mlc"><CheckIcon /></div>Historial completo con filtros por fecha</li>
                <li><div className="mlc"><CheckIcon /></div>Registro automático desde ventas</li>
              </ul>
              <Link to="/register" className="btn btn-primary">Probar gratis →</Link>
            </div>
            <div className="module-visual">
              <div className="module-visual-inner">
                <div className="caja-mock">
                  <div className="caja-balance">
                    <div className="caja-balance-label">Saldo disponible en caja</div>
                    <div className="caja-balance-val">$127.450</div>
                    <div className="caja-balance-sub">↑ +$38.750 hoy</div>
                  </div>
                  <div className="caja-2col">
                    <div className="caja-mini"><div className="caja-mini-lbl">Ingresos hoy</div><div className="caja-mini-val green">+$52.300</div></div>
                    <div className="caja-mini"><div className="caja-mini-lbl">Egresos hoy</div><div className="caja-mini-val red">-$13.550</div></div>
                  </div>
                  <div className="caja-movs">
                    <div className="caja-movs-title">Movimientos del día</div>
                    <div className="caja-mov-row"><div className="caja-mov-left"><div className="caja-mov-dot g"></div>Venta — Comercial López</div><span className="caja-mov-amt green">+$18.400</span></div>
                    <div className="caja-mov-row"><div className="caja-mov-left"><div className="caja-mov-dot r"></div>Gasto — Proveedor ABC</div><span className="caja-mov-amt red">-$8.200</span></div>
                    <div className="caja-mov-row"><div className="caja-mov-left"><div className="caja-mov-dot g"></div>Cobro — Ferretería Central</div><span className="caja-mov-amt green">+$9.750</span></div>
                    <div className="caja-mov-row"><div className="caja-mov-left"><div className="caja-mov-dot r"></div>Retiro de caja</div><span className="caja-mov-amt red">-$5.350</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Clientes */}
          <div className={`module-panel${activeModule === 'clientes' ? ' active' : ''}`}>
            <div>
              <div className="module-tag"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>CRM Clientes</div>
              <h3 className="module-title">Nunca pierdas un cobro pendiente</h3>
              <p className="module-desc">Mantené el registro completo de cada cliente: sus datos, cuánto te deben, su historial de compras y sus pedidos activos.</p>
              <ul className="module-list">
                <li><div className="mlc"><CheckIcon /></div>Saldo de deuda actualizado automáticamente</li>
                <li><div className="mlc"><CheckIcon /></div>Historial completo de facturas y pedidos</li>
                <li><div className="mlc"><CheckIcon /></div>Búsqueda por nombre, CUIT o email</li>
                <li><div className="mlc"><CheckIcon /></div>Registrar pagos parciales o totales</li>
              </ul>
              <Link to="/register" className="btn btn-primary">Probar gratis →</Link>
            </div>
            <div className="module-visual">
              <div className="module-visual-inner">
                <div className="mf-shell">
                  <div className="mf-hd"><span className="mf-hd-title">Clientes</span><span className="mf-hd-btn">+ Nuevo Cliente</span></div>
                  <table className="mf-table">
                    <thead><tr><th>Cliente</th><th>CUIT</th><th>Facturas</th><th>Deuda</th></tr></thead>
                    <tbody>
                      <tr><td style={{fontFamily:'inherit',fontSize:'10px',color:'#1e2320'}}>Comercial López</td><td>20-12345678-9</td><td style={{color:'#373F47'}}>12</td><td style={{color:'#8B8982',fontWeight:'700',textAlign:'right'}}>$32.000</td></tr>
                      <tr><td style={{fontFamily:'inherit',fontSize:'10px',color:'#1e2320'}}>Distribuidora Sur</td><td>27-87654321-0</td><td style={{color:'#373F47'}}>7</td><td style={{color:'#606B6C',fontWeight:'700',textAlign:'right'}}>$0</td></tr>
                      <tr><td style={{fontFamily:'inherit',fontSize:'10px',color:'#1e2320'}}>Panadería Norte</td><td>20-11223344-5</td><td style={{color:'#373F47'}}>3</td><td style={{color:'#8B8982',fontWeight:'700',textAlign:'right'}}>$14.200</td></tr>
                      <tr><td style={{fontFamily:'inherit',fontSize:'10px',color:'#1e2320'}}>Ferretería Central</td><td>30-55667788-1</td><td style={{color:'#373F47'}}>19</td><td style={{color:'#606B6C',fontWeight:'700',textAlign:'right'}}>$0</td></tr>
                      <tr><td style={{fontFamily:'inherit',fontSize:'10px',color:'#1e2320'}}>Almacén El Sol</td><td>23-99887766-4</td><td style={{color:'#373F47'}}>5</td><td style={{color:'#8B8982',fontWeight:'700',textAlign:'right'}}>$22.600</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header reveal">
            <p className="section-eyebrow">Cómo funciona</p>
            <h2 className="section-title">De cero a operativo en minutos</h2>
            <p className="section-sub">Sin instalaciones complejas, sin migraciones complicadas. Gestify está listo cuando vos lo estás.</p>
          </div>
          <div className="steps-grid">
            {[
              { n:'1', title:'Creá tu cuenta', desc:'Registrate con tu email o Google. No necesitás tarjeta de crédito. Tu primer semana es completamente gratuita.' },
              { n:'2', title:'Configurá tu negocio', desc:'Cargá tus productos, clientes y datos de la empresa. Nuestro asistente de configuración te guía en cada paso.' },
              { n:'3', title:'Empezá a operar', desc:'Generá facturas, controlá tu caja y gestioná pedidos desde el primer día. Sin curva de aprendizaje empinada.' },
            ].map(s => (
              <div className="step-card reveal" key={s.n}>
                <div className="step-number">{s.n}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="section" id="pricing">
        <div className="container">
          <div className="section-header reveal">
            <p className="section-eyebrow">Precios</p>
            <h2 className="section-title">Por menos de lo que perdés<br />sin tener los números claros</h2>
            <p className="section-sub">Una sola venta que no cobras, un gasto que no registrás, o un mes sin saber tu ganancia real — ya vale más que el plan Pro. Probá gratis 7 días.</p>
          </div>
          <div className="pricing-grid reveal">
            <div className="pricing-card">
              <div className="pricing-name">Prueba gratuita</div>
              <div className="pricing-price"><span className="pricing-amount">Gratis</span></div>
              <div className="pricing-desc">7 días de acceso completo. Sin tarjeta de crédito ni compromisos.</div>
              <hr className="pricing-divider" />
              <ul className="pricing-features">
                {['Todos los módulos incluidos','Facturación ilimitada','Control de Caja y Reportes','Exportación PDF'].map(f => (
                  <li className="pricing-feature" key={f}><div className="pfi yes"><CheckIcon /></div>{f}</li>
                ))}
                <li className="pricing-feature"><div className="pfi no"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div><span style={{color:'var(--text-muted)'}}>Soporte prioritario</span></li>
              </ul>
              <Link to="/register" className="btn btn-ghost" style={{width:'100%',justifyContent:'center'}}>Empezar prueba gratis</Link>
            </div>
            <div className="pricing-card featured">
              <div className="pricing-pill">⚡ Más popular</div>
              <div className="pricing-name">Pro</div>
              <div className="pricing-price">
                <span className="pricing-currency">$</span>
                <span className="pricing-amount">14.999</span>
                <span className="pricing-period">ARS / mes</span>
              </div>
              <div className="pricing-desc">Acceso completo y soporte prioritario para negocios que necesitan operar sin límites.</div>
              <hr className="pricing-divider" />
              <ul className="pricing-features">
                {['Todo lo del plan gratuito','Clientes y productos ilimitados','Reportes avanzados y analytics','Soporte prioritario en español','Nuevas funcionalidades incluidas'].map(f => (
                  <li className="pricing-feature" key={f}><div className="pfi yes"><CheckIcon /></div>{f}</li>
                ))}
              </ul>
              <Link to="/register" className="btn btn-primary" style={{width:'100%',justifyContent:'center'}}>Iniciar prueba gratuita →</Link>
              <p className="pricing-sub">7 días gratis · Sin tarjeta de crédito · Cancelá cuando quieras</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header reveal">
            <p className="section-eyebrow">Testimonios</p>
            <h2 className="section-title">Resultados reales de negocios reales</h2>
          </div>
          <div className="testimonials-grid">
            {[
              { initials:'MG', text:'"Antes no sabía si el negocio ganaba o perdía plata de verdad. Ahora lo veo todos los días en el dashboard. El primer mes descubrí que un producto me daba pérdida y ni lo sabía."', name:'Martín González', role:'Distribuidora de bebidas, Buenos Aires' },
              { initials:'LC', text:'"Dejé el Excel y el primer mes recuperé 4 horas por semana. Además, un cliente me debía $80.000 y yo ni me acordaba — Gestify me lo mostró solo en el panel de clientes."', name:'Laura Castro', role:'Ferretería, Rosario' },
              { initials:'RP', text:'"Configuré todo en una tarde. Al día siguiente ya estaba facturando. Ahora cierro la caja en 2 minutos y sé exactamente cuánto entró y cuánto salió — sin adivinar."', name:'Roberto Peralta', role:'Almacén, Córdoba' },
            ].map(t => (
              <div className="testimonial-card reveal" key={t.name}>
                <div className="testimonial-stars">{'★★★★★'.split('').map((s,i) => <span className="testimonial-star" key={i}>{s}</span>)}</div>
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initials}</div>
                  <div><div className="testimonial-name">{t.name}</div><div className="testimonial-role">{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="cta-final">
        <div className="cta-glow"></div>
        <div className="container cta-content">
          <div className="reveal">
            <div className="badge" style={{marginBottom:'28px'}}><span className="badge-dot"></span>7 días gratis — sin tarjeta de crédito</div>
          </div>
          <h2 className="cta-title reveal">Dejá el Excel.<br />Empezá a saber qué pasa<br />realmente en tu negocio.</h2>
          <p className="cta-sub reveal">7 días gratis, sin tarjeta. En 5 minutos tenés todo configurado y empezás a ver tus números como nunca antes.</p>
          <div className="cta-actions reveal">
            <Link to="/register" className="btn btn-primary btn-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              Empezar gratis ahora →
            </Link>
            <a href="#demo" className="btn btn-ghost-dark btn-lg">Ver demo interactivo</a>
          </div>
          <p className="cta-note reveal">Sin tarjeta de crédito <span>·</span> 7 días de prueba gratis <span>·</span> Soporte en español</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <a href="#" className="footer-logo">
                <img src="/newlogo.png" alt="Gestify" style={{height:'72px',objectFit:'contain'}} />
                <span className="footer-logo-text">Gestify</span>
              </a>
              <p className="footer-desc">Sistema de gestión integral para PyMEs argentinas. Facturación, inventario, caja y más en una sola plataforma.</p>
            </div>
            <div>
              <p className="footer-col-title">Producto</p>
              <ul className="footer-links">
                <li><a href="#features">Funcionalidades</a></li>
                <li><a href="#modules">Módulos</a></li>
                <li><a href="#pricing">Precios</a></li>
                <li><a href="#demo">Demo</a></li>
              </ul>
            </div>
            <div>
              <p className="footer-col-title">Módulos</p>
              <ul className="footer-links">
                <li><a href="#modules">Facturación</a></li>
                <li><a href="#modules">Control de Caja</a></li>
                <li><a href="#modules">Gestión de Ventas</a></li>
                <li><a href="#modules">Reportes</a></li>
              </ul>
            </div>
            <div>
              <p className="footer-col-title">Soporte</p>
              <ul className="footer-links">
                <li><a href="#">Centro de ayuda</a></li>
                <li><a href="#">Contacto</a></li>
                <li><a href="#">Estado del sistema</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copy">© 2026 Gestify · Todos los derechos reservados</p>
            <div className="footer-bottom-links"><a href="#">Términos</a><a href="#">Privacidad</a></div>
          </div>
        </div>
      </footer>

      {/* ── SCROLL TOP ── */}
      <button
        className={`scroll-top-btn${showScrollTop ? ' visible' : ''}`}
        onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
      </button>

    </div>
  );
}
