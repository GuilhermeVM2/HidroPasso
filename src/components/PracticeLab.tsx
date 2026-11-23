import React, { useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, HelpCircle, RotateCcw } from 'lucide-react';
import {
  PRESET_PROBLEMS,
  formatPtNumber,
  formatSignificantPt,
  formatTimeText,
  parsePtNumberInput,
  solveHydraulics,
} from '../utils/hydraulics';

type StepStatus = 'idle' | 'correct' | 'warning' | 'error';

interface StepFeedback {
  status: StepStatus;
  message: string;
}

export const PracticeLab: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(PRESET_PROBLEMS[0].id);

  // Step inputs
  const [step1Vol, setStep1Vol] = useState('');
  const [step1Time, setStep1Time] = useState('');
  const [step2Flow, setStep2Flow] = useState('');
  const [step3Area, setStep3Area] = useState('');
  const [step4Radius, setStep4Radius] = useState('');
  const [step5DiamMm, setStep5DiamMm] = useState('');

  const [hintsOpen, setHintsOpen] = useState<Record<number, boolean>>({});
  const [feedback, setFeedback] = useState<Record<number, StepFeedback>>({});

  const problem = useMemo(
    () => PRESET_PROBLEMS.find((p) => p.id === selectedId) ?? PRESET_PROBLEMS[0],
    [selectedId]
  );

  const sol = useMemo(() => solveHydraulics(problem), [problem]);

  const resetPractice = (newId?: string) => {
    if (newId) setSelectedId(newId);
    setStep1Vol('');
    setStep1Time('');
    setStep2Flow('');
    setStep3Area('');
    setStep4Radius('');
    setStep5DiamMm('');
    setHintsOpen({});
    setFeedback({});
  };

  const toggleHint = (step: number) => {
    setHintsOpen((prev) => ({ ...prev, [step]: !prev[step] }));
  };

  const checkStep1 = () => {
    const v = parsePtNumberInput(step1Vol);
    const t = parsePtNumberInput(step1Time);
    if (v === null || t === null) {
      setFeedback((f) => ({
        ...f,
        1: { status: 'error', message: 'Digite os dois valores numéricos (Volume em m³ e Tempo em s).' },
      }));
      return;
    }
    const vOk = Math.abs(v - sol.volumeM3) <= 0.01;
    const tOk = Math.abs(t - sol.totalSeconds) <= 1;
    if (vOk && tOk) {
      setFeedback((f) => ({
        ...f,
        1: {
          status: 'correct',
          message: `Correto! ${formatPtNumber(sol.volumeM3, 3)} m³ e ${formatPtNumber(sol.totalSeconds, 0)} segundos.`,
        },
      }));
    } else if (!vOk) {
      setFeedback((f) => ({
        ...f,
        1: { status: 'error', message: 'Revise o volume: divida os litros por 1.000 para passar para m³.' },
      }));
    } else {
      setFeedback((f) => ({
        ...f,
        1: {
          status: 'error',
          message: 'Revise o tempo total: multiplique as horas por 3.600, os minutos por 60 e some os segundos.',
        },
      }));
    }
  };

  const checkStep2 = () => {
    const q = parsePtNumberInput(step2Flow);
    if (q === null) {
      setFeedback((f) => ({
        ...f,
        2: { status: 'error', message: 'Digite a vazão em m³/s.' },
      }));
      return;
    }
    const relErr = Math.abs(q - sol.flowM3s) / sol.flowM3s;
    if (relErr <= 0.008) {
      setFeedback((f) => ({
        ...f,
        2: {
          status: 'correct',
          message: `Excelente! Q = ${formatSignificantPt(sol.flowM3s, 5)} m³/s (≈ ${formatPtNumber(sol.flowLs, 2)} L/s).`,
        },
      }));
    } else if (relErr <= 0.04) {
      setFeedback((f) => ({
        ...f,
        2: {
          status: 'warning',
          message: 'Quase lá, mas você arredondou cedo demais! Guarde pelo menos 4 dígitos diferentes de zero depois da vírgula.',
        },
      }));
    } else {
      setFeedback((f) => ({
        ...f,
        2: { status: 'error', message: 'Ainda não. Lembre-se: Q = Volume (m³) ÷ Tempo (s).' },
      }));
    }
  };

  const checkStep3 = () => {
    const a = parsePtNumberInput(step3Area);
    if (a === null) {
      setFeedback((f) => ({
        ...f,
        3: { status: 'error', message: 'Digite a área da boca do cano em m².' },
      }));
      return;
    }
    const relErr = Math.abs(a - sol.areaM2) / sol.areaM2;
    if (relErr <= 0.01) {
      setFeedback((f) => ({
        ...f,
        3: {
          status: 'correct',
          message: `Correto! A = ${formatSignificantPt(sol.areaM2, 5)} m² (${formatPtNumber(sol.areaCm2, 4)} cm²).`,
        },
      }));
    } else if (relErr <= 0.04) {
      setFeedback((f) => ({
        ...f,
        3: {
          status: 'warning',
          message: 'Valor próximo, mas parece afetado por arredondamento no passo anterior. Use Q com mais casas!',
        },
      }));
    } else {
      setFeedback((f) => ({
        ...f,
        3: { status: 'error', message: 'Confira a divisão: Área = Vazão (Q) ÷ Velocidade (v).' },
      }));
    }
  };

  const checkStep4 = () => {
    const r = parsePtNumberInput(step4Radius);
    if (r === null) {
      setFeedback((f) => ({
        ...f,
        4: { status: 'error', message: 'Digite o raio em metros (m).' },
      }));
      return;
    }
    const relErr = Math.abs(r - sol.radiusM) / sol.radiusM;
    if (relErr <= 0.012) {
      setFeedback((f) => ({
        ...f,
        4: {
          status: 'correct',
          message: `Muito bem! r = ${formatPtNumber(sol.radiusM, 4)} m (${formatPtNumber(sol.radiusCm, 2)} cm).`,
        },
      }));
    } else if (Math.abs(r - sol.radiusCm) / sol.radiusCm <= 0.02) {
      setFeedback((f) => ({
        ...f,
        4: {
          status: 'warning',
          message: `Você digitou em centímetros (${formatPtNumber(sol.radiusCm, 2)} cm). Passe para metros dividindo por 100!`,
        },
      }));
    } else if (Math.abs(r - sol.r2M2) / sol.r2M2 <= 0.03) {
      setFeedback((f) => ({
        ...f,
        4: {
          status: 'warning',
          message: 'Faltou apertar o botão da raiz quadrada (√) na calculadora! Esse valor ainda é r².',
        },
      }));
    } else {
      setFeedback((f) => ({
        ...f,
        4: { status: 'error', message: 'Divida a Área por 3,14 e depois tire a raiz quadrada (√).' },
      }));
    }
  };

  const checkStep5 = () => {
    const dMm = parsePtNumberInput(step5DiamMm);
    if (dMm === null) {
      setFeedback((f) => ({
        ...f,
        5: { status: 'error', message: 'Digite o diâmetro final em milímetros (mm).' },
      }));
      return;
    }
    const diff = Math.abs(dMm - sol.diameterMm);
    if (diff <= 0.15) {
      setFeedback((f) => ({
        ...f,
        5: {
          status: 'correct',
          message: sol.commercialMatch
            ? `Perfeito! ${formatPtNumber(sol.diameterMm, 1)} mm — exatamente um cano comercial de ${sol.commercialMatch.label}!`
            : `Perfeito! Diâmetro = ${formatPtNumber(sol.diameterMm, 1)} mm.`,
        },
      }));
    } else if (diff <= 0.6) {
      setFeedback((f) => ({
        ...f,
        5: {
          status: 'warning',
          message: `Quase! Deu diferença de ${formatPtNumber(diff, 2)} mm. Isso acontece quando arredondamos Q ou A cedo demais.`,
        },
      }));
    } else if (Math.abs(dMm - sol.radiusM * 1000) <= 0.3) {
      setFeedback((f) => ({
        ...f,
        5: {
          status: 'warning',
          message: 'Você esqueceu de multiplicar o raio por 2! Diâmetro = 2 × raio.',
        },
      }));
    } else {
      setFeedback((f) => ({
        ...f,
        5: {
          status: 'error',
          message: 'Multiplique o raio (em metros) por 2 e depois por 1.000 para achar em milímetros.',
        },
      }));
    }
  };

  const completedCount = [1, 2, 3, 4, 5].filter((n) => feedback[n]?.status === 'correct').length;

  const renderFeedback = (step: number) => {
    const fb = feedback[step];
    if (!fb) return null;
    const styles =
      fb.status === 'correct'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
        : fb.status === 'warning'
        ? 'bg-amber-50 border-amber-200 text-amber-900'
        : 'bg-red-50 border-red-200 text-red-900';

    return (
      <div className={`mt-3 px-3.5 py-2.5 rounded-lg border text-xs flex items-start gap-2 ${styles}`}>
        {fb.status === 'correct' ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        ) : (
          <AlertCircle
            className={`w-4 h-4 shrink-0 mt-0.5 ${
              fb.status === 'warning' ? 'text-amber-600' : 'text-red-600'
            }`}
          />
        )}
        <span>{fb.message}</span>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header & Exercise Selector */}
      <div className="p-6 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Pratique Passo a Passo
            </h3>
            <p className="text-sm text-slate-600 mt-0.5">
              Resolva com sua calculadora e valide cada etapa antes de avançar.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold text-slate-700 tabular-nums">
              {completedCount} de 5 passos corretos
            </span>
            <button
              type="button"
              onClick={() => resetPractice()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpar
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESET_PROBLEMS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => resetPractice(p.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                selectedId === p.id
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Problem Statement */}
        <div className="mt-5 p-4 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 leading-relaxed">
          <strong className="text-slate-900">Enunciado:</strong> Um reservatório de{' '}
          <strong className="font-mono text-slate-900">
            {formatPtNumber(sol.volumeLiters, 0)} litros
          </strong>{' '}
          recebe água a uma velocidade de{' '}
          <strong className="font-mono text-slate-900">
            {formatPtNumber(sol.velocityMs, 1)} m/s
          </strong>{' '}
          e leva{' '}
          <strong className="text-slate-900">
            {formatTimeText(sol.hours, sol.minutes, sol.seconds)}
          </strong>{' '}
          para encher completamente (use π = 3,14). Qual é o diâmetro do cano em milímetros?
        </div>
      </div>

      {/* 5 Interactive Input Cards */}
      <div className="divide-y divide-slate-200">
        {/* Step 1 */}
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h4 className="text-sm sm:text-base font-bold text-slate-900">
              Passo 1 — Arrumar as unidades (m³ e segundos)
            </h4>
            <button
              type="button"
              onClick={() => toggleHint(1)}
              className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:text-sky-800 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {hintsOpen[1] ? 'Ocultar dica' : 'Ver dica'}
            </button>
          </div>
          {hintsOpen[1] && (
            <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
              Divida {formatPtNumber(sol.volumeLiters, 0)} por 1.000 para achar o volume em m³. Para o
              tempo: ({sol.hours} × 3.600) + ({sol.minutes} × 60) + {sol.seconds}.
            </p>
          )}
          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="block text-xs font-medium text-slate-600 mb-1">Volume (m³)</span>
              <input
                type="text"
                inputMode="decimal"
                value={step1Vol}
                onChange={(e) => setStep1Vol(e.target.value)}
                placeholder="ex: 12"
                className="w-36 px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-slate-600 mb-1">Tempo total (s)</span>
              <input
                type="text"
                inputMode="numeric"
                value={step1Time}
                onChange={(e) => setStep1Time(e.target.value)}
                placeholder="ex: 3949"
                className="w-40 px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>
            <button
              type="button"
              onClick={checkStep1}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors cursor-pointer"
            >
              Verificar Passo 1
            </button>
          </div>
          {renderFeedback(1)}
        </div>

        {/* Step 2 */}
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h4 className="text-sm sm:text-base font-bold text-slate-900">
              Passo 2 — Calcular a vazão (Q = V ÷ t)
            </h4>
            <button
              type="button"
              onClick={() => toggleHint(2)}
              className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:text-sky-800 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {hintsOpen[2] ? 'Ocultar dica' : 'Ver dica'}
            </button>
          </div>
          {hintsOpen[2] && (
            <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
              Faça {formatPtNumber(sol.volumeM3, 3)} ÷ {formatPtNumber(sol.totalSeconds, 0)} e anote
              pelo menos 4 números diferentes de zero após a vírgula.
            </p>
          )}
          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="block text-xs font-medium text-slate-600 mb-1">Vazão Q (m³/s)</span>
              <input
                type="text"
                inputMode="decimal"
                value={step2Flow}
                onChange={(e) => setStep2Flow(e.target.value)}
                placeholder="ex: 0,0030387"
                className="w-48 px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>
            <button
              type="button"
              onClick={checkStep2}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors cursor-pointer"
            >
              Verificar Passo 2
            </button>
          </div>
          {renderFeedback(2)}
        </div>

        {/* Step 3 */}
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h4 className="text-sm sm:text-base font-bold text-slate-900">
              Passo 3 — Descobrir a área da boca do cano (A = Q ÷ v)
            </h4>
            <button
              type="button"
              onClick={() => toggleHint(3)}
              className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:text-sky-800 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {hintsOpen[3] ? 'Ocultar dica' : 'Ver dica'}
            </button>
          </div>
          {hintsOpen[3] && (
            <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
              Divida a vazão Q pela velocidade ({formatPtNumber(sol.velocityMs, 1)} m/s).
            </p>
          )}
          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="block text-xs font-medium text-slate-600 mb-1">Área A (m²)</span>
              <input
                type="text"
                inputMode="decimal"
                value={step3Area}
                onChange={(e) => setStep3Area(e.target.value)}
                placeholder="ex: 0,00050645"
                className="w-48 px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>
            <button
              type="button"
              onClick={checkStep3}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors cursor-pointer"
            >
              Verificar Passo 3
            </button>
          </div>
          {renderFeedback(3)}
        </div>

        {/* Step 4 */}
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h4 className="text-sm sm:text-base font-bold text-slate-900">
              Passo 4 — Achar o raio usando raiz quadrada (r = √(A ÷ π))
            </h4>
            <button
              type="button"
              onClick={() => toggleHint(4)}
              className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:text-sky-800 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {hintsOpen[4] ? 'Ocultar dica' : 'Ver dica'}
            </button>
          </div>
          {hintsOpen[4] && (
            <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
              Divida a Área em m² por 3,14 para achar r² e depois aperte √ na calculadora.
            </p>
          )}
          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="block text-xs font-medium text-slate-600 mb-1">Raio r (m)</span>
              <input
                type="text"
                inputMode="decimal"
                value={step4Radius}
                onChange={(e) => setStep4Radius(e.target.value)}
                placeholder="ex: 0,0127"
                className="w-48 px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>
            <button
              type="button"
              onClick={checkStep4}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors cursor-pointer"
            >
              Verificar Passo 4
            </button>
          </div>
          {renderFeedback(4)}
        </div>

        {/* Step 5 */}
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h4 className="text-sm sm:text-base font-bold text-slate-900">
              Passo 5 — Multiplicar por 2 e converter para milímetros (Ø = 2 × r × 1.000)
            </h4>
            <button
              type="button"
              onClick={() => toggleHint(5)}
              className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:text-sky-800 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {hintsOpen[5] ? 'Ocultar dica' : 'Ver dica'}
            </button>
          </div>
          {hintsOpen[5] && (
            <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
              Multiplique o raio em metros por 2 para obter o diâmetro em metros e depois multiplique
              por 1.000 para achar em milímetros (mm).
            </p>
          )}
          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="block text-xs font-medium text-slate-600 mb-1">
                Diâmetro final Ø (mm)
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={step5DiamMm}
                onChange={(e) => setStep5DiamMm(e.target.value)}
                placeholder="ex: 25,4"
                className="w-48 px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>
            <button
              type="button"
              onClick={checkStep5}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Verificar Diâmetro Final
            </button>
          </div>
          {renderFeedback(5)}
        </div>
      </div>
    </div>
  );
};
