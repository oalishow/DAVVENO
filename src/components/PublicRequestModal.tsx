import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';
import type { Member } from '../types';
import ImageCropperModal from './ImageCropperModal';

interface PublicRequestModalProps {
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export default function PublicRequestModal({ onClose, onSubmitSuccess }: PublicRequestModalProps) {
  const [name, setName] = useState('');
  const [ra, setRa] = useState('');
  const [email, setEmail] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [course, setCourse] = useState('');
  
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  
  const [consent, setConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableRoles = ["ALUNO(A)", "PROFESSOR(A)", "COLABORADOR(A)", "SEMINARISTA", "PADRE", "DIÁCONO", "BISPO"];

  const toggleRole = (role: string) => {
    setRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCropImageSrc(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  const handleSubmit = async () => {
    if (!name || !email || roles.length === 0) {
      setError('Nome, E-mail e ao menos um Vínculo são obrigatórios.');
      return;
    }
    
    if (!consent) {
      setError('É necessário aceitar os termos da LGPD para prosseguir.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload: Partial<Member> = {
        name: name.trim(),
        ra: ra.trim(),
        email: email.trim(),
        roles,
        course,
        photoUrl: photoBase64,
        isApproved: false, // Pedido pendente  
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, `artifacts/${appId}/public/data/students`), payload);

      // Aqui entra o EmailJS na implementação estendida.
      onSubmitSuccess();
    } catch (e) {
      console.error(e);
      setError('Falha de comunicação. A sua solicitação não foi processada.');
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] overflow-y-auto">
      {cropImageSrc && (
        <ImageCropperModal
          imageSrc={cropImageSrc}
          onClose={() => setCropImageSrc(null)}
          onCropComplete={(croppedBase64) => {
            setPhotoBase64(croppedBase64);
            setCropImageSrc(null);
          }}
        />
      )}
      
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-xl animated-scale-in my-auto max-h-[90vh] flex flex-col relative overflow-y-auto custom-scrollbar">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
           <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
        </button>

        <h2 className="text-xl font-bold text-sky-600 dark:text-sky-400 mb-2">Solicitar Identidade Digital</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Preencha os seus dados. O seu pedido será enviado para a secretaria da instituição para validação.</p>

        {error && <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm font-medium rounded-xl">{error}</div>}

        <div className="space-y-4">
          <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-slate-500 uppercase mb-1">Nome Completo</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: João Silva" className="input-modern w-full rounded-xl py-3 px-4 text-sm" />
          </div>
          <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-slate-500 uppercase mb-1">RA (Registro Acadêmico)</label>
              <input type="text" value={ra} onChange={e => setRa(e.target.value)} placeholder="Se aplicável" className="input-modern w-full rounded-xl py-3 px-4 text-sm" />
          </div>
          <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-slate-500 uppercase mb-1">E-mail para Contacto</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Para ser notificado(a) da aprovação" className="input-modern w-full rounded-xl py-3 px-4 text-sm" />
          </div>
          
          <div className="pt-1 border-t border-slate-200 dark:border-slate-700/50 mt-1">
              <label className="block text-[10px] sm:text-xs font-semibold text-slate-500 uppercase mb-2 mt-2">Vínculo Institucional</label>
              <div className="flex flex-wrap gap-2">
                {availableRoles.map(role => (
                  <button
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${roles.includes(role) ? 'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-500/50' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
          </div>

          <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-slate-500 uppercase mb-1 mt-2">Curso Académico</label>
              <select value={course} onChange={e => setCourse(e.target.value)} className="input-modern w-full rounded-xl py-3 px-4 text-sm">
                  <option value="">Nenhum / Não aplicável</option>
                  <option value="FILOSOFIA">FILOSOFIA</option>
                  <option value="FILOSOFIA EAD">FILOSOFIA EAD</option>
                  <option value="TEOLOGIA">TEOLOGIA</option>
                  <option value="TEOLOGIA EAD">TEOLOGIA EAD</option>
              </select>
          </div>
          <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2">Fotografia Pessoal (Rosto)</label>
              <div className="flex items-center gap-4">
                {photoBase64 && (
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-300 dark:border-slate-600 shadow-sm flex-shrink-0">
                    <img src={photoBase64} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors text-sm font-semibold dark:bg-sky-900/20 dark:border-sky-600/50 dark:text-sky-400">
                  <ImageIcon className="w-5 h-5"/>
                  {photoBase64 ? 'Alterar Fotografia' : 'Escolher e Recortar Fotografia'}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
          </div>
        </div>

        <div className="mt-6 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 flex items-start gap-3">
           <input 
             type="checkbox" 
             id="lgpd-consent" 
             checked={consent} 
             onChange={(e) => setConsent(e.target.checked)}
             className="mt-1 w-4 h-4 text-sky-600 bg-slate-100 border-slate-300 rounded focus:ring-sky-500 dark:bg-slate-700 dark:border-slate-600"
           />
           <div className="flex-1">
             <label htmlFor="lgpd-consent" className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer hover:text-sky-600 transition-colors">
               <ShieldCheck className="w-4 h-4 text-emerald-500" /> Termo de Consentimento (LGPD)
             </label>
             <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
               Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), concordo e autorizo que os meus dados pessoais e de imagem sejam armazenados e processados exclusivamente para a emissão e verificação da Identidade Digital da instituição.
             </p>
           </div>
        </div>

        <button onClick={handleSubmit} disabled={loading} className="mt-6 btn-modern w-full py-3.5 px-4 rounded-xl shadow-lg shadow-sky-600/20 text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 flex justify-center gap-2 items-center">
            {loading ? 'A Enviar...' : <><Save className="w-4 h-4"/> Enviar Solicitação</>}
        </button>
      </div>
    </div>,
    document.body
  );
}
