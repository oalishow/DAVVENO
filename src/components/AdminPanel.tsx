import { useState } from 'react';
import { Settings, UserPlus, Database, Trash2, Bell, Printer, Loader2 } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';
import { resizeAndConvertToBase64 } from '../lib/imageUtils';
import MemberList from './MemberList';
import SettingsModal from './SettingsModal';
import RecycleBinModal from './RecycleBinModal';
import BackupModal from './BackupModal';

export default function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [name, setName] = useState('');
  const [ra, setRa] = useState('');
  const [validity, setValidity] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [course, setCourse] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);

  const [status, setStatus] = useState<{ msg: string; type: 'success' | 'error' | 'loading' } | null>(null);
  const [showList, setShowList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBin, setShowBin] = useState(false);
  const [showBackup, setShowBackup] = useState(false);

  const availableRoles = ["ALUNO(A)", "PROFESSOR(A)", "COLABORADOR(A)", "SEMINARISTA", "PADRE", "DIÁCONO", "BISPO"];

  const toggleRole = (role: string) => {
    setRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  const handleRegister = async () => {
    if (!name || !validity) {
      setStatus({ msg: 'Preencha o Nome e a Validade.', type: 'error' });
      setTimeout(() => setStatus(null), 4000);
      return;
    }

    setStatus({ msg: 'A processar registo...', type: 'loading' });

    let photoUrl: string | null = null;
    if (photo) {
      try {
        photoUrl = await resizeAndConvertToBase64(photo);
      } catch (e) {
        console.error('Error with photo:', e);
      }
    }

    try {
      const alphaCode = Array(6).fill(0).map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('');
      const membersRef = collection(db, `artifacts/${appId}/public/data/students`);

      await addDoc(membersRef, {
        name: name.trim(),
        ra: ra.trim(),
        validityDate: validity,
        alphaCode,
        photoUrl,
        roles,
        course,
        isActive: true,
        isApproved: true,
        createdAt: new Date().toISOString()
      });

      setStatus({ msg: 'Identidade criada com sucesso!', type: 'success' });
      setName(''); setRa(''); setValidity(''); setCourse(''); setRoles([]); setPhoto(null);
      setTimeout(() => setStatus(null), 4000);
    } catch (error) {
      console.error(error);
      setStatus({ msg: 'Falha no registo. Verifique a conexão.', type: 'error' });
      setTimeout(() => setStatus(null), 4000);
    }
  };

  return (
    <div className="animated-fade-in">
      <div className="flex justify-between items-center mb-6 sm:mb-8 border-b border-slate-200 dark:border-slate-700/60 pb-3 sm:pb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-200">Painel de Gestão</h2>
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => setShowSettings(true)} className="p-1.5 sm:p-2 text-sky-600 dark:text-sky-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-all" title="Configurações">
            <Settings className="w-5 h-5" />
          </button>
          <button onClick={onLogout} className="py-1.5 px-3 sm:py-2 sm:px-4 border border-slate-300 dark:border-slate-600/60 rounded-lg text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:text-rose-500 transition-all">
            Sair
          </button>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-5 bg-white dark:bg-slate-800/40 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50">
        <h3 className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          Registo Direto de Membro
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nome Completo</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: João Silva" className="input-modern w-full rounded-xl py-2.5 px-3" />
          </div>
          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">RA</label>
            <input type="text" value={ra} onChange={e => setRa(e.target.value)} placeholder="Ex: 123456" className="input-modern w-full rounded-xl py-2.5 px-3" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Data de Validade</label>
            <input type="date" value={validity} onChange={e => setValidity(e.target.value)} className="input-modern w-full rounded-xl py-2.5 px-3 uppercase text-sm" />
          </div>
          
          <div className="md:col-span-2 pt-1 border-t border-slate-200 dark:border-slate-700/50 mt-1">
            <label className="block text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2">Vínculo Institucional</label>
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

          <div className="md:col-span-2 border-t border-slate-200 dark:border-slate-700/50 pt-3 mt-1">
            <label className="block text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Curso Académico</label>
            <select value={course} onChange={e => setCourse(e.target.value)} className="input-modern w-full rounded-xl py-2.5 px-3 text-sm">
              <option value="">Nenhum / Não aplicável</option>
              <option value="FILOSOFIA">FILOSOFIA</option>
              <option value="FILOSOFIA EAD">FILOSOFIA EAD</option>
              <option value="TEOLOGIA">TEOLOGIA</option>
              <option value="TEOLOGIA EAD">TEOLOGIA EAD</option>
            </select>
          </div>

          <div className="md:col-span-2 border-t border-slate-200 dark:border-slate-700/50 pt-3 mt-1">
             <label className="block text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Fotografia do Membro (Opcional)</label>
             <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} className="w-full text-sm text-slate-600 dark:text-slate-400 file:cursor-pointer file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-100 file:text-sky-600 hover:file:bg-sky-200 transition-all" />
          </div>
        </div>

        <button 
          onClick={handleRegister} 
          disabled={status?.type === 'loading'}
          className="btn-modern w-full flex items-center justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-sky-600/20 text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500"
        >
          {status?.type === 'loading' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Criar Registo Direto & Gerar QR Code
        </button>
      </div>

      {status && status.type !== 'loading' && (
        <div className={`mt-4 p-3 rounded-xl text-center text-sm font-medium border ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
          {status.msg}
        </div>
      )}

      {/* Toolbar */}
      <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-slate-200 dark:border-slate-700/60">
        <h3 className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          Gestão & Base de Dados
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-3 mb-4">
          <button onClick={() => setShowList(!showList)} className={`btn-modern py-2.5 px-3 rounded-xl border shadow-sm text-xs sm:text-sm font-medium transition-colors ${showList ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white border-transparent' : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600/50 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
            Exibir Lista
          </button>
          
          <button className="btn-modern flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-sky-300 text-sky-700 bg-sky-50 hover:bg-sky-100 text-xs sm:text-sm font-medium dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-500/30">
            <Printer className="w-4 h-4" /> Imprimir
          </button>

          <button onClick={() => setShowBackup(true)} className="btn-modern flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs sm:text-sm font-medium dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-500/30">
            <Database className="w-4 h-4" /> Backups
          </button>

          <button onClick={() => setShowBin(true)} className="btn-modern flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs sm:text-sm font-medium dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-500/30">
            <Trash2 className="w-4 h-4" /> Lixeira
          </button>

          <button className="btn-modern flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 text-xs sm:text-sm font-medium dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-500/30">
            <Bell className="w-4 h-4" /> Solicitações
          </button>
        </div>

        {showList && <MemberList />}
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showBin && <RecycleBinModal onClose={() => setShowBin(false)} />}
      {showBackup && <BackupModal onClose={() => setShowBackup(false)} />}
    </div>
  );
}
