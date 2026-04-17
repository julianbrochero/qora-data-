import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Genera y descarga un PDF de presupuesto con la estética del sistema Gestify/Nimbus.
 * Paleta: blanco, verde #334139, grises claros — sin fondos oscuros.
 */
export const generarPDFPresupuesto = (presupuesto) => {
    try {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
        const W = doc.internal.pageSize.getWidth()
        const H = doc.internal.pageSize.getHeight()

        // ── Paleta sistema Nimbus ──────────────────
        const WHITE   = [255, 255, 255]
        const ACCENT  = [51,  65,  57]      // #334139 — verde Nimbus
        const ACCENT_L= [234, 240, 235]     // #eaf0eb — surface primaria
        const BORDER  = [209, 213, 219]     // #d1d5db
        const PAGE_BG = [248, 249, 251]     // #f8f9fb
        const CT1     = [13,  13,  13]      // textBlack
        const CT2     = [17,  24,  39]      // textDark
        const CT3     = [107, 114, 128]     // textMid
        const CT_LIGHT= [156, 163, 175]     // textLight
        const DANGER  = [220, 38,  38]

        // ── Helpers ──────────────────────────────
        const fNum  = (n) => (parseFloat(n) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        const fDate = (s) => { try { return new Date(s).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) } catch { return s || '—' } }

        // ── Datos ────────────────────────────────
        const numero        = presupuesto.numero || 'PRES-00001'
        const fecha         = fDate(presupuesto.fecha || new Date())
        const validez       = presupuesto.validez || 7
        const fechaVal      = (() => {
            try { const d = new Date(presupuesto.fecha || new Date()); d.setDate(d.getDate() + parseInt(validez)); return fDate(d) } catch { return '—' }
        })()
        const cliente       = presupuesto.cliente || 'Sin especificar'
        const nombreEmpresa = (presupuesto.nombreEmpresa || '').trim()
        const items         = Array.isArray(presupuesto.items) ? presupuesto.items : []
        const ivaPorc       = parseFloat(presupuesto.iva ?? 21)
        const subtotal      = items.reduce((s, i) => s + (parseFloat(i.subtotal) || 0), 0)
        const ivaValor      = subtotal * (ivaPorc / 100)
        const total         = presupuesto.incluirIva ? subtotal + ivaValor : subtotal
        const obs           = presupuesto.observaciones || ''
        const condPago      = presupuesto.condicionesPago || ''

        // ── FONDO PÁGINA ─────────────────────────
        doc.setFillColor(...PAGE_BG)
        doc.rect(0, 0, W, H, 'F')

        // ── HEADER — barra blanca con línea verde ─
        doc.setFillColor(...WHITE)
        doc.rect(0, 0, W, 38, 'F')

        // Línea verde de acento izquierda
        doc.setFillColor(...ACCENT)
        doc.rect(0, 0, 3.5, 38, 'F')

        // Texto empresa / sistema
        doc.setFont('helvetica', 'bold')
        if (nombreEmpresa) {
            doc.setFontSize(nombreEmpresa.length > 20 ? 15 : 19)
            doc.setTextColor(...ACCENT)
            doc.text(nombreEmpresa.toUpperCase(), 12, 16)
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(7)
            doc.setTextColor(...CT3)
            doc.text('Generado por Gestify', 12, 23)
        } else {
            doc.setFontSize(20)
            doc.setTextColor(...ACCENT)
            doc.text('GESTIFY', 12, 17)
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(7.5)
            doc.setTextColor(...CT3)
            doc.text('Sistema de Gestión Empresarial', 12, 24)
        }

        // Título PRESUPUESTO (derecha)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(18)
        doc.setTextColor(...ACCENT)
        doc.text('PRESUPUESTO', W - 12, 16, { align: 'right' })

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8.5)
        doc.setTextColor(...CT3)
        doc.text(`N° ${numero}`, W - 12, 23, { align: 'right' })

        // Línea separadora bajo el header
        doc.setDrawColor(...BORDER)
        doc.setLineWidth(0.3)
        doc.line(0, 38, W, 38)

        // ── BLOQUE INFO ──────────────────────────
        const cardY = 44

        // Tarjeta izquierda — Cliente
        doc.setFillColor(...WHITE)
        doc.roundedRect(10, cardY, 90, 30, 2.5, 2.5, 'F')
        doc.setDrawColor(...BORDER)
        doc.setLineWidth(0.25)
        doc.roundedRect(10, cardY, 90, 30, 2.5, 2.5, 'S')
        // Línea verde izq
        doc.setFillColor(...ACCENT)
        doc.rect(10, cardY, 2.5, 30, 'F')

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(6.5)
        doc.setTextColor(...CT_LIGHT)
        doc.text('CLIENTE', 17, cardY + 7)

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(...CT1)
        const cLines = doc.splitTextToSize(cliente, 76)
        doc.text(cLines[0], 17, cardY + 14)
        if (cLines[1]) { doc.setFontSize(9.5); doc.text(cLines[1], 17, cardY + 21) }

        // Tarjeta derecha — Fechas
        doc.setFillColor(...WHITE)
        doc.roundedRect(108, cardY, 92, 30, 2.5, 2.5, 'F')
        doc.setDrawColor(...BORDER)
        doc.roundedRect(108, cardY, 92, 30, 2.5, 2.5, 'S')

        const addRow = (label, value, yOff) => {
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(6.5)
            doc.setTextColor(...CT_LIGHT)
            doc.text(label, 114, cardY + yOff)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(8.5)
            doc.setTextColor(...CT2)
            doc.text(String(value), 155, cardY + yOff, { align: 'right' })
        }
        addRow('FECHA', fecha, 9)
        addRow('VÁLIDO HASTA', fechaVal, 17)
        addRow('VALIDEZ', `${validez} días`, 25)

        // ── TABLA PRODUCTOS ───────────────────────
        const tableY = cardY + 38
        const tableBody = items.map((it, i) => [
            i + 1,
            it.producto || it.nombre || '—',
            it.descripcion || '',
            String(it.cantidad ?? 1),
            `$${fNum(it.precio ?? 0)}`,
            `$${fNum(it.subtotal ?? 0)}`
        ])

        autoTable(doc, {
            startY: tableY,
            head: [['#', 'Producto / Servicio', 'Descripción', 'Cant.', 'Precio Unit.', 'Subtotal']],
            body: tableBody,
            theme: 'plain',
            styles: {
                font: 'helvetica',
                fontSize: 8.5,
                cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
                lineColor: BORDER,
                lineWidth: 0.2,
                textColor: CT2,
                valign: 'middle',
                fillColor: WHITE,
            },
            headStyles: {
                fillColor: ACCENT_L,
                textColor: ACCENT,
                fontStyle: 'bold',
                fontSize: 7.5,
                cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
            },
            alternateRowStyles: { fillColor: PAGE_BG },
            columnStyles: {
                0: { cellWidth: 8,  halign: 'center', textColor: CT3 },
                1: { cellWidth: 55 },
                2: { cellWidth: 45, textColor: CT3, fontSize: 7.5 },
                3: { cellWidth: 15, halign: 'center' },
                4: { cellWidth: 28, halign: 'right' },
                5: { cellWidth: 28, halign: 'right', fontStyle: 'bold', textColor: ACCENT },
            },
            margin: { left: 10, right: 10 },
        })

        let y = doc.lastAutoTable.finalY + 8

        // ── TOTALES ───────────────────────────────
        const totW = 85
        const totX = W - 10 - totW

        // Caja totales blanca
        doc.setFillColor(...WHITE)
        doc.roundedRect(totX, y, totW, presupuesto.incluirIva ? 34 : 24, 2.5, 2.5, 'F')
        doc.setDrawColor(...BORDER)
        doc.roundedRect(totX, y, totW, presupuesto.incluirIva ? 34 : 24, 2.5, 2.5, 'S')

        const totRow = (label, value, yOff) => {
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(8.5)
            doc.setTextColor(...CT3)
            doc.text(label, totX + 5, y + yOff)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(...CT2)
            doc.text(`$${fNum(value)}`, totX + totW - 5, y + yOff, { align: 'right' })
        }

        totRow('Subtotal', subtotal, 9)

        if (presupuesto.incluirIva) {
            totRow(`IVA (${ivaPorc}%)`, ivaValor, 17)
            // Línea
            doc.setDrawColor(...BORDER)
            doc.line(totX + 4, y + 20, totX + totW - 4, y + 20)
            // Total — fondo verde suave
            doc.setFillColor(...ACCENT_L)
            doc.roundedRect(totX, y + 22, totW, 12, 2, 2, 'F')
            doc.setDrawColor(...ACCENT)
            doc.setLineWidth(0.5)
            doc.roundedRect(totX, y + 22, totW, 12, 2, 2, 'S')
            doc.setLineWidth(0.2)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
            doc.setTextColor(...ACCENT)
            doc.text('TOTAL', totX + 5, y + 30)
            doc.text(`$${fNum(total)}`, totX + totW - 5, y + 30, { align: 'right' })
            y += 40
        } else {
            doc.setDrawColor(...BORDER)
            doc.line(totX + 4, y + 12, totX + totW - 4, y + 12)
            doc.setFillColor(...ACCENT_L)
            doc.roundedRect(totX, y + 14, totW, 12, 2, 2, 'F')
            doc.setDrawColor(...ACCENT)
            doc.setLineWidth(0.5)
            doc.roundedRect(totX, y + 14, totW, 12, 2, 2, 'S')
            doc.setLineWidth(0.2)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
            doc.setTextColor(...ACCENT)
            doc.text('TOTAL', totX + 5, y + 22)
            doc.text(`$${fNum(total)}`, totX + totW - 5, y + 22, { align: 'right' })
            y += 30
        }

        y += 8

        // ── OBSERVACIONES / CONDICIONES ───────────
        if (obs || condPago) {
            const boxW = totX - 14
            const boxX = 10

            if (obs) {
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(7.5)
                doc.setTextColor(...CT3)
                doc.text('OBSERVACIONES', boxX, y + 5)
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(8)
                doc.setTextColor(...CT2)
                const obsLines = doc.splitTextToSize(obs, boxW)
                doc.text(obsLines, boxX, y + 12)
                y += 10 + obsLines.length * 4.5
            }

            if (condPago) {
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(7.5)
                doc.setTextColor(...CT3)
                doc.text('CONDICIONES DE PAGO', boxX, y + 5)
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(8)
                doc.setTextColor(...CT2)
                const cpLines = doc.splitTextToSize(condPago, boxW)
                doc.text(cpLines, boxX, y + 12)
            }
        }

        // ── PIE DE PÁGINA ─────────────────────────
        doc.setFillColor(...WHITE)
        doc.rect(0, H - 14, W, 14, 'F')
        doc.setDrawColor(...BORDER)
        doc.setLineWidth(0.3)
        doc.line(0, H - 14, W, H - 14)
        // Línea verde izq pie
        doc.setFillColor(...ACCENT)
        doc.rect(0, H - 14, 3, 14, 'F')

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7.5)
        doc.setTextColor(...ACCENT)
        doc.text('Gestify', 10, H - 7)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(...CT_LIGHT)
        doc.text(`Documento generado el ${fDate(new Date())}`, W - 10, H - 7, { align: 'right' })

        // ── GUARDAR ───────────────────────────────
        doc.save(`Presupuesto-${numero}.pdf`)
        return true
    } catch (err) {
        console.error('Error generando PDF presupuesto:', err)
        return false
    }
}
