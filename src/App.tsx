/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DiaryProvider, useDiary } from './context/DiaryContext';
import { AdminProvider } from './context/AdminContext';
import { Toaster, toast } from 'sonner';
import { LandingPage } from './pages/LandingPage';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useEffect } from 'react';
import { Dashboard } from './pages/Dashboard';
import { ClassDetail } from './pages/ClassDetail';
import { Reports } from './pages/Reports';
import { SecretariatDashboard } from './pages/SecretariatDashboard';
import { Manual } from './pages/Manual';
import { Navbar } from './components/Navbar';
import { AnimatePresence, motion } from 'motion/react';

function PWAUpdater() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    if (offlineReady) {
      toast.success('App pronto para uso offline!', {
        description: 'Você pode acessar o diário mesmo sem internet.',
        duration: 5000,
      });
      setOfflineReady(false);
    }
  }, [offlineReady, setOfflineReady]);

  useEffect(() => {
    if (needRefresh) {
      toast.info('Nova versão disponível!', {
        description: 'Clique para atualizar e obter as melhorias mais recentes.',
        action: {
          label: 'Atualizar Agora',
          onClick: () => updateServiceWorker(true),
        },
        duration: Infinity,
      });
    }
  }, [needRefresh, updateServiceWorker]);

  return null;
}

function AppContent() {
  const { user, isAuthReady, data } = useDiary();
  const [view, setView] = useState<'dashboard' | 'reports' | 'class-detail' | 'manual'>('dashboard');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-neutral-500 font-serif">Carregando Diário...</p>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  // Route for Secretariat
  if (data.settings.role === 'super_admin') {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar 
          activeView={view} 
          onViewChange={(v) => {
            if (v === 'manual') setView('manual');
            else setView('dashboard');
          }} 
        />
        <main>
          {view === 'manual' ? (
            <Manual onBack={() => setView('dashboard')} />
          ) : (
            <AdminProvider>
              <SecretariatDashboard />
            </AdminProvider>
          )}
        </main>
      </div>
    );
  }

  const handleSelectClass = (id: string) => {
    setSelectedClassId(id);
    setView('class-detail');
  };

  const handleBackToDashboard = () => {
    setSelectedClassId(null);
    setView('dashboard');
  };

  return (
    <div className="min-h-screen bg-paper">
      <Navbar 
        activeView={view} 
        onViewChange={(v) => {
          setView(v);
          setSelectedClassId(null);
        }} 
      />
      
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={view + (selectedClassId || '')}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
          >
            {view === 'dashboard' && <Dashboard onSelectClass={handleSelectClass} />}
            {view === 'reports' && <Reports />}
            {view === 'manual' && <Manual onBack={() => setView('dashboard')} />}
            {view === 'class-detail' && selectedClassId && (
              <ClassDetail classId={selectedClassId} onBack={handleBackToDashboard} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <DiaryProvider>
      <PWAUpdater />
      <AppContent />
      <Toaster position="top-right" richColors closeButton />
    </DiaryProvider>
  );
}

