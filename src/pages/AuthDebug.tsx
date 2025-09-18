import React, { useMemo, useState } from 'react';
import { supabase } from '../config/supabase';

type CheckResult = {
  name: string;
  status: 'pass' | 'fail' | 'info';
  details?: any;
};

const mask = (val?: string) => {
  if (!val) return 'missing';
  try {
    const url = new URL(val);
    return url.origin;
  } catch {
    return val.length > 12 ? `${val.slice(0, 6)}...${val.slice(-4)}` : val;
  }
};

const AuthDebug: React.FC = () => {
  const [results, setResults] = useState<CheckResult[]>([]);
  const [running, setRunning] = useState(false);

  const envInfo = useMemo(() => ({
    MODE: import.meta.env.MODE,
    PROD: import.meta.env.PROD,
    DEV: import.meta.env.DEV,
    VITE_SUPABASE_URL: mask(import.meta.env.VITE_SUPABASE_URL),
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'present' : 'missing',
    ORIGIN: typeof window !== 'undefined' ? window.location.origin : 'n/a',
  }), []);

  const runChecks = async () => {
    setRunning(true);
    const out: CheckResult[] = [];
    try {
      out.push({ name: 'Env: Supabase URL', status: envInfo.VITE_SUPABASE_URL !== 'missing' ? 'pass' : 'fail', details: envInfo.VITE_SUPABASE_URL });
      out.push({ name: 'Env: Supabase Anon Key', status: envInfo.VITE_SUPABASE_ANON_KEY === 'present' ? 'pass' : 'fail' });
      out.push({ name: 'Env: Origin', status: 'info', details: envInfo.ORIGIN });

      // Check session
      const { data: sessData, error: sessErr } = await supabase.auth.getSession();
      if (sessErr) {
        out.push({ name: 'Auth: getSession', status: 'fail', details: sessErr.message });
      } else {
        out.push({ name: 'Auth: getSession', status: 'pass', details: { hasSession: Boolean(sessData.session), userId: sessData.session?.user?.id } });
      }

      // Simple DB connectivity check (public, RLS-protected table may fail which is okay)
      const { data: pingData, error: pingErr } = await supabase
        .from('settings')
        .select('key')
        .limit(1);
      if (pingErr) {
        out.push({ name: 'DB: settings read', status: 'fail', details: pingErr.message });
      } else {
        out.push({ name: 'DB: settings read', status: 'pass', details: pingData });
      }

      // Try RPC existence (login_customer) without running sensitive logic
      // We call it with dummy data to just see permission error vs function missing
      const { error: rpcErr } = await supabase.rpc('login_customer', { user_email: 'x', user_password: 'y' });
      if (rpcErr) {
        out.push({ name: 'DB: RPC login_customer', status: 'info', details: rpcErr.message });
      } else {
        out.push({ name: 'DB: RPC login_customer', status: 'pass' });
      }
    } catch (e: any) {
      out.push({ name: 'Unexpected error', status: 'fail', details: e?.message || String(e) });
    } finally {
      setResults(out);
      setRunning(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Auth Debug</h1>
      <div className="rounded border p-4 bg-white shadow mb-4">
        <h2 className="font-semibold mb-2">Environment</h2>
        <pre className="text-sm overflow-auto">
{JSON.stringify(envInfo, null, 2)}
        </pre>
      </div>
      <button
        disabled={running}
        onClick={runChecks}
        className={`px-4 py-2 rounded text-white ${running ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {running ? 'Running checks…' : 'Run checks'}
      </button>
      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((r, i) => (
            <div key={i} className={`p-3 rounded border ${r.status === 'pass' ? 'border-green-200 bg-green-50' : r.status === 'fail' ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="font-medium">{r.name} — <span className={r.status === 'pass' ? 'text-green-700' : r.status === 'fail' ? 'text-red-700' : 'text-gray-700'}>{r.status}</span></div>
              {r.details !== undefined && (
                <pre className="text-xs mt-1 overflow-auto">{typeof r.details === 'string' ? r.details : JSON.stringify(r.details, null, 2)}</pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuthDebug;
