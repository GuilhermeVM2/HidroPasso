export interface ProblemParams {
  id: string;
  label: string;
  subtitle: string;
  volumeLiters: number;
  hours: number;
  minutes: number;
  seconds: number;
  velocityMs: number;
  piValue: 3.14 | 3.1416;
}

export interface HydraulicSolution {
  volumeLiters: number;
  volumeM3: number;
  boxesOf1000: number;
  hours: number;
  minutes: number;
  seconds: number;
  hoursInSeconds: number;
  minutesInSeconds: number;
  totalSeconds: number;
  velocityMs: number;
  velocityCms: number;
  piValue: number;
  flowM3s: number;
  flowLs: number;
  bottles3LPerSec: number;
  areaM2: number;
  areaCm2: number;
  r2M2: number;
  r2Cm2: number;
  radiusM: number;
  radiusCm: number;
  diameterM: number;
  diameterCm: number;
  diameterMm: number;
  inchesExact: number;
  commercialMatch: CommercialPipe | null;
}

export interface CommercialPipe {
  label: string;
  inches: number;
  mm: number;
  usage: string;
}

export const COMMERCIAL_PIPES: CommercialPipe[] = [
  { label: '1/2"', inches: 0.5, mm: 12.7, usage: 'Ramais residenciais e torneiras' },
  { label: '3/4"', inches: 0.75, mm: 19.05, usage: 'Alimentação de caixas d’água e chuveiros' },
  { label: '1"', inches: 1.0, mm: 25.4, usage: 'Recalque e abastecimento de médio porte' },
  { label: '1 1/4"', inches: 1.25, mm: 31.75, usage: 'Colunas de distribuição predial' },
  { label: '1 1/2"', inches: 1.5, mm: 38.1, usage: 'Bombas e reservatórios coletivos' },
  { label: '2"', inches: 2.0, mm: 50.8, usage: 'Adutoras e tanques industriais' },
  { label: '2 1/2"', inches: 2.5, mm: 63.5, usage: 'Redes de incêndio e grande vazão' },
  { label: '3"', inches: 3.0, mm: 76.2, usage: 'Linhas principais de recalque industrial' },
];

export const PRESET_PROBLEMS: ProblemParams[] = [
  {
    id: 'aula-12000',
    label: 'Exemplo da Aula (12.000 L)',
    subtitle: 'Reservatório de 12.000 L a 6 m/s em 1h 5min 49s',
    volumeLiters: 12000,
    hours: 1,
    minutes: 5,
    seconds: 49,
    velocityMs: 6,
    piValue: 3.14,
  },
  {
    id: 'residencial-5000',
    label: 'Caixa Residencial (5.000 L)',
    subtitle: 'Reservatório de 5.000 L a 4 m/s em 1h 13min 8s',
    volumeLiters: 5000,
    hours: 1,
    minutes: 13,
    seconds: 8,
    velocityMs: 4,
    piValue: 3.14,
  },
  {
    id: 'escola-3000',
    label: 'Escola (3.000 L)',
    subtitle: 'Reservatório de 3.000 L a 5 m/s em 1h 18min 59s',
    volumeLiters: 3000,
    hours: 1,
    minutes: 18,
    seconds: 59,
    velocityMs: 5,
    piValue: 3.14,
  },
  {
    id: 'industrial-24000',
    label: 'Tanque Industrial (24.000 L)',
    subtitle: 'Tanque de 24.000 L a 4 m/s em 49min 22s',
    volumeLiters: 24000,
    hours: 0,
    minutes: 49,
    seconds: 22,
    velocityMs: 4,
    piValue: 3.14,
  },
];

export function formatPtNumber(value: number, maxDecimals = 4, minDecimals = 0): string {
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  }).format(value);
}

/**
 * Formats numbers keeping at least `sigFigs` non-zero significant digits after decimal,
 * mirroring the calculator precision guidance in the lesson (e.g. 0,0030387).
 */
export function formatSignificantPt(value: number, sigDigits = 5): string {
  if (!Number.isFinite(value) || value === 0) return '0';
  const abs = Math.abs(value);
  if (abs >= 1) {
    return formatPtNumber(value, 4);
  }
  const leadingZeros = Math.max(0, Math.floor(-Math.log10(abs)));
  const decimals = Math.min(10, leadingZeros + sigDigits);
  return formatPtNumber(value, decimals);
}

