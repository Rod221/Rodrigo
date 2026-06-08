import { motion } from 'motion/react';
import { Users, Send, CheckCircle2, MessageSquareText, FileSpreadsheet } from 'lucide-react';
import { Client } from '../types';

interface DashboardStatsProps {
  clients: Client[];
}

export default function DashboardStats({ clients }: DashboardStatsProps) {
  const total = clients.length;
  const sent = clients.filter((c) => c.msgSent).length;
  const confirmed = clients.filter((c) => c.msgConfirmed).length;
  const replied = clients.filter((c) => c.msgReplied).length;

  const confirmedPercentage = total > 0 ? Math.round((confirmed / total) * 100) : 0;
  const repliedPercentage = total > 0 ? Math.round((replied / total) * 100) : 0;
  const sentPercentage = total > 0 ? Math.round((sent / total) * 100) : 0;

  const cards = [
    {
      id: 'stat-total',
      title: 'Clientes Cadastrados',
      value: total,
      subtext: 'Clientes ativos no sistema',
      icon: Users,
      color: 'from-blue-500/10 to-indigo-500/10',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600',
      percentage: 100,
      percentageLabel: 'Base total de registros',
    },
    {
      id: 'stat-sent',
      title: 'Mensagens Enviadas',
      value: sent,
      subtext: `${sentPercentage}% de alcance da base`,
      icon: Send,
      color: 'from-amber-500/10 to-orange-500/10',
      textColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600',
      percentage: sentPercentage,
      percentageLabel: 'Disparos executados',
    },
    {
      id: 'stat-confirmed',
      title: 'Confirmações Recebidas',
      value: confirmed,
      subtext: `${confirmedPercentage}% dos clientes cadastrados`,
      icon: CheckCircle2,
      color: 'from-emerald-500/10 to-teal-500/10',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600',
      percentage: confirmedPercentage,
      percentageLabel: 'Presença/Recebimento garantido',
    },
    {
      id: 'stat-replied',
      title: 'Mensagens Respondidas',
      value: replied,
      subtext: `${repliedPercentage}% de engajamento ativo`,
      icon: MessageSquareText,
      color: 'from-purple-500/10 to-pink-500/10',
      textColor: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600',
      percentage: repliedPercentage,
      percentageLabel: 'Interações ativas de volta',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" id="stats-container">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            id={card.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className={`relative overflow-hidden bg-gradient-to-br ${card.color} border border-slate-100 rounded-2xl p-6 transition-all duration-300 hover:shadow-md`}
          >
            {/* Visual background ambient details */}
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 pointer-events-none">
              <Icon size={120} strokeWidth={1} />
            </div>

            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 font-sans">{card.title}</p>
                <h3 className="text-3xl font-bold tracking-tight text-slate-900 mt-2 font-sans">
                  {card.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                <Icon size={22} />
              </div>
            </div>

            <div className="mt-5">
              <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-1.5">
                <span>{card.percentageLabel}</span>
                <span className="font-bold">{card.percentage}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${card.percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={`h-full rounded-full ${
                    card.id === 'stat-total'
                      ? 'bg-indigo-500'
                      : card.id === 'stat-sent'
                      ? 'bg-amber-500'
                      : card.id === 'stat-confirmed'
                      ? 'bg-emerald-500'
                      : 'bg-purple-500'
                  }`}
                />
              </div>
              <p className="text-xs text-slate-600 mt-2.5 font-sans leading-relaxed">
                {card.subtext}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
