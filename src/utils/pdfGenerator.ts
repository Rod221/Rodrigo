import { jsPDF } from 'jspdf';
import { Client } from '../types';

/**
 * Generates an executive PDF report for the registered clients database.
 * Includes executive headers, metadata details, key KPI statistics,
 * custom drawn visual bar chart of messaging statuses,
 * and a complete tabular list of all clients in the system.
 */
export function generateClientReportPDF(clients: Client[], currentUserEmail: string = 'rodrigovangelino45@gmail.com') {
  // Initialize standard A4 PDF (portrait, units in mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const total = clients.length;
  const sent = clients.filter(c => c.msgSent).length;
  const confirmed = clients.filter(c => c.msgConfirmed).length;
  const replied = clients.filter(c => c.msgReplied).length;

  const confRate = total > 0 ? Math.round((confirmed / total) * 100) : 0;
  const replyRate = total > 0 ? Math.round((replied / total) * 100) : 0;

  const todayStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Color Definitions (Sophisticated Slate Theme)
  const primaryColor = [30, 41, 59]; // slate-800
  const accentColor = [79, 70, 229]; // indigo-600
  const successColor = [16, 185, 129]; // emerald-500
  const warningColor = [245, 158, 11]; // amber-500
  const lightGrey = [241, 245, 249]; // slate-100
  const darkGrey = [100, 116, 139]; // slate-500

  // Margins & Dimensions
  const mx = 15; // Left margin
  let cy = 20;   // Current Y position

  // --- 1. PAGE HEADER ---
  // Decorative primary header bar
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 15, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('SISTEMA DE GESTÃO DE CLIENTES & COMUNICAÇÃO', mx, 10);

  // Document Title
  cy = 28;
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(22);
  doc.text('Relatório Consolidado de Clientes', mx, cy);

  // Divider lines
  cy += 4;
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setLineWidth(1.5);
  doc.line(mx, cy, 210 - mx, cy);

  // Metadata Block
  cy += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(darkGrey[0], darkGrey[1], darkGrey[2]);
  doc.text(`Gerado por: ${currentUserEmail}`, mx, cy);
  doc.text(`Data de Emissão: ${todayStr}`, 210 - mx - 60, cy);

  // --- 2. EXECUTIVE METRICS CARDS ---
  cy += 8;
  // Card 1: Total Clients
  const cardW = 56;
  const cardH = 22;

  // Render Card 1 (Total Clientes)
  doc.setFillColor(lightGrey[0], lightGrey[1], lightGrey[2]);
  doc.rect(mx, cy, cardW, cardH, 'F');
  doc.setTextColor(darkGrey[0], darkGrey[1], darkGrey[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('TOTAL DE CLIENTES', mx + 4, cy + 6);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${total}`, mx + 4, cy + 15);

  // Render Card 2 (Confirmados)
  doc.setFillColor(lightGrey[0], lightGrey[1], lightGrey[2]);
  doc.rect(mx + cardW + 4, cy, cardW, cardH, 'F');
  doc.setTextColor(darkGrey[0], darkGrey[1], darkGrey[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('MENSAGENS CONFIRMADAS', mx + cardW + 4 + 4, cy + 6);
  doc.setTextColor(successColor[0], successColor[1], successColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${confirmed} (${confRate}%)`, mx + cardW + 4 + 4, cy + 15);

  // Render Card 3 (Respondidas)
  doc.setFillColor(lightGrey[0], lightGrey[1], lightGrey[2]);
  doc.rect(mx + (cardW * 2) + 8, cy, cardW, cardH, 'F');
  doc.setTextColor(darkGrey[0], darkGrey[1], darkGrey[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('MENSAGENS RESPONDIDAS', mx + (cardW * 2) + 8 + 4, cy + 6);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${replied} (${replyRate}%)`, mx + (cardW * 2) + 8 + 4, cy + 15);

  // --- 3. GRAPH REPRESENTATION (Vector bar chart) ---
  cy += cardH + 10;
  
  // Section Title
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Distribuição e Status das Mensagens', mx, cy);

  // Thin separator
  cy += 2;
  doc.setDrawColor(210, 214, 219);
  doc.setLineWidth(0.5);
  doc.line(mx, cy, 210 - mx, cy);

  // Draw chart elements
  cy += 8;
  const chartH = 45;
  const chartW = 180;
  
  // Draw chart background box
  doc.setFillColor(250, 250, 250);
  doc.rect(mx, cy, chartW, chartH, 'F');

  // Draw chart axes (Left border and bottom border inside chart)
  doc.setDrawColor(180, 185, 191);
  doc.setLineWidth(0.3);
  const graphStartX = mx + 35;
  const graphEndX = mx + chartW - 10;
  const graphStartY = cy + 5;
  const graphEndY = cy + chartH - 12;

  doc.line(graphStartX, graphStartY, graphStartX, graphEndY); // Y Axis
  doc.line(graphStartX, graphEndY, graphEndX, graphEndY);     // X Axis

  // Values calculation for bar graphing
  const maxVal = Math.max(total, 1);
  const getWidthForValue = (val: number) => {
    const availableWidth = graphEndX - graphStartX;
    return (val / maxVal) * availableWidth;
  };

  // Bars setup
  const barYOffset = 6;
  const barHeight = 6;
  
  // Bar 1: Total Clientes
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  const w1 = getWidthForValue(total);
  doc.rect(graphStartX, graphStartY + barYOffset, w1, barHeight, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Total de Clientes', mx + 2, graphStartY + barYOffset + 4);
  doc.text(`${total} (${total > 0 ? '100' : '0'}%)`, graphStartX + w1 + 3, graphStartY + barYOffset + 4);

  // Bar 2: Mensagens Enviadas
  doc.setFillColor(warningColor[0], warningColor[1], warningColor[2]);
  const w2 = getWidthForValue(sent);
  doc.rect(graphStartX, graphStartY + barYOffset * 2.5, w2, barHeight, 'F');
  
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Mensagens Enviadas', mx + 2, graphStartY + barYOffset * 2.5 + 4);
  doc.text(`${sent} (${total > 0 ? Math.round((sent/total)*100) : 0}%)`, graphStartX + w2 + 3, graphStartY + barYOffset * 2.5 + 4);

  // Bar 3: Confirmou Recebimento
  doc.setFillColor(successColor[0], successColor[1], successColor[2]);
  const w3 = getWidthForValue(confirmed);
  doc.rect(graphStartX, graphStartY + barYOffset * 4, w3, barHeight, 'F');
  
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Confirmados (Sim)', mx + 2, graphStartY + barYOffset * 4 + 4);
  doc.text(`${confirmed} (${confRate}%)`, graphStartX + w3 + 3, graphStartY + barYOffset * 4 + 4);

  // Bar 4: Respondeu Mensagem
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  const w4 = getWidthForValue(replied);
  doc.rect(graphStartX, graphStartY + barYOffset * 5.5, w4, barHeight, 'F');
  
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Respondidas', mx + 2, graphStartY + barYOffset * 5.5 + 4);
  doc.text(`${replied} (${replyRate}%)`, graphStartX + w4 + 3, graphStartY + barYOffset * 5.5 + 4);

  // Axis helper markers
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(darkGrey[0], darkGrey[1], darkGrey[2]);
  doc.text('0', graphStartX, graphEndY + 4);
  doc.text(`${Math.round(maxVal / 2)}`, (graphStartX + graphEndX) / 2, graphEndY + 4);
  doc.text(`${maxVal}`, graphEndX - 3, graphEndY + 4);

  // --- 4. DETAILED CLIENT ROSTER GRID (Multi-page safe table) ---
  cy += chartH + 12;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Relação Completa de Clientes', mx, cy);

  cy += 2;
  doc.line(mx, cy, 210 - mx, cy);

  cy += 6;
  // Table Header Background
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(mx, cy, 180, 8, 'F');

  // Table Headers
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('NOME COMPLETO', mx + 3, cy + 5.5);
  doc.text('E-MAIL / TELEFONE', mx + 50, cy + 5.5);
  doc.text('CATEGORIA', mx + 105, cy + 5.5);
  doc.text('ENVIADO', mx + 130, cy + 5.5);
  doc.text('CONFIRMADO', mx + 150, cy + 5.5);
  doc.text('RESPONDIDO', mx + 172, cy + 5.5);

  cy += 8;

  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  clients.forEach((client, idx) => {
    // If we hit bottom of the page, add page and write headers
    if (cy > 275) {
      doc.addPage();
      cy = 18;
      
      // Page Top indicator
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text('SISTEMA DE GESTÃO DE CLIENTES - RELATÓRIO DE ROSTER', mx, 5.5);

      cy += 5;
      
      // Secondary header re-render
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(mx, cy, 180, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('NOME COMPLETO', mx + 3, cy + 5.5);
      doc.text('E-MAIL / TELEFONE', mx + 50, cy + 5.5);
      doc.text('CATEGORIA', mx + 105, cy + 5.5);
      doc.text('ENVIADO', mx + 130, cy + 5.5);
      doc.text('CONFIRMADO', mx + 150, cy + 5.5);
      doc.text('RESPONDIDO', mx + 172, cy + 5.5);

      cy += 8;
    }

    // Row zebra stripes style
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.rect(mx, cy, 180, 7.5, 'F');

    // Safe string truncations for fitting beautifully
    const truncName = client.name.length > 25 ? client.name.substring(0, 23) + '...' : client.name;
    const truncEmail = client.email.length > 28 ? client.email.substring(0, 26) + '...' : client.email;
    const cleanPhone = client.phone || '(00) 00000-0000';

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(truncName, mx + 3, cy + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`${truncEmail}`, mx + 50, cy + 3.2);
    doc.setFontSize(6.5);
    doc.text(`Fone: ${cleanPhone}`, mx + 50, cy + 6.2);
    doc.setFontSize(7.5);

    doc.setTextColor(51, 65, 85);
    doc.text(client.category || 'Mensalista', mx + 105, cy + 5);

    // Messaging status flags with colorized visual indicators
    // Sent status
    if (client.msgSent) {
      doc.setTextColor(successColor[0], successColor[1], successColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('SIM', mx + 132, cy + 5);
    } else {
      doc.setTextColor(darkGrey[0], darkGrey[1], darkGrey[2]);
      doc.setFont('helvetica', 'normal');
      doc.text('NAO', mx + 132, cy + 5);
    }

    // Confirmed status
    if (client.msgConfirmed) {
      doc.setTextColor(successColor[0], successColor[1], successColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('SIM', mx + 154, cy + 5);
    } else {
      doc.setTextColor(darkGrey[0], darkGrey[1], darkGrey[2]);
      doc.setFont('helvetica', 'normal');
      doc.text('NAO', mx + 154, cy + 5);
    }

    // Replied status
    if (client.msgReplied) {
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('SIM', mx + 176, cy + 5);
    } else {
      doc.setTextColor(darkGrey[0], darkGrey[1], darkGrey[2]);
      doc.setFont('helvetica', 'normal');
      doc.text('NAO', mx + 176, cy + 5);
    }

    cy += 7.5;
  });

  // Footer note on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(mx, 282, 210 - mx, 282);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Gerenciador de Clientes e Mensagens - Relatório de Controle', mx, 287);
    doc.text(`Página ${i} de ${pageCount}`, 175, 287);
  }

  // Save the PDF file dynamically
  doc.save(`relatorio-clientes-${new Date().toISOString().split('T')[0]}.pdf`);
}