export function roundToSignificant(value: number, sigDigits: number): number {
  if (!Number.isFinite(value) || value === 0) return 0;
  return Number(value.toPrecision(sigDigits));
}

export function solveHydraulics(params: ProblemParams): HydraulicSolution {
  const volumeLiters = Math.max(1, params.volumeLiters);
  const volumeM3 = volumeLiters / 1000;
  const boxesOf1000 = volumeLiters / 1000;

  const hours = Math.max(0, Math.floor(params.hours));
  const minutes = Math.max(0, Math.floor(params.minutes));
  const seconds = Math.max(0, Math.floor(params.seconds));

  const hoursInSeconds = hours * 3600;
  const minutesInSeconds = minutes * 60;
  const totalSeconds = Math.max(1, hoursInSeconds + minutesInSeconds + seconds);

  const velocityMs = Math.max(0.1, params.velocityMs);
  const velocityCms = velocityMs * 100;
  const piValue = params.piValue;

  const flowM3s = volumeM3 / totalSeconds;
  const flowLs = flowM3s * 1000;
  const bottles3LPerSec = flowLs / 3;

  const areaM2 = flowM3s / velocityMs;
  const areaCm2 = areaM2 * 10000;

  const r2M2 = areaM2 / piValue;
  const r2Cm2 = areaCm2 / piValue;

  const radiusM = Math.sqrt(r2M2);
  const radiusCm = radiusM * 100;

  const diameterM = 2 * radiusM;
  const diameterCm = diameterM * 100;
  const diameterMm = diameterM * 1000;
  const inchesExact = diameterMm / 25.4;

  let closestPipe: CommercialPipe | null = null;
  let minDiff = Infinity;
  for (const pipe of COMMERCIAL_PIPES) {
    const diff = Math.abs(pipe.mm - diameterMm);
    if (diff < minDiff) {
      minDiff = diff;
      closestPipe = pipe;
    }
  }
  const commercialMatch = closestPipe && minDiff <= 0.45 ? closestPipe : null;

  return {
    volumeLiters,
    volumeM3,
    boxesOf1000,
    hours,
    minutes,
    seconds,
    hoursInSeconds,
    minutesInSeconds,
    totalSeconds,
    velocityMs,
    velocityCms,
    piValue,
    flowM3s,
    flowLs,
    bottles3LPerSec,
    areaM2,
    areaCm2,
    r2M2,
    r2Cm2,
    radiusM,
    radiusCm,
    diameterM,
    diameterCm,
    diameterMm,
    inchesExact,
    commercialMatch,
  };
}

export function formatTimeText(hours: number, minutes: number, seconds: number): string {
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hora' : 'horas'}`);
  if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`);
  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds} ${seconds === 1 ? 'segundo' : 'segundos'}`);
  }
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} e ${parts[1]}`;
  return `${parts[0]}, ${parts[1]} e ${parts[2]}`;
}

export function formatShortTime(hours: number, minutes: number, seconds: number): string {
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} h`);
  if (minutes > 0) parts.push(`${minutes} min`);
  parts.push(`${seconds} s`);
  return parts.join(' ');
}

