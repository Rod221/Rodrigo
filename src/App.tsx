import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileDown, 
  RefreshCw, 
  UserPlus, 
  FileSpreadsheet, 
  Calendar, 
  Mail, 
  LayoutDashboard, 
  Users, 
  Upload, 
  Database, 
  CheckCircle, 
  Clock, 
  Menu, 
  X,
  MessageSquare,
  Search,
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import { Client } from './types';
import { initialClients } from './data/mockData';
import { generateClientReportPDF } from './utils/pdfGenerator';

// Subcomponents imports
import DashboardStats from './components/DashboardStats';
import CustomCharts from './components/CustomCharts';
import ClientTable from './components/ClientTable';
import CsvImporter from './components/CsvImporter';
import ClientFormModal from './components/ClientFormModal';

const STORAGE_KEY = 'gestao_clientes_database_v1';
const USER_EMAIL = 'rodrigovangelino45@gmail.com';

export default function App() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  // Navigation active tab
  const [activeView, setActiveView] = useState<'dashboard' | 'clients' | 'import'>('dashboard');
  
  // Mobile navigation sidebar state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load clients database on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setClients(JSON.parse(stored));
      } catch (e) {
        setClients(initialClients);
      }
    } else {
      setClients(initialClients);
    }
  }, []);

  // Save clients list helper
  const saveClientsToDatabase = (updatedList: Client[]) => {
    setClients(updatedList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  };

  // Add or Edit Client save callback
  const handleSaveClient = (client: Client) => {
    const index = clients.findIndex((c) => c.id === client.id);
    let updated: Client[];

    if (index !== -1) {
      // Edit existing
      updated = [...clients];
      updated[index] = client;
    } else {
      // Add new
      updated = [client, ...clients];
    }

    saveClientsToDatabase(updated);
    setIsModalOpen(false);
    setEditingClient(null);
  };

  // Single client deletion or full wipe
  const handleDeleteClient = (id: string) => {
    if (id === '__ALL__') {
      saveClientsToDatabase([]);
    } else {
      const updated = clients.filter((c) => c.id !== id);
      saveClientsToDatabase(updated);
    }
  };

  // Switch Quick messaging status toggles directly from table
  const handleToggleStatus = (id: string, field: 'msgSent' | 'msgConfirmed' | 'msgReplied') => {
    const updated = clients.map((c) => {
      if (c.id === id) {
        const nextVal = !c[field];
        const newRecord = { ...c, [field]: nextVal };

        // Cascade logics for communication flow:
        if (field === 'msgReplied' && nextVal === true) {
          // If customer replied, they must have received and had message sent
          newRecord.msgConfirmed = true;
          newRecord.msgSent = true;
        } else if (field === 'msgConfirmed' && nextVal === true) {
          // If customer confirmed, message must have been sent
          newRecord.msgSent = true;
        } else if (field === 'msgSent' && nextVal === false) {
          // If message was never sent, they couldn't have confirmed or replied
          newRecord.msgConfirmed = false;
          newRecord.msgReplied = false;
        } else if (field === 'msgConfirmed' && nextVal === false) {
          // If we undo confirmed, we also undo replied
          newRecord.msgReplied = false;
        }

        return newRecord;
      }
      return c;
    });

    saveClientsToDatabase(updated);
  };

  // Handle CSV Import
  const handleCsvImport = (importedList: Client[], replace: boolean) => {
    if (replace) {
      saveClientsToDatabase(importedList);
    } else {
      // Append without duplicate emails or phones (upsert)
      const merged = [...clients];
      importedList.forEach((newClient) => {
        const duplicateIdx = merged.findIndex(
          (c) => c.email.toLowerCase() === newClient.email.toLowerCase() && c.email !== 'sem@email.com'
        );
        if (duplicateIdx !== -1) {
          merged[duplicateIdx] = { ...newClient, id: merged[duplicateIdx].id }; // updates matching email
        } else {
          merged.push(newClient);
        }
      });
      saveClientsToDatabase(merged);
    }
    // Switch view to clients after success CSV upload
    setActiveView('clients');
  };

  // Reload initial mockup list
  const handleLoadMockData = () => {
    saveClientsToDatabase(initialClients);
  };

  // Export Executive PDF Report
  const handleExportPDF = () => {
    generateClientReportPDF(clients, USER_EMAIL);
  };

  const todayText = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Calculate top/recent records
  const recentClients = [...clients].slice(0, 5);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden" id="app-root-workflow">
      
      {/* 1. BRANDING SIDEBAR (Professional Polish Theme Style) */}
      <aside className="hidden md:flex w-64 bg-slate-900 flex-col text-slate-300 shrink-0 border-r border-slate-800" id="sidebar-container">
        {/* Sidebar Header */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/40">
          <div className="w-9 h-9 bg-indigo-650 rounded-xl flex items-center justify-center text-white font-extrabold tracking-tight text-lg shadow-inner">
            C
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black text-white tracking-tight leading-none">ClientFlow</span>
            <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-1 leading-none">Professional</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5" id="sidebar-navigation">
          <button
            id="nav-btn-dashboard"
            onClick={() => {
              setActiveView('dashboard');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
              activeView === 'dashboard'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <LayoutDashboard size={16} />
            Visão Geral / Dashboard
          </button>
          
          <button
            id="nav-btn-clients"
            onClick={() => {
              setActiveView('clients');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
              activeView === 'clients'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <Users size={16} />
            Gerenciar Clientes
          </button>

          <button
            id="nav-btn-import"
            onClick={() => {
              setActiveView('import');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
              activeView === 'import'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <Upload size={16} />
            Importar Planilhas (CSV)
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 mt-auto border-t border-slate-800 text-[10px] text-slate-500 font-mono">
          <div>Versão 2.4.0 • Enterprise</div>
          <div className="text-slate-600 mt-1">GCP Cloud Build</div>
        </div>
      </aside>

      {/* MOBILE HEADER & MENUS */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 flex flex-col text-slate-300 p-5 z-50 mr-12"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-6 mb-4 border-b border-slate-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black">C</div>
                  <span className="text-base font-bold text-white tracking-tight">ClientFlow</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-1.5 flex-1">
                <button
                  onClick={() => { setActiveView('dashboard'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold ${
                    activeView === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-850'
                  }`}
                >
                  <LayoutDashboard size={15} /> Dashboard
                </button>
                <button
                  onClick={() => { setActiveView('clients'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold ${
                    activeView === 'clients' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-850'
                  }`}
                >
                  <Users size={15} /> Clientes
                </button>
                <button
                  onClick={() => { setActiveView('import'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold ${
                    activeView === 'import' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-850'
                  }`}
                >
                  <Upload size={15} /> Importar CSV
                </button>
              </div>

              <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                Versão 2.4.0 (Enterprise)
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. MAIN APPLICATION WORKSPACE COLUMN */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden" id="app-workspace-body">
        
        {/* MAIN VISUAL HEADER */}
        <header className="h-20 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between shrink-0" id="main-header">
          <div className="flex items-center gap-3">
            {/* Mobile Nav Button */}
            <button
              id="mobile-nav-toggle"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg md:hidden cursor-pointer shrink-0"
            >
              <Menu size={20} />
            </button>
            
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight" id="header-dynamic-title">
                {activeView === 'dashboard' && 'Visão Geral do Sistema'}
                {activeView === 'clients' && 'Espaço Carteira de Clientes'}
                {activeView === 'import' && 'Importação em Massa via CSV'}
              </h2>
              <p className="text-xs text-slate-500 hidden sm:block">
                {activeView === 'dashboard' && 'Gestão centralizada de clientes e comunicações com gráficos reais'}
                {activeView === 'clients' && 'Controle cadastral, filtros em tempo real e status de mensagens'}
                {activeView === 'import' && 'Importador inteligente com mapeamento flexível de tabelas'}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {activeView === 'import' ? (
              <button
                id="header-back-to-clients"
                onClick={() => setActiveView('clients')}
                className="flex items-center gap-1.5 px-3 py-2 text-slate-700 bg-slate-100 hover:bg-slate-250 transition border border-slate-200 rounded-xl font-bold text-xs cursor-pointer"
              >
                Voltar aos Clientes
              </button>
            ) : (
              clients.length > 0 && (
                <button
                  id="header-export-pdf"
                  onClick={handleExportPDF}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-200 shadow-sm transition cursor-pointer"
                  title="Exportar tudo em PDF executivo de alta fidelidade"
                >
                  <FileDown size={14} /> Exportar PDF
                </button>
              )
            )}

            <button
              id="header-create-client"
              onClick={() => {
                setEditingClient(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm shadow-indigo-600/10 transition cursor-pointer"
            >
              <UserPlus size={14} /> Novo Cliente
            </button>
          </div>
        </header>

        {/* DYNAMIC SCREEN CONTENT VIEW */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6" id="workspace-dynamic-container">
          
          {/* VIEW A: CONSOLIDATED DASHBOARD */}
          {activeView === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
              id="dashboard-view-panel"
            >
              {/* Statistical counters */}
              <DashboardStats clients={clients} />

              {/* Graphic charts component with vector render bars */}
              <CustomCharts clients={clients} />

              {/* Segment Split Grid matching Professional Polish aesthetics */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Visual guideline card */}
                <div className="lg:col-span-7 bg-white border border-slate-200 shadow-xs rounded-xl p-6 flex flex-col justify-between min-h-[220px]">
                  <div>
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                       <Database className="text-indigo-600" size={17} />
                       Controle Operacional Integrado
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 lines-relaxed">
                      Este sistema armazena todos os cadastros localmente para garantir sua privacidade e soberania de dados. 
                      Adicione registros manualmente ou use planilhas em massa, atualize estados com botões de alternação rápida, 
                      e gere relatórios complexos em PDF para impressão.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-lg text-xs font-semibold text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block"></span>
                        Zebra styling nas tabelas
                      </div>
                      <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-lg text-xs font-semibold text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 block"></span>
                        Mapeador inteligente de CSV
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> Última atualização em tempo de execução
                    </span>
                    <button
                      id="view-table-direct-arrow"
                      onClick={() => setActiveView('clients')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                    >
                      Ir para carteira de clientes &rarr;
                    </button>
                  </div>
                </div>

                {/* Real-time Roster list match: "Últimos Registros" */}
                <div className="lg:col-span-5 bg-white border border-slate-200 shadow-xs rounded-xl flex flex-col min-h-[225px]" id="dashboard-recent-card">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
                      Últimos Registros
                    </h3>
                    <button
                      id="see-all-badge"
                      onClick={() => setActiveView('clients')}
                      className="text-[10px] bg-indigo-50 text-indigo-650 px-2 py-0.5 rounded-full font-bold cursor-pointer hover:bg-indigo-100 transition"
                    >
                      Ver Todos
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto px-4 divide-y divide-slate-100">
                    {recentClients.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs py-8">
                        Lista vazia
                      </div>
                    ) : (
                      recentClients.map((client) => {
                        // Classify status badges
                        let badgeBg = 'bg-slate-50 text-slate-600';
                        let badgeLabel = 'PENDENTE';
                        if (client.msgReplied) {
                          badgeBg = 'bg-purple-50 text-purple-700';
                          badgeLabel = 'RESPONDIDO';
                        } else if (client.msgConfirmed) {
                          badgeBg = 'bg-emerald-50 text-emerald-700';
                          badgeLabel = 'CONFIRMADO';
                        } else if (client.msgSent) {
                          badgeBg = 'bg-amber-50 text-amber-700';
                          badgeLabel = 'ENVIADO';
                        }

                        return (
                          <div key={client.id} className="flex items-center justify-between py-3 text-xs">
                            <div className="min-w-0">
                              <div className="font-bold text-slate-800 truncate">{client.name}</div>
                              <div className="text-[10px] text-slate-400 truncate mt-0.5">{client.email || 'sem@email.com'}</div>
                            </div>
                            <span className={`px-2 py-0.5 ${badgeBg} rounded-full text-[9px] font-bold tracking-wider shrink-0`}>
                              {badgeLabel}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* VIEW B: DETAILED CLIENTS PORTFOLIO ROSTER */}
          {activeView === 'clients' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              id="clients-view-panel"
            >
              <ClientTable
                clients={clients}
                onEdit={(client) => {
                  setEditingClient(client);
                  setIsModalOpen(true);
                }}
                onDelete={handleDeleteClient}
                onAddClick={() => {
                  setEditingClient(null);
                  setIsModalOpen(true);
                }}
                onToggleStatus={handleToggleStatus}
                onLoadMock={handleLoadMockData}
              />
            </motion.div>
          )}

          {/* VIEW C: CSV IMPORTER WORK BENCH */}
          {activeView === 'import' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              id="import-view-panel"
            >
              <CsvImporter onImport={handleCsvImport} />
            </motion.div>
          )}

        </div>

        {/* GLOBAL APPLICATION FOOTER */}
        <footer className="h-10 bg-white border-t border-slate-200 px-6 sm:px-8 flex items-center justify-between text-[11px] text-slate-400 font-medium shrink-0" id="main-footer">
          <div className="flex gap-6 items-center">
            <span className="hidden sm:inline">Sistema operacional ativo</span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> 
              Banco de dados conectado ({clients.length} registros)
            </span>
          </div>
          <div>Gerado em tempo real às 19:22 • {USER_EMAIL}</div>
        </footer>

      </main>

      {/* 3. MODALS AND SAVE/EDIT INTERFACES */}
      <ClientFormModal
        client={editingClient}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClient(null);
        }}
        onSave={handleSaveClient}
      />

    </div>
  );
}
