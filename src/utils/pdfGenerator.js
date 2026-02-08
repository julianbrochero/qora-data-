import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generarPDFCotizacion = (cotizacion) => {
  try {
    // Crear nuevo documento PDF en orientación vertical
    const doc = new jsPDF();
    
    // Configuración de la empresa
    const empresa = {
      nombre: 'MI EMPRESA S.A.',
      direccion: 'Av. Principal 1234, Ciudad, Provincia',
      telefono: '(351) 123-4567',
      email: 'info@miempresa.com',
      cuit: '30-12345678-9',
      condicionIVA: 'Responsable Inscripto',
      inicioActividades: '01/01/2020'
    };

    // Título
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text('PRESUPUESTO', 105, 20, { align: 'center' });
    
    // Información de la empresa
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(empresa.nombre, 15, 35);
    doc.setFont('helvetica', 'normal');
    doc.text(empresa.direccion, 15, 40);
    doc.text(`Tel: ${empresa.telefono} | Email: ${empresa.email}`, 15, 45);
    doc.text(`CUIT: ${empresa.cuit} | ${empresa.condicionIVA}`, 15, 50);

    // Información del presupuesto
    const infoX = 120;
    doc.setFont('helvetica', 'bold');
    doc.text('N° PRESUPUESTO:', infoX, 35);
    doc.text('FECHA:', infoX, 42);
    doc.text('VÁLIDO HASTA:', infoX, 49);
    doc.text('CLIENTE:', infoX, 56);
    
    doc.setFont('helvetica', 'normal');
    doc.text(cotizacion.numero, infoX + 35, 35);
    doc.text(cotizacion.fecha, infoX + 35, 42);
    
    // Calcular fecha de validez (30 días)
    const fechaValidez = new Date(cotizacion.fecha);
    fechaValidez.setDate(fechaValidez.getDate() + 30);
    doc.text(fechaValidez.toISOString().split('T')[0], infoX + 35, 49);
    
    doc.text(cotizacion.cliente, infoX + 35, 56);

    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 65, 195, 65);

    // Tabla de productos
    const tableColumn = [
      { header: 'Descripción', dataKey: 'descripcion' },
      { header: 'Cant.', dataKey: 'cantidad' },
      { header: 'Precio Unit.', dataKey: 'precio' },
      { header: 'Subtotal', dataKey: 'subtotal' }
    ];

    const tableRows = cotizacion.items.map(item => ({
      descripcion: item.producto,
      cantidad: item.cantidad.toString(),
      precio: `$${(item.precio || 0).toLocaleString()}`,
      subtotal: `$${(item.subtotal || 0).toLocaleString()}`
    }));

    // Agregar tabla al PDF
    doc.autoTable({
      startY: 70,
      columns: tableColumn,
      body: tableRows,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        descripcion: { cellWidth: 80 },
        cantidad: { cellWidth: 20, halign: 'center' },
        precio: { cellWidth: 35, halign: 'right' },
        subtotal: { cellWidth: 35, halign: 'right' }
      }
    });

    // Calcular posición Y después de la tabla
    let finalY = doc.lastAutoTable.finalY + 10;

    // Totales
    const subtotal = cotizacion.total || 0;
    const iva = subtotal * 0.21;
    const total = subtotal + iva;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    // Cuadro de totales
    const totalesX = 130;
    doc.text('SUBTOTAL:', totalesX, finalY);
    doc.text('IVA (21%):', totalesX, finalY + 6);
    doc.text('TOTAL:', totalesX, finalY + 12);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`$${subtotal.toLocaleString()}`, totalesX + 45, finalY, { align: 'right' });
    doc.text(`$${iva.toLocaleString()}`, totalesX + 45, finalY + 6, { align: 'right' });
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text(`$${total.toLocaleString()}`, totalesX + 45, finalY + 12, { align: 'right' });
    doc.setTextColor(0, 0, 0);

    // Línea debajo de totales
    doc.setDrawColor(41, 128, 185);
    doc.line(totalesX, finalY + 14, totalesX + 45, finalY + 14);

    // Condiciones y observaciones
    finalY += 30;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CONDICIONES DEL PRESUPUESTO:', 15, finalY);
    
    doc.setFont('helvetica', 'normal');
    const condiciones = [
      '• Este presupuesto tiene una validez de 30 días a partir de la fecha de emisión.',
      '• El trabajo comenzará una vez aprobado el presupuesto y confirmado el anticipo.',
      '• Formas de pago aceptadas: Efectivo, Transferencia bancaria, Tarjeta de crédito/débito.',
      '• Los precios incluyen IVA. No incluyen gastos de instalación adicionales no especificados.',
      '• Tiempo de entrega estimado: 7-10 días hábiles luego de la confirmación.',
      '• Garantía: 6 meses por defectos de fabricación en los productos entregados.'
    ];

    condiciones.forEach((condicion, index) => {
      doc.text(condicion, 20, finalY + 8 + (index * 5));
    });

    // Firmas
    finalY += 60;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    // Firma empresa
    doc.text('FIRMA Y SELLO DE LA EMPRESA', 30, finalY);
    doc.line(30, finalY + 2, 90, finalY + 2);
    doc.setFont('helvetica', 'normal');
    doc.text('Aclaración y firma', 30, finalY + 8);
    doc.text(empresa.nombre, 30, finalY + 13);

    // Firma cliente
    doc.setFont('helvetica', 'bold');
    doc.text('ACEPTADO POR EL CLIENTE', 120, finalY);
    doc.line(120, finalY + 2, 180, finalY + 2);
    doc.setFont('helvetica', 'normal');
    doc.text('Aclaración y firma', 120, finalY + 8);
    doc.text(cotizacion.cliente, 120, finalY + 13);

    // Pie de página
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Documento generado automáticamente - ' + new Date().toLocaleString(), 105, pageHeight - 10, { align: 'center' });
    doc.text(empresa.nombre + ' - ' + empresa.direccion, 105, pageHeight - 5, { align: 'center' });

    // Guardar el PDF
    doc.save(`Presupuesto-${cotizacion.numero}.pdf`);

    console.log('✅ PDF de cotización generado exitosamente');
    
  } catch (error) {
    console.error('❌ Error al generar PDF:', error);
    alert('Error al generar el PDF. Por favor, intente nuevamente.');
  }
};

// Función adicional para generar PDF de facturas (opcional)
export const generarPDFFactura = (factura) => {
  // Implementación similar para facturas...
  console.log('Generando PDF de factura:', factura);
};