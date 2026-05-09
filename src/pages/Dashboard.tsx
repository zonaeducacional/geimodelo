import React, { useState, useEffect } from 'react';
import { useDiary } from '../context/DiaryContext';
import { Button, Card, Modal, Input } from '../components/UI';
import { Plus, Users, BookOpen, Trash2, ChevronRight, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { School } from '../types';

export const Dashboard: React.FC<{ onSelectClass: (id: string) => void }> = ({ onSelectClass }) => {
  const { data, addClass, deleteClass, updateSettings, updateUserPassword, user } = useDiary();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', subject: '', year: new Date().getFullYear().toString() });
  const [tempSettings, setTempSettings] = useState(data.settings);
  const [newPassword, setNewPassword] = useState('');
  const [schools, setSchools] = useState<School[]>([]);

  useEffect(() => {
    if (isSettingsOpen) {
      // Offline Mock para escolas
      setSchools([
        { id: '1', name: 'Escola Municipal Antônio Carlos', municipioId: 'central' },
        { id: '2', name: 'Escola Municipal João Pedro', municipioId: 'central' },
      ] as any[]);
    }
  }, [isSettingsOpen]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addClass({ ...newClass, studentIds: [] });
    setIsModalOpen(false);
    setNewClass({ name: '', subject: '', year: new Date().getFullYear().toString() });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(tempSettings);
    
    if (newPassword && newPassword.length >= 6) {
      try {
        await updateUserPassword(newPassword);
        setNewPassword('');
      } catch (error) {
        // Error is handled in context
      }
    }
    
    setIsSettingsOpen(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-12">
        <div>
          <div className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">
            {data.settings.schoolName || 'Escola Não Definida'}
          </div>
          <h1 className="text-4xl font-serif mb-2">Minhas Turmas</h1>
          <p className="text-neutral-500">
            {data.settings.teacherName ? `Professor(a): ${data.settings.teacherName}` : 'Gerencie suas disciplinas e alunos de forma organizada.'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => { setTempSettings(data.settings); setIsSettingsOpen(true); }} className="gap-2">
            <SettingsIcon size={20} />
            Personalizar
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus size={20} />
            Nova Turma
          </Button>
        </div>
      </header>

      {data.classes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-neutral-200">
          <BookOpen size={48} className="mx-auto text-neutral-300 mb-4" />
          <h3 className="text-xl font-serif text-neutral-500">Nenhuma turma cadastrada</h3>
          <p className="text-neutral-400 mb-6">Comece criando sua primeira turma para gerenciar.</p>
          <Button variant="outline" onClick={() => setIsModalOpen(true)}>Criar Turma</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.classes.map((c, index) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-serif group-hover:text-secondary transition-colors">{c.name}</h3>
                    <p className="text-sm text-neutral-500">{c.subject}</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteClass(c.id); }}
                    className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-neutral-600 mb-6">
                  <div className="flex items-center gap-1.5">
                    <Users size={16} />
                    <span>{c.studentIds.length} Alunos</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-neutral-300" />
                  <span>Ano {c.year}</span>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full justify-between group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all"
                  onClick={() => onSelectClass(c.id)}
                >
                  Ver Detalhes
                  <ChevronRight size={18} />
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Personalizar Dados">
        <div className="mb-6">
          <p className="text-sm text-neutral-500">Informações para contextualizar o sistema</p>
        </div>
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do(a) Professor(a)</label>
            <Input 
              placeholder="Ex: Prof. João Silva" 
              value={tempSettings.teacherName}
              onChange={e => setTempSettings({ ...tempSettings, teacherName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Escola</label>
            <select 
              className="w-full p-3 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={tempSettings.schoolId || ''}
              onChange={e => {
                const selectedSchool = schools.find(s => s.id === e.target.value);
                setTempSettings({ 
                  ...tempSettings, 
                  schoolId: e.target.value,
                  schoolName: selectedSchool ? selectedSchool.name : ''
                });
              }}
            >
              <option value="">-- Selecione sua escola --</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ano Letivo</label>
            <Input 
              placeholder="Ex: 2024" 
              value={tempSettings.schoolYear}
              onChange={e => setTempSettings({ ...tempSettings, schoolYear: e.target.value })}
            />
          </div>

          {/* Only show password change if they logged in with email */}
          {user?.email && (
            <div className="pt-4 border-t border-neutral-100 mt-4">
              <label className="block text-sm font-medium mb-1 text-neutral-700">Nova Senha (opcional)</label>
              <Input 
                type="password"
                placeholder="Mínimo 6 caracteres" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                minLength={6}
              />
              <p className="text-xs text-neutral-400 mt-1">Deixe em branco para manter a senha atual.</p>
            </div>
          )}

          {/* Temporary button to become super admin for testing */}
          {user?.role !== 'super_admin' && (
            <div className="pt-4 border-t border-neutral-100 mt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full text-secondary border-secondary hover:bg-secondary hover:text-white"
                onClick={() => {
                  updateSettings({ ...tempSettings, role: 'super_admin' });
                  setIsSettingsOpen(false);
                }}
              >
                Acessar Painel da Secretaria (Testes)
              </Button>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsSettingsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Salvar Dados
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Turma">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome da Turma</label>
            <Input 
              required 
              placeholder="Ex: 3º Ano A" 
              value={newClass.name}
              onChange={e => setNewClass({ ...newClass, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Disciplina</label>
            <Input 
              required 
              placeholder="Ex: Matemática" 
              value={newClass.subject}
              onChange={e => setNewClass({ ...newClass, subject: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ano Letivo</label>
            <Input 
              required 
              type="number" 
              value={newClass.year}
              onChange={e => setNewClass({ ...newClass, year: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Criar Turma
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
