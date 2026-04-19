import { useState, useRef } from 'react';
import { X, Save, Trash2, ShieldAlert, Download, QrCode } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';
import type { Member } from '../types';
import { resizeAndConvertToBase64 } from '../lib/imageUtils';
import { QRCodeCanvas } from 'qrcode.react';
import { URL_STORAGE_KEY, DEFAULT_PUBLIC_URL } from '../lib/constants';

interface MemberEditModalProps {
  member: Member;
  onClose: () => void;
  onUpdate: () => void;
}

export default function MemberEditModal({ member, onClose, onUpdate }: MemberEditModalProps) {
  const [name, setName] = useState(member.name || '');
  const [ra, setRa] = useState(member.ra || '');
  const [email, setEmail] = useState(member.email || '');
  const [validity, setValidity] = useState(member.validityDate || '');
  const [isActive, setIsActive] = useState(member.isActive !== false);
  const [course, setCourse] = useState(member.course || '');
  const [roles, setRoles] = useState<string[]>(member.roles || []);
  const [photo, setPhoto] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const availableRoles = ["ALUNO(A)", "PROFESSOR(A)", "COLABORADOR(A)", "SEMINARISTA", "PADRE", "DIÁCONO", "BISPO"];
  const qrRef = useRef<HTMLDivElement>(null);

  const toggleRole = (role: string) => {
    setRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  const handleUpdate = async () => {
    if (!name || !validity) {
      setError('Nome e Validade são obrigatórios.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    let photoUrl = member.photoUrl;
    if (photo) {
      try {
        photoUrl = await resizeAndConvertToBase64(photo);
      } catch (e) {
        console.error('Photo error', e);
      }
    }

    try {
      const docRef = doc(db, `artifacts/${appId}/public/data/students`, member.id);
      await updateDoc(docRef, {
        name, ra, email, validityDate: validity, isActive, course, roles,
        photoUrl: photoUrl || null
      });
      onUpdate();
    } catch (err) {
      console.error(err);
      setError('Falha ao gravar alterações.');
      setLoading(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!confirm('Deseja mover este registo para a lixeira?')) return;
    setLoading(true);
    try {
      const docRef = doc(db, `artifacts/${appId}/public/data/students`, member.id);
      await updateDoc(docRef, { deletedAt: new Date().toISOString() });
      onUpdate();
    } catch (err) {
      console.error(err);
      setError('Falha ao remover.');
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `QR_${name.replace(/\\s+/g, '_')}.png`;
    link.click();
  };

  const verificationUrl = `${localStorage.getItem(URL_STORAGE_KEY) || DEFAULT_PUBLIC_URL}?verify=${member.alphaCode}`;

  return (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[55] overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-4xl my-auto max-h-[95vh] overflow-y-auto custom-scrollbar animated-scale-in">
        
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200 dark:border-slate-700/60 sticky top-0 bg-white dark:bg-slate-800 z-20">
          <h2 className="text-xl font-bold text-sky-600 dark:text-sky-400">Ficha do Membro</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {error && <div className="mb-4 bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-medium">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700/30 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Nome Completo</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-modern w-full rounded-lg py-2 px-3 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">RA</label>
                  <input type="text" value={ra} onChange={e => setRa(e.target.value)} className="input-modern w-full rounded-lg py-2 px-3 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Status</label>
                  <select value={isActive ? 'true' : 'false'} onChange={e => setIsActive(e.target.value === 'true')} className="input-modern w-full rounded-lg py-2 px-3 text-sm">
                    <option value="true">Ativo</option>
                    <option value="false">Suspenso</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Data Validade</label>
                <input type="date" value={validity} onChange={e => setValidity(e.target.value)} className="input-modern w-full rounded-lg py-2 px-3 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Código Identificação</label>
                <input type="text" value={member.alphaCode || ''} disabled className="input-modern w-full rounded-lg py-2 px-3 text-sm font-mono tracking-widest bg-slate-100 opacity-70" />
              </div>
              
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/50">
                <label className="text-xs font-medium text-slate-500 mb-2 block">Vínculos</label>
                <div className="flex flex-wrap gap-2">
                  {availableRoles.map(role => (
                    <button key={role} onClick={() => toggleRole(role)} className={`px-2 py-1 rounded text-[10px] font-medium border transition-all ${roles.includes(role) ? 'bg-sky-100 text-sky-700 border-sky-300' : 'bg-slate-100 text-slate-600 border-slate-300'}`}>
                      {role}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block mt-2">Atualizar Foto (opcional)</label>
                <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} className="w-full text-xs text-slate-600 file:border-0 file:rounded file:px-3 file:py-1 file:bg-sky-100 file:text-sky-700" />
              </div>
            </div>
          </div>

          <div className="md:col-span-5 bg-slate-50 dark:bg-slate-900/30 p-6 rounded-xl border border-slate-200 dark:border-slate-700/30 flex flex-col items-center justify-center">
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">QR Code de Validação</h3>
            
            <div ref={qrRef} className="bg-white p-3 rounded-xl shadow-lg mb-4">
               <QRCodeCanvas value={verificationUrl} size={160} level="M" />
            </div>

            <button onClick={downloadQR} className="btn-modern flex items-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-sm w-full justify-center mb-2">
              <Download className="w-4 h-4" /> Exportar QR Code
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-5 border-t border-slate-200 dark:border-slate-700/60 gap-4">
          <button onClick={handleSoftDelete} disabled={loading} className="btn-modern flex items-center gap-2 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors w-full sm:w-auto justify-center">
             <Trash2 className="w-4 h-4" /> Mover para Lixeira
          </button>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={onClose} disabled={loading} className="btn-modern flex-1 sm:flex-none px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-medium">Voltar</button>
            <button onClick={handleUpdate} disabled={loading} className="btn-modern flex-1 sm:flex-none px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> {loading ? 'A processar...' : 'Guardar'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
