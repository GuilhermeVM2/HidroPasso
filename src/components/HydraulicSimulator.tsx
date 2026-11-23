import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import {
  HydraulicSolution,
  formatPtNumber,
  formatSignificantPt,
  formatTimeText,
} from '../utils/hydraulics';

interface HydraulicSimulatorProps {
  solution: HydraulicSolution;
  activeStep: number;
  onSelectStep: (step: number) => void;
}

export const HydraulicSimulator: React.FC<HydraulicSimulatorProps> = ({
  solution,
  activeStep,
  onSelectStep,
}) => {
  const [fillProgress, setFillProgress] = useState(0.62);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    let frameId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setFillProgress((prev) => {
        const next = prev + dt * 0.085;
        return next > 1 ? 0 : next;
      });
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying]);

  // Scale visual pipe bore height between 18px and 52px based on diameterMm (10mm to 80mm)
  const clampedMm = Math.min(80, Math.max(10, solution.diameterMm));
  const pipeHalfHeight = 9 + ((clampedMm - 10) / 70) * 18;
  const pipeCenterY = 122;
  const pipeTopY = pipeCenterY - pipeHalfHeight;
  const pipeBottomY = pipeCenterY + pipeHalfHeight;

  // Cross section radius in SVG (between 22 and 46)
  const crossRadius = 22 + ((clampedMm - 10) / 70) * 24;
  const crossCx = 128;
  const crossCy = 266;

  // Flow animation duration inversely proportional to velocity
  const flowDuration = Math.max(0.28, Math.min(2.2, 2.8 / solution.velocityMs));

  // Tank water height
  const tankTop = 58;
  const tankHeight = 196;
  const waterHeight = tankHeight * fillProgress;
  const waterY = tankTop + tankHeight - waterHeight;

  const currentElapsedSec = Math.round(fillProgress * solution.totalSeconds);
  const currentLiters = Math.round(fillProgress * solution.volumeLiters);

  // Number of 1000L grid lines inside tank (capped for clean visual)
  const boxDivisions = Math.min(12, Math.max(2, Math.round(solution.boxesOf1000)));

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
      {/* Stage Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <span className="text-slate-900 font-semibold">Bancada Hidráulica Interativa</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            {formatPtNumber(solution.boxesOf1000, 1)} caixas de 1.000 L
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pausar' : 'Simular'}
          </button>
          <button
            type="button"
            onClick={() => {
              setFillProgress(0);
              setIsPlaying(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Zerar Tanque
          </button>
        </div>
      </div>

      {/* SVG Simulation Canvas */}
      <div className="p-4 sm:p-6 bg-[#F8FAFC] relative">
        <svg
          viewBox="0 0 720 340"
          className="w-full h-auto block select-none"
          role="img"
          aria-label="Diagrama hidráulico mostrando o cano de entrada, o corte transversal com raio e diâmetro, e o reservatório enchendo"
        >
          <defs>
            <linearGradient id="waterTankGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="pipeWallGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#CBD5E1" />
              <stop offset="50%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
            <clipPath id="tankClip">
              <rect x="432" y={tankTop} width="236" height={tankHeight} rx="6" />
            </clipPath>
          </defs>

          {/* Subtle blueprint coordinate grid */}
          <g stroke="#E2E8F0" strokeWidth="1" opacity="0.7">
            <line x1="20" y1="58" x2="700" y2="58" strokeDasharray="3 4" />
            <line x1="20" y1="122" x2="432" y2="122" strokeDasharray="3 4" />
            <line x1="20" y1="254" x2="700" y2="254" strokeDasharray="3 4" />
          </g>

          {/* Step Highlight Badge inside SVG */}
          <g transform="translate(24, 22)">
            <text
              x="0"
              y="12"
              fill="#475569"
              fontSize="11.5"
              fontWeight="600"
              fontFamily="var(--font-sans)"
            >
              Caminho Reverso: Volume + Tempo + Velocidade → Diâmetro (Ø)
            </text>
          </g>

          {/* PIPE SECTION (Left to Tank) */}
          <g>
            {/* Outer pipe walls */}
            <rect
              x="36"
              y={pipeTopY - 7}
              width="396"
              height={pipeHalfHeight * 2 + 14}
              rx="4"
              fill="url(#pipeWallGrad)"
            />
            {/* Inner water bore */}
            <rect
              x="36"
              y={pipeTopY}
              width="396"
              height={pipeHalfHeight * 2}
              fill="#0EA5E9"
              opacity={activeStep === 2 || activeStep === 3 ? '1' : '0.88'}
            />

            {/* Animated water stream lines inside pipe */}
            <g clipPath="none">
              <line
                x1="44"
                y1={pipeCenterY - pipeHalfHeight * 0.42}
                x2="424"
                y2={pipeCenterY - pipeHalfHeight * 0.42}
                stroke="#BAE6FD"
                strokeWidth="2"
                strokeDasharray="18 18"
                className="animate-water-flow"
                style={{ animationDuration: `${flowDuration}s` }}
              />
              <line
                x1="44"
                y1={pipeCenterY}
                x2="424"
                y2={pipeCenterY}
                stroke="#E0F2FE"
                strokeWidth="2.5"
                strokeDasharray="22 14"
                className="animate-water-flow"
                style={{ animationDuration: `${flowDuration * 0.85}s` }}
              />
              <line
                x1="44"
                y1={pipeCenterY + pipeHalfHeight * 0.42}
                x2="424"
                y2={pipeCenterY + pipeHalfHeight * 0.42}
                stroke="#BAE6FD"
                strokeWidth="2"
                strokeDasharray="18 18"
                className="animate-water-flow"
                style={{ animationDuration: `${flowDuration}s` }}
              />
            </g>

            {/* Velocity vector label above pipe */}
            <g transform="translate(135, 58)">
              <line
                x1="0"
                y1="14"
                x2="140"
                y2="14"
                stroke={activeStep === 3 ? '#0284C7' : '#334155'}
                strokeWidth="2"
              />
              <polygon
                points="140,14 131,9 131,19"
                fill={activeStep === 3 ? '#0284C7' : '#334155'}
              />
              <text
                x="0"
                y="4"
                fill={activeStep === 3 ? '#0284C7' : '#0F172A'}
                fontSize="12"
                fontWeight="700"
                fontFamily="var(--font-mono)"
              >
                v = {formatPtNumber(solution.velocityMs, 1)} m/s
              </text>
            </g>

            {/* Flow Q callout below pipe */}
            <g
              transform="translate(226, 174)"
              onClick={() => onSelectStep(2)}
              className="cursor-pointer"
            >
              <rect
                x="-6"
                y="-16"
                width="192"
                height="40"
                rx="6"
                fill={activeStep === 2 ? '#E0F2FE' : '#FFFFFF'}
                stroke={activeStep === 2 ? '#0284C7' : '#CBD5E1'}
                strokeWidth={activeStep === 2 ? '1.5' : '1'}
              />
              <text
                x="6"
                y="0"
                fill="#0369A1"
                fontSize="11.5"
                fontWeight="700"
                fontFamily="var(--font-mono)"
              >
                Q = {formatSignificantPt(solution.flowM3s, 5)} m³/s
              </text>
              <text
                x="6"
                y="16"
                fill="#475569"
                fontSize="10.5"
                fontFamily="var(--font-sans)"
              >
                ≈ {formatPtNumber(solution.flowLs, 2)} L/s ({formatPtNumber(solution.bottles3LPerSec, 1)}× garrafa 3L)
              </text>
            </g>

            {/* Water jet entering tank */}
            {fillProgress < 0.99 && (
              <path
                d={`M 432 ${pipeTopY + 2} Q 456 ${pipeTopY + 6} 468 ${Math.min(
                  waterY + 4,
                  tankTop + tankHeight - 4
                )} L 456 ${Math.min(waterY + 4, tankTop + tankHeight - 4)} Q 448 ${
                  pipeBottomY + 4
                } 432 ${pipeBottomY - 2} Z`}
                fill="#38BDF8"
                opacity="0.72"
              />
            )}
          </g>

          {/* PIPE MOUTH CROSS-SECTION (Corte Frontal da Boca do Cano) */}
          <g
            onClick={() => onSelectStep(activeStep === 4 ? 4 : 5)}
            className="cursor-pointer"
          >
            <rect
              x="24"
              y="198"
              width="368"
              height="126"
              rx="8"
              fill="#FFFFFF"
              stroke={activeStep >= 3 ? '#0284C7' : '#E2E8F0'}
              strokeWidth={activeStep >= 3 ? '1.5' : '1'}
            />
            <text
              x="38"
              y="218"
              fill="#0F172A"
              fontSize="11.5"
              fontWeight="700"
              fontFamily="var(--font-sans)"
            >
              Corte da Boca do Cano (Passos 3, 4 e 5)
            </text>

            {/* Outer pipe rim */}
            <circle
              cx={crossCx}
              cy={crossCy}
              r={crossRadius + 6}
              fill="#CBD5E1"
              stroke="#64748B"
              strokeWidth="1.5"
            />
            {/* Inner water area A */}
            <circle
              cx={crossCx}
              cy={crossCy}
              r={crossRadius}
              fill={activeStep === 3 ? '#0284C7' : '#38BDF8'}
              fillOpacity={activeStep === 3 ? '0.85' : '0.45'}
              stroke="#0369A1"
              strokeWidth="1.5"
            />

            {/* Radius r line */}
            <line
              x1={crossCx}
              y1={crossCy}
              x2={crossCx + crossRadius}
              y2={crossCy}
              stroke="#0F172A"
              strokeWidth="2"
            />
            <circle cx={crossCx} cy={crossCy} r="2.5" fill="#0F172A" />
            <text
              x={crossCx + crossRadius * 0.35}
              y={crossCy - 5}
              fill="#0F172A"
              fontSize="11"
              fontWeight="700"
              fontFamily="var(--font-mono)"
            >
              r
            </text>

            {/* Diameter Ø dimension bracket below circle */}
            <line
              x1={crossCx - crossRadius}
              y1={crossCy + crossRadius + 14}
              x2={crossCx + crossRadius}
              y2={crossCy + crossRadius + 14}
              stroke="#0284C7"
              strokeWidth="1.5"
            />
            <line
              x1={crossCx - crossRadius}
              y1={crossCy + crossRadius + 10}
              x2={crossCx - crossRadius}
              y2={crossCy + crossRadius + 18}
              stroke="#0284C7"
              strokeWidth="1.5"
            />
            <line
              x1={crossCx + crossRadius}
              y1={crossCy + crossRadius + 10}
              x2={crossCx + crossRadius}
              y2={crossCy + crossRadius + 18}
              stroke="#0284C7"
              strokeWidth="1.5"
            />

            {/* Numeric values right of cross-section */}
            <g transform="translate(198, 238)">
              <text
                x="0"
                y="0"
                fill={activeStep === 3 ? '#0284C7' : '#334155'}
                fontSize="11.5"
                fontWeight="600"
                fontFamily="var(--font-mono)"
              >
                Área (A) = {formatPtNumber(solution.areaCm2, 4)} cm²
              </text>
              <text
                x="0"
                y="21"
                fill={activeStep === 4 ? '#0284C7' : '#334155'}
                fontSize="11.5"
                fontWeight="600"
                fontFamily="var(--font-mono)"
              >
                Raio (r) = {formatPtNumber(solution.radiusCm, 2)} cm
              </text>
              <text
                x="0"
                y="44"
                fill="#0F172A"
                fontSize="12.5"
                fontWeight="700"
                fontFamily="var(--font-mono)"
              >
                Diâmetro (Ø) = {formatPtNumber(solution.diameterMm, 1)} mm
              </text>
              <text
                x="0"
                y="62"
                fill="#059669"
                fontSize="11"
                fontWeight="600"
                fontFamily="var(--font-sans)"
              >
                {solution.commercialMatch
                  ? `✓ Tubo comercial de ${solution.commercialMatch.label}`
                  : `≈ ${formatPtNumber(solution.inchesExact, 2)} polegadas`}
              </text>
            </g>
          </g>

          {/* RESERVOIR TANK (Right) */}
          <g onClick={() => onSelectStep(1)} className="cursor-pointer">
            {/* Tank background */}
            <rect
              x="432"
              y={tankTop}
              width="236"
              height={tankHeight}
              rx="6"
              fill="#FFFFFF"
              stroke={activeStep === 1 ? '#0284C7' : '#64748B'}
              strokeWidth={activeStep === 1 ? '2.5' : '2'}
            />

            {/* Water inside tank */}
            <g clipPath="url(#tankClip)">
              <rect
                x="432"
                y={waterY}
                width="236"
                height={waterHeight + 2}
                fill="url(#waterTankGrad)"
              />
              {/* Water meniscus highlight */}
              <line
                x1="432"
                y1={waterY}
                x2="668"
                y2={waterY}
                stroke="#BAE6FD"
                strokeWidth="2"
              />
            </g>

            {/* 1.000L level graduation marks */}
            {Array.from({ length: boxDivisions - 1 }).map((_, idx) => {
              const y = tankTop + ((idx + 1) / boxDivisions) * tankHeight;
              return (
                <line
                  key={idx}
                  x1="654"
                  y1={y}
                  x2="668"
                  y2={y}
                  stroke="#94A3B8"
                  strokeWidth="1"
                />
              );
            })}

            {/* Tank labels */}
            <text
              x="550"
              y="44"
              textAnchor="middle"
              fill="#0F172A"
              fontSize="12.5"
              fontWeight="700"
              fontFamily="var(--font-sans)"
            >
              Reservatório ({formatPtNumber(solution.volumeLiters, 0)} L = {formatPtNumber(solution.volumeM3, 3)} m³)
            </text>

            {/* Live fill overlay text centered cleanly with high contrast badge */}
            <rect
              x="466"
              y="132"
              width="168"
              height="52"
              rx="6"
              fill="#0F172A"
              fillOpacity="0.82"
            />
            <text
              x="550"
              y="154"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="13"
              fontWeight="700"
              fontFamily="var(--font-mono)"
            >
              {formatPtNumber(currentLiters, 0)} L ({Math.round(fillProgress * 100)}%)
            </text>
            <text
              x="550"
              y="172"
              textAnchor="middle"
              fill="#BAE6FD"
              fontSize="11"
              fontFamily="var(--font-mono)"
            >
              t = {formatPtNumber(currentElapsedSec, 0)} / {formatPtNumber(solution.totalSeconds, 0)} s
            </text>

            {/* Total time below tank */}
            <text
              x="550"
              y="276"
              textAnchor="middle"
              fill="#334155"
              fontSize="11.5"
              fontWeight="600"
              fontFamily="var(--font-sans)"
            >
              Tempo total: {formatTimeText(solution.hours, solution.minutes, solution.seconds)}
            </text>
            <text
              x="550"
              y="294"
              textAnchor="middle"
              fill="#0284C7"
              fontSize="11.5"
              fontWeight="700"
              fontFamily="var(--font-mono)"
            >
              ({formatPtNumber(solution.totalSeconds, 0)} segundos)
            </text>
          </g>
        </svg>
      </div>

      {/* Bottom contextual strip */}
      <div className="px-5 py-3.5 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
        <div>
          <span className="font-semibold text-slate-900">Analogia real:</span>{' '}
          {formatPtNumber(solution.boxesOf1000, 1)} caixas d’água de 1.000 L sendo cheias a{' '}
          <span className="font-mono font-medium text-slate-900 tabular-nums">
            {formatPtNumber(solution.flowLs, 2)} L/s
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Clique no passo:</span>
          {[1, 2, 3, 4, 5].map((stepNum) => (
            <button
              key={stepNum}
              type="button"
              onClick={() => onSelectStep(stepNum)}
              className={`w-7 h-7 rounded-md font-mono text-xs font-semibold transition-colors cursor-pointer ${
                activeStep === stepNum
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {stepNum}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
