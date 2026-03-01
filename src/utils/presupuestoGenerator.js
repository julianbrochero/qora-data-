import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Genera y descarga un PDF de presupuesto.
 * @param {Object} presupuesto - Datos del presupuesto
 */
export const generarPDFPresupuesto = (presupuesto) => {
    try {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
        const W = doc.internal.pageSize.getWidth()   // 210
        const H = doc.internal.pageSize.getHeight()  // 297

        // ── Paleta ──────────────────────────────
        const DARK = [40, 42, 40]    // #282A28
        const ACCENT = [51, 65, 57]    // #334139
        const LIME = [220, 237, 49]    // #DCED31
        const LIGHT = [245, 245, 245]   // #F5F5F5
        const BORDER = [220, 220, 220]
        const CT1 = [30, 35, 32]
        const CT3 = [139, 137, 130]

        // ── Helpers ──────────────────────────────
        const fNum = (n) => (parseFloat(n) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        const fDate = (s) => { try { return new Date(s).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) } catch { return s || '—' } }

        // ── Datos extraídos ──────────────────────
        const numero = presupuesto.numero || 'PRES-00001'
        const fecha = fDate(presupuesto.fecha || new Date())
        const validez = presupuesto.validez || 7
        const fechaVal = (() => {
            try {
                const d = new Date(presupuesto.fecha || new Date())
                d.setDate(d.getDate() + parseInt(validez))
                return fDate(d)
            } catch { return '—' }
        })()
        const cliente = presupuesto.cliente || 'Sin especificar'
        const nombreEmpresa = (presupuesto.nombreEmpresa || '').trim()
        const items = Array.isArray(presupuesto.items) ? presupuesto.items : []
        const ivaPorc = parseFloat(presupuesto.iva ?? 21)
        const subtotalGeneral = items.reduce((s, i) => s + (parseFloat(i.subtotal) || 0), 0)
        const ivaValor = subtotalGeneral * (ivaPorc / 100)
        const total = presupuesto.incluirIva ? subtotalGeneral + ivaValor : subtotalGeneral
        const obs = presupuesto.observaciones || ''
        const condPago = presupuesto.condicionesPago || ''

        // ── HEADER ───────────────────────────────
        // Fondo verde oscuro
        doc.setFillColor(...DARK)
        doc.rect(0, 0, W, 40, 'F')

        // Barra lima lateral
        doc.setFillColor(...LIME)
        doc.rect(0, 0, 4, 40, 'F')

        // Logo / Nombre de empresa
        doc.setFont('helvetica', 'bold')
        if (nombreEmpresa) {
            // Nombre de empresa grande
            doc.setFontSize(nombreEmpresa.length > 18 ? 16 : 20)
            doc.setTextColor(255, 255, 255)
            doc.text(nombreEmpresa.toUpperCase(), 14, 17)
            // Subtítulo: Gestify
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(7)
            doc.setTextColor(180, 180, 180)
            doc.text('Generado por Gestify', 14, 24)
        } else {
            // Fallback: mostrar GESTIFY
            doc.setFontSize(22)
            doc.setTextColor(255, 255, 255)
            doc.text('GESTIFY', 14, 17)
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(8)
            doc.setTextColor(180, 180, 180)
            doc.text('Sistema de Gestión Empresarial', 14, 23)
        }

        // Título PRESUPUESTO (derecha)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(20)
        doc.setTextColor(...LIME)
        doc.text('PRESUPUESTO', W - 14, 17, { align: 'right' })

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(200, 200, 200)
        doc.text(`N° ${numero}`, W - 14, 24, { align: 'right' })

        // ── BLOQUE INFO ──────────────────────────
        // Tarjeta izquierda — Cliente
        const cardY = 48
        doc.setFillColor(...LIGHT)
        doc.roundedRect(10, cardY, 90, 32, 3, 3, 'F')
        doc.setDrawColor(...BORDER)
        doc.setLineWidth(0.3)
        doc.roundedRect(10, cardY, 90, 32, 3, 3, 'S')

        // Línea verde a la izq de la tarjeta cliente
        doc.setFillColor(...ACCENT)
        doc.rect(10, cardY, 2.5, 32, 'F')

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7)
        doc.setTextColor(...CT3)
        doc.text('CLIENTE', 17, cardY + 7)

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(...CT1)
        const clienteLines = doc.splitTextToSize(cliente, 78)
        doc.text(clienteLines[0], 17, cardY + 14)
        if (clienteLines[1]) doc.text(clienteLines[1], 17, cardY + 20)

        // Tarjeta derecha — Datos del presupuesto
        doc.setFillColor(...LIGHT)
        doc.roundedRect(108, cardY, 92, 32, 3, 3, 'F')
        doc.setDrawColor(...BORDER)
        doc.roundedRect(108, cardY, 92, 32, 3, 3, 'S')

        const addRow = (label, value, yOff) => {
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(7)
            doc.setTextColor(...CT3)
            doc.text(label, 114, cardY + yOff)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(8.5)
            doc.setTextColor(...CT1)
            doc.text(String(value), 148, cardY + yOff)
        }
        addRow('FECHA', fecha, 9)
        addRow('VÁLIDO HASTA', fechaVal, 17)
        addRow('VALIDEZ', `${validez} días`, 25)

        // ── TABLA PRODUCTOS ───────────────────────
        const tableY = cardY + 40
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
                textColor: CT1,
                valign: 'middle',
            },
            headStyles: {
                fillColor: DARK,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 7.5,
                cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
            },
            alternateRowStyles: { fillColor: [250, 250, 250] },
            columnStyles: {
                0: { cellWidth: 8, halign: 'center', textColor: CT3 },
                1: { cellWidth: 55 },
                2: { cellWidth: 45, textColor: CT3, fontSize: 7.5 },
                3: { cellWidth: 15, halign: 'center' },
                4: { cellWidth: 28, halign: 'right' },
                5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
            },
            margin: { left: 10, right: 10 },
        })

        let y = doc.lastAutoTable.finalY + 8

        // ── TOTALES ───────────────────────────────
        const totW = 85
        const totX = W - 10 - totW

        // Caja totales
        doc.setFillColor(...LIGHT)
        doc.roundedRect(totX, y, totW, presupuesto.incluirIva ? 32 : 22, 3, 3, 'F')
        doc.setDrawColor(...BORDER)
        doc.roundedRect(totX, y, totW, presupuesto.incluirIva ? 32 : 22, 3, 3, 'S')

        const totRow = (label, value, yOff, bold = false, color = CT1) => {
            doc.setFont('helvetica', bold ? 'bold' : 'normal')
            doc.setFontSize(bold ? 10 : 8.5)
            doc.setTextColor(...CT3)
            doc.text(label, totX + 5, y + yOff)
            doc.setTextColor(...color)
            doc.text(`$${fNum(value)}`, totX + totW - 5, y + yOff, { align: 'right' })
        }

        totRow('Subtotal', subtotalGeneral, 8)
        if (presupuesto.incluirIva) {
            totRow(`IVA (${ivaPorc}%)`, ivaValor, 16)
            // Línea separadora
            doc.setDrawColor(...BORDER)
            doc.line(totX + 4, y + 19, totX + totW - 4, y + 19)
            // Total destacado
            doc.setFillColor(...DARK)
            doc.roundedRect(totX, y + 21, totW, 11, 2, 2, 'F')
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
            doc.setTextColor(255, 255, 255)
            doc.text('TOTAL', totX + 5, y + 29)
            doc.setTextColor(...LIME)
            doc.text(`$${fNum(total)}`, totX + totW - 5, y + 29, { align: 'right' })
            y += 37
        } else {
            doc.setDrawColor(...BORDER)
            doc.line(totX + 4, y + 11, totX + totW - 4, y + 11)
            doc.setFillColor(...DARK)
            doc.roundedRect(totX, y + 13, totW, 11, 2, 2, 'F')
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
            doc.setTextColor(255, 255, 255)
            doc.text('TOTAL', totX + 5, y + 21)
            doc.setTextColor(...LIME)
            doc.text(`$${fNum(total)}`, totX + totW - 5, y + 21, { align: 'right' })
            y += 27
        }

        y += 8

        // ── OBSERVACIONES / CONDICIONES ───────────
        if (obs || condPago) {
            const boxW = totX - 14
            const boxX = 10

            if (obs) {
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(8)
                doc.setTextColor(...ACCENT)
                doc.text('OBSERVACIONES', boxX, y + 5)
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(8)
                doc.setTextColor(...CT1)
                const obsLines = doc.splitTextToSize(obs, boxW - 8)
                doc.text(obsLines, boxX, y + 12)
                y += 10 + obsLines.length * 4.5
            }

            if (condPago) {
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(8)
                doc.setTextColor(...ACCENT)
                doc.text('CONDICIONES DE PAGO', boxX, y + 5)
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(8)
                doc.setTextColor(...CT1)
                const cpLines = doc.splitTextToSize(condPago, boxW - 8)
                doc.text(cpLines, boxX, y + 12)
            }
        }

        // ── PIE DE PÁGINA ─────────────────────────
        doc.setFillColor(...DARK)
        doc.rect(0, H - 16, W, 16, 'F')
        doc.setFillColor(...LIME)
        doc.rect(0, H - 16, 3, 16, 'F')

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.setTextColor(255, 255, 255)
        doc.text('Generado por Gestify', 10, H - 9)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(160, 160, 160)
        doc.text(`Documento generado el ${fDate(new Date())} · gestify.app`, W - 10, H - 9, { align: 'right' })

        // ── GUARDAR ───────────────────────────────
        doc.save(`Presupuesto-${numero}.pdf`)
        return true
    } catch (err) {
        console.error('Error generando PDF presupuesto:', err)
        return false
    }
}
