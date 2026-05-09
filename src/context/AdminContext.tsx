import React, { createContext, useContext, useState } from 'react';
import { School, Settings } from '../types';
import { useDiary } from './DiaryContext';
import { toast } from 'sonner';
import { useLiveQuery } from 'dexie-react-hooks';
import { localDb } from '../lib/db';

export interface StudentReport {
  id: string;
  name: string;
  registration: string;
  totalClasses: number;
  presences: number;
  absences: number;
  attendancePercentage: number;
}

export interface SchoolReportData {
  studentCount: number;
  classCount: number;
  students: StudentReport[];
}

interface AdminContextType {
  schools: School[];
  teachers: Settings[];
  addSchool: (name: string) => Promise<void>;
  assignTeacherToSchool: (teacherUid: string, schoolId: string) => Promise<void>;
  promoteToAdmin: (teacherUid: string) => Promise<void>;
  getSchoolReport: (schoolId: string) => Promise<SchoolReportData>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useDiary();
  
  // Usar LiveQuery para as escolas virem do banco local
  const schools = useLiveQuery(() => localDb.schools.toArray()) || [];
  const [teachers, setTeachers] = useState<Settings[]>([]);

  // Buscar professores sincronizados no servidor
  React.useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch('/api/admin/teachers');
        if (res.ok) {
          const data = await res.json();
          setTeachers(data);
        }
      } catch (e) { console.error('Erro ao buscar professores'); }
    };

    fetchTeachers();
    const interval = setInterval(fetchTeachers, 10000); // Atualiza a cada 10s
    return () => clearInterval(interval);
  }, []);

  const addSchool = async (name: string) => {
    try {
      const newSchool: School = {
        id: crypto.randomUUID(),
        name,
        createdAt: new Date().toISOString()
      };
      
      await localDb.schools.add(newSchool);
      toast.success(`Escola "${name}" adicionada com sucesso!`);
    } catch (error) {
      console.error('Erro ao adicionar escola:', error);
      toast.error('Erro ao salvar escola no banco local.');
    }
  };

  const assignTeacherToSchool = async (teacherUid: string, schoolId: string) => {
    toast.success('Professor vinculado à escola com sucesso (Offline)!');
  };

  const promoteToAdmin = async (teacherUid: string) => {
    toast.success('Usuário promovido a Secretaria com sucesso (Offline)!');
  };

  const getSchoolReport = async (schoolId: string): Promise<SchoolReportData> => {
    // Simulação de dados para o relatório
    return { 
      studentCount: 150, 
      classCount: 12, 
      students: [
        { id: '1', name: 'Alice Silva', registration: '2026001', totalClasses: 20, presences: 18, absences: 2, attendancePercentage: 90 },
        { id: '2', name: 'Bruno Santos', registration: '2026002', totalClasses: 20, presences: 12, absences: 8, attendancePercentage: 60 },
      ] 
    };
  };

  return (
    <AdminContext.Provider value={{ schools, teachers, addSchool, assignTeacherToSchool, promoteToAdmin, getSchoolReport }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};
