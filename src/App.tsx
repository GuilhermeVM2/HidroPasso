import React, { useMemo, useState } from 'react';
import {
  PRESET_PROBLEMS,
  ProblemParams,
  formatPtNumber,
  formatSignificantPt,
  solveHydraulics,
} from './utils/hydraulics';
import { HydraulicSimulator } from './components/HydraulicSimulator';
import { FiveStepsGuide } from './components/FiveStepsGuide';
import { PuloDoGato } from './components/PuloDoGato';
import { PracticeLab } from './components/PracticeLab';
import { WordExportPanel } from './components/WordExportPanel';

export default function App() {
  const [params, setParams] = useState<ProblemParams>(PRESET_PROBLEMS[0]);
  const [activeStep, setActiveStep] = useState<number>(1);

  const solution = useMemo(() => solveHydraulics(params), [params]);

  const handlePresetSelect = (preset: ProblemParams) => {
    setParams({ ...preset });
  };

  const updateParam = <K extends keyof ProblemParams>(key: K, value: ProblemParams[K]) => {
    setParams((prev) => ({
      ...prev,
      id: 'custom',
      label: 'Personalizado',
      [key]: value,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* Top Navigation Bar — 3-Zone Contract */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#simulador"
            className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            HidroPasso
          </a>

          {/* Zone 2: 4 Single-line Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a
              href="#simulador"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Simulador
            </a>
            <a
              href="#passos"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              5 Passos
            </a>
            <a
              href="#dicas"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Pulo do Gato
            </a>
            <a
              href="#praticar"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Praticar
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center shrink-0">
            <a
              href="#word"
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors whitespace-nowrap shrink-0"
            >
              Exportar Word
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero & Interactive Two-Zone Sandbox */}
        <section id="simulador" className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-12">
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
              <span>Hidráulica Aplicada</span>
              <span aria-hidden="true">·</span>
              <span>Método Reverso em 5 Passos</span>
              <span aria-hidden="true">·</span>
              <span>Volume e Tempo até o Diâmetro</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 max-w-3xl text-balance">
              Como descobrir a largura do cano fazendo o caminho de volta
            </h1>
            <p className="mt-2.5 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              Imagine um reservatório grande de 12.000 litros — o equivalente a 12 caixas d’água de
              1.000 litros juntas. Ajuste os valores abaixo ou escolha um exemplo para enxergar
              cada etapa até o diâmetro final.
            </p>
          </div>

          {/* Preset Toolbar (Workspace level, not top bar) */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/70 rounded-lg">
              {PRESET_PROBLEMS.map((preset) => {
                const isSelected = params.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <div className="text-xs font-mono text-slate-600 tabular-nums">
              Resultado:{' '}
              <strong className="text-slate-900">
                Ø = {formatPtNumber(solution.diameterMm, 1)} mm
              </strong>
              {solution.commercialMatch && (
                <span className="text-emerald-700 font-semibold">
                  {' '}
                  ({solution.commercialMatch.label})
                </span>
              )}
            </div>
          </div>

          {/* Two-Zone Sandbox Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Zone: Interactive Hydraulic Stage (65%) */}
            <div className="lg:col-span-8 flex flex-col">
              <HydraulicSimulator
                solution={solution}
                activeStep={activeStep}
                onSelectStep={setActiveStep}
              />
            </div>

            {/* Right Zone: Control & Concept Deck (35%) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="pb-3 border-b border-slate-200">
                  <h2 className="text-base font-bold text-slate-900">Dados do Problema</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Altere qualquer variável para recalcular os 5 passos ao vivo
                  </p>
                </div>

                {/* Volume Slider + Input */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <label htmlFor="vol-range" className="font-semibold text-slate-700">
                      Volume do reservatório (litros)
                    </label>
                    <span className="font-mono font-semibold text-sky-700 tabular-nums">
                      {formatPtNumber(params.volumeLiters, 0)} L ({formatPtNumber(solution.volumeM3, 2)} m³)
                    </span>
                  </div>
                  <input
                    id="vol-range"
                    type="range"
                    min={1000}
                    max={30000}
                    step={500}
                    value={params.volumeLiters}
                    onChange={(e) => updateParam('volumeLiters', Number(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                </div>

                {/* Time Inputs (h, min, s) */}
                <div>
                  <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tempo de enchimento (h / min / s)
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="block">
                      <span className="block text-[11px] text-slate-500 mb-1">Horas</span>
                      <input
                        type="number"
                        min={0}
                        max={24}
                        value={params.hours}
                        onChange={(e) =>
                          updateParam('hours', Math.max(0, Number(e.target.value) || 0))
                        }
                        className="w-full px-2.5 py-1.5 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 tabular-nums"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-[11px] text-slate-500 mb-1">Minutos</span>
                      <input
                        type="number"
                        min={0}
                        max={59}
                        value={params.minutes}
                        onChange={(e) =>
                          updateParam(
                            'minutes',
                            Math.min(59, Math.max(0, Number(e.target.value) || 0))
                          )
                        }
                        className="w-full px-2.5 py-1.5 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 tabular-nums"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-[11px] text-slate-500 mb-1">Segundos</span>
                      <input
                        type="number"
                        min={0}
                        max={59}
                        value={params.seconds}
                        onChange={(e) =>
                          updateParam(
                            'seconds',
                            Math.min(59, Math.max(0, Number(e.target.value) || 0))
                          )
                        }
                        className="w-full px-2.5 py-1.5 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 tabular-nums"
                      />
                    </label>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 mt-1.5 tabular-nums">
                    Total convertido: {formatPtNumber(solution.totalSeconds, 0)} segundos
                  </p>
                </div>

                {/* Velocity Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <label htmlFor="vel-range" className="font-semibold text-slate-700">
                      Velocidade da água (m/s)
                    </label>
                    <span className="font-mono font-semibold text-sky-700 tabular-nums">
                      {formatPtNumber(params.velocityMs, 1)} m/s
                    </span>
                  </div>
                  <input
                    id="vel-range"
                    type="range"
                    min={1}
                    max={12}
                    step={0.5}
                    value={params.velocityMs}
                    onChange={(e) => updateParam('velocityMs', Number(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                </div>

                {/* Pi Precision Selector */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-xs font-semibold text-slate-700">Valor de π:</span>
                  <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => updateParam('piValue', 3.14)}
                      className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                        params.piValue === 3.14
                          ? 'bg-white text-slate-900 shadow-sm font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      3,14
                    </button>
                    <button
                      type="button"
                      onClick={() => updateParam('piValue', 3.1416)}
                      className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                        params.piValue === 3.1416
                          ? 'bg-white text-slate-900 shadow-sm font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      3,1416
                    </button>
                  </div>
                </div>
              </div>

              {/* Live 5-Step Mini Readout */}
              <div className="mt-6 pt-4 border-t border-slate-200 space-y-2">
                <p className="text-xs font-semibold text-slate-500">Cadeia de Cálculo ao Vivo</p>
                <div className="space-y-1.5 text-xs font-mono tabular-nums">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className={`w-full flex justify-between px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                      activeStep === 2 ? 'bg-sky-50 text-sky-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>2. Vazão (Q)</span>
                    <span>{formatSignificantPt(solution.flowM3s, 5)} m³/s</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep(3)}
                    className={`w-full flex justify-between px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                      activeStep === 3 ? 'bg-sky-50 text-sky-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>3. Área (A)</span>
                    <span>{formatSignificantPt(solution.areaM2, 5)} m²</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep(4)}
                    className={`w-full flex justify-between px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                      activeStep === 4 ? 'bg-sky-50 text-sky-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>4. Raio (r)</span>
                    <span>{formatPtNumber(solution.radiusM, 4)} m</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep(5)}
                    className={`w-full flex justify-between px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                      activeStep === 5 ? 'bg-slate-900 text-white font-semibold' : 'bg-slate-100 text-slate-900 font-semibold'
                    }`}
                  >
                    <span>5. Diâmetro (Ø)</span>
                    <span>
                      {formatPtNumber(solution.diameterMm, 1)} mm
                      {solution.commercialMatch ? ` (${solution.commercialMatch.label})` : ''}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 & 3: 5 Steps & Summary Table */}
        <section id="passos" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-slate-200">
          <div className="mb-6 max-w-2xl">
            <p className="text-xs font-semibold text-sky-700 mb-1">01. Método Completo</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 text-balance">
              Resolvendo em 5 passos curtos e limpos
            </h2>
          </div>

          <FiveStepsGuide
            solution={solution}
            activeStep={activeStep}
            onSelectStep={setActiveStep}
          />
        </section>

        {/* Section 4: O "Pulo do Gato" */}
        <section id="dicas" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-slate-200">
          <div className="mb-6 max-w-2xl">
            <p className="text-xs font-semibold text-sky-700 mb-1">02. Dicas de Prova e Calculadora</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 text-balance">
              O “pulo do gato” para não errar na calculadora
            </h2>
          </div>

          <PuloDoGato solution={solution} />
        </section>

        {/* Section 5: Interactive Guided Practice */}
        <section id="praticar" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-slate-200">
          <div className="mb-6 max-w-2xl">
            <p className="text-xs font-semibold text-sky-700 mb-1">03. Treino Guiado</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 text-balance">
              Agora é sua vez de fazer o caminho de volta
            </h2>
          </div>

          <PracticeLab />
        </section>

        {/* Section 6: Bonus Word Export */}
        <section id="word" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-slate-200">
          <div className="mb-6 max-w-2xl">
            <p className="text-xs font-semibold text-sky-700 mb-1">04. Bônus para Trabalhos</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 text-balance">
              Texto limpo e fórmulas prontas para colar no Word
            </h2>
          </div>

          <WordExportPanel params={params} solution={solution} />
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span>HidroPasso · Guia interativo de cálculo reverso de tubulação</span>
          <span className="font-mono">Q = V ÷ t · A = Q ÷ v · r = √(A ÷ π) · Ø = 2 × r</span>
        </div>
      </footer>
    </div>
  );
}
