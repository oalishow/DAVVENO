import React, { useState, useRef } from "react";
import { X, Wand2, Sparkles, CheckCircle, Save } from "lucide-react";
import type { Event, CertificateTemplate } from "../types";
import { updateEvent } from "../lib/firebase";
import { CertificateRenderer } from "./CertificateRenderer";
import { GoogleGenAI } from "@google/genai";

interface CertificateEditorProps {
  event: Event;
  onClose: () => void;
  onSaved: (updatedEvent: Event) => void;
}

const TEMPLATE_STYLES = [
  { name: "Clássico", bg: "bg-slate-50", font: "serif" },
  { name: "Moderno", bg: "bg-slate-100", font: "sans" },
  { name: "Pastoral (Sky)", bg: "bg-gradient-to-br from-sky-50 to-white", font: "sans" },
  { name: "Artístico (Warm)", bg: "bg-gradient-to-br from-amber-50 to-orange-50", font: "serif" },
  { name: "Solenidade", bg: "bg-gradient-to-b from-slate-100 to-slate-200", font: "serif" },
];

export default function CertificateEditor({
  event,
  onClose,
  onSaved,
}: CertificateEditorProps) {
  const [template, setTemplate] = useState<CertificateTemplate>(
    event.certificateTemplate || {
      bodyText: "",
      fontFamily: "sans",
      bgStyle: "bg-slate-50",
      signatureName: "Coordenação",
      signatureRole: "FAJOPA",
      isApproved: false,
    }
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const rendererRef = useRef<HTMLDivElement>(null);

  const handleGenerateText = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Gere o texto central de um certificado de participação para o evento "${event.title}".
      Descrição do evento: "${event.description}".
      Carga horária: ${event.hours} horas.
      Instrução: O texto deve ser formal, teológico/pastoral e emocionante.
      Deve mencionar que "[NOME DO ALUNO]" participou com dedicação.
      Use o marcador "[NOME DO ALUNO]" para o nome.
      Não adicione títulos ou assinaturas no texto gerado, apenas o corpo do parágrafo.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text || "";
      setTemplate({ ...template, bodyText: text.trim().replace(/^"|"$/g, '') });
    } catch (e: any) {
      console.error(e);
      alert("Erro ao gerar texto: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const applyNanoBanana = () => {
    // Escolhe um estilo mais arrojado/pastoral
    const styles = TEMPLATE_STYLES.slice(2);
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    setTemplate({
      ...template,
      bgStyle: randomStyle.bg,
      fontFamily: randomStyle.font,
    });
  };

  const handleSaveAndApprove = async () => {
    if (!confirm("Ao conferir e aprovar, os alunos poderão baixar o certificado. Deseja continuar?")) return;
    setIsSaving(true);
    try {
      const finalTemplate = { ...template, isApproved: true };
      await updateEvent(event.id, { certificateTemplate: finalTemplate });
      onSaved({ ...event, certificateTemplate: finalTemplate });
    } catch (e: any) {
      console.error(e);
      alert("Erro ao salvar: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm overflow-hidden">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-6xl h-full sm:h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-sky-500" />
              Editor de Certificado
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Personalize o layout e texto para {event.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row bg-slate-100 dark:bg-slate-900/50">
          
          {/* Settings Sidebar */}
          <div className="w-full md:w-80 lg:w-96 p-4 sm:p-6 bg-white dark:bg-slate-800/40 border-r border-slate-200 dark:border-slate-800 overflow-y-auto shrink-0 flex flex-col gap-6">
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleGenerateText}
                disabled={isGenerating}
                className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border border-indigo-200 dark:border-indigo-500/20 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating ? "Gerando..." : "Produzir Texto com Gemini"}
              </button>

              <button
                onClick={applyNanoBanana}
                className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border border-amber-200 dark:border-amber-500/20"
              >
                <Wand2 className="w-4 h-4" />
                Gerar Design (Nano Banana)
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                  Estilo Visual
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATE_STYLES.map((ts, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTemplate({ ...template, bgStyle: ts.bg, fontFamily: ts.font })}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        template.bgStyle === ts.bg
                          ? "border-sky-500 bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      {ts.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                  Corpo do Texto
                </label>
                <textarea
                  value={template.bodyText}
                  onChange={(e) => setTemplate({ ...template, bodyText: e.target.value })}
                  className="w-full h-40 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-sky-500 resize-none text-slate-700 dark:text-slate-300"
                  placeholder="Deixe em branco para usar o texto padrão..."
                ></textarea>
                <p className="text-[10px] text-slate-400 pl-1">Use [NOME DO ALUNO] como variável.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                    Nome Assinatura
                  </label>
                  <input
                    type="text"
                    value={template.signatureName}
                    onChange={(e) => setTemplate({ ...template, signatureName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-sky-500 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                    Cargo Assinatura
                  </label>
                  <input
                    type="text"
                    value={template.signatureRole}
                    onChange={(e) => setTemplate({ ...template, signatureRole: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-sky-500 text-slate-700 dark:text-slate-300"
                  />
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-700">
               <button
                onClick={handleSaveAndApprove}
                disabled={isSaving}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {isSaving ? "Salvando..." : "Conferir e Aprovar Edição"}
              </button>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 p-4 sm:p-8 flex items-center justify-center bg-slate-200 dark:bg-slate-900/80 overflow-auto">
             <div className="scale-[0.35] sm:scale-50 md:scale-75 lg:scale-95 origin-center transition-transform">
                <div className="shadow-2xl">
                  <CertificateRenderer 
                    ref={rendererRef} 
                    event={event} 
                    template={template} 
                    member={{ name: "JOÃO DA SILVA", ra: "123456" }} 
                  />
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
