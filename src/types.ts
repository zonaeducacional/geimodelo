export type UserRole = 'teacher' | 'school_admin' | 'super_admin';

export interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  registration: string;
  uid: string;
  schoolId?: string;
}

export interface Class {
  id: string;
  name: string;
  subject: string;
  year: string;
  studentIds: string[];
  uid: string;
  schoolId?: string;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  date: string;
  subject: string;
  lesson: string; // e.g., "Aula 1", "Aula 2"
  presentStudentIds: string[];
  uid: string;
  schoolId?: string;
}

export interface GradeRecord {
  id: string;
  classId: string;
  studentId: string;
  unit: 'I Unidade' | 'II Unidade' | 'III Unidade';
  subject: string;
  assessment: '1ª Avaliação' | '2ª Avaliação' | '3ª Avaliação' | '4ª Avaliação';
  activityName: string;
  grade: number;
  date: string;
  uid: string;
  schoolId?: string;
}

export interface LessonPlan {
  id: string;
  classId: string;
  date: string;
  subject: string;
  content: string;
  observations: string;
  uid: string;
  schoolId?: string;
}

export interface PlanningDocument {
  id: string;
  classId: string;
  type: 'aula' | 'projeto' | 'avaliacao' | 'outro';
  title: string;
  fileContent: string; // base64
  date: string;
  uid: string;
  schoolId?: string;
}

export interface Settings {
  teacherName: string;
  schoolName: string;
  schoolYear: string;
  uid: string;
  role?: UserRole; // 'teacher' by default if undefined
  schoolId?: string; // The school this user belongs to
}

export interface DiaryData {
  students: Student[];
  classes: Class[];
  attendance: AttendanceRecord[];
  grades: GradeRecord[];
  lessonPlans: LessonPlan[];
  documents: PlanningDocument[];
  settings: Settings;
}