export function generateWordPlainText(params: ProblemParams, sol: HydraulicSolution): string {
  const timeText = formatTimeText(sol.hours, sol.minutes, sol.seconds);
  const matchNote = sol.commercialMatch
    ? ` — um tubo padrão de ${sol.commercialMatch.label} (${sol.commercialMatch.usage.toLowerCase()})`
    : ` (aprox. ${formatPtNumber(sol.inchesExact, 2)} polegadas)`;

  const qStr = formatSignificantPt(sol.flowM3s, 5);
  const qLStr = formatPtNumber(sol.flowLs, 2);
  const aStr = formatSignificantPt(sol.areaM2, 5);
  const r2Str = formatSignificantPt(sol.r2M2, 5);
  const rStr = formatPtNumber(sol.radiusM, 4);
  const dMStr = formatPtNumber(sol.diameterM, 4);
  const dCmStr = formatPtNumber(sol.diameterCm, 2);
  const dMmStr = formatPtNumber(sol.diameterMm, 1);

  return `1. Traduzindo o problema para a vida real

Imagine um reservatório de ${formatPtNumber(sol.volumeLiters, 0)} litros — o equivalente a ${formatPtNumber(sol.boxesOf1000, 1)} caixas d'água de 1.000 litros juntas.

A água entra nesse tanque pelo cano a ${formatPtNumber(sol.velocityMs, 1)} metros por segundo e leva ${timeText} para encher tudo até a boca.

Pergunta: qual é a largura (diâmetro) desse cano? Vamos fazer o caminho de volta — começar pelo volume e pelo tempo até descobrir o tamanho da boca do tubo.

2. Resolvendo em 5 passos curtos e limpos

Passo 1 — Arrumar as unidades (Volume em m³ e Tempo todo em segundos)
- Volume (V): ${formatPtNumber(sol.volumeLiters, 0)} litros ÷ 1.000 = ${formatPtNumber(sol.volumeM3, 3)} m³
- Tempo (t):
  - ${sol.hours} h × 3.600 = ${formatPtNumber(sol.hoursInSeconds, 0)} segundos
  - ${sol.minutes} min × 60 = ${formatPtNumber(sol.minutesInSeconds, 0)} segundos
  - Sobram mais ${sol.seconds} segundos
  - Tempo total: ${formatPtNumber(sol.hoursInSeconds, 0)} + ${formatPtNumber(sol.minutesInSeconds, 0)} + ${sol.seconds} = ${formatPtNumber(sol.totalSeconds, 0)} segundos

Passo 2 — Descobrir a vazão de água (Q = Volume ÷ Tempo)
- Q = ${formatPtNumber(sol.volumeM3, 3)} ÷ ${formatPtNumber(sol.totalSeconds, 0)} = ${qStr} m³/s (ou cerca de ${qLStr} litros por segundo)

Passo 3 — Descobrir a área da boca do cano (A = Vazão ÷ Velocidade)
- A = ${qStr} ÷ ${formatPtNumber(sol.velocityMs, 1)} = ${aStr} m² (${formatPtNumber(sol.areaCm2, 4)} cm²)

Passo 4 — Achar o raio do cano usando a raiz quadrada (r² = Área ÷ π)
- r² = ${aStr} ÷ ${formatPtNumber(sol.piValue, 4)} = ${r2Str} m²
- r = √${r2Str} = ${rStr} m (${formatPtNumber(sol.radiusCm, 2)} cm)

Passo 5 — Multiplicar por 2 para achar o diâmetro (Ø = 2 × r)
- Ø = 2 × ${rStr} = ${dMStr} m
- Em centímetros (× 100): ${dCmStr} cm
- Em milímetros (× 1.000): ${dMmStr} mm

Resposta prática: O diâmetro da tubulação é de ${dMStr} m, ou seja, ${dCmStr} cm (${dMmStr} mm${matchNote}).`;
}

export function generateWordEquations(sol: HydraulicSolution): { label: string; formula: string }[] {
  const qStr = formatSignificantPt(sol.flowM3s, 5);
  const aStr = formatSignificantPt(sol.areaM2, 5);
  const r2Str = formatSignificantPt(sol.r2M2, 5);
  const rStr = formatPtNumber(sol.radiusM, 4);
  const dMStr = formatPtNumber(sol.diameterM, 4);
  const dMmStr = formatPtNumber(sol.diameterMm, 1);
  const matchSuffix = sol.commercialMatch ? ` (${sol.commercialMatch.label})` : '';

  return [
    {
      label: 'Vazão (Q)',
      formula: `Q = V/t = ${formatPtNumber(sol.volumeM3, 3)}/${formatPtNumber(sol.totalSeconds, 0)} = ${qStr} m^3/s`,
    },
    {
      label: 'Área do cano (A)',
      formula: `A = Q/v = ${qStr}/${formatPtNumber(sol.velocityMs, 1)} = ${aStr} m^2`,
    },
    {
      label: 'Raio (r)',
      formula: `r = √(A/π) = √(${aStr}/${formatPtNumber(sol.piValue, 4)}) = √${r2Str} = ${rStr} m`,
    },
    {
      label: 'Diâmetro (Ø)',
      formula: `Ø = 2 × r = 2 × ${rStr} = ${dMStr} m = ${dMmStr} mm${matchSuffix}`,
    },
  ];
}

export function parsePtNumberInput(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s+/g, '');
  if (!cleaned) return null;
  // Handle Brazilian format: 1.200,50 or 0,0030387 or 3949
  let normalized = cleaned;
  if (cleaned.includes(',') && cleaned.includes('.')) {
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    normalized = cleaned.replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    // e.g. 3.949 or 12.000
    normalized = cleaned.replace(/\./g, '');
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
