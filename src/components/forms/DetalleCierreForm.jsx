import React from 'react';
import { X, TrendingUp, TrendingDown, Wallet, Calendar, FileText } from 'lucide-react';

const fMonto = v => (parseFloat(v) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const DetalleCierreForm = ({ selectedItem, closeModal }) => {
  if (!selectedItem) {
    return (
      <div style={{ padding: 32, textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
        <p style={{ color: '#8B8982', fontSize: 13 }}>No hay datos del cierre disponibles.</p>
        <button onClick={closeModal} style={{ marginTop: 16, padding: '8px 20px', background: '#282A28', color: '#4ADE80', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Cerrar</button>
      </div>
    );
  }

  const ingresos = parseFloat(selectedItem.ingresos) || 0;
  const egresos = parseFloat(selectedItem.egresos) || 0;
  const saldo = parseFloat(selectedItem.saldo_final ?? selectedItem.saldo) || 0;
  const fecha = selectedItem.fecha || selectedItem.fecha_cierre || '—';
  const observaciones = selectedItem.observaciones || selectedItem.notas || null;
  const movimientosCount = selectedItem.movimientos ?? selectedItem.cantidad_movimientos ?? '—';

  const cards = [
    { label: 'Ingresos', value: `+$${fMonto(ingresos)}`, color: '#065F46', bg: '#F0FDF4', icon: TrendingUp },
    { label: 'Egresos', value: `-$${fMonto(egresos)}`, color: '#991B1B', bg: '#FEF2F2', icon: TrendingDown },
    { label: 'Saldo final', value: `$${fMonto(saldo)}`, color: saldo >= 0 ? '#1E40AF' : '#991B1B', bg: '#EFF6FF', icon: Wallet },
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", WebkitFontSmoothing: 'antialiased' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid rgba(48,54,47,.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(74,222,128,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={15} strokeWidth={2.5} style={{ color: '#22C55E' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e2320', margin: 0, letterSpacing: '-.02em' }}>Detalle de Cierre</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <Calendar size={11} style={{ color: '#8B8982' }} />
              <span style={{ fontSize: 11, color: '#8B8982' }}>{fecha}</span>
            </div>
          </div>
        </div>
        <button onClick={closeModal} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(48,54,47,.12)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B8982' }}>
          <X size={14} />
        </button>
      </div>

      {/* Cards */}
      <div style={{ padding: '16px 24px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {cards.map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} style={{ background: bg, borderRadius: 10, padding: '12px 14px', border: `1px solid ${color}20` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Icon size={12} style={{ color }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: '#8B8982', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color, letterSpacing: '-.03em' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Info extra */}
      <div style={{ padding: '0 24px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {movimientosCount !== '—' && (
          <div style={{ background: '#F5F5F5', borderRadius: 9, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(48,54,47,.08)' }}>
            <span style={{ fontSize: 12, color: '#8B8982', fontWeight: 500 }}>Cantidad de movimientos</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1e2320' }}>{movimientosCount}</span>
          </div>
        )}

        {observaciones && (
          <div style={{ background: '#FAFFF5', borderRadius: 9, padding: '10px 14px', border: '1px solid rgba(74,222,128,.2)' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#22C55E', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4 }}>Observaciones</span>
            <p style={{ fontSize: 12, color: '#1e2320', margin: 0, lineHeight: 1.5 }}>{observaciones}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 24px 20px', borderTop: '1px solid rgba(48,54,47,.08)', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={closeModal}
          style={{ padding: '9px 22px', background: '#282A28', color: '#4ADE80', border: 'none', borderRadius: 9, cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: "'Inter', sans-serif" }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default DetalleCierreForm;
