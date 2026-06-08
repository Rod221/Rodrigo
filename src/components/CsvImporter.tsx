import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, FileSpreadsheet, Download, HelpCircle, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { parseCSV, generateCSVSample } from '../utils/csvParser';
import { Client } from '../types';

interface CsvImporterProps {
  onImport: (importedClients: Client[], replace: boolean) => void;
}

export default function CsvImporter({ onImport }: CsvImporterProps) {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string; count?: number }>({ type: 'idle', message: '' });
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setStatus({
        type: 'error',
        message: 'Por favor, selecione um arquivo no formato .CSV válido.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          setStatus({
            type: 'error',
            message: 'Nenhum cliente válido pôde ser extraído do arquivo. Verifique o cabeçalhos do CSV.',
          });
          return;
        }

        onImport(parsed, importMode === 'replace');
        
        setStatus({
          type: 'success',
          message: `Sucesso! Importação concluída com sucesso.`,
          count: parsed.length,
        });

        // Auto-reset status message after 6 seconds
        setTimeout(() => {
          setStatus({ type: 'idle', message: '' });
        }, 6000);

      } catch (err) {
        setStatus({
          type: 'error',
          message: 'Erro interno ao processar o arquivo CSV. Certifique-se de que a formatação está correta.',
        });
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const downloadSampleCSV = () => {
    const csvContent = generateCSVSample();
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' }); // UTF-8 BOM
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_importacao_clientes.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 rounded-2xl p-6" id="csv-importer-panel">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-emerald-600" />
            Importação via Arquivo CSV
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">Cadastre múltiplos clientes instantaneamente usando planilhas</p>
        </div>

        {/* Import Mode Selector Toggle */}
        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl self-start lg:self-center">
          <button
            id="import-mode-append"
            type="button"
            onClick={() => setImportMode('append')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all duration-200 cursor-pointer ${
              importMode === 'append'
                ? 'bg-white shadow-sm text-slate-800 border border-slate-100'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Mesclar registros
          </button>
          <button
            id="import-mode-replace"
            type="button"
            onClick={() => setImportMode('replace')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all duration-200 cursor-pointer ${
              importMode === 'replace'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Substituir existentes
          </button>
        </div>
      </div>

      {/* Main drag area */}
      <div
        id="csv-drag-area"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-300 ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50/10'
            : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          id="csv-file-input"
          className="hidden"
          accept=".csv"
          onChange={handleFileChange}
        />

        <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 mb-3 shrink-0">
          <Upload size={24} />
        </div>

        <p className="text-sm font-semibold text-slate-700 text-center font-sans">
          Arraste e solte seu arquivo .CSV aqui ou{' '}
          <button
            id="csv-browse-btn"
            type="button"
            onClick={triggerFileInput}
            className="text-indigo-600 hover:text-indigo-700 underline font-semibold transition-all duration-200 cursor-pointer inline"
          >
            rebusque no computador
          </button>
        </p>
        <p className="text-xs text-slate-400 mt-1.5 text-center">Formato suportado: Planilha codificada em CSV (Separador de vírgula ou ponto-e-vírgula)</p>

        {/* Download CSV Helper Template Link */}
        <button
          id="download-template-csv"
          onClick={downloadSampleCSV}
          type="button"
          className="mt-5 flex items-center gap-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors cursor-pointer"
        >
          <Download size={14} /> Download Modelo .CSV de Exemplo
        </button>
      </div>

      {/* CSV Layout Explainer */}
      <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl p-4" id="csv-mapping-help-card">
        <h5 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <HelpCircle size={14} className="text-indigo-500" /> Como formatar seu arquivo CSV:
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          <div className="text-[11px] leading-relaxed text-slate-600">
            <span className="font-bold text-slate-800">Colunas Identificadas:</span> Nome, E-mail, Telefone, Categoria.
          </div>
          <div className="text-[11px] leading-relaxed text-slate-600">
            <span className="font-bold text-slate-800">Mapeador Inteligente:</span> Funciona com termos em inglês (Name, Phone, Email) ou português!
          </div>
          <div className="text-[11px] leading-relaxed text-slate-600">
            <span className="font-bold text-slate-800">Estado de Confirmação:</span> Use <span className="font-mono text-indigo-600">"Sim" / "Nao" / "True"</span> nas colunas de Mensagem.
          </div>
          <div className="text-[11px] leading-relaxed text-slate-600">
            <span className="font-bold text-slate-800">Tratamento de Dados:</span> Se omitir o status, o sistema assume 'Não enviado' / 'Pendente'.
          </div>
        </div>
      </div>

      {/* Import Feedbacks and Alert banners */}
      {status.type !== 'idle' && (
        <div
          id="csv-import-notif"
          className={`mt-4 p-4 rounded-xl border flex items-start gap-3 animate-fadeIn ${
            status.type === 'success'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
              : 'bg-red-50 border-red-100 text-red-800'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="text-sm font-semibold">{status.message}</p>
            {status.count && (
              <p className="text-xs mt-1 font-sans text-emerald-700 leading-normal">
                Adicionados <strong className="font-bold text-emerald-900">{status.count} novos clientes</strong> à lista. Os gráficos e relatórios gerados já refletem essa carga!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
