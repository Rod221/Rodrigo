import { Client } from '../types';

/**
 * Parses CSV text into an array of Client objects.
 * Automatically handles comma (,) and semicolon (;) separators,
 * and strips potential surrounding quotes.
 * Uses smart header detection in Brazilian Portuguese and English.
 */
export function parseCSV(csvText: string): Client[] {
  if (!csvText || !csvText.trim()) {
    return [];
  }

  // Split lines and clean
  const lines = csvText.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length < 2) {
    return [];
  }

  // Detect separator: check if first line contains more semicolons or commas
  const firstLine = lines[0];
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const separator = semicolonCount > commaCount ? ';' : ',';

  // Helper to split a CSV line respecting quotes
  const splitCSVLine = (line: string, sep: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === sep && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result.map(val => val.replace(/^"|"$/g, '').trim()); // Strip outer quotes
  };

  // Extract headers and map to client fields
  const rawHeaders = splitCSVLine(firstLine, separator).map(h => h.toLowerCase());
  
  // Header index mapping
  let nameIdx = -1;
  let emailIdx = -1;
  let phoneIdx = -1;
  let categoryIdx = -1;
  let msgSentIdx = -1;
  let msgConfirmedIdx = -1;
  let msgRepliedIdx = -1;

  rawHeaders.forEach((header, index) => {
    if (header.includes('nome') || header.includes('name') || header === 'cliente') {
      nameIdx = index;
    } else if (header.includes('email') || header.includes('e-mail') || header.includes('correio')) {
      emailIdx = index;
    } else if (header.includes('fone') || header.includes('tel') || header.includes('phone') || header.includes('celular') || header.includes('contato')) {
      phoneIdx = index;
    } else if (header.includes('cat') || header.includes('grupo') || header.includes('tipo') || header.includes('category') || header.includes('classe')) {
      categoryIdx = index;
    } else if (header.includes('env') || header.includes('sent') || header.includes('dispar')) {
      msgSentIdx = index;
    } else if (header.includes('conf') || header.includes('presen') || header.includes('ok') || header === 'confirmado') {
      msgConfirmedIdx = index;
    } else if (header.includes('resp') || header.includes('repl') || header.includes('retorn')) {
      msgRepliedIdx = index;
    }
  });

  // Fallbacks in case headers aren't detected by text
  if (nameIdx === -1 && rawHeaders.length > 0) nameIdx = 0;
  if (emailIdx === -1 && rawHeaders.length > 1) emailIdx = 1;
  if (phoneIdx === -1 && rawHeaders.length > 2) phoneIdx = 2;
  if (categoryIdx === -1 && rawHeaders.length > 3) categoryIdx = 3;

  const parsedClients: Client[] = [];
  const today = new Date().toISOString().split('T')[0];

  // Helper to parse boolean values in Portuguese & English
  const parseBool = (val: string): boolean => {
    if (!val) return false;
    const normalized = val.toLowerCase();
    return (
      normalized === 'sim' ||
      normalized === 's' ||
      normalized === 'true' ||
      normalized === '1' ||
      normalized === 'ok' ||
      normalized === 'confirmado' ||
      normalized === 'yes' ||
      normalized === 'y'
    );
  };

  for (let i = 1; i < lines.length; i++) {
    const cells = splitCSVLine(lines[i], separator);
    if (cells.length === 0 || (cells.length === 1 && cells[0] === '')) {
      continue;
    }

    const name = nameIdx !== -1 && cells[nameIdx] ? cells[nameIdx] : `Cliente #${i}`;
    const email = emailIdx !== -1 && cells[emailIdx] ? cells[emailIdx] : 'sem@email.com';
    const phone = phoneIdx !== -1 && cells[phoneIdx] ? cells[phoneIdx] : '(00) 00000-0000';
    const category = categoryIdx !== -1 && cells[categoryIdx] ? cells[categoryIdx] : 'Mensalista';

    // Parse flags. If not mapped, set logical cascading (replied needs confirmed, confirmed needs sent, etc. or defaults)
    const msgSent = msgSentIdx !== -1 && cells[msgSentIdx] ? parseBool(cells[msgSentIdx]) : true;
    const msgConfirmed = msgConfirmedIdx !== -1 && cells[msgConfirmedIdx] ? parseBool(cells[msgConfirmedIdx]) : false;
    const msgReplied = msgRepliedIdx !== -1 && cells[msgRepliedIdx] ? parseBool(cells[msgRepliedIdx]) : false;

    parsedClients.push({
      id: `c-csv-${Date.now()}-${i}`,
      name,
      email,
      phone,
      category,
      msgSent,
      // If confirmed or replied is true, sent must logically be true as well
      msgConfirmed: msgConfirmed || msgReplied,
      msgReplied,
      registeredAt: today,
    });
  }

  return parsedClients;
}

/**
 * Generates an example CSV string that users can download.
 */
export function generateCSVSample(): string {
  return `Nome;E-mail;Telefone;Categoria;Mensagem Enviada;Confirmado;Respondido
Carlos Andrade;carlos.andrade@email.com;(11) 99888-1111;Mensalista;Sim;Sim;Sim
Mariana Castro;mariana.castro@email.com;(21) 98877-2222;Anual;Sim;Sim;Nao
Rodrigo Vangelino;rodrigo.vangelino@email.com;(15) 99122-3333;VIP;Sim;Nao;Nao
Juliana Mendes;juliana.mendes@email.com;(31) 97755-4444;Mensalista;Nao;Nao;Nao
Lucas Oliveira;lucas.oliveira@email.com;(47) 99233-5555;Semestral;Sim;Sim;Sim`;
}
