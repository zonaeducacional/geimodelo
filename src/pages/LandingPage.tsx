import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDiary } from '../context/DiaryContext';
import { useTheme } from '../context/ThemeContext';
import { Button, Input, Card } from '../components/UI';
import { BookOpen, Users, BarChart3, Calendar, CheckCircle2, Mail, Lock, ArrowLeft, HelpCircle, ShieldCheck } from 'lucide-react';
import { Manual } from './Manual';
import { LegalTerms } from '../components/LegalTerms';

type AuthMode = 'login' | 'register' | 'reset';

export const LandingPage: React.FC = () => {
  const { login, loginWithEmail, registerWithEmail, resetPassword } = useDiary();
  const { theme } = useTheme(); // <-- Adicionado o ThemeContext
  const [authState, setAuthState] = useState<'idle' | 'loading'>('idle');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [userType, setUserType] = useState<'teacher' | 'admin'>('teacher');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [showLegal, setShowLegal] = useState(false);

  const handleGoogleLogin = async () => {
    setAuthState('loading');
    try {
      await login();
    } catch (error) {
      setAuthState('idle');
    }
  };

  const handleEmailAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setAuthState('loading');
    try {
      if (authMode === 'login') {
        await loginWithEmail(email, password);
      } else if (authMode === 'register') {
        await registerWithEmail(email, password);
      } else if (authMode === 'reset') {
        await resetPassword(email);
        setAuthMode('login');
        setAuthState('idle');
        return; // Don't keep loading if just resetting password
      }
    } catch (error) {
      setAuthState('idle');
    }
  };

  const renderAuthForm = () => {
    if (authMode === 'reset') {
      return (
        <motion.form
          key="reset"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          onSubmit={handleEmailAction}
          className="flex flex-col gap-4 text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <button type="button" onClick={() => setAuthMode('login')} className="text-neutral-400 hover:text-ink">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-2xl font-serif text-ink">Recuperar Senha</h2>
          </div>
          <p className="text-sm text-neutral-500 mb-2">Digite seu e-mail para receber um link de redefinição de senha.</p>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <Input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="pl-10" 
                placeholder="seu@email.com" 
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full mt-2 bg-primary hover:bg-secondary text-white">Enviar Link</Button>
        </motion.form>
      );
    }

    return (
      <motion.form
        key={authMode}
        initial={{ opacity: 0, x: authMode === 'login' ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: authMode === 'login' ? 20 : -20 }}
        onSubmit={handleEmailAction}
        className="flex flex-col gap-4 text-left"
      >
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            {theme.logoUrl ? (
              <img src={theme.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
            ) : (
              <BookOpen size={32} />
            )}
          </div>
          <h2 className="text-2xl font-serif text-ink">{authMode === 'login' ? (userType === 'admin' ? 'Portal Gestor' : 'Portal Professor') : 'Crie sua conta'}</h2>
          
          {authMode === 'login' && (
            <div className="flex bg-neutral-100 p-1 rounded-xl mt-4 max-w-[240px] mx-auto border border-neutral-200/50">
              <button 
                type="button"
                onClick={() => setUserType('teacher')}
                className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${userType === 'teacher' ? 'bg-white text-primary shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
              >
                Professor
              </button>
              <button 
                type="button"
                onClick={() => setUserType('admin')}
                className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${userType === 'admin' ? 'bg-white text-primary shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
              >
                Secretaria
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <Input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="pl-10" 
                placeholder="seu@email.com" 
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-neutral-700">Senha</label>
              {authMode === 'login' && (
                <button 
                  type="button" 
                  onClick={() => setAuthMode('reset')}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Esqueceu a senha?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <Input 
                type="password" 
                required 
                minLength={6}
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="pl-10" 
                placeholder="••••••••" 
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full mt-2 bg-primary hover:bg-secondary text-white font-semibold h-12 rounded-2xl shadow-lg shadow-primary/20">
          {authMode === 'login' ? (userType === 'admin' ? 'Acessar Painel Gestor' : 'Entrar no Sistema') : 'Criar minha Conta'}
        </Button>
      </motion.form>
    );
  };

  if (showManual) {
    return <Manual onBack={() => setShowManual(false)} />;
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="p-8 md:px-16 md:pt-12 flex justify-between items-center z-10">
        <div className="flex items-center gap-3 text-primary">
          {theme.logoUrl ? (
            <img src={theme.logoUrl} alt={theme.municipioNome} className="w-10 h-10 object-contain drop-shadow-sm" />
          ) : (
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
               <BookOpen size={24} className="text-white" />
            </div>
          )}
          <span className="font-serif text-2xl font-bold tracking-tight text-ink border-l-2 border-primary/20 pl-3 py-1">
            {theme.municipioNome}
          </span>
        </div>
        <Button variant="ghost" onClick={() => setShowManual(true)} className="gap-2 text-ink hover:bg-primary/10 font-medium">
          <HelpCircle size={18} className="text-primary" />
          Manual do Usuário
        </Button>
      </header>
      <main className="flex-1 flex flex-col md:flex-row relative z-10">
        {/* Left Side - Hero */}
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-center relative">
          {/* Decorative Blur */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 blur-[100px] rounded-full -z-10"></div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >

            <h1 className="text-5xl md:text-7xl font-serif text-ink mb-6 leading-tight font-black tracking-tight">
              GEI - Gestão <br />
              <span className="text-primary relative">
                Educacional
                <svg className="absolute w-full h-3 -bottom-2 left-0 text-accent/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent"/>
                </svg>
              </span><br />
              Inteligente.
            </h1>
            <div className="flex flex-col gap-3 mt-8 border-l-4 border-accent pl-5">
              <p className="text-xl text-ink font-medium">Diário de classe simplificado e completo.</p>
              <p className="text-lg text-neutral-500 max-w-lg">
                Funcionando nativamente no desktop e no celular.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 p-8 md:p-16 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-8 shadow-2xl shadow-primary/5 border-neutral-200/50">
            <AnimatePresence mode="wait">
              {authState === 'idle' ? (
                renderAuthForm()
              ) : (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4 mx-auto" />
                  <p className="text-neutral-600 font-medium">Autenticando...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </main>

      {/* Footer Features */}
      <footer className="p-8 md:p-16 bg-white border-t border-neutral-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <Feature 
            icon={<Users className="text-secondary" />} 
            title="Gestão de Alunos" 
            desc="Importação em massa e perfis detalhados." 
          />
          <Feature 
            icon={<Calendar className="text-secondary" />} 
            title="Chamada Inteligente" 
            desc="Registro rápido de presença por data." 
          />
          <Feature 
            icon={<BarChart3 className="text-secondary" />} 
            title="Relatórios" 
            desc="Analytics automáticos de notas e frequência." 
          />
          <Feature 
            icon={<BookOpen className="text-secondary" />} 
            title="Planejamento" 
            desc="Diário de classe e documentos integrados." 
          />
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-neutral-400">© 2026 GEI - Gestão Educacional Inteligente. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <button 
              onClick={() => setShowLegal(true)} 
              className="text-xs font-bold text-neutral-400 hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck size={14} />
              Termos de Uso & LGPD (MEC)
            </button>
            <a 
              href="https://chat.whatsapp.com/JUMdhYWnShM0mHcVU58zRd" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs font-bold text-neutral-400 hover:text-primary transition-colors flex items-center gap-1"
            >
              Suporte & Comunidade
            </a>
          </div>
        </div>
      </footer>

      <LegalTerms isOpen={showLegal} onClose={() => setShowLegal(false)} />
    </div>
  );
};

const Feature: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="flex flex-col gap-3">
    <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center">
      {icon}
    </div>
    <h3 className="font-serif text-lg">{title}</h3>
    <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
  </div>
);

