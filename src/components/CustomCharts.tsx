import { useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, PieChart, Info, HelpCircle } from 'lucide-react';
import { Client } from '../types';

interface CustomChartsProps {
  clients: Client[];
}

export default function CustomCharts({ clients }: CustomChartsProps) {
  const [activeTooltip, setActiveTooltip] = useState<{ id: string; val: number; label: string; x: number; y: number } | null>(null);

  const total = clients.length;
  const sent = clients.filter((c) => c.msgSent).length;
  const confirmed = clients.filter((c) => c.msgConfirmed).length;
  const replied = clients.filter((c) => c.msgReplied).length;

  // Calculando categorias para o gráfico de rosca
  const engaged = clients.filter((c) => c.msgConfirmed && c.msgReplied).length;
  const justConfirmed = clients.filter((c) => c.msgConfirmed && !c.msgReplied).length;
  const pendingResponse = clients.filter((c) => c.msgSent && !c.msgConfirmed).length;
  const notSent = clients.filter((c) => !c.msgSent).length;

  const barData = [
    { id: 'total', label: 'Cadastrados', value: total, color: '#4f46e5', hoverBg: '#4338ca' }, // indigo
    { id: 'sent', label: 'Disparados', value: sent, color: '#f59e0b', hoverBg: '#d97706' }, // amber
    { id: 'confirmed', label: 'Confirmados', value: confirmed, color: '#10b981', hoverBg: '#059669' }, // emerald
    { id: 'replied', label: 'Respondidos', value: replied, color: '#8b5cf6', hoverBg: '#7c3aed' }, // violet
  ];

  const donutParts = [
    { label: 'Engajado (Conf + Resp)', value: engaged, color: '#897bf8' },
    { label: 'Apenas Confirmado', value: justConfirmed, color: '#10b981' },
    { label: 'Enviado s/ Retorno', value: pendingResponse, color: '#f59e0b' },
    { label: 'Não Enviada', value: notSent, color: '#cbd5e1' },
  ].filter(d => d.value > 0); // Only render parts with > 0 items

  // SVG parameters for Bar Chart
  const svgW = 480;
  const svgH = 260;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartW = svgW - paddingLeft - paddingRight;
  const chartH = svgH - paddingTop - paddingBottom;

  const maxVal = Math.max(...barData.map((d) => d.value), 5);
  const roundedMaxVal = Math.ceil(maxVal / 5) * 5; // Round to nearest 5 for grid lines

  // Y and X mapping helpers
  const getY = (val: number) => {
    return paddingTop + chartH - (val / roundedMaxVal) * chartH;
  };
  const barGap = 35;
  const totalBarWidths = chartW - barGap * (barData.length - 1);
  const barW = totalBarWidths / barData.length;

  // Donut SVG parameters
  const donutR = 60;
  const strokeW = 16;
  const donutCenter = 100;
  const totalDonutSum = engaged + justConfirmed + pendingResponse + notSent;

  let currentAngleOffset = 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-charts-grid">
      {/* 1. BAR CHART */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 rounded-2xl p-6" id="bar-chart-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-600" />
              Comparativo de Engajamento
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">Visão geral do funil de resposta e conversão</p>
          </div>
          <span className="text-[10px] bg-slate-100 px-2.5 py-1 rounded-full text-slate-500 font-mono flex items-center gap-1">
            <Info size={11} /> Valores Reais
          </span>
        </div>

        {/* SVG Render */}
        <div className="relative flex justify-center items-center w-full min-h-[260px]">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-lg select-none">
            {/* Grid Lines */}
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              const gridVal = (roundedMaxVal / 5) * idx;
              const y = getY(gridVal);
              return (
                <g key={`grid-${idx}`}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={svgW - paddingRight}
                    y2={y}
                    stroke="#eaeef3"
                    strokeWidth="0.8"
                    strokeDasharray="4 4"
                  />
                  {/* Y Axis Label */}
                  <text
                    x={paddingLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="9"
                    fill="#94a3b8"
                    fontFamily="monospace"
                  >
                    {gridVal}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {barData.map((d, index) => {
              const barX = paddingLeft + index * (barW + barGap);
              const barY = getY(d.value);
              const barHeightValue = Math.max(((d.value / roundedMaxVal) * chartH), 3); // minimum 3px bar so it shows

              return (
                <g
                  key={d.id}
                  className="cursor-pointer group"
                  onMouseEnter={(e) => {
                    setActiveTooltip({
                      id: d.id,
                      val: d.value,
                      label: d.label,
                      x: barX + barW / 2,
                      y: barY - 14,
                    });
                  }}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  {/* Decorative background column on hover */}
                  <rect
                    x={barX - 6}
                    y={paddingTop}
                    width={barW + 12}
                    height={chartH}
                    fill="transparent"
                    className="group-hover:fill-slate-50/50 transition-colors"
                  />

                  {/* The Actual Colored Bar */}
                  <motion.rect
                    x={barX}
                    y={svgH - paddingBottom}
                    width={barW}
                    initial={{ y: svgH - paddingBottom, height: 0 }}
                    animate={{ y: barY, height: barHeightValue }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100, delay: index * 0.1 }}
                    rx="4"
                    fill={d.color}
                    className="transition-all duration-300 group-hover:brightness-95"
                  />

                  {/* Value on Top of Bar when hovered */}
                  <text
                    x={barX + barW / 2}
                    y={barY - 6}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="#334155"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    {d.value}
                  </text>

                  {/* Label under the bar */}
                  <text
                    x={barX + barW / 2}
                    y={svgH - paddingBottom + 16}
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight="500"
                    fill="#64748b"
                  >
                    {d.label}
                  </text>
                </g>
              );
            })}

            {/* Tooltip in Bar Chart SVG */}
            {activeTooltip && (
              <g pointerEvents="none">
                <rect
                  x={activeTooltip.x - 55}
                  y={activeTooltip.y - 30}
                  width="110"
                  height="26"
                  rx="6"
                  fill="#1e293b"
                  opacity="0.95"
                />
                <text
                  x={activeTooltip.x}
                  y={activeTooltip.y - 14}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9.5"
                  fontWeight="bold"
                >
                  {activeTooltip.label}: {activeTooltip.val}
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* 2. DONUT ENGAGEMENT CIRCLE */}
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 rounded-2xl p-6" id="donut-chart-card">
        <div>
          <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <PieChart size={18} className="text-indigo-600" />
            Engajamento e Funil Geral
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">Fatias de status ativo dos contatos</p>
        </div>

        {totalDonutSum === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[220px] text-slate-400 text-xs">
            <HelpCircle size={36} className="text-slate-300 stroke-[1.5] mb-2 animate-pulse" />
            Nenhum dado cadastrado para filtrar
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-6 min-h-[190px]">
            {/* SVG Donut */}
            <div className="relative w-[180px] h-[180px] shrink-0">
              <svg width="180" height="180" viewBox="0 0 200 200" className="-rotate-90">
                {donutParts.map((part, index) => {
                  const fraction = part.value / totalDonutSum;
                  const strokeDashLength = fraction * (2 * Math.PI * donutR);
                  const strokeDashGap = (2 * Math.PI * donutR) - strokeDashLength;
                  const currentStrokeOffset = -currentAngleOffset;

                  // Advance offset for next slice
                  currentAngleOffset += strokeDashLength;

                  return (
                    <motion.circle
                      key={`donut-slice-${index}`}
                      cx={donutCenter}
                      cy={donutCenter}
                      r={donutR}
                      fill="transparent"
                      stroke={part.color}
                      strokeWidth={strokeW}
                      strokeDasharray={`${strokeDashLength} ${strokeDashGap}`}
                      strokeDashoffset={currentStrokeOffset}
                      strokeLinecap={fraction < 0.99 ? "round" : "butt"}
                      initial={{ strokeWidth: 0, opacity: 0 }}
                      animate={{ strokeWidth: strokeW, opacity: 1 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="transition-all duration-300 hover:brightness-95 hover:stroke-[20px] cursor-pointer"
                    />
                  );
                })}
              </svg>
              {/* Central counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-800 font-sans tracking-tight">
                  {totalDonutSum}
                </span>
                <span className="text-[10px] font-sans text-slate-400 font-medium">
                  Clientes
                </span>
              </div>
            </div>

            {/* Custom Interactive Legends */}
            <div className="flex-1 flex flex-col gap-2.5 w-full">
              {donutParts.map((part, idx) => {
                const percentage = Math.round((part.value / totalDonutSum) * 100);
                return (
                  <div key={idx} className="flex items-center justify-between text-xs border-b border-dashed border-slate-100 pb-1.5 last:border-b-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full block shrink-0" style={{ backgroundColor: part.color }} />
                      <span className="text-slate-600 font-medium leading-tight">{part.label}</span>
                    </div>
                    <span className="font-mono text-slate-400 font-bold ml-1">
                      {part.value} <span className="text-[10px] text-slate-400 font-normal">({percentage}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
