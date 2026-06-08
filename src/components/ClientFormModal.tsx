import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { X, User, Mail, Phone, Bookmark, CheckCircle, Send, MessageSquare } from 'lucide-react';
import { Client } from '../types';

interface ClientFormModalProps {
  client: Client | null; // Null means we are creating a new one
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
}

export default function ClientFormModal({ client, isOpen, onClose, onSave }: ClientFormModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Mensalista');
  const [msgSent, setMsgSent] = useState(false);
  const [msgConfirmed, setMsgConfirmed] = useState(false);
  const [msgReplied, setMsgReplied] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  // Sincronizar inputs quando o client para edição muda
  useEffect(() => {
    if (client) {
      setName(client.name);
      setEmail(client.email);
      setPhone(client.phone);
      setCategory(client.category || 'Mensalista');
      setMsgSent(client.msgSent);
      setMsgConfirmed(client.msgConfirmed);
      setMsgReplied(client.msgReplied);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setCategory('Mensalista');
      setMsgSent(false);
      setMsgConfirmed(false);
      setMsgReplied(false);
    }
    setErrorMsg('');
  }, [client, isOpen]);

  if (!isOpen) return null;

  // Mask Phone Input simple helper
  const maskPhone = (value: string) => {
    const raw = value.replace(/\D/g, '');
    if (raw.length <= 11) {
      if (raw.length > 6) {
        return `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
      } else if (raw.length > 2) {
        return `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
      }
      return raw;
    }
    return value;
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPhone(maskPhone(e.target.value));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('O nome do cliente é obrigatório.');
      return;
    }

    // Auto logical cascading:
    // If replied or confirmed is true, msgSent must be true
    let finalSent = msgSent;
    if (msgConfirmed || msgReplied) {
      finalSent = true;
    }

    const generatedId = client ? client.id : `c-${Date.now()}`;
    const registeredAt = client ? client.registeredAt : new Date().toISOString().split('T')[0];

    onSave({
      id: generatedId,
      name: name.trim(),
      email: email.trim() || 'sem@email.com',
      phone: phone.trim() || '(00) 00000-0000',
      category: category,
      msgSent: finalSent,
      msgConfirmed: msgConfirmed,
      msgReplied: msgReplied,
      registeredAt,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" id="form-modal-overlay">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden" id="form-modal-content">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100 dark:bg-slate-950/40">
          <h3 className="font-bold text-slate-800 text-base font-sans" id="modal-title">
            {client ? 'Editar Cadastro do Cliente' : 'Cadastrar Novo Cliente'}
          </h3>
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4" id="client-form">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100" id="form-error-banner">
              {errorMsg}
            </div>
          )}

          {/* 1. Nome Input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nome Completo</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <User size={16} />
              </span>
              <input
                id="form-input-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João da Silva Gomes"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 2. Email Input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">E-mail</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  id="form-input-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* 3. Telefone Input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Telefone / Celular</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Phone size={16} />
                </span>
                <input
                  id="form-input-phone"
                  type="text"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(11) 98765-4321"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* 4. Categoria select */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Categoria do Contrato</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Bookmark size={16} />
              </span>
              <select
                id="form-select-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
              >
                <option value="Mensalista">Mensalista (Mensal)</option>
                <option value="Semestral">Semestral (6 meses)</option>
                <option value="Anual">Anual (12 meses)</option>
                <option value="VIP">VIP / Cortesia</option>
                <option value="Avulso">Avulso / Esporádico</option>
              </select>
            </div>
          </div>

          {/* 5. Status de mensagens checkboxes */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Status de Fluxo e Comunicação</h4>
            
            <div className="space-y-3">
              {/* Checkbox A: Sent */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-150 hover:bg-slate-50/50 transition-colors cursor-pointer" id="chk-label-sent">
                <input
                  id="form-chk-sent"
                  type="checkbox"
                  checked={msgSent || msgConfirmed || msgReplied}
                  disabled={msgConfirmed || msgReplied} // Locked true if deeper status is true
                  onChange={(e) => setMsgSent(e.target.checked)}
                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                />
                <div>
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-700">
                    <Send size={12} className="text-amber-500" /> Mensagem de Confirmação Enviada
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">O convite ou lembrete de confirmação foi encaminhado ao cliente.</p>
                </div>
              </label>

              {/* Checkbox B: Confirmed */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-150 hover:bg-slate-50/50 transition-colors cursor-pointer" id="chk-label-confirmed">
                <input
                  id="form-chk-confirmed"
                  type="checkbox"
                  checked={msgConfirmed}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setMsgConfirmed(checked);
                    if (checked) {
                      setMsgSent(true); // Cascade sent true
                    }
                  }}
                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                />
                <div>
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-700">
                    <CheckCircle size={12} className="text-emerald-500" /> Cliente Confirmou (Presença / Plano)
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">O cliente indicou de forma explícita que confirma a presença ou recebimento.</p>
                </div>
              </label>

              {/* Checkbox C: Replied */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-150 hover:bg-slate-50/50 transition-colors cursor-pointer" id="chk-label-replied">
                <input
                  id="form-chk-replied"
                  type="checkbox"
                  checked={msgReplied}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setMsgReplied(checked);
                    if (checked) {
                      setMsgConfirmed(true); // Cascade confirmed true (and sent to true via confirmed trigger)
                      setMsgSent(true);
                    }
                  }}
                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                />
                <div>
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-700">
                    <MessageSquare size={12} className="text-purple-500" /> Cliente Respondeu à Mensagem
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Houve uma interação dialogada e resposta de volta do cliente.</p>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              id="form-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold font-sans text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="form-save-btn"
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-xs font-bold text-white rounded-xl shadow-sm transition-all cursor-pointer"
            >
              {client ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
