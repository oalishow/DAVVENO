import { ShieldCheck } from 'lucide-react';

export default function Header() {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <ShieldCheck className="w-24 h-24 sm:w-32 sm:h-32 text-sky-500 drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]" />
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-teal-500 to-emerald-600 dark:from-sky-400 dark:via-teal-300 dark:to-emerald-400 animated-slide-in-up tracking-tight mb-2">
        Verify-ID
      </h1>
      <p className="text-slate-500 dark:text-slate-400 font-light text-xs sm:text-sm md:text-base animated-fade-in">
        Verificador de carteirinha FAJOPA e SPSCJ
      </p>
    </div>
  );
}
