import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import MunicipalApp from './municipal/MunicipalApp.jsx';
import IndustryApp from './industry/IndustryApp.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Layers, Building2, User, Factory, Loader2 } from 'lucide-react';
import './index.css';

function MainApp() {
  const { portal, setPortal, loading } = useAuth();

  return (
    <div className="relative">
      {/* Loading Indicator */}
      {loading && (
        <div className="fixed top-3 right-3 z-[110] flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1.5 text-xs text-white backdrop-blur shadow-lg border border-slate-700">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
          <span>Syncing with server...</span>
        </div>
      )}

      {/* Active Portal Render */}
      {(portal === 'municipal' || portal === 'municipality') && (
        <MunicipalApp
          onSwitchPortal={(target) => {
            if (typeof target === 'string') setPortal(target);
            else setPortal('industry');
          }}
        />
      )}

      {portal === 'citizen' && (
        <App
          onSwitchPortal={(target) => {
            if (typeof target === 'string') setPortal(target);
            else setPortal('municipality');
          }}
        />
      )}

      {portal === 'industry' && (
        <IndustryApp
          onSwitchPortal={(target) => {
            if (typeof target === 'string') setPortal(target);
            else setPortal('municipality');
          }}
        />
      )}

      {/* Persistent Global Portal Switcher Pill for EcoConnect */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[99] flex items-center gap-1 rounded-full bg-slate-900/90 backdrop-blur-md p-1.5 shadow-2xl border border-slate-700/80 text-white text-xs font-semibold">
        <div className="flex items-center gap-1 px-2.5 py-1 text-slate-400 font-bold uppercase tracking-wider text-[10px] hidden sm:flex">
          <Layers className="h-3.5 w-3.5 text-emerald-400" />
          EcoConnect Portals:
        </div>

        <button
          onClick={() => setPortal('citizen')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-bold ${
            portal === 'citizen'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400/50'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <User className="h-3.5 w-3.5" />
          Citizen
        </button>

        <button
          onClick={() => setPortal('municipality')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-bold ${
            portal === 'municipal' || portal === 'municipality'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/50'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          Municipality
        </button>

        <button
          onClick={() => setPortal('industry')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-bold ${
            portal === 'industry'
              ? 'bg-amber-400 text-slate-900 shadow-md shadow-amber-400/30 ring-1 ring-amber-300/80'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Factory className="h-3.5 w-3.5" />
          Industry
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  </React.StrictMode>
);
