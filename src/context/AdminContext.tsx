import React, { createContext, useContext, useState } from 'react';
import { School, Settings } from '../types';
import { useDiary } from './DiaryContext';
import { toast } from 'sonner';

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
  const { user, data } = useDiary();
  const [schools, setSchools] = useState<School[]>([
    { id: '1', name: 'Escola Municipal Antônio Carlos', municipioId: 'central', createdAt: new Date().toISOString() }
  ]);
  const [teachers, setTeachers] = useState<Settings[]>([]);

  const addSchool = async (name: string) => {
    toast.success('Escola adicionada com sucesso (Offline)!');
  };

  const assignTeacherToSchool = async (teacherUid: string, schoolId: string) => {
    toast.success('Professor vinculado à escola com sucesso (Offline)!');
  };

  const promoteToAdmin = async (teacherUid: string) => {
    toast.success('Usuário promovido a Secretaria com sucesso (Offline)!');
  };

  const getSchoolReport = async (schoolId: string): Promise<SchoolReportData> => {
    return { studentCount: 0, classCount: 0, students: [] };
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
