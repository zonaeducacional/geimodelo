import Dexie, { Table } from 'dexie';
import { Student, Class, AttendanceRecord, GradeRecord, LessonPlan, PlanningDocument } from '../types';

export interface SyncQueueItem {
  id?: number;
  tabela: string;
  operacao: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  criadoEm: number;
}

export class GEIDatabase extends Dexie {
  students!: Table<Student, string>;
  classes!: Table<Class, string>;
  attendance!: Table<AttendanceRecord, string>;
  grades!: Table<GradeRecord, string>;
  lessonPlans!: Table<LessonPlan, string>;
  documents!: Table<PlanningDocument, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('GEI_Offline_Database');

    this.version(3).stores({
      schools: 'id, name, municipioId',
      students: 'id, uid, schoolId, classId',
      classes: 'id, uid, schoolId',
      attendance: 'id, uid, studentId, classId, date',
      grades: 'id, uid, studentId, classId, subject',
      lessonPlans: 'id, uid, classId, date',
      documents: 'id, uid, schoolId',
      syncQueue: '++id, tabela, operacao, criadoEm',
    });
  }
}

export const localDb = new GEIDatabase();

export async function syncComServidor() {
  if (!navigator.onLine) return;
  const pendingItems = await localDb.syncQueue.orderBy('criadoEm').toArray();
  if (pendingItems.length === 0) return;

  console.log(`📡 Iniciando sincronização de ${pendingItems.length} itens pendentes...`);
  // Enviar para a API Fastify
  for (const item of pendingItems) {
    await localDb.syncQueue.delete(item.id!);
  }
}

window.addEventListener('online', syncComServidor);
