import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import {
  HydraulicSolution,
  formatPtNumber,
  formatSignificantPt,
  formatShortTime,
} from '../utils/hydraulics';

interface FiveStepsGuideProps {
  solution: HydraulicSolution;
  activeStep: number;
  onSelectStep: (step: number) => void;
}

export const FiveStepsGuide: React.FC<FiveStepsGuideProps> = ({
  solution,
  activeStep,
  onSelectStep,
}) => {
  const [useCm2Shortcut, setUseCm2Shortcut] = useState(false);

  const qStr = formatSignificantPt(solution.flowM3s, 5);
  const aStr = formatSignificantPt(solution.areaM2, 5);
  const r2Str = formatSignificantPt(solution.r2M2, 5);
  const rStr = formatPtNumber(solution.radiusM, 4);
  const dMStr = formatPtNumber(solution.diameterM, 4);

  const steps = [
    {
      num: 1,
      title: 'Arrumar as unidades (Volume em m³ e Tempo em segundos)',
      formula: 'V(m³) = Litros ÷ 1.000  |  t(s) = (h × 3.600) + (min × 60) + s',
      why: 'Como a velocidade está em metros por segundo (m/s), deixamos o volume em m³ e o tempo todo em segundos para as unidades conversarem entre si.',
      lines: [
        `Volume (V): ${formatPtNumber(solution.volumeLiters, 0)} litros ÷ 1.000 = ${formatPtNumber(solution.volumeM3, 3)} m³`,
        `Horas: ${solution.hours} h × 3.600 = ${formatPtNumber(solution.hoursInSeconds, 0)} s`,
        `Minutos: ${solution.minutes} min × 60 = ${formatPtNumber(solution.minutesInSeconds, 0)} s`,
        `Segundos restantes: + ${solution.seconds} s`,
      ],
      resultLabel: 'Unidades prontas',
      resultValue: `V = ${formatPtNumber(solution.volumeM3, 3)} m³  ·  t = ${formatPtNumber(solution.totalSeconds, 0)} s`,
    },
    {
      num: 2,
      title: 'Descobrir a vazão de água (Q = Volume ÷ Tempo)',
      formula: 'Q = V ÷ t',
      why: 'Dividimos o volume em m³ pelo tempo total em segundos para saber quanta água passa pelo cano a cada segundo.',
      lines: [
        `Q = ${formatPtNumber(solution.volumeM3, 3)} ÷ ${formatPtNumber(solution.totalSeconds, 0)}`,
        `Q = ${qStr} m³/s`,
        `Em litros por segundo (× 1.000): ≈ ${formatPtNumber(solution.flowLs, 2)} L/s`,
        `Comparação real: enche cerca de ${formatPtNumber(solution.bottles3LPerSec, 2)} garrafas de 3 litros por segundo`,
      ],
      resultLabel: 'Vazão encontrada',
      resultValue: `Q = ${qStr} m³/s (${formatPtNumber(solution.flowLs, 2)} L/s)`,
    },
    {
      num: 3,
      title: 'Descobrir a área da boca do cano (A = Vazão ÷ Velocidade)',
      formula: 'A = Q ÷ v',
      why: 'No sentido normal fazíamos Área × Velocidade = Vazão. Como agora estamos fazendo o caminho de volta para achar a Área, fazemos a operação contrária: dividimos.',
      lines: [
        `A = ${qStr} ÷ ${formatPtNumber(solution.velocityMs, 1)}`,
        `A = ${aStr} m²`,
        `Se preferir em centímetros quadrados (× 10.000): ${formatPtNumber(solution.areaCm2, 4)} cm²`,
      ],
      resultLabel: 'Área da seção do tubo',
      resultValue: `A = ${aStr} m² (${formatPtNumber(solution.areaCm2, 4)} cm²)`,
    },
    {
      num: 4,
      title: 'Achar o raio usando a raiz quadrada (r² = Área ÷ π)',
      formula: 'r² = A ÷ π   →   r = √(r²)',
      why: 'Sabemos que Área = π × r². Para isolar o raio (r), primeiro dividimos a área por π e depois apertamos o botão de raiz quadrada (√) na calculadora.',
      lines: useCm2Shortcut
        ? [
            `Passando a área para cm²: ${aStr} × 10.000 = ${formatPtNumber(solution.areaCm2, 4)} cm²`,
            `r² = ${formatPtNumber(solution.areaCm2, 4)} ÷ ${formatPtNumber(solution.piValue, 4)} = ${formatPtNumber(solution.r2Cm2, 4)} cm²`,
            `r = √${formatPtNumber(solution.r2Cm2, 4)} = ${formatPtNumber(solution.radiusCm, 2)} cm`,
            `Voltando para metros (÷ 100): ${rStr} m`,
          ]
        : [
            `r² = ${aStr} ÷ ${formatPtNumber(solution.piValue, 4)} = ${r2Str} m²`,
            `Apertando √ na calculadora para tirar o "ao quadrado":`,
            `r = √${r2Str} = ${rStr} m`,
            `Em centímetros (× 100): ${formatPtNumber(solution.radiusCm, 2)} cm`,
          ],
      resultLabel: 'Raio interno do cano',
      resultValue: `r = ${rStr} m (${formatPtNumber(solution.radiusCm, 2)} cm)`,
    },
    {
      num: 5,
      title: 'Multiplicar por 2 para achar o diâmetro (Ø = 2 × r)',
      formula: 'Ø = 2 × r',
      why: 'O raio vai só do centro até a parede do tubo (metade da largura). O diâmetro é a largura total de uma ponta à outra, por isso multiplicamos por 2.',
      lines: [
        `Ø = 2 × ${rStr} = ${dMStr} m`,
        `Em centímetros (× 100): ${formatPtNumber(solution.diameterCm, 2)} cm`,
        `Em milímetros (× 1.000): ${formatPtNumber(solution.diameterMm, 1)} mm`,
        solution.commercialMatch
          ? `Bitola comercial exata: cano de ${solution.commercialMatch.label} (${solution.commercialMatch.usage})`
          : `Equivalente aproximado em polegadas: ${formatPtNumber(solution.inchesExact, 2)}"`,
      ],
      resultLabel: 'Diâmetro final',
      resultValue: `${dMStr} m  ·  ${formatPtNumber(solution.diameterCm, 2)} cm  ·  ${formatPtNumber(solution.diameterMm, 1)} mm`,
    },
  ];

  const current = steps.find((s) => s.num === activeStep) ?? steps[0];

  const summaryRows = [
    {
      measure: 'Volume do tanque (V)',
      original: `${formatPtNumber(solution.volumeLiters, 0)} litros`,
      converted: `${formatPtNumber(solution.volumeM3, 3)} m³`,
      highlight: false,
    },
    {
      measure: 'Tempo total (t)',
      original: formatShortTime(solution.hours, solution.minutes, solution.seconds),
      converted: `${formatPtNumber(solution.totalSeconds, 0)} segundos`,
      highlight: false,
    },
    {
      measure: 'Vazão (Q)',
      original: `${formatPtNumber(solution.flowLs, 4)} L/s`,
      converted: `${qStr} m³/s`,
      highlight: false,
    },
    {
      measure: 'Velocidade (v)',
      original: `${formatPtNumber(solution.velocityMs, 1)} m/s`,
      converted: `${formatPtNumber(solution.velocityCms, 0)} cm/s`,
      highlight: false,
    },
    {
      measure: 'Área do cano (A)',
      original: `${formatPtNumber(solution.areaCm2, 4)} cm²`,
      converted: `${aStr} m²`,
      highlight: false,
    },
    {
      measure: 'Raio (r)',
      original: `${formatPtNumber(solution.radiusCm, 2)} cm`,
      converted: `${rStr} m`,
      highlight: false,
    },
    {
      measure: 'Diâmetro do cano (Ø)',
      original: solution.commercialMatch
        ? `${formatPtNumber(solution.diameterMm, 1)} mm (${solution.commercialMatch.label})`
        : `${formatPtNumber(solution.diameterMm, 1)} mm`,
      converted: `${dMStr} m (${formatPtNumber(solution.diameterCm, 2)} cm)`,
      highlight: true,
    },
  ];

  return (
    <div className="space-y-10">
      {/* 5-Step Interactive Walkthrough */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {/* Step selector tabs */}
        <div className="grid grid-cols-5 border-b border-slate-200 bg-slate-50/70">
          {steps.map((step) => {
            const isActive = step.num === activeStep;
            const isPast = step.num < activeStep;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => onSelectStep(step.num)}
                className={`px-3 py-3.5 text-left transition-colors cursor-pointer border-b-2 ${
                  isActive
                    ? 'bg-white border-sky-600 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span
                    className={`w-5 h-5 rounded-md inline-flex items-center justify-center font-mono text-[11px] shrink-0 ${
                      isActive
                        ? 'bg-sky-600 text-white'
                        : isPast
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {step.num}
                  </span>
                  <span className="truncate hidden sm:inline">Passo {step.num}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Step Content */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div className="max-w-2xl">
              <p className="text-xs font-medium text-sky-700 mb-1">
                Passo {current.num} de 5
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 text-balance">
                {current.title}
              </h3>
            </div>

            {current.num === 4 && (
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
                <button
                  type="button"
                  onClick={() => setUseCm2Shortcut(false)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    !useCm2Shortcut
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Em m² (padrão)
                </button>
                <button
                  type="button"
                  onClick={() => setUseCm2Shortcut(true)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    useCm2Shortcut
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Em cm² (sem zeros)
                </button>
              </div>
            )}
          </div>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl mb-6">
            {current.why}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Calculation Breakdown */}
            <div className="lg:col-span-8 bg-[#F8FAFC] border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-200">
                  <span className="text-xs font-medium text-slate-500">Fórmula aplicada</span>
                  <code className="font-mono text-xs sm:text-sm font-semibold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-md">
                    {current.formula}
                  </code>
                </div>

                <ul className="space-y-2.5">
                  {current.lines.map((line, i) => (
                    <li
                      key={i}
                      className="font-mono text-xs sm:text-sm text-slate-800 tabular-nums leading-relaxed"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Step Result Panel */}
            <div className="lg:col-span-4 bg-slate-900 text-white rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-sky-300 mb-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{current.resultLabel}</span>
                </div>
                <p className="font-mono text-base sm:text-lg font-semibold text-white tabular-nums leading-snug">
                  {current.resultValue}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-6 mt-6 border-t border-slate-800">
                <button
                  type="button"
                  disabled={activeStep === 1}
                  onClick={() => onSelectStep(Math.max(1, activeStep - 1))}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={activeStep === 5}
                  onClick={() => onSelectStep(Math.min(5, activeStep + 1))}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Próximo
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Summary Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Quadro resumo para enxergar tudo de uma vez
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Todas as grandezas da simulação atual convertidas lado a lado
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            π = {formatPtNumber(solution.piValue, 4)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-6">O que estamos medindo</th>
                <th className="py-3 px-6">Valor original / prático</th>
                <th className="py-3 px-6">Valor convertido / calculado (SI)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {summaryRows.map((row) => (
                <tr
                  key={row.measure}
                  className={row.highlight ? 'bg-sky-50/60 font-semibold' : 'hover:bg-slate-50/70'}
                >
                  <td className="py-3.5 px-6 text-slate-900 font-medium">{row.measure}</td>
                  <td className="py-3.5 px-6 font-mono text-slate-700 tabular-nums">
                    {row.original}
                  </td>
                  <td className="py-3.5 px-6 font-mono text-slate-900 tabular-nums">
                    {row.converted}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
