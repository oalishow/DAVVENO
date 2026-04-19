import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, ShieldAlert, Mail, Link } from 'lucide-react';
import { PASSWORD_STORAGE_KEY, URL_STORAGE_KEY, EMAIL_SETTINGS_KEY, DEFAULT_ADMIN_PASSWORD, DEFAULT_PUBLIC_URL } from '../lib/constants';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const [url, setUrl] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [status, setStatus] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  useEffect(() => {
    setUrl(localStorage.getItem(URL_STORAGE_KEY) || DEFAULT_PUBLIC_URL);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleSaveUrl = () => {
    if (!url) return;
    localStorage.setItem(URL_STORAGE_KEY, url);
    showStatus('URL base atualizada com sucesso!', 'success');
  };

  const handleSavePassword = () => {
    const current = localStorage.getItem(PASSWORD_STORAGE_KEY) || DEFAULT_ADMIN_PASSWORD;
    if (password !== current) {
      showStatus('A senha atual está incorreta.', 'error');
      return;
    }
    if (newPassword.length < 4) {
      showStatus('A nova senha precisa ter mais caracteres.', 'error');
      return;
    }
    localStorage.setItem(PASSWORD_STORAGE_KEY, newPassword);
    setPassword(''); setNewPassword('');
    showStatus('Palavra-passe alterada!', 'success');
  };

  const showStatus = (msg: string, type: 'success'|'error') => {
    setStatus({ msg, type });
    setTimeout(() => setStatus(null), 3000);
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl p-6 w-full max-w-md animated-scale-in">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-sky-600 dark:text-sky-400">Configurações Gerais</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {status && (
          <div className={`mb-4 p-3 text-center rounded-xl text-sm font-medium ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {status.msg}
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-slate-800 dark:text-slate-200">
              <Link className="w-4 h-4" /> URL de Acesso Público
            </h3>
            <input type="text" value={url} onChange={e=>setUrl(e.target.value)} className="input-modern w-full rounded-xl py-2 px-3 text-sm mb-3" />
            <button onClick={handleSaveUrl} className="btn-modern w-full py-2 bg-slate-700 hover:bg-sky-600 text-white rounded-lg text-sm font-medium">Atualizar URL</button>
          </div>

          <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-200 dark:border-rose-500/20">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-rose-700 dark:text-rose-300">
              <ShieldAlert className="w-4 h-4" /> Segurança de Acesso
            </h3>
            <div className="space-y-3">
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Senha Atual" className="input-modern w-full rounded-xl py-2 px-3 text-sm" />
              <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="Nova Senha" className="input-modern w-full rounded-xl py-2 px-3 text-sm" />
              <button onClick={handleSavePassword} className="btn-modern w-full py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium">Alterar Credenciais</button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
