import React, { createContext, useContext, useEffect, useState } from 'react';
import { DiaryData, Student, Class, AttendanceRecord, GradeRecord, LessonPlan, PlanningDocument, Settings } from '../types';
import { toast } from 'sonner';
import { useLiveQuery } from 'dexie-react-hooks';
import { localDb } from '../lib/db';
import { useTheme } from './ThemeContext';

const API_URL = ''; // Usando rotas relativas para o Proxy do Nginx no VPS

interface User {
  uid: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  providerData?: any[];
}

interface DiaryContextType {
  data: DiaryData;
  user: User | null;
  isAuthReady: boolean;
  login: () => Promise<void>;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  registerWithEmail: (e: string, p: string) => Promise<void>;
  resetPassword: (e: string) => Promise<void>;
  updateUserPassword: (p: string) => Promise<void>;
  logout: () => Promise<void>;
  addStudent: (student: Omit<Student, 'id' | 'uid'>) => Promise<string>;
  addClass: (newClass: Omit<Class, 'id' | 'uid'>) => Promise<void>;
  addAttendance: (record: Omit<AttendanceRecord, 'id' | 'uid'>) => Promise<void>;
  addGrade: (record: Omit<GradeRecord, 'id' | 'uid'>) => Promise<void>;
  addLessonPlan: (plan: Omit<LessonPlan, 'id' | 'uid'>) => Promise<void>;
  addDocument: (doc: Omit<PlanningDocument, 'id' | 'uid'>) => Promise<void>;
  updateStudent: (student: Student) => Promise<void>;
  updateClass: (cls: Class) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  updateSettings: (settings: Omit<Settings, 'uid'>) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  deleteDocument: (id: string) => Promise<void>;
}

const DiaryContext = createContext<DiaryContextType | undefined>(undefined);

