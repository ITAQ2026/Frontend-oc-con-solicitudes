const descargarPDF = (r) => {
    const doc = new jsPDF();
    const primaryColor = [15, 23, 42];
    const margin = 20;

    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("ALPHA QUÍMICA S.R.L.", 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text("COMPROBANTE DE PAGO NO VÁLIDO COMO FACTURA", 105, 30, { align: 'center' });

    doc.setTextColor(...primaryColor);
    doc.setFontSize(14);
    doc.text(`RECIBO DE CAJA R-${String(r.id).padStart(5, '0')}`, margin, 55);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${new Date(r.fecha).toLocaleDateString('es-AR')}`, 150, 55);

    autoTable(doc, {
      startY: 65,
      head: [['Concepto', 'Información']],
      body: [
        ['EMISOR / PAGADOR', r.emisor.toUpperCase()],
        ['RECEPTOR / BENEFICIARIO', r.receptor.toUpperCase()],
        ['MOTIVO DEL PAGO', r.concepto],
        ['MÉTODO UTILIZADO', r.condicion_pago.toUpperCase()],
        ['MONTO TOTAL', `$ ${Number(r.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`]
      ],
      theme: 'striped',
      headStyles: { fillColor: primaryColor },
      styles: { fontSize: 10, cellPadding: 5 }
    });

    const finalY = doc.lastAutoTable.finalY + 15;
    
    // Cuadro de Total
    doc.setFillColor(245, 247, 250);
    doc.rect(margin, finalY, 170, 15, 'F');
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL RECIBIDO: $ ${Number(r.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, 105, finalY + 10, { align: 'center' });

    // --- SECCIÓN DE FIRMAS ---
    const firmaY = finalY + 45;
    doc.setDrawColor(200);
    
    // Línea Emisor
    doc.line(margin + 10, firmaY, margin + 70, firmaY); 
    // Línea Receptor
    doc.line(130, firmaY, 190, firmaY); 

    doc.setFontSize(8);
    doc.setTextColor(100);
    
    // Textos descriptivos debajo de las líneas
    doc.setFont("helvetica", "normal");
    doc.text("FIRMA EMISOR", margin + 40, firmaY + 5, { align: 'center' });
    doc.text("FIRMA RECEPTOR", 160, firmaY + 5, { align: 'center' });
    
    // Nombres de los responsables
    doc.setFont("helvetica", "bold");
    doc.text(r.emisor.toUpperCase(), margin + 40, firmaY + 10, { align: 'center' });
    doc.text(r.receptor.toUpperCase(), 160, firmaY + 10, { align: 'center' });

    doc.save(`Recibo_Alpha_${r.id}.pdf`);
  };