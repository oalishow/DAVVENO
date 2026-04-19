import { useState, useEffect } from 'react';
import { Camera, XCircle, Search } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { collection, query, getDocs } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';
import type { Member } from '../types';
import VerificationResult from './VerificationResult';

export default function Verifier() {
  const [isScanning, setIsScanning] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  
  const [membersCache, setMembersCache] = useState<Member[]>([]);
  const [validationResult, setValidationResult] = useState<{member: Member | null, status: 'VALID'|'INACTIVE'|'EXPIRED'|'NOT_FOUND'} | null>(null);

  useEffect(() => {
    // Populate cache for "offline fallback" strategy
    const loadCache = async () => {
      try {
        const q = query(collection(db, `artifacts/${appId}/public/data/students`));
        const snapshot = await getDocs(q);
        const members = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Member);
        setMembersCache(members);
      } catch(e) {
        console.error("Cache load error", e);
      }
    };
    loadCache();
  }, []);

  const startScanner = async () => {
    setIsScanning(true);
    setValidationResult(null);
  };

  useEffect(() => {
    let ht5Qrcode: Html5Qrcode | null = null;
    if (isScanning) {
      ht5Qrcode = new Html5Qrcode("reader");
      ht5Qrcode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          ht5Qrcode?.stop().catch(console.error);
          setIsScanning(false);
          
          // Parse QR URL if it's the full link
          let memberId = decodedText;
          try {
              const url = new URL(decodedText);
              memberId = url.searchParams.get('verify') || decodedText;
          } catch (_) {}

          runVerification(memberId, false);
        },
        () => {}
      ).catch(console.error);
    }
    return () => {
      if (ht5Qrcode && ht5Qrcode.isScanning) {
        ht5Qrcode.stop().catch(console.error);
      }
    }
  }, [isScanning]);

  const handleVerifyManual = () => {
    if (!codeInput) return;
    runVerification(codeInput.toUpperCase(), true);
  };

  const runVerification = (idOrCode: string, isAlphaCode: boolean) => {
    const targetId = idOrCode.toUpperCase();
    
    // Engine Matcher
    const foundMember = membersCache.find(m => {
      if (m.deletedAt || m.isApproved === false) return false;
      const alphaUpper = m.alphaCode?.toUpperCase();
      const raUpper = m.ra?.toUpperCase();
      
      if (isAlphaCode) return alphaUpper === targetId || raUpper === targetId;
      return m.id === targetId || m.legacyId === targetId || alphaUpper === targetId || raUpper === targetId;
    });

    if (!foundMember) {
      setValidationResult({ member: null, status: 'NOT_FOUND' });
      return;
    }

    if (foundMember.isActive === false) {
      setValidationResult({ member: foundMember, status: 'INACTIVE' });
      return;
    }

    if (!foundMember.validityDate) {
      setValidationResult({ member: foundMember, status: 'EXPIRED' });
      return;
    }

    const isValid = new Date(foundMember.validityDate + 'T23:59:59') >= new Date();
    setValidationResult({ member: foundMember, status: isValid ? 'VALID' : 'EXPIRED' });
  };

  if (validationResult) {
    return (
      <VerificationResult 
        member={validationResult.member}
        status={validationResult.status}
        onReset={() => {
          setValidationResult(null);
          setCodeInput('');
        }}
      />
    );
  }

  return (
    <div className="py-2 sm:py-4 flex flex-col items-center space-y-6">
      <div className="w-full text-center">
        {!isScanning ? (
          <button 
            onClick={startScanner}
            className="btn-modern w-full md:w-3/4 mx-auto flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl shadow-lg shadow-sky-600/30 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-sky-500 via-teal-400 to-sky-500"
          >
            <Camera className="w-5 h-5" />
            Escanear QR Code
          </button>
        ) : (
          <button 
            onClick={() => setIsScanning(false)}
            className="btn-modern w-full md:w-3/4 mx-auto flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-rose-500 border border-rose-300 hover:bg-rose-500 hover:text-white transition-colors dark:bg-rose-500/10 dark:border-rose-500/30"
          >
            <XCircle className="w-5 h-5" />
            Cancelar Escaneamento
          </button>
        )}
      </div>

      <div id="reader" className={`w-full max-w-sm rounded-2xl overflow-hidden shadow-lg border-2 border-sky-300 dark:border-sky-500/30 ${!isScanning && 'hidden'}`}></div>

      <div className="relative flex items-center py-2 w-full max-w-md">
        <div className="flex-grow border-t border-slate-300 dark:border-slate-700/80"></div>
        <span className="mx-4 text-slate-500 text-[10px] sm:text-xs font-semibold uppercase tracking-widest">Ou valide manualmente</span>
        <div className="flex-grow border-t border-slate-300 dark:border-slate-700/80"></div>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50">
        <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 text-center">Código de Identificação ou RA</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleVerifyManual()}
            placeholder="EX: A1B2C3 OU 123456" 
            className="input-modern flex-grow rounded-xl py-2.5 px-4 text-center font-mono tracking-widest uppercase text-sm sm:text-lg" 
          />
          <button onClick={handleVerifyManual} className="btn-modern py-2.5 px-5 rounded-xl text-white font-bold bg-slate-700 hover:bg-sky-600 flex items-center justify-center gap-2">
            <Search className="w-4 h-4"/> Verificar
          </button>
        </div>
      </div>
    </div>
  );
}