export const DiaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('gei-user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthReady, setIsAuthReady] = useState(true);
  
  // Dexie.js Live Queries (Offline First)
  const students = useLiveQuery(() => localDb.students.toArray()) || [];
  const classes = useLiveQuery(() => localDb.classes.toArray()) || [];
  const attendance = useLiveQuery(() => localDb.attendance.toArray()) || [];
  const grades = useLiveQuery(() => localDb.grades.toArray()) || [];
  const lessonPlans = useLiveQuery(() => localDb.lessonPlans.toArray()) || [];
  const documents = useLiveQuery(() => localDb.documents.toArray()) || [];

  const data: DiaryData = {
    students,
    classes,
    attendance,
    grades,
    lessonPlans,
    documents,
    settings: { 
      teacherName: user?.name || 'Prof. Sérgio', 
      schoolName: theme.municipioNome || 'A Central', 
      schoolYear: '2026', 
      uid: user?.uid || '',
      role: user?.email?.includes('admin') ? 'super_admin' : 'teacher',
      schoolId: '1'
    }
  };

  // Efeito para sincronizar automaticamente quando os dados mudarem (Upload)
  useEffect(() => {
    if (user) {
      const timeout = setTimeout(() => syncData(), 2000); // Debounce de 2s
      return () => clearTimeout(timeout);
    }
  }, [students, classes, attendance, grades, user]);

  // Efeito para buscar atualizações do servidor periodicamente (Download)
  useEffect(() => {
    if (user?.email) {
      const interval = setInterval(() => downloadSync(), 30000); // Checa a cada 30s
      downloadSync(); // Checa ao abrir o app
      return () => clearInterval(interval);
    }
  }, [user?.email]);

  const downloadSync = async () => {
    if (!user?.email) return;
    try {
      const syncRes = await fetch(`${API_URL}/api/sync/${user.email}`);
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        // Restaura dados no Dexie se houver algo novo
        if (syncData.classes) {
          await localDb.classes.bulkPut(syncData.classes);
          await localDb.students.bulkPut(syncData.students || []);
          await localDb.attendance.bulkPut(syncData.attendance || []);
          await localDb.grades.bulkPut(syncData.grades || []);
          if (syncData.schools) await localDb.schools.bulkPut(syncData.schools);
        }
      }
    } catch (e) { console.error('Erro no download sync'); }
  };

  const syncData = async () => {
    if (!user?.email) return;
    try {
      await fetch(`${API_URL}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: user.email, 
          data: { 
            students, 
            classes, 
            attendance, 
            grades, 
            schools: await localDb.schools.toArray(),
            settings: data.settings,
            lastSync: Date.now() 
          } 
        })
      });
    } catch (e) {
      console.error('Erro na sincronização:', e);
    }
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('gei-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('gei-user');
    }
  }, [user]);

  // Funções de Auth Mockadas (Pronto para o backend VPS)
  const loginWithEmail = async (email: string, password?: string) => { 
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const resData = await response.json();
      
      if (response.ok) {
        const loggedUser = { ...resData.user };
        
        // Tenta baixar dados sincronizados do servidor
        try {
          const syncRes = await fetch(`${API_URL}/api/sync/${loggedUser.email}`);
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            // Restaura dados no Dexie (Simplificado para o demo)
            if (syncData.classes) {
              await localDb.classes.bulkPut(syncData.classes);
              await localDb.students.bulkPut(syncData.students || []);
              await localDb.attendance.bulkPut(syncData.attendance || []);
              await localDb.grades.bulkPut(syncData.grades || []);
              if (syncData.schools) await localDb.schools.bulkPut(syncData.schools);
            }
          }
        } catch (e) { console.error('Erro ao baixar sync'); }

        // Memória Permanente: Verifica se existe um avatar salvo para este e-mail
        const savedAvatar = localStorage.getItem(`gei_avatar_${loggedUser.email}`);
        if (savedAvatar) {
          loggedUser.avatarUrl = savedAvatar;
        }
        
        setUser(loggedUser);
        localStorage.setItem('gei-user', JSON.stringify(loggedUser));
        toast.success(loggedUser.role === 'super_admin' ? 'Bem-vindo, Gestor!' : 'Login Realizado com Sucesso!'); 
      } else {
        toast.error('Erro na autenticação.');
      }
    } catch (error) {
      toast.error('Erro de conexão com o servidor.');
    }
  };

  const login = async () => loginWithEmail('professor@gei.com');
  const registerWithEmail = async (e: string) => loginWithEmail(e);
  const resetPassword = async () => { toast.success('Link enviado!'); };
  const updateUserPassword = async () => { toast.success('Senha atualizada!'); };
  const logout = async () => { 
    setUser(null); 
    localStorage.removeItem('gei-user');
    toast.info('Sessão encerrada.'); 
  };

  // Funções de Banco de Dados (DEXIE JS)
  const addClass = async (newClass: Omit<Class, 'id' | 'uid'>) => {
    const id = crypto.randomUUID();
    await localDb.classes.put({ ...newClass, id, uid: '123', schoolId: '1' });
    toast.success('Turma criada localmente!');
  };

  const addStudent = async (student: Omit<Student, 'id' | 'uid'>) => {
    const id = crypto.randomUUID();
    await localDb.students.put({ ...student, id, uid: '123', schoolId: '1' });
    toast.success('Aluno salvo offline!');
    return id;
  };

  const addAttendance = async (record: Omit<AttendanceRecord, 'id' | 'uid'>) => {
    const id = crypto.randomUUID();
    await localDb.attendance.put({ ...record, id, uid: '123', schoolId: '1' });
    toast.success('Chamada registrada (Offline)!');
  };

  const addGrade = async (record: Omit<GradeRecord, 'id' | 'uid'>) => {
    const id = crypto.randomUUID();
    await localDb.grades.put({ ...record, id, uid: '123', schoolId: '1' });
    toast.success('Nota lançada no banco local!');
  };

  const addLessonPlan = async (plan: Omit<LessonPlan, 'id' | 'uid'>) => {
    const id = crypto.randomUUID();
    await localDb.lessonPlans.put({ ...plan, id, uid: '123', schoolId: '1' });
    toast.success('Plano salvo!');
  };

  const addDocument = async (docData: Omit<PlanningDocument, 'id' | 'uid'>) => {
    const id = crypto.randomUUID();
    await localDb.documents.put({ ...docData, id, uid: '123', schoolId: '1' });
    toast.success('Documento guardado localmente!');
  };

  const updateStudent = async (student: Student) => {
    await localDb.students.put(student);
  };

  const updateClass = async (cls: Class) => {
    await localDb.classes.put(cls);
  };

  const deleteClass = async (id: string) => {
    await localDb.classes.delete(id);
    toast.error('Turma apagada localmente.');
  };

  const deleteDocument = async (id: string) => {
    await localDb.documents.delete(id);
  };

  const updateSettings = async (newSettings: Omit<Settings, 'uid'>) => {
    // No futuro persistirá no VPS
    toast.success('Configurações salvas!');
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      // Se houver um novo avatar em base64, enviamos para o servidor real no VPS
      if (updates.avatarUrl && updates.avatarUrl.startsWith('data:image')) {
        const response = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            image: updates.avatarUrl,
            type: updates.role === 'super_admin' ? 'logo' : 'profile'
          })
        });
        
        if (response.ok) {
          const resData = await response.json();
          updates.avatarUrl = resData.url;
          
          // Salva na Memória Permanente associada ao e-mail
          if (user?.email) {
            localStorage.setItem(`gei_avatar_${user.email}`, resData.url);
          }
        }
      }

      if (user) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('gei-user', JSON.stringify(updatedUser));
        toast.success('Perfil atualizado e otimizado!');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao salvar imagem no servidor.');
    }
  };

  return (
    <DiaryContext.Provider value={{
      data, user, isAuthReady, login, loginWithEmail, registerWithEmail, resetPassword, updateUserPassword, logout,
      addStudent, addClass, addAttendance, addGrade, addLessonPlan, addDocument,
      updateStudent, updateClass, deleteClass, updateSettings, deleteDocument, updateUser
    }}>
      {children}
    </DiaryContext.Provider>
  );
};

export const useDiary = () => {
  const context = useContext(DiaryContext);
  if (!context) throw new Error('useDiary must be used within a DiaryProvider');
  return context;
};
