import React, { useState, useRef } from 'react';
import { useDiary } from '../context/DiaryContext';
import { Card, Button, Select } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, Users, CheckCircle2, Award, Download, FileText, LineChart as LineChartIcon } from 'lucide-react';
import { toast } from 'sonner';

export const Reports: React.FC = () => {
  const { data } = useDiary();
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const reportRef = useRef<HTMLDivElement>(null);

  const filteredClasses = selectedClassId === 'all' 
    ? data.classes 
    : data.classes.filter(c => c.id === selectedClassId);

  const filteredStudents = selectedClassId === 'all'
    ? data.students
    : data.students.filter(s => filteredClasses.some(c => c.studentIds.includes(s.id)));

  const filteredAttendance = selectedClassId === 'all'
    ? data.attendance
    : data.attendance.filter(a => a.classId === selectedClassId);

  const filteredGrades = selectedClassId === 'all'
    ? data.grades
    : data.grades.filter(g => g.classId === selectedClassId);

  const totalStudents = filteredStudents.length;
  const totalClasses = filteredClasses.length;
  
  // Calculate average attendance
  const avgAttendance = filteredAttendance.length > 0 
    ? (filteredAttendance.reduce((acc, curr) => {
        const cls = data.classes.find(c => c.id === curr.classId);
        return acc + (curr.presentStudentIds.length / (cls?.studentIds.length || 1));
      }, 0) / filteredAttendance.length) * 100
    : 0;

  // Calculate average grade
  const avgGrade = filteredGrades.length > 0
    ? filteredGrades.reduce((acc, curr) => acc + curr.grade, 0) / filteredGrades.length
    : 0;

  const classData = filteredClasses.map(c => ({
    name: c.name,
    alunos: c.studentIds.length,
    media: data.grades.filter(g => g.classId === c.id).reduce((acc, curr, _, arr) => acc + curr.grade / arr.length, 0) || 0
  }));

  // Evolution Data
  const units = ['I Unidade', 'II Unidade', 'III Unidade'] as const;
  const assessments = ['1ª Avaliação', '2ª Avaliação', '3ª Avaliação', '4ª Avaliação'] as const;

  const evolutionData = [];
  for (const unit of units) {
    for (const assessment of assessments) {
      const label = `${unit.split(' ')[0]} - ${assessment.split(' ')[0]}`;
      
      // Class Average for this point
      const pointGrades = filteredGrades.filter(g => g.unit === unit && g.assessment === assessment);
      const classAvg = pointGrades.length > 0 
        ? pointGrades.reduce((acc, curr) => acc + curr.grade, 0) / pointGrades.length 
        : null;

      // Selected Student Grade for this point
      let studentGrade = null;
      if (selectedStudentId) {
        const sGrade = pointGrades.find(g => g.studentId === selectedStudentId);
        studentGrade = sGrade ? sGrade.grade : null;
      }

      if (classAvg !== null || studentGrade !== null) {
        evolutionData.push({
          name: label,
          'Média da Turma': classAvg,
          'Nota do Aluno': studentGrade
        });
      }
    }
  }

  const COLORS = ['#9ddbca', '#92b395', '#726c81', '#565164'];

  const exportToCSV = () => {
    try {
      const headers = ['Turma', 'Alunos', 'Media de Notas', 'Status'];
      
      const escapeCSV = (val: any) => {
        const str = (val ?? '').toString();
        return `"${str.replace(/"/g, '""')}"`;
      };

      const rows = classData.map(c => [
        escapeCSV(c.name),
        escapeCSV(c.alunos),
        escapeCSV(c.media.toFixed(2).replace('.', ',')),
        escapeCSV(c.media >= 6 ? 'Satisfatório' : 'Atenção')
      ]);

      const csvContent = [
        headers.map(escapeCSV).join(';'),
        ...rows.map(row => row.join(';'))
      ].join('\r\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = selectedClassId === 'all' 
        ? 'Relatorio_Geral_Escolar.csv' 
        : `Relatorio_Turma_${filteredClasses[0]?.name.replace(/[^a-z0-9]/gi, '_')}.csv`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('CSV exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast.error('Erro ao exportar o CSV.');
    }
  };

  const exportToPDF = () => {
    if (!reportRef.current) return;
    
    const loadingToast = toast.loading('Preparando relatório...');
    
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const content = reportRef.current.innerHTML;
      const styles = `
        <style>
          @media print {
            @page { size: A4; margin: 1cm; }
            body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          body { font-family: sans-serif; color: #565164; background: white; padding: 20px; }
          * { box-sizing: border-box; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border-bottom: 1px solid #f5f5f5; text-align: left; padding: 8px; }
        </style>
      `;

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <html>
            <head>
              <title>Relatório Escolar</title>
              ${styles}
            </head>
            <body>
              ${content}
            </body>
          </html>
        `);
        doc.close();

        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          document.body.removeChild(iframe);
          toast.dismiss(loadingToast);
          toast.success('Janela de impressão aberta!');
        }, 500);
      }
    } catch (error) {
      console.error('Erro ao preparar PDF:', error);
      toast.dismiss(loadingToast);
      toast.error('Erro ao gerar o PDF. Tente novamente.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
        <div>
          <h1 className="text-4xl font-serif mb-2">Relatórios & Analytics</h1>
          <p className="text-neutral-500">Visão geral do desempenho pedagógico e engajamento.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-64">
            <Select value={selectedClassId} onChange={(e) => {
              setSelectedClassId(e.target.value);
              setSelectedStudentId('');
            }}>
              <option value="all">Todas as Turmas</option>
              {data.classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToCSV} className="gap-2" variant="outline">
              <FileText size={18} />
              CSV
            </Button>
            <Button onClick={exportToPDF} className="gap-2" variant="secondary">
              <Download size={18} />
              PDF
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard icon={<Users size={24} />} label="Total de Alunos" value={totalStudents} color="bg-blue-50 text-blue-600" />
        <StatCard icon={<TrendingUp size={24} />} label="Média de Presença" value={`${avgAttendance.toFixed(1)}%`} color="bg-green-50 text-green-600" />
        <StatCard icon={<Award size={24} />} label="Média de Notas" value={avgGrade.toFixed(1)} color="bg-primary/20 text-secondary" />
        <StatCard icon={<CheckCircle2 size={24} />} label="Turmas Ativas" value={totalClasses} color="bg-purple-50 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="h-[400px] flex flex-col">
          <h3 className="text-xl font-serif mb-6">Média de Notas por Turma</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} domain={[0, 10]} />
                <Tooltip 
                  cursor={{ fill: '#d8f5d1' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="media" fill="#9ddbca" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="h-[400px] flex flex-col">
          <h3 className="text-xl font-serif mb-6">Distribuição de Alunos</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="alunos"
                >
                  {classData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-xl font-serif">Evolução de Notas</h3>
            <p className="text-sm text-neutral-500">Acompanhamento do progresso individual vs média do grupo.</p>
          </div>
          
          <div className="w-64">
            <Select 
              value={selectedStudentId} 
              onChange={(e) => setSelectedStudentId(e.target.value)}
              disabled={selectedClassId === 'all'}
            >
              <option value="">Selecione um Aluno</option>
              {filteredStudents.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
            {selectedClassId === 'all' && (
              <p className="text-[10px] text-neutral-400 mt-1">Selecione uma turma para filtrar alunos.</p>
            )}
          </div>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} domain={[0, 10]} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line 
                type="monotone" 
                dataKey="Média da Turma" 
                stroke="#92b395" 
                strokeWidth={2} 
                dot={{ r: 4, fill: '#92b395' }} 
                activeDot={{ r: 6 }}
                strokeDasharray="5 5"
              />
              {selectedStudentId && (
                <Line 
                  type="monotone" 
                  dataKey="Nota do Aluno" 
                  stroke="#726c81" 
                  strokeWidth={3} 
                  dot={{ r: 6, fill: '#726c81' }} 
                  activeDot={{ r: 8 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Hidden Report Template for PDF Export - Hardened against oklch errors */}
      <div style={{ position: 'fixed', left: '-9999px', top: '0', zIndex: -100, pointerEvents: 'none', visibility: 'hidden' }}>
        <div ref={reportRef} style={{ padding: '48px', backgroundColor: '#ffffff', color: '#565164', width: '1000px', fontFamily: 'sans-serif' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #9ddbca', paddingBottom: '32px', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#92b395', marginBottom: '8px', fontFamily: 'serif' }}>{data.settings.schoolName || 'Escola Não Definida'}</h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', fontSize: '14px', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <span>Ano Letivo: {data.settings.schoolYear}</span>
              <span>Professor(a): {data.settings.teacherName || 'Não Informado'}</span>
            </div>
          </div>

          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', borderLeft: '4px solid #9ddbca', paddingLeft: '16px', fontFamily: 'serif' }}>
              Relatório de Desempenho {selectedClassId !== 'all' && `- Turma ${filteredClasses[0]?.name}`}
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }}>
              <div style={{ padding: '24px', borderRadius: '16px', border: '1px solid #f5f5f5', backgroundColor: '#fafafa' }}>
                <p style={{ fontSize: '12px', color: '#a3a3a3', textTransform: 'uppercase', marginBottom: '4px' }}>Total de Alunos</p>
                <p style={{ fontSize: '30px', fontWeight: 'bold', fontFamily: 'serif' }}>{totalStudents}</p>
              </div>
              <div style={{ padding: '24px', borderRadius: '16px', border: '1px solid #f5f5f5', backgroundColor: '#fafafa' }}>
                <p style={{ fontSize: '12px', color: '#a3a3a3', textTransform: 'uppercase', marginBottom: '4px' }}>Frequência Média</p>
                <p style={{ fontSize: '30px', fontWeight: 'bold', fontFamily: 'serif' }}>{avgAttendance.toFixed(1)}%</p>
              </div>
              <div style={{ padding: '24px', borderRadius: '16px', border: '1px solid #f5f5f5', backgroundColor: '#fafafa' }}>
                <p style={{ fontSize: '12px', color: '#a3a3a3', textTransform: 'uppercase', marginBottom: '4px' }}>Média de Notas</p>
                <p style={{ fontSize: '30px', fontWeight: 'bold', fontFamily: 'serif' }}>{avgGrade.toFixed(1)}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Detalhamento por Turma</h3>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#fafafa', color: '#737373', fontSize: '12px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e5e5' }}>Turma</th>
                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e5e5' }}>Alunos</th>
                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e5e5' }}>Média</th>
                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e5e5' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {classData.map((c, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '16px', fontWeight: '500' }}>{c.name}</td>
                      <td style={{ padding: '16px' }}>{c.alunos}</td>
                      <td style={{ padding: '16px', fontWeight: 'bold' }}>{c.media.toFixed(1)}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', padding: '4px 8px', borderRadius: '9999px',
                          backgroundColor: c.media >= 5 ? '#dcfce7' : '#fee2e2',
                          color: c.media >= 5 ? '#15803d' : '#b91c1c'
                        }}>
                          {c.media >= 5 ? 'Satisfatório' : 'Atenção'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures */}
          <div style={{ marginTop: '96px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #565164', paddingTop: '8px' }}>
                <p style={{ fontWeight: 'bold' }}>Diretor(a)</p>
                <p style={{ fontSize: '12px', color: '#a3a3a3' }}>Assinatura e Carimbo</p>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #565164', paddingTop: '8px' }}>
                <p style={{ fontWeight: 'bold' }}>Secretário(a)</p>
                <p style={{ fontSize: '12px', color: '#a3a3a3' }}>Assinatura e Carimbo</p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '48px', textAlign: 'center', fontSize: '10px', color: '#d4d4d4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Documento gerado eletronicamente pelo Sistema de Gestão Escolar
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => (
  <Card className="flex items-center gap-4">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">{label}</p>
      <p className="text-2xl font-serif">{value}</p>
    </div>
  </Card>
);
