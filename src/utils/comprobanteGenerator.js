import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Genera y descarga un PDF de comprobante interno de venta.
 * No es una factura fiscal — incluye leyenda aclaratoria.
 *
 * @param {Object} factura - Datos de la factura/comprobante
 * @param {string} [nombreEmpresa] - Nombre del negocio (opcional, fallback a localStorage)
 */
export const generarPDFComprobante = (factura, nombreEmpresa) => {
    try {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
        const W = doc.internal.pageSize.getWidth()
        const H = doc.internal.pageSize.getHeight()

        // ── Paleta ──────────────────────────────────────
        const DARK   = [40, 42, 40]
        const ACCENT = [51, 65, 57]
        const LIME   = [74, 222, 128]
        const LIGHT  = [245, 245, 245]
        const BORDER = [220, 220, 220]
        const CT1    = [30, 35, 32]
        const CT3    = [139, 137, 130]
        const RED    = [153, 27, 27]
        const GREEN  = [6, 95, 70]

        // ── Helpers ─────────────────────────────────────
        const fNum = (n) => (parseFloat(n) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        const fDate = (s) => {
            try { return new Date(s + (String(s).includes('T') ? '' : 'T00:00:00')).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
            catch { return s || '—' }
        }

        // ── Datos ────────────────────────────────────────
        const empresa  = (nombreEmpresa || localStorage.getItem('gestify_empresa') || '').trim()
        const numero   = factura.numero || 'FA-000001'
        const fecha    = fDate(factura.fecha || new Date())
        const cliente  = factura.cliente_nombre || factura.cliente || 'Sin especificar'
        const metodo   = factura.metodopago || factura.metodoPago || 'Efectivo'
        const tipo     = factura.tipo || 'Comprobante'
        const total    = parseFloat(factura.total) || 0
        const cobrado  = parseFloat(factura.montopagado) || 0
        const saldo    = parseFloat(factura.saldopendiente) || (total - cobrado)
        const estado   = factura.estado || 'pendiente'

        const items = (() => {
            try {
                const raw = factura.items
                return Array.isArray(raw) ? raw : JSON.parse(raw || '[]')
            } catch { return [] }
        })()

        // ── HEADER ───────────────────────────────────────
        doc.setFillColor(...DARK)
        doc.rect(0, 0, W, 42, 'F')

        // Barra lima lateral
        doc.setFillColor(...LIME)
        doc.rect(0, 0, 4, 42, 'F')

        // Nombre empresa / logo
        doc.setFont('helvetica', 'bold')
        if (empresa) {
            doc.setFontSize(empresa.length > 18 ? 16 : 20)
            doc.setTextColor(255, 255, 255)
            doc.text(empresa.toUpperCase(), 14, 17)
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(7)
            doc.setTextColor(180, 180, 180)
            doc.text('Generado por Gestify', 14, 24)
        } else {
            doc.setFontSize(22)
            doc.setTextColor(255, 255, 255)
            doc.text('GESTIFY', 14, 17)
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(8)
            doc.setTextColor(180, 180, 180)
            doc.text('Sistema de Gestión Empresarial', 14, 24)
        }

        // Título COMPROBANTE (derecha)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(18)
        doc.setTextColor(...LIME)
        doc.text('COMPROBANTE', W - 14, 15, { align: 'right' })

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8.5)
        doc.setTextColor(200, 200, 200)
        doc.text(`N° ${numero}`, W - 14, 22, { align: 'right' })
        doc.setFontSize(7.5)
        doc.setTextColor(160, 160, 160)
        doc.text(tipo, W - 14, 28, { align: 'right' })

        // ── BLOQUE INFO ──────────────────────────────────
        const cardY = 50

        // Tarjeta cliente (izquierda)
        doc.setFillColor(...LIGHT)
        doc.roundedRect(10, cardY, 90, 34, 3, 3, 'F')
        doc.setDrawColor(...BORDER)
        doc.setLineWidth(0.3)
        doc.roundedRect(10, cardY, 90, 34, 3, 3, 'S')
        doc.setFillColor(...ACCENT)
        doc.rect(10, cardY, 2.5, 34, 'F')

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7)
        doc.setTextColor(...CT3)
        doc.text('CLIENTE', 17, cardY + 7)

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(...CT1)
        const clienteLines = doc.splitTextToSize(cliente, 78)
        doc.text(clienteLines[0], 17, cardY + 15)
        if (clienteLines[1]) doc.text(clienteLines[1], 17, cardY + 21)

        // Tarjeta datos (derecha)
        doc.setFillColor(...LIGHT)
        doc.roundedRect(108, cardY, 92, 34, 3, 3, 'F')
        doc.setDrawColor(...BORDER)
        doc.roundedRect(108, cardY, 92, 34, 3, 3, 'S')

        const addRow = (label, value, yOff) => {
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(7)
            doc.setTextColor(...CT3)
            doc.text(label, 114, cardY + yOff)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(8.5)
            doc.setTextColor(...CT1)
            doc.text(String(value), 152, cardY + yOff)
        }
        addRow('FECHA', fecha, 9)
        addRow('MÉTODO PAGO', metodo, 18)
        addRow('ESTADO', estado.toUpperCase(), 27)

        // ── TABLA PRODUCTOS ──────────────────────────────
        const tableY = cardY + 42

        const tableBody = items.length > 0
            ? items.map((it, i) => [
                i + 1,
                it.producto || it.nombre || it.descripcion || '—',
                String(it.cantidad ?? 1),
                `$${fNum(it.precio ?? 0)}`,
                `$${fNum(it.subtotal ?? 0)}`
            ])
            : [[1, 'Servicio / Cobro', '1', `$${fNum(total)}`, `$${fNum(total)}`]]

        autoTable(doc, {
            startY: tableY,
            head: [['#', 'Producto / Servicio', 'Cant.', 'Precio Unit.', 'Subtotal']],
            body: tableBody,
            theme: 'plain',
            styles: {
                font: 'helvetica',
                fontSize: 8.5,
                cellPadding: { top: 4.5, bottom: 4.5, left: 5, right: 5 },
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
                cellPadding: { top: 5, bottom: 5, left: 5, right: 5 },
            },
            alternateRowStyles: { fillColor: [250, 250, 250] },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center', textColor: CT3 },
                1: { cellWidth: 95 },
                2: { cellWidth: 18, halign: 'center' },
                3: { cellWidth: 32, halign: 'right' },
                4: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
            },
            margin: { left: 10, right: 10 },
        })

        let y = doc.lastAutoTable.finalY + 8

        // ── TOTALES ──────────────────────────────────────
        const totW = 90
        const totX = W - 10 - totW
        const hasSaldo = saldo > 0.009

        const boxH = hasSaldo ? 44 : 34

        doc.setFillColor(...LIGHT)
        doc.roundedRect(totX, y, totW, boxH, 3, 3, 'F')
        doc.setDrawColor(...BORDER)
        doc.roundedRect(totX, y, totW, boxH, 3, 3, 'S')

        // Fila subtotal
        const totRow = (label, value, yOff, colorVal = CT1) => {
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(8.5)
            doc.setTextColor(...CT3)
            doc.text(label, totX + 6, y + yOff)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(...colorVal)
            doc.text(`$${fNum(value)}`, totX + totW - 6, y + yOff, { align: 'right' })
        }

        totRow('Total', total, 9)
        totRow('Cobrado', cobrado, 18, GREEN)

        if (hasSaldo) {
            doc.setDrawColor(...BORDER)
            doc.line(totX + 5, y + 21, totX + totW - 5, y + 21)
            totRow('Saldo pendiente', saldo, 28, RED)
            doc.setDrawColor(...BORDER)
            doc.line(totX + 5, y + 31, totX + totW - 5, y + 31)
        } else {
            doc.setDrawColor(...BORDER)
            doc.line(totX + 5, y + 21, totX + totW - 5, y + 21)
        }

        // Total box destacado
        const totalBoxY = hasSaldo ? y + 33 : y + 23
        doc.setFillColor(...DARK)
        doc.roundedRect(totX, totalBoxY, totW, 11, 2, 2, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor(255, 255, 255)
        doc.text('TOTAL', totX + 6, totalBoxY + 7.5)
        doc.setTextColor(...LIME)
        doc.text(`$${fNum(total)}`, totX + totW - 6, totalBoxY + 7.5, { align: 'right' })

        y = totalBoxY + 16

        // ── MÉTODO DE PAGO (izquierda del bloque totales) ──
        const infoX = 10
        const infoW = totX - 18
        const infoY = doc.lastAutoTable.finalY + 8

        doc.setFillColor(...LIGHT)
        doc.roundedRect(infoX, infoY, infoW, 26, 3, 3, 'F')
        doc.setDrawColor(...BORDER)
        doc.roundedRect(infoX, infoY, infoW, 26, 3, 3, 'S')
        doc.setFillColor(...ACCENT)
        doc.rect(infoX, infoY, 2.5, 26, 'F')

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7)
        doc.setTextColor(...CT3)
        doc.text('MÉTODO DE PAGO', infoX + 8, infoY + 8)

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.setTextColor(...CT1)
        doc.text(metodo, infoX + 8, infoY + 18)

        // ── LEYENDA ──────────────────────────────────────
        y = Math.max(y, infoY + 32)
        y += 4

        doc.setDrawColor(...BORDER)
        doc.setLineWidth(0.3)
        doc.roundedRect(10, y, W - 20, 14, 2, 2, 'S')

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7)
        doc.setTextColor(...CT3)
        doc.text('⚠  Comprobante no válido como factura fiscal. Documento de uso interno.', W / 2, y + 5.5, { align: 'center' })
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(6.5)
        doc.text('Este comprobante no reemplaza a una factura AFIP/ARCA oficial. Para factura electrónica, consulte a su contador.', W / 2, y + 10, { align: 'center' })

        // ── FOOTER ───────────────────────────────────────
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
        doc.text(
            `Documento generado el ${fDate(new Date())}  ·  gestify.app`,
            W - 10, H - 9, { align: 'right' }
        )

        // ── GUARDAR ──────────────────────────────────────
        doc.save(`Comprobante-${numero}.pdf`)
        return true
    } catch (err) {
        console.error('Error generando comprobante PDF:', err)
        return false
    }
}
