import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Ruler } from 'lucide-react';
import {
  COMMERCIAL_PIPES,
  HydraulicSolution,
  formatPtNumber,
  formatSignificantPt,
  roundToSignificant,
} from '../utils/hydraulics';

interface PuloDoGatoProps {
  solution: HydraulicSolution;
}

export const PuloDoGato: React.FC<PuloDoGatoProps> = ({ solution }) => {
  const [sigDigits, setSigDigits] = useState<1 | 2 | 5>(1);

  // Simulate early rounding in Step 2 (Q)
  const roundedQ = roundToSignificant(solution.flowM3s, sigDigits);
  const roundedA = roundedQ / solution.velocityMs;
  const roundedR2 = roundedA / solution.piValue;
  const roundedR = Math.sqrt(roundedR2);
  const roundedDiamMm = roundedR * 2 * 1000;
  const diffMm = roundedDiamMm - solution.diameterMm;
  const hasSignificantDrift = Math.abs(diffMm) >= 0.08;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Tip 1: Interactive Early Rounding Simulator */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold text-sky-700">Dica 1 · Precisão</span>
              <span className="text-xs text-slate-500">Simulador interativo</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Cuidado para não arredondar cedo demais
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              Se no Passo 2 você cortar as casas decimais da vazão ({' '}
              <span className="font-mono text-slate-900">
                {formatSignificantPt(solution.flowM3s, 5)}
              </span>{' '}
              ), o erro vai se multiplicando até distorcer o diâmetro final. Teste abaixo:
            </p>

            {/* Precision selector */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg mb-5">
              <button
                type="button"
                onClick={() => setSigDigits(1)}
                className={`px-2.5 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  sigDigits === 1
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cortar p/ 1 dígito
              </button>
              <button
                type="button"
                onClick={() => setSigDigits(2)}
                className={`px-2.5 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  sigDigits === 2
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2 dígitos
              </button>
              <button
                type="button"
                onClick={() => setSigDigits(5)}
                className={`px-2.5 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  sigDigits === 5
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                4+ dígitos (ideal)
              </button>
            </div>

            {/* Live comparison readout */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-4 space-y-2.5 text-xs sm:text-sm font-mono tabular-nums">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500 font-sans">Vazão usada (Q):</span>
                <span className="text-slate-900 font-semibold">
                  {formatSignificantPt(roundedQ, sigDigits)} m³/s
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500 font-sans">Área obtida (A):</span>
                <span className="text-slate-800">{formatSignificantPt(roundedA, 5)} m²</span>
              </div>
              <div className="flex justify-between gap-2 pt-2 border-t border-slate-200">
                <span className="text-slate-700 font-sans font-semibold">Diâmetro final:</span>
                <span className="text-slate-950 font-bold">
                  {formatPtNumber(roundedDiamMm, 2)} mm
                </span>
              </div>
            </div>
          </div>

          <div
            className={`mt-4 px-3.5 py-2.5 rounded-lg border text-xs flex items-center gap-2 ${
              hasSignificantDrift
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            {hasSignificantDrift ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Desvio de{' '}
                  <strong className="font-mono tabular-nums">
                    {diffMm > 0 ? '+' : ''}
                    {formatPtNumber(diffMm, 2)} mm
                  </strong>{' '}
                  em relação ao valor exato ({formatPtNumber(solution.diameterMm, 1)} mm). Guarde ao menos 4 números diferentes de zero!
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Precisão preservada! Bate exatamente com{' '}
                  <strong className="font-mono tabular-nums">
                    {formatPtNumber(solution.diameterMm, 1)} mm
                  </strong>
                  .
                </span>
              </>
            )}
          </div>
        </div>

        {/* Tip 2: cm² Shortcut */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold text-sky-700">Dica 2 · Raiz Quadrada</span>
              <span className="text-xs text-slate-500">Atalho sem zeros</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Passe para cm² para fugir dos "0,000..."
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              Se tirar a raiz quadrada de um número cheio de zeros parecer confuso na calculadora,
              multiplique a Área em m² por <strong className="text-slate-900">10.000</strong> antes
              de dividir por π. O resultado sai direto em centímetros:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-slate-500 mb-2">Em metros (muitos zeros)</p>
                <div className="space-y-1.5 font-mono text-xs text-slate-700 tabular-nums">
                  <p>A = {formatSignificantPt(solution.areaM2, 5)} m²</p>
                  <p>r² = {formatSignificantPt(solution.r2M2, 5)} m²</p>
                  <p className="text-slate-900 font-semibold">
                    r = √{formatSignificantPt(solution.r2M2, 5)}
                  </p>
                  <p className="text-sky-700 font-bold">r = {formatPtNumber(solution.radiusM, 4)} m</p>
                </div>
              </div>

              <div className="bg-sky-50/70 border border-sky-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-sky-800 mb-2">Em cm² (limpo e direto)</p>
                <div className="space-y-1.5 font-mono text-xs text-slate-800 tabular-nums">
                  <p>A = {formatPtNumber(solution.areaCm2, 4)} cm²</p>
                  <p>r² = {formatPtNumber(solution.r2Cm2, 4)} cm²</p>
                  <p className="text-slate-950 font-semibold">
                    r = √{formatPtNumber(solution.r2Cm2, 4)}
                  </p>
                  <p className="text-sky-800 font-bold">
                    r = {formatPtNumber(solution.radiusCm, 2)} cm
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5">
            Depois é só dobrar:{' '}
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              Ø = 2 × {formatPtNumber(solution.radiusCm, 2)} = {formatPtNumber(solution.diameterCm, 2)} cm ({formatPtNumber(solution.diameterMm, 1)} mm)
            </span>
          </p>
        </div>
      </div>

      {/* Tip 3: Commercial Pipe Benchmark */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 mb-1">
              <Ruler className="w-3.5 h-3.5" />
              <span>Dica 3 · Sinal de que a conta está certa</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Bitolas comerciais de tubulação (1 polegada = 25,4 mm)
            </h3>
          </div>
          <div className="text-xs font-mono text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg tabular-nums">
            Seu resultado atual: <strong>{formatPtNumber(solution.diameterMm, 1)} mm</strong>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-5 max-w-3xl">
          Na engenharia e na hidráulica, números como <strong>25,4 mm</strong> não aparecem por
          acaso. Quando sua conta bate em uma medida comercial exata abaixo, é sinal claro de que o
          exercício foi montado para dar esse tubo:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {COMMERCIAL_PIPES.map((pipe) => {
            const isMatch = solution.commercialMatch?.label === pipe.label;
            return (
              <div
                key={pipe.label}
                className={`rounded-lg border p-3 transition-colors ${
                  isMatch
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                    : 'bg-[#F8FAFC] border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-mono text-sm font-bold">{pipe.label}</span>
                  {isMatch && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>
                <p className="font-mono text-xs text-slate-600 tabular-nums">
                  {formatPtNumber(pipe.mm, 2)} mm
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
