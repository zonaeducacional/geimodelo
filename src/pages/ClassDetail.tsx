import React, { useState } from 'react';
import { useDiary } from '../context/DiaryContext';
import { Button, Card, Input, Modal, Select } from '../components/UI';
import { 
  Users, CheckSquare, GraduationCap, BookOpen, FileText, 
  Search, UserPlus, Download, Save, Trash2, Plus, Upload,
  Layout, ExternalLink, X, Sparkles, Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDate } from '../lib/utils';
import { StudentProfile } from './StudentProfile';
import { toast } from 'sonner';
import { PlanningDocument } from '../types';
import { SUBJECTS } from '../constants';
import { AIPlanner } from '../components/AIPlanner';

export const ClassDetail: React.FC<{ classId: string; onBack: () => void }> = ({ classId, onBack }) => {
  const { data, addStudent, addAttendance, addGrade, addLessonPlan, addDocument, updateClass, deleteClass } = useDiary();
  const currentClass = data.classes.find(c => c.id === classId);
  const [activeTab, setActiveTab] = useState<'alunos' | 'chamada' | 'notas' | 'diario' | 'documentos' | 'planejamento'>('alunos');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  if (!currentClass) return <div>Turma não encontrada.</div>;

  const classStudents = data.students.filter(s => currentClass.studentIds.includes(s.id));

  if (selectedStudentId) {
    return <StudentProfile studentId={selectedStudentId} onBack={() => setSelectedStudentId(null)} />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <button onClick={onBack} className="text-sm text-secondary hover:underline mb-2 flex items-center gap-1">
            ← Voltar para Turmas
          </button>
          <h1 className="text-4xl font-serif">{currentClass.name}</h1>
          <p className="text-neutral-500">{currentClass.subject} • {currentClass.year}</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl border border-neutral-100 shadow-sm overflow-x-auto no-scrollbar">
          <TabButton active={activeTab === 'alunos'} onClick={() => setActiveTab('alunos')} icon={<Users size={18} />} label="Alunos" />
          <TabButton active={activeTab === 'chamada'} onClick={() => setActiveTab('chamada')} icon={<CheckSquare size={18} />} label="Chamada" />
          <TabButton active={activeTab === 'notas'} onClick={() => setActiveTab('notas')} icon={<GraduationCap size={18} />} label="Notas" />
          <TabButton active={activeTab === 'diario'} onClick={() => setActiveTab('diario')} icon={<BookOpen size={18} />} label="Diário" />
          <TabButton active={activeTab === 'documentos'} onClick={() => setActiveTab('documentos')} icon={<FileText size={18} />} label="Docs" />
          <TabButton active={activeTab === 'planejamento'} onClick={() => setActiveTab('planejamento')} icon={<Layout size={18} />} label="Planejamento" />
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'alunos' && <StudentsTab classId={classId} students={classStudents} onSelectStudent={setSelectedStudentId} />}
          {activeTab === 'chamada' && <AttendanceTab classId={classId} students={classStudents} />}
          {activeTab === 'notas' && <GradesTab classId={classId} students={classStudents} />}
          {activeTab === 'diario' && <DiaryTab classId={classId} />}
          {activeTab === 'documentos' && <DocumentsTab classId={classId} />}
          {activeTab === 'planejamento' && <PlanningTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
      active ? 'bg-primary text-white shadow-md' : 'text-neutral-500 hover:bg-neutral-50'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

// --- TABS ---

const StudentsTab: React.FC<{ classId: string; students: any[]; onSelectStudent: (id: string) => void }> = ({ classId, students, onSelectStudent }) => {
  const { addStudent, updateClass, data } = useDiary();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', registration: '' });

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = await addStudent(newStudent);
    if (id) {
      const cls = data.classes.find(c => c.id === classId);
      if (cls) {
        await updateClass({ ...cls, studentIds: [...cls.studentIds, id] });
      }
    }
    setIsModalOpen(false);
    setNewStudent({ name: '', registration: '' });
  };

  const downloadTemplate = () => {
    const content = "Nome\nALBERT RIBEIRO DOS SANTOS\nARIELE ANDRADE GOMES\nARTHUR PIRES DE SOUZA\nARTHUR SANTOS PEREIRA\nBEATRIZ MULLER DA COSTA SANTOS\nBERNARDO PASSOS BRITO\nDAVID LUCAS PASSOS TEIXEIRA\nEVELIN DOS SANTOSDE SOUZA\nHENRY GABRIEL SOUZA FERREIRA\nLAIANE DIAS SANTOS";
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "template_alunos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info('Template baixado! Preencha a lista de nomes.');
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/);
      let count = 0;
      
      const cls = data.classes.find(c => c.id === classId);
      if (!cls) return;

      const newStudentIds = [...cls.studentIds];

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        const parts = trimmedLine.split(/[,;]/).map(s => s.trim());
        let name = '';
        let registration = '';

        if (parts.length >= 2) {
          [name, registration] = parts;
        } else {
          name = parts[0];
          registration = `MAT-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        const lowerName = name.toLowerCase();
        if (name && lowerName !== 'nome' && lowerName !== 'name') {
          const id = await addStudent({ name, registration });
          if (id) {
            newStudentIds.push(id);
            count++;
          }
        }
      }
      
      if (count > 0) {
        await updateClass({ ...cls, studentIds: newStudentIds });
        toast.success(`${count} alunos importados com sucesso!`);
      } else {
        toast.error('Nenhum aluno válido encontrado no arquivo.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-6 border-b border-neutral-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <Input 
            placeholder="Buscar aluno..." 
            className="pl-10" 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button variant="outline" className="gap-2 flex-1 md:flex-none" onClick={downloadTemplate}>
            <Download size={18} />
            Template
          </Button>
          <label className="flex-1 md:flex-none">
            <input 
              type="file" 
              accept=".csv,.txt" 
              className="hidden" 
              onChange={handleCSVImport}
            />
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl font-medium transition-all active:scale-95 border border-neutral-200 bg-white hover:bg-neutral-50 text-ink cursor-pointer w-full">
              <Upload size={18} />
              Importar
            </div>
          </label>
          <Button className="gap-2 flex-1 md:flex-none" onClick={() => setIsModalOpen(true)}>
            <UserPlus size={18} />
            Novo Aluno
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 text-neutral-500 text-sm uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Matrícula</th>
              <th className="px-6 py-4 font-medium">Nome</th>
              <th className="px-6 py-4 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm text-neutral-500">{s.registration}</td>
                <td className="px-6 py-4 font-medium">{s.name}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onSelectStudent(s.id)}
                    className="text-secondary hover:underline text-sm font-medium"
                  >
                    Ver Perfil
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-neutral-400 italic">
                  Nenhum aluno encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Aluno">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome Completo</label>
            <Input required value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Matrícula / ID</label>
            <Input required value={newStudent.registration} onChange={e => setNewStudent({ ...newStudent, registration: e.target.value })} />
          </div>
          <Button type="submit" className="w-full mt-4">Salvar Aluno</Button>
        </form>
      </Modal>
    </Card>
  );
};


const AttendanceTab: React.FC<{ classId: string; students: any[] }> = ({ classId, students }) => {
  const { addAttendance, data } = useDiary();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [lesson, setLesson] = useState('Aula 1');
  const [presentIds, setPresentIds] = useState<string[]>(students.map(s => s.id));

  const classAttendance = data.attendance.filter(a => a.classId === classId);
  const totalLessons = classAttendance.length;

  const getFrequency = (studentId: string) => {
    if (totalLessons === 0) return 100;
    const presenceCount = classAttendance.filter(a => a.presentStudentIds.includes(studentId)).length;
    return (presenceCount / totalLessons) * 100;
  };

  const toggleStudent = (id: string) => {
    setPresentIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    await addAttendance({ classId, date, subject, lesson, presentStudentIds: presentIds });
  };

  const exportAttendanceToCSV = () => {
    try {
      const headers = ['Data', 'Disciplina', 'Aula', 'Presentes', 'Ausentes'];
      const rows = classAttendance.sort((a, b) => b.date.localeCompare(a.date)).map(record => {
        const presentNames = students
          .filter(s => record.presentStudentIds.includes(s.id))
          .map(s => s.name)
          .join(', ');
        
        const absentNames = students
          .filter(s => !record.presentStudentIds.includes(s.id))
          .map(s => s.name)
          .join(', ');

        return [
          formatDate(record.date),
          record.subject || '-',
          record.lesson,
          `"${presentNames}"`,
          `"${absentNames}"`
        ];
      });

      const csvContent = [
        headers.join(';'),
        ...rows.map(row => row.join(';'))
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      const className = data.classes.find(c => c.id === classId)?.name || 'Turma';
      link.setAttribute('download', `Frequencia_${className.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Frequência exportada com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar frequência:', error);
      toast.error('Erro ao exportar os dados.');
    }
  };

  const absentStudents = students.filter(s => !presentIds.includes(s.id));

  return (
    <div className="space-y-8">
      <Card>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-400 uppercase">Data</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-auto" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-400 uppercase">Disciplina</label>
              <Select value={subject} onChange={e => setSubject(e.target.value)} className="w-auto">
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-400 uppercase">Identificação da Aula</label>
              <Input placeholder="Ex: Aula 1" value={lesson} onChange={e => setLesson(e.target.value)} className="w-auto" />
            </div>
          </div>
          <div className="flex items-center gap-6 w-full md:w-auto justify-between">
            <div className="text-right">
              <p className="text-sm font-medium text-ink">{presentIds.length} Presentes</p>
              <p className="text-xs text-neutral-400">{absentStudents.length} Faltas</p>
            </div>
            <Button onClick={handleSave} className="gap-2">
              <Save size={18} />
              Salvar Chamada
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {students.map(s => {
            const freq = getFrequency(s.id);
            const isAtRisk = freq < 75;
            
            return (
              <button
                key={s.id}
                onClick={() => toggleStudent(s.id)}
                className={`flex flex-col p-4 rounded-2xl border transition-all text-left ${
                  presentIds.includes(s.id) 
                    ? 'bg-primary/5 border-primary/20' 
                    : 'bg-white border-neutral-100 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      presentIds.includes(s.id) ? 'bg-primary border-primary text-white' : 'border-neutral-200'
                    }`}>
                      {presentIds.includes(s.id) && <CheckSquare size={12} />}
                    </div>
                    <span className="font-medium text-ink">{s.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                    presentIds.includes(s.id) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {presentIds.includes(s.id) ? 'P' : 'F'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between w-full mt-auto pt-2 border-t border-neutral-100/50">
                  <span className="text-[10px] text-neutral-400 uppercase">Frequência Acumulada</span>
                  <span className={`text-xs font-bold ${isAtRisk ? 'text-red-500' : 'text-green-600'}`}>
                    {freq.toFixed(0)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {absentStudents.length > 0 && (
        <Card className="border-red-100 bg-red-50/30">
          <h3 className="text-lg font-serif text-red-700 mb-4 flex items-center gap-2">
            <Users size={20} />
            Alunos Faltosos (Hoje)
          </h3>
          <div className="flex flex-wrap gap-2">
            {absentStudents.map(s => (
              <div key={s.id} className="px-3 py-1 bg-white border border-red-100 rounded-full text-sm text-red-600 font-medium">
                {s.name}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-serif">Histórico de Chamadas</h3>
          <Button variant="outline" size="sm" className="gap-2" onClick={exportAttendanceToCSV}>
            <Download size={14} />
            Exportar CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 font-medium">Data</th>
                <th className="px-6 py-3 font-medium">Disciplina</th>
                <th className="px-6 py-3 font-medium">Aula</th>
                <th className="px-6 py-3 font-medium">Presenças</th>
                <th className="px-6 py-3 font-medium">Faltas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {classAttendance.sort((a, b) => b.date.localeCompare(a.date)).map(a => (
                <tr key={a.id} className="text-sm">
                  <td className="px-6 py-3">{formatDate(a.date)}</td>
                  <td className="px-6 py-3 text-neutral-500">{a.subject || '-'}</td>
                  <td className="px-6 py-3 font-medium">{a.lesson}</td>
                  <td className="px-6 py-3 text-green-600 font-medium">{a.presentStudentIds.length}</td>
                  <td className="px-6 py-3 text-red-500 font-medium">{students.length - a.presentStudentIds.length}</td>
                </tr>
              ))}
              {classAttendance.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-neutral-400 italic">Nenhum registro encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const GradesTab: React.FC<{ classId: string; students: any[] }> = ({ classId, students }) => {
  const { addGrade, data } = useDiary();
  const [unit, setUnit] = useState<'I Unidade' | 'II Unidade' | 'III Unidade'>('I Unidade');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [assessment, setAssessment] = useState<'1ª Avaliação' | '2ª Avaliação' | '3ª Avaliação' | '4ª Avaliação'>('1ª Avaliação');
  const [activity, setActivity] = useState('');
  const [grades, setGrades] = useState<Record<string, string>>({});

  const subjects = SUBJECTS;

  const classGrades = data.grades.filter(g => g.classId === classId);

  const handleSave = async () => {
    if (!activity) {
      toast.error('Por favor, informe o nome da atividade.');
      return;
    }

    const entries = Object.entries(grades).filter(([_, grade]) => grade !== '');
    
    if (entries.length === 0) {
      toast.error('Por favor, insira pelo menos uma nota.');
      return;
    }

    let count = 0;
    for (const [studentId, grade] of entries) {
      await addGrade({
        classId,
        studentId,
        unit,
        subject,
        assessment,
        activityName: activity,
        grade: parseFloat(grade as string),
        date: new Date().toISOString()
      });
      count++;
    }

    if (count > 0) {
      toast.success(`${count} notas lançadas com sucesso!`);
      setActivity('');
      setGrades({});
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-neutral-400 uppercase mb-1">Unidade</label>
            <Select value={unit} onChange={e => setUnit(e.target.value as any)}>
              <option>I Unidade</option>
              <option>II Unidade</option>
              <option>III Unidade</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 uppercase mb-1">Disciplina</label>
            <Select value={subject} onChange={e => setSubject(e.target.value)}>
              {subjects.map(s => <option key={s}>{s}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 uppercase mb-1">Avaliação</label>
            <Select value={assessment} onChange={e => setAssessment(e.target.value as any)}>
              <option>1ª Avaliação</option>
              <option>2ª Avaliação</option>
              <option>3ª Avaliação</option>
              <option>4ª Avaliação</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 uppercase mb-1">Atividade</label>
            <Input placeholder="Ex: Prova Mensal" value={activity} onChange={e => setActivity(e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end mb-8">
          <Button onClick={handleSave} className="gap-2 w-full md:w-auto">
            <Save size={18} />
            Lançar Notas
          </Button>
        </div>

        <div className="overflow-hidden border border-neutral-100 rounded-2xl">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 text-neutral-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Aluno</th>
                <th className="px-6 py-4 font-medium w-32">Nota (0-10)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {students.map(s => (
                <tr key={s.id}>
                  <td className="px-6 py-4 font-medium">{s.name}</td>
                  <td className="px-6 py-4">
                    <Input 
                      type="number" 
                      min="0" 
                      max="10" 
                      step="0.1"
                      placeholder="0.0"
                      value={grades[s.id] || ''}
                      onChange={e => setGrades({ ...grades, [s.id]: e.target.value })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-serif mb-4">Histórico de Notas</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 font-medium">Data</th>
                <th className="px-6 py-3 font-medium">Unidade</th>
                <th className="px-6 py-3 font-medium">Disciplina</th>
                <th className="px-6 py-3 font-medium">Avaliação</th>
                <th className="px-6 py-3 font-medium">Atividade</th>
                <th className="px-6 py-3 font-medium">Aluno</th>
                <th className="px-6 py-3 font-medium">Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {classGrades.sort((a, b) => b.date.localeCompare(a.date)).map(g => {
                const student = students.find(s => s.id === g.studentId);
                return (
                  <tr key={g.id} className="text-sm">
                    <td className="px-6 py-3 whitespace-nowrap">{formatDate(g.date)}</td>
                    <td className="px-6 py-3">{g.unit}</td>
                    <td className="px-6 py-3">{g.subject}</td>
                    <td className="px-6 py-3">{g.assessment}</td>
                    <td className="px-6 py-3 font-medium">{g.activityName}</td>
                    <td className="px-6 py-3">{student?.name || 'Desconhecido'}</td>
                    <td className={`px-6 py-3 font-bold ${g.grade >= 5 ? 'text-green-600' : 'text-red-500'}`}>
                      {g.grade.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
              {classGrades.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-neutral-400 italic">Nenhum registro encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-serif">Resumo de Notas por Unidade</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-neutral-500">Média Unid. (≥ 5.0)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-neutral-500">Abaixo da Média (&lt; 5.0)</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-neutral-50 text-neutral-500 text-[10px] uppercase">
              <tr>
                <th className="px-4 py-3 font-medium border-b border-neutral-100 sticky left-0 bg-neutral-50 z-10">Aluno</th>
                {['I Unidade', 'II Unidade', 'III Unidade'].map(u => (
                  <th key={u} colSpan={subjects.length} className="px-4 py-2 text-center border-b border-neutral-100 border-x border-neutral-100 bg-neutral-100/50">
                    {u}
                  </th>
                ))}
              </tr>
              <tr>
                <th className="px-4 py-2 border-b border-neutral-100 sticky left-0 bg-neutral-50 z-10"></th>
                {['I Unidade', 'II Unidade', 'III Unidade'].map(u => (
                  subjects.map(s => (
                    <th key={`${u}-${s}`} className="px-2 py-2 font-medium border-b border-neutral-100 border-r border-neutral-100 text-[8px] min-w-[60px] text-center">
                      {s.substring(0, 3)}
                    </th>
                  ))
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {students.map(student => {
                const studentGrades = classGrades.filter(g => g.studentId === student.id);
                return (
                  <tr key={student.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-sm border-r border-neutral-100 sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                      {student.name}
                    </td>
                    {['I Unidade', 'II Unidade', 'III Unidade'].map(u => (
                      subjects.map(s => {
                        const total = studentGrades
                          .filter(g => g.unit === u && g.subject === s)
                          .reduce((acc, curr) => acc + curr.grade, 0);
                        const cappedTotal = Math.min(total, 10);
                        
                        return (
                          <td key={`${u}-${s}`} className="px-2 py-3 text-center border-r border-neutral-100 text-xs">
                            <span className={`font-bold ${total === 0 ? 'text-neutral-300' : cappedTotal >= 5 ? 'text-green-600' : 'text-red-500'}`}>
                              {total === 0 ? '-' : cappedTotal.toFixed(1)}
                            </span>
                          </td>
                        );
                      })
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[10px] text-neutral-400 italic">
          * O total da unidade é limitado a 10.0. O aluno precisa de 15 pontos no total das 3 unidades para aprovação anual.
        </p>
      </Card>
    </div>
  );
};

const DiaryTab: React.FC<{ classId: string }> = ({ classId }) => {
  const { addLessonPlan, data } = useDiary();
  const [plan, setPlan] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    subject: SUBJECTS[0],
    content: '', 
    observations: '' 
  });
  const plans = data.lessonPlans.filter(p => p.classId === classId).sort((a, b) => b.date.localeCompare(a.date));

  const handleSave = async () => {
    if (!plan.content) return;
    await addLessonPlan({ ...plan, classId });
    setPlan({ 
      date: new Date().toISOString().split('T')[0], 
      subject: plan.subject,
      content: '', 
      observations: '' 
    });
  };

  const downloadDiaryTemplate = () => {
    const content = "Data,Disciplina,Conteúdo,Observações\n2026-03-26,Matemática,Introdução à Álgebra,Resolver exercícios da página 42\n2026-03-27,Geografia,Geometria Plana,Trazer régua e compasso";
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "template_diario.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info('Template de diário baixado!');
  };

  const handleDiaryCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/);
      let count = 0;

      for (const line of lines) {
        const parts = line.split(/[,;]/).map(s => s.trim());
        if (parts.length >= 3) {
          const [date, subject, content, observations] = parts;
          if (date && content && date.match(/^\d{4}-\d{2}-\d{2}$/) && date !== 'Data') {
            await addLessonPlan({
              classId,
              date,
              subject: subject || SUBJECTS[0],
              content,
              observations: observations || ''
            });
            count++;
          }
        }
      }

      if (count > 0) {
        toast.success(`${count} registros importados para o diário!`);
      } else {
        toast.error('Nenhum registro válido encontrado. Use o formato: Data (AAAA-MM-DD), Disciplina, Conteúdo, Observações');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-serif">Novo Registro</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={downloadDiaryTemplate}>
                <Download size={14} />
                Template
              </Button>
              <label className="cursor-pointer">
                <input type="file" accept=".csv,.txt" className="hidden" onChange={handleDiaryCSVImport} />
                <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all active:scale-95 border border-neutral-200 bg-white hover:bg-neutral-50 text-ink">
                  <Upload size={14} />
                  Importar
                </div>
              </label>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-neutral-500">Data da Aula:</label>
              <Input type="date" value={plan.date} onChange={e => setPlan({ ...plan, date: e.target.value })} className="w-auto" />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-neutral-500">Disciplina:</label>
              <Select value={plan.subject} onChange={e => setPlan({ ...plan, subject: e.target.value })} className="w-auto">
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Conteúdo Ministrado</label>
            <textarea 
              className="w-full h-40 p-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              placeholder="Descreva o que foi trabalhado em aula..."
              value={plan.content}
              onChange={e => setPlan({ ...plan, content: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observações / Ocorrências</label>
            <textarea 
              className="w-full h-24 p-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              placeholder="Opcional..."
              value={plan.observations}
              onChange={e => setPlan({ ...plan, observations: e.target.value })}
            />
          </div>
          <Button onClick={handleSave} className="w-full gap-2">
            <Save size={18} />
            Salvar no Diário
          </Button>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-serif px-2">Histórico Recente</h3>
        {plans.map(p => (
          <Card key={p.id} className="p-4 border-l-4 border-l-secondary">
            <div className="flex justify-between items-start mb-1">
              <div className="text-xs font-mono text-secondary">{formatDate(p.date)}</div>
              <div className="text-[10px] font-bold uppercase text-neutral-400">{p.subject}</div>
            </div>
            <p className="text-sm line-clamp-3 text-neutral-600">{p.content}</p>
          </Card>
        ))}
        {plans.length === 0 && (
          <div className="text-center py-8 text-neutral-400 italic text-sm">Nenhum registro anterior.</div>
        )}
      </div>
    </div>
  );
};

const DocumentsTab: React.FC<{ classId: string }> = ({ classId }) => {
  const { addDocument, deleteDocument, data } = useDiary();
  const docs = data.documents.filter(d => d.classId === classId);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit file size to 800KB to stay safe within Firestore's 1MB limit
    if (file.size > 800 * 1024) {
      toast.error('O arquivo é muito grande. O limite é de 800KB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      addDocument({
        classId,
        title: file.name,
        type: 'aula',
        fileContent: reader.result as string,
        date: new Date().toISOString()
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = (doc: PlanningDocument) => {
    try {
      const link = document.createElement('a');
      link.href = doc.fileContent;
      link.download = doc.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Iniciando download...');
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      toast.error('Erro ao baixar o documento.');
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-serif">Documentos Pedagógicos</h3>
        <label className="cursor-pointer">
          <input type="file" className="hidden" onChange={handleUpload} />
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all font-medium">
            <Plus size={18} />
            Anexar Arquivo
          </div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {docs.map(d => (
          <div key={d.id} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex flex-col items-center text-center group relative">
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleDownload(d)}
                className="p-1.5 bg-white rounded-lg text-neutral-400 hover:text-secondary shadow-sm"
                title="Baixar"
              >
                <Download size={14} />
              </button>
              <button 
                onClick={() => deleteDocument(d.id)}
                className="p-1.5 bg-white rounded-lg text-neutral-400 hover:text-red-500 shadow-sm"
                title="Excluir"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-secondary mb-3 shadow-sm group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
            <h4 className="text-sm font-medium line-clamp-1 mb-1">{d.title}</h4>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider">{formatDate(d.date)}</span>
          </div>
        ))}
        {docs.length === 0 && (
          <div className="col-span-full py-12 text-center text-neutral-400 italic">
            Nenhum documento anexado a esta turma.
          </div>
        )}
      </div>
    </Card>
  );
};

const PlanningTab: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-serif text-ink">Planejamento Inteligente (IA)</h3>
          <p className="text-sm text-neutral-500">Gere prompts mestres para criar planos de aula, sequências e projetos com sua IA favorita, que já vem com habilidades e competências da BNCC.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-2xl">
          <Sparkles size={18} className="text-secondary animate-pulse" />
          <span className="text-xs font-bold text-secondary uppercase">Powered by BNCC Pro</span>
        </div>
      </header>

      <div className="h-[700px]">
        <AIPlanner />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard 
          title="Planos de Aula" 
          description="Roteiros detalhados alinhados às competências e habilidades da BNCC."
          icon={<BookOpen size={20} />}
        />
        <FeatureCard 
          title="Sequências Didáticas" 
          description="Conjunto de aulas encadeadas com progressão pedagógica lógica."
          icon={<Rocket size={20} />}
        />
        <FeatureCard 
          title="Projetos Didáticos" 
          description="Aprendizagem Baseada em Projetos (ABP) com foco no produto final."
          icon={<GraduationCap size={20} />}
        />
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => (
  <Card className="p-6 border-none bg-neutral-50/50 hover:bg-white hover:shadow-md transition-all group">
    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-secondary mb-4 shadow-sm group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h4 className="font-serif text-lg mb-1">{title}</h4>
    <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>
  </Card>
);
