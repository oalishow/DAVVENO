import { useState } from 'react';
import { Lock } from 'lucide-react';
import { PASSWORD_STORAGE_KEY, DEFAULT_ADMIN_PASSWORD } from '../lib/constants';

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = () => {
    const storedPassword = localStorage.getItem(PASSWORD_STORAGE_KEY) || DEFAULT_ADMIN_PASSWORD;
    if (password === storedPassword) {
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-sm mx-auto animated-scale-in">
      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-sky-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-sky-100 dark:border-slate-700 shadow-inner">
        <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-sky-600 dark:text-sky-400" />
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-center text-slate-800 dark:text-white tracking-tight mb-2">Acesso Reservado</h1>
      <p className="text-slate-500 dark:text-slate-400 text-center text-xs sm:text-sm mb-6">
        Área restrita à gestão da instituição.
      </p>

      {error && (
        <div className="text-center p-2 sm:p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-xs sm:text-sm font-medium">
          Palavra-passe incorreta.
        </div>
      )}

      <div className="space-y-4 sm:space-y-5">
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          placeholder="Palavra-passe"
          className="input-modern w-full text-center tracking-widest text-base sm:text-lg rounded-xl py-3 px-4"
        />
        <button
          onClick={handleLogin}
          className="btn-modern w-full py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-500/30"
        >
          Desbloquear
        </button>
      </div>
    </div>
  );
}
