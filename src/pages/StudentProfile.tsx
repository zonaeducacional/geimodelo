import React, { useRef } from 'react';
import { useDiary } from '../context/DiaryContext';
import { useTheme } from '../context/ThemeContext';
import { Card, Button } from '../components/UI';
import { User, Calendar, GraduationCap, ArrowLeft, TrendingUp, Download, FileText } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';
import { SUBJECTS } from '../constants';

export const StudentProfile: React.FC<{ studentId: string; onBack: () => void }> = ({ studentId, onBack }) => {
  const { data } = useDiary();
  const { theme } = useTheme();
  const reportRef = useRef<HTMLDivElement>(null);
  const student = data.students.find(s => s.id === studentId);
  
  if (!student) return <div>Aluno não encontrado.</div>;

  const studentGrades = data.grades.filter(g => g.studentId === studentId);
  const studentAttendance = data.attendance.map(a => ({
    date: a.date,
    present: a.presentStudentIds.includes(studentId)
  }));

  const avgGrade = studentGrades.length > 0 
    ? studentGrades.reduce((acc, curr) => acc + curr.grade, 0) / studentGrades.length 
    : 0;

  const attendanceRate = studentAttendance.length > 0
    ? (studentAttendance.filter(a => a.present).length / studentAttendance.length) * 100
    : 100;

  const isAtRisk = attendanceRate < 75;

  const subjects = SUBJECTS;

  const getUnitTotal = (unit: string, subject: string) => {
    const total = studentGrades
      .filter(g => g.unit === unit && g.subject === subject)
      .reduce((acc, curr) => acc + curr.grade, 0);
    return Math.min(total, 10);
  };

  // Evolution Data for Chart
  const units = ['I Unidade', 'II Unidade', 'III Unidade'] as const;
  const assessments = ['1ª Avaliação', '2ª Avaliação', '3ª Avaliação', '4ª Avaliação'] as const;

  const evolutionData = [];
  for (const unit of units) {
    for (const assessment of assessments) {
      const label = `${unit.split(' ')[0]} - ${assessment.split(' ')[0]}`;
      const sGrade = studentGrades.find(g => g.unit === unit && g.assessment === assessment);
      
      if (sGrade) {
        evolutionData.push({
          name: label,
          'Nota': sGrade.grade
        });
      }
    }
  }

  const exportToCSV = () => {
    try {
      const headers = ['Disciplina', 'I Unidade', 'II Unidade', 'III Unidade', 'Total', 'Media', 'Status'];
      
      const escapeCSV = (val: any) => {
        const str = (val ?? '').toString();
        return `"${str.replace(/"/g, '""')}"`;
      };

      const rows = subjects.map(s => {
        const u1 = getUnitTotal('I Unidade', s);
        const u2 = getUnitTotal('II Unidade', s);
        const u3 = getUnitTotal('III Unidade', s);
        const total = u1 + u2 + u3;
        const avg = total / 3;
        const status = total >= 15 ? 'Aprovado' : (u1 > 0 && u2 > 0 && u3 > 0) ? 'Reprovado' : 'Em curso';
        
        return [
          escapeCSV(s),
          escapeCSV(u1.toFixed(1).replace('.', ',')),
          escapeCSV(u2.toFixed(1).replace('.', ',')),
          escapeCSV(u3.toFixed(1).replace('.', ',')),
          escapeCSV(total.toFixed(1).replace('.', ',')),
          escapeCSV(avg.toFixed(1).replace('.', ',')),
          escapeCSV(status)
        ];
      });

      const csvContent = [
        escapeCSV(`Boletim Escolar - ${student.name}`),
        escapeCSV(`Matricula: ${student.registration}`),
        escapeCSV(`Ano Letivo: ${data.settings.schoolYear}`),
        '',
        headers.map(escapeCSV).join(';'),
        ...rows.map(row => row.join(';'))
      ].join('\r\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Boletim_${student.name.replace(/[^a-z0-9]/gi, '_')}.csv`;
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
    
    const loadingToast = toast.loading('Preparando impressão do Boletim...');
    
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
          th, td { border-bottom: 1px solid #f5f5f5; }
        </style>
      `;

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <html>
            <head>
              <title>Boletim - ${student.name}</title>
              ${styles}
            </head>
            <body>
              ${content}
            </body>
          </html>
        `);
        doc.close();

        // Wait for styles to apply
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
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-sm text-secondary hover:underline flex items-center gap-1">
          <ArrowLeft size={16} />
          Voltar para Lista
        </button>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} className="gap-2" variant="outline">
            <FileText size={18} />
            Baixar CSV
          </Button>
          <Button onClick={exportToPDF} className="gap-2" variant="secondary">
            <Download size={18} />
            Gerar Boletim (PDF)
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="w-32 h-32 rounded-3xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
          <User size={48} />
        </div>
        <div className="flex-1">
          <h1 className="text-4xl font-serif mb-2">{student.name}</h1>
          <p className="text-neutral-500 mb-4">Matrícula: {student.registration}</p>
          
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-white rounded-2xl border border-neutral-100 shadow-sm">
              <span className="text-[10px] text-neutral-400 uppercase block">Média Geral</span>
              <span className="text-xl font-serif text-secondary">{avgGrade.toFixed(1)}</span>
            </div>
            <div className={`px-4 py-2 bg-white rounded-2xl border shadow-sm ${isAtRisk ? 'border-red-200 bg-red-50' : 'border-neutral-100'}`}>
              <span className="text-[10px] text-neutral-400 uppercase block">Frequência</span>
              <span className={`text-xl font-serif ${isAtRisk ? 'text-red-600' : 'text-green-600'}`}>
                {attendanceRate.toFixed(0)}%
              </span>
            </div>
          </div>
          
          {isAtRisk && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-xl text-xs font-medium flex items-center gap-2">
              <TrendingUp size={14} />
              Atenção: Frequência abaixo do mínimo legal (75%). Risco de reprovação.
            </div>
          )}
        </div>
      </div>

      <div className="mb-12">
        <Card>
          <div className="flex items-center gap-2 mb-6 text-secondary">
            <TrendingUp size={20} />
            <h3 className="text-xl font-serif">Resumo por Unidade</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 text-neutral-500 text-[10px] uppercase">
                <tr>
                  <th className="px-4 py-2 font-medium">Disciplina</th>
                  <th className="px-4 py-2 font-medium text-center">I Unidade</th>
                  <th className="px-4 py-2 font-medium text-center">II Unidade</th>
                  <th className="px-4 py-2 font-medium text-center">III Unidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {subjects.map(s => {
                  const u1 = getUnitTotal('I Unidade', s);
                  const u2 = getUnitTotal('II Unidade', s);
                  const u3 = getUnitTotal('III Unidade', s);
                  const hasGrades = u1 > 0 || u2 > 0 || u3 > 0;

                  if (!hasGrades) return null;

                  return (
                    <tr key={s} className="text-sm">
                      <td className="px-4 py-3 font-medium">{s}</td>
                      {[u1, u2, u3].map((val, idx) => (
                        <td key={idx} className="px-4 py-3 text-center">
                          <span className={`font-serif font-bold ${val >= 5 ? 'text-green-600' : 'text-red-500'}`}>
                            {val.toFixed(1)}
                          </span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {studentGrades.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-neutral-400 italic">Nenhuma nota lançada para este aluno.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <div className="flex items-center gap-2 mb-6 text-secondary">
            <GraduationCap size={20} />
            <h3 className="text-xl font-serif">Histórico de Notas</h3>
          </div>
          <div className="space-y-3">
            {studentGrades.sort((a, b) => b.date.localeCompare(a.date)).map((g, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                      {g.unit || 'I Unidade'}
                    </span>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-neutral-200 text-neutral-600 rounded">
                      {g.assessment || 'Avaliação'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-ink">{g.activityName}</p>
                  <p className="text-[10px] text-neutral-400">{g.subject} • {formatDate(g.date)}</p>
                </div>
                <div className="text-right ml-4">
                  <span className={`font-serif text-xl block ${g.grade >= 5 ? 'text-green-600' : 'text-red-500'}`}>
                    {g.grade.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
            {studentGrades.length === 0 && <p className="text-sm text-neutral-400 italic p-4">Nenhuma nota lançada.</p>}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-6 text-secondary">
            <Calendar size={20} />
            <h3 className="text-xl font-serif">Registro de Presença</h3>
          </div>
          <div className="space-y-2">
            {studentAttendance.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                <span className="text-sm">{formatDate(a.date)}</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                  a.present ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {a.present ? 'Presente' : 'Falta'}
                </span>
              </div>
            ))}
            {studentAttendance.length === 0 && <p className="text-sm text-neutral-400 italic">Nenhum registro de chamada.</p>}
          </div>
        </Card>
      </div>

      {/* Hidden Boletim Template for PDF Export - Hardened against oklch errors */}
      <div style={{ position: 'fixed', left: '-9999px', top: '0', zIndex: -100, pointerEvents: 'none', visibility: 'hidden' }}>
        <div ref={reportRef} style={{ padding: '48px', backgroundColor: '#ffffff', color: '#565164', width: '1000px', fontFamily: 'sans-serif' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #9ddbca', paddingBottom: '32px', marginBottom: '32px' }}>
            {theme.logoUrl && (
              <img src={theme.logoUrl} alt="Logo" style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '16px' }} />
            )}
            <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: theme.color2 || '#92b395', marginBottom: '8px', fontFamily: 'serif' }}>{data.settings.schoolName || 'Escola Não Definida'}</h1>
            <p style={{ fontSize: '14px', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Boletim Escolar Oficial</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', fontSize: '12px', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <span>Ano Letivo: {data.settings.schoolYear}</span>
              <span>Emitido em: {new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          {/* Student Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '48px', backgroundColor: '#fafafa', padding: '24px', borderRadius: '24px', border: '1px solid #f5f5f5' }}>
            <div>
              <p style={{ fontSize: '10px', color: '#a3a3a3', textTransform: 'uppercase', marginBottom: '4px' }}>Aluno(a)</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'serif' }}>{student.name}</p>
            </div>
            <div>
              <p style={{ fontSize: '10px', color: '#a3a3a3', textTransform: 'uppercase', marginBottom: '4px' }}>Matrícula</p>
              <p style={{ fontSize: '20px', fontFamily: 'serif' }}>{student.registration}</p>
            </div>
          </div>

          {/* Grades Table */}
          <div style={{ marginBottom: '48px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', borderLeft: '4px solid #9ddbca', paddingLeft: '16px', fontFamily: 'serif' }}>Desempenho por Disciplina</h3>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#fafafa', color: '#737373', fontSize: '10px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e5e5' }}>Disciplina</th>
                  <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e5e5', textAlign: 'center' }}>I Unid.</th>
                  <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e5e5', textAlign: 'center' }}>II Unid.</th>
                  <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e5e5', textAlign: 'center' }}>III Unid.</th>
                  <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e5e5', textAlign: 'center' }}>Total</th>
                  <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e5e5', textAlign: 'center' }}>Média</th>
                  <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e5e5', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s, i) => {
                  const u1 = getUnitTotal('I Unidade', s);
                  const u2 = getUnitTotal('II Unidade', s);
                  const u3 = getUnitTotal('III Unidade', s);
                  const totalPoints = u1 + u2 + u3;
                  const finalAvg = totalPoints / 3;
                  const isFinished = u1 > 0 && u2 > 0 && u3 > 0;
                  const status = totalPoints >= 15 ? 'Aprovado' : isFinished ? 'Reprovado' : 'Em curso';
                  
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #f5f5f5', fontSize: '14px' }}>
                      <td style={{ padding: '16px', fontWeight: '500' }}>{s}</td>
                      <td style={{ padding: '16px', textAlign: 'center', fontFamily: 'serif' }}>{u1 > 0 ? u1.toFixed(1) : '-'}</td>
                      <td style={{ padding: '16px', textAlign: 'center', fontFamily: 'serif' }}>{u2 > 0 ? u2.toFixed(1) : '-'}</td>
                      <td style={{ padding: '16px', textAlign: 'center', fontFamily: 'serif' }}>{u3 > 0 ? u3.toFixed(1) : '-'}</td>
                      <td style={{ padding: '16px', textAlign: 'center', fontFamily: 'serif', fontWeight: 'bold' }}>{totalPoints > 0 ? totalPoints.toFixed(1) : '-'}</td>
                      <td style={{ padding: '16px', textAlign: 'center', fontFamily: 'serif' }}>{finalAvg > 0 ? finalAvg.toFixed(1) : '-'}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span style={{ 
                          fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '4px',
                          backgroundColor: status === 'Aprovado' ? '#dcfce7' : status === 'Reprovado' ? '#fee2e2' : '#dbeafe',
                          color: status === 'Aprovado' ? '#15803d' : status === 'Reprovado' ? '#b91c1c' : '#1d4ed8'
                        }}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p style={{ marginTop: '8px', fontSize: '8px', color: '#a3a3a3', fontStyle: 'italic' }}>
              * Nota máxima por unidade: 10,0. Critério de aprovação: Mínimo de 15 pontos acumulados (Média 5,0).
            </p>
          </div>

          {/* Attendance and Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '48px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', borderLeft: '4px solid #9ddbca', paddingLeft: '16px', fontFamily: 'serif' }}>Frequência e Faltas</h3>
              <div style={{ padding: '24px', borderRadius: '16px', border: '1px solid #f5f5f5', backgroundColor: '#fafafa', marginBottom: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '4px', fontFamily: 'serif' }}>{attendanceRate.toFixed(0)}%</p>
                  <p style={{ fontSize: '12px', color: '#a3a3a3', textTransform: 'uppercase' }}>Taxa de Presença</p>
                </div>
              </div>
              
              {studentAttendance.filter(a => !a.present).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#a3a3a3', textTransform: 'uppercase', marginBottom: '8px' }}>Datas de Ausência:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {studentAttendance.filter(a => !a.present).map((a, idx) => (
                      <span key={idx} style={{ fontSize: '9px', backgroundColor: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fee2e2' }}>
                        {formatDate(a.date)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '12px', color: '#15803d', fontWeight: '500', fontStyle: 'italic' }}>Nenhuma falta registrada até o momento.</p>
              )}
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', borderLeft: '4px solid #9ddbca', paddingLeft: '16px', fontFamily: 'serif' }}>Evolução de Notas</h3>
              <div style={{ height: '150px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" hide />
                    <YAxis domain={[0, 10]} hide />
                    <Line type="monotone" dataKey="Nota" stroke="#726c81" strokeWidth={3} dot={{ r: 4, fill: '#726c81' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
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

