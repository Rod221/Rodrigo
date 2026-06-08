import { useState } from 'react';
import { Search, UserPlus, Edit2, Trash2, SlidersHorizontal, CheckCircle2, Send, MessageSquareText, FileX, RefreshCw } from 'lucide-react';
import { Client } from '../types';

interface ClientTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
  onToggleStatus: (id: string, field: 'msgSent' | 'msgConfirmed' | 'msgReplied') => void;
  onLoadMock: () => void;
}

export default function ClientTable({
  clients,
  onEdit,
  onDelete,
  onAddClick,
  onToggleStatus,
  onLoadMock,
}: ClientTableProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Filter lists based on inputs
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase()) ||
      client.phone.includes(search);

    const matchesCategory = categoryFilter === 'Todas' || client.category === categoryFilter;

    let matchesStatus = true;
    if (statusFilter === 'sent') {
      matchesStatus = client.msgSent;
    } else if (statusFilter === 'confirmed') {
      matchesStatus = client.msgConfirmed;
    } else if (statusFilter === 'replied') {
      matchesStatus = client.msgReplied;
    } else if (statusFilter === 'pending') {
      matchesStatus = !client.msgSent;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col" id="client-table-root">
      
      {/* Search & Filters block */}
      <div className="p-5 border-b border-slate-150 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50" id="table-controls-panel">
        
        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={16} />
          </span>
          <input
            id="table-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou telefone..."
            className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filters dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category selection */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal size={13} className="text-slate-400" />
            <select
              id="table-filter-category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="Todas">Todas Planos</option>
              <option value="Mensalista">Mensalista</option>
              <option value="Semestral">Semestral</option>
              <option value="Anual">Anual</option>
              <option value="VIP">VIP</option>
              <option value="Avulso">Avulso</option>
            </select>
          </div>

          {/* Message Status filter selection */}
          <div>
            <select
              id="table-filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="Todos">Todos Statuses</option>
              <option value="sent">Enviado</option>
              <option value="confirmed">Confirmado (Sim)</option>
              <option value="replied">Respondido (Sim)</option>
              <option value="pending">Pendente Envio</option>
            </select>
          </div>

          {/* Quick Clear filters */}
          {(search || categoryFilter !== 'Todas' || statusFilter !== 'Todos') && (
            <button
              id="clear-filters-btn"
              onClick={() => {
                setSearch('');
                setCategoryFilter('Todas');
                setStatusFilter('Todos');
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              Limpar Filtros
            </button>
          )}

          {/* Register Button */}
          <button
            id="register-client-btn"
            onClick={onAddClick}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer ml-auto lg:ml-2"
          >
            <UserPlus size={14} /> Cadastrar Novo
          </button>
        </div>
      </div>

      {/* Roster Table Content */}
      <div className="overflow-x-auto" id="table-scroll-wrapper">
        {filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center" id="empty-table-view">
            <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl mb-3 shrink-0">
              <FileX size={32} />
            </div>
            <h5 className="font-bold text-slate-700 text-sm font-sans">Nenhum cliente cadastrado</h5>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Não encontramos nenhum registro correspondente aos filtros aplicados na pesquisa corrente.
            </p>
            {clients.length === 0 ? (
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                <button
                  id="empty-add-btn"
                  onClick={onAddClick}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Cadastrar Primeiro Cliente
                </button>
                <button
                  id="empty-load-mock-btn"
                  onClick={onLoadMock}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  <RefreshCw size={13} /> Carregar Amostras Prontas
                </button>
              </div>
            ) : (
              <button
                id="reset-filter-scenar"
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('Todas');
                  setStatusFilter('Todos');
                }}
                className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
              >
                Resetar Filtros e Mostrar Todos
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left border-collapse" id="clients-roster-table">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/20 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">Cliente</th>
                <th className="py-3.5 px-5">Categoria / Contrato</th>
                <th className="py-3.5 px-4 text-center">Enviado</th>
                <th className="py-3.5 px-4 text-center">Confirmado (Sim)</th>
                <th className="py-3.5 px-4 text-center">Respondido</th>
                <th className="py-3.5 px-4">Cadastro em</th>
                <th className="py-3.5 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-sans">
              {filteredClients.map((client) => {
                return (
                  <tr
                    key={client.id}
                    id={`row-${client.id}`}
                    className="hover:bg-slate-50/40 transition-colors"
                  >
                    {/* Column 1: Client Card Details */}
                    <td className="py-3 px-5">
                      <div>
                        <p className="font-bold text-slate-800 leading-tight block">{client.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                          <span>{client.email}</span>
                          {client.phone && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span>{client.phone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Category Plan */}
                    <td className="py-3 px-5">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        client.category === 'VIP'
                          ? 'bg-purple-50 text-purple-700 border border-purple-100'
                          : client.category === 'Anual'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : client.category === 'Mensalista'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-150'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {client.category || 'Mensalista'}
                      </span>
                    </td>

                    {/* Column 3: Checkbox msgSent slider */}
                    <td className="py-3 px-4 text-center">
                      <button
                        id={`toggle-sent-${client.id}`}
                        type="button"
                        onClick={() => onToggleStatus(client.id, 'msgSent')}
                        className={`mx-auto flex items-center justify-center p-1.5 rounded-full border transition-all duration-200 cursor-pointer ${
                          client.msgSent
                            ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                            : 'bg-slate-50 border-slate-200 text-slate-300 hover:bg-slate-100 hover:text-slate-400'
                        }`}
                        title={client.msgSent ? 'Marcar como não disparado' : 'Marcar como disparado'}
                      >
                        <Send size={13} className={client.msgSent ? 'fill-current' : ''} />
                      </button>
                    </td>

                    {/* Column 4: Checkbox msgConfirmed slider */}
                    <td className="py-3 px-4 text-center">
                      <button
                        id={`toggle-confirmed-${client.id}`}
                        type="button"
                        onClick={() => onToggleStatus(client.id, 'msgConfirmed')}
                        className={`mx-auto flex items-center justify-center p-1.5 rounded-full border transition-all duration-200 cursor-pointer ${
                          client.msgConfirmed
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                            : 'bg-slate-50 border-slate-200 text-slate-300 hover:bg-slate-100 hover:text-slate-400'
                        }`}
                        title={client.msgConfirmed ? 'Marcar como não confirmado' : 'Marcar como confirmado'}
                      >
                        <CheckCircle2 size={13} className={client.msgConfirmed ? 'fill-current' : ''} />
                      </button>
                    </td>

                    {/* Column 5: Checkbox msgReplied slider */}
                    <td className="py-3 px-4 text-center">
                      <button
                        id={`toggle-replied-${client.id}`}
                        type="button"
                        onClick={() => onToggleStatus(client.id, 'msgReplied')}
                        className={`mx-auto flex items-center justify-center p-1.5 rounded-full border transition-all duration-200 cursor-pointer ${
                          client.msgReplied
                            ? 'bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100'
                            : 'bg-slate-50 border-slate-200 text-slate-300 hover:bg-slate-100 hover:text-slate-400'
                        }`}
                        title={client.msgReplied ? 'Marcar como não respondido' : 'Marcar como respondido'}
                      >
                        <MessageSquareText size={13} className={client.msgReplied ? 'fill-current' : ''} />
                      </button>
                    </td>

                    {/* Column 6: Registration date */}
                    <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">
                      {client.registeredAt ? new Date(client.registeredAt + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'}
                    </td>

                    {/* Column 7: Actions Editing/Trash */}
                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          id={`edit-btn-${client.id}`}
                          onClick={() => onEdit(client)}
                          type="button"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar cliente"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          id={`del-btn-${client.id}`}
                          onClick={() => onDelete(client.id)}
                          type="button"
                          className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir cadastro"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer statistics counter and reset trigger */}
      <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500" id="table-footer">
        <span>Mostrando <strong className="font-bold text-slate-700">{filteredClients.length}</strong> de <strong className="font-bold text-slate-700">{clients.length}</strong> clientes</span>
        {clients.length > 0 && (
          <button
            id="wipe-table-btn"
            onClick={() => {
              if (confirm('Tem certeza de que deseja apagar TODOS os clientes cadastrados? Esta operação é irreversível.')) {
                onDelete('__ALL__');
              }
            }}
            className="text-red-500 hover:text-red-650 font-semibold cursor-pointer"
          >
            Limpar todos os registros
          </button>
        )}
      </div>
    </div>
  );
}
