import React, { forwardRef } from 'react';
import type { Event, CertificateTemplate, Member } from '../types';

interface CertificateRendererProps {
  event: Event;
  template: CertificateTemplate;
  member: Partial<Member>;
}

export const CertificateRenderer = forwardRef<HTMLDivElement, CertificateRendererProps>(
  ({ event, template, member }, ref) => {
    
    // Default fallback styles
    const fontClass = template.fontFamily === 'serif' ? 'font-serif' : 
                      template.fontFamily === 'mono' ? 'font-mono' : 'font-sans';
                      
    const defaultBodyText = `Certificamos que [NOME DO ALUNO], participou com êxito do evento "${event.title}", em formato ${event.format}, realizado entre ${new Date(event.startDate).toLocaleDateString('pt-BR')} e ${new Date(event.endDate || event.startDate).toLocaleDateString('pt-BR')}, com carga horária total de ${event.hours} horas.`;
    
    const bodyText = (template.bodyText || defaultBodyText)
      .replace('[NOME DO ALUNO]', member.name || 'NOME DO ALUNO')
      .replace('[RA DO ALUNO]', member.ra || 'RA DO ALUNO');

    return (
      <div 
        ref={ref} 
        className={`w-[1122px] h-[793px] relative flex flex-col justify-between p-16 overflow-hidden ${fontClass} ${template.bgStyle}`}
      >
        <div className="absolute inset-0 border-[16px] border-slate-800/10 m-6 pointer-events-none rounded-xl"></div>
        <div className="absolute inset-0 border-[2px] border-slate-800/20 m-8 pointer-events-none rounded-lg"></div>

        <div className="relative z-10 flex flex-col items-center pt-8">
          <h1 className="text-6xl font-black text-slate-800 tracking-widest uppercase mb-4">CERTIFICADO</h1>
          <h2 className="text-2xl font-medium text-slate-600 uppercase tracking-widest">DE PARTICIPAÇÃO</h2>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center flex-1 my-12 px-24">
          <p className="text-3xl text-slate-700 text-center leading-relaxed">
            {bodyText}
          </p>
        </div>

        <div className="relative z-10 flex flex-col items-center pb-12">
          <div className="w-80 border-b-2 border-slate-800 mb-4"></div>
          <h3 className="text-2xl font-bold text-slate-800">{template.signatureName || "Nome do Responsável"}</h3>
          <p className="text-lg font-medium text-slate-600">{template.signatureRole || "Cargo / Instituição"}</p>
        </div>
        
        {/* FAJOPA Credits */}
        <div className="absolute bottom-4 right-10 opacity-30 pointer-events-none">
          <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Powered by DAVVERO-ID & FAJOPA</p>
        </div>
      </div>
    );
  }
);

CertificateRenderer.displayName = 'CertificateRenderer';
