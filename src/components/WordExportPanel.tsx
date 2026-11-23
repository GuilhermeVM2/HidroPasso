import React, { useState } from 'react';
import { Copy, Check, FileText } from 'lucide-react';
import {
  HydraulicSolution,
  ProblemParams,
  generateWordEquations,
  generateWordPlainText,
} from '../utils/hydraulics';

interface WordExportPanelProps {
  params: ProblemParams;
  solution: HydraulicSolution;
}

export const WordExportPanel: React.FC<WordExportPanelProps> = ({ params, solution }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const plainText = generateWordPlainText(params, solution);
  const equations = generateWordEquations(solution);

  const copyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((curr) => (curr === key ? null : curr));
      }, 2200);
    } catch {
      // Fallback via hidden textarea if clipboard API is restricted
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((curr) => (curr === key ? null : curr));
      }, 2200);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Clean Plain Text for Word */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-700" />
              <h3 className="text-lg font-bold text-slate-900">
                Resolução limpa pronta para colar no Word
              </h3>
            </div>
            <button
              type="button"
              onClick={() => copyText('full-word', plainText)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {copiedKey === 'full-word' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Texto copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copiar texto completo
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Sem camadas invisíveis de fórmula que quebram o texto ao colar. Atualiza automaticamente
            com os valores da sua simulação.
          </p>
          <pre className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-4 text-xs font-sans text-slate-800 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
            {plainText}
          </pre>
        </div>
      </div>

      {/* Word Equation Editor (Alt + =) */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Equações para o Word (Alt + =)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Para deixar frações e raízes quadradas no visual profissional dentro do Word:
          </p>
          <ol className="text-xs text-slate-700 space-y-1.5 mb-5 list-decimal list-inside bg-slate-50 border border-slate-200 rounded-lg p-3.5">
            <li>
              Aperte <kbd className="font-mono px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[11px]">Alt</kbd> +{' '}
              <kbd className="font-mono px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[11px]">=</kbd> no Word.
            </li>
            <li>
              Cole uma linha abaixo e aperte{' '}
              <kbd className="font-mono px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[11px]">Ctrl</kbd> +{' '}
              <kbd className="font-mono px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[11px]">=</kbd>{' '}
              (Equação → Converter → Profissional).
            </li>
          </ol>

          <div className="space-y-2.5">
            {equations.map((eq, idx) => {
              const key = `eq-${idx}`;
              const isCopied = copiedKey === key;
              return (
                <div
                  key={eq.label}
                  className="flex items-center justify-between gap-2 bg-[#F8FAFC] border border-slate-200 rounded-lg p-3"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-slate-500 mb-0.5">{eq.label}</p>
                    <code className="block font-mono text-xs text-slate-900 truncate tabular-nums">
                      {eq.formula}
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(key, eq.formula)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
