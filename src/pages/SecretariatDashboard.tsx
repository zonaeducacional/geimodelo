import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Card, Button, Modal, Input } from '../components/UI';
import { 
  Building2, Users, Plus, GraduationCap, 
  BarChart3, Loader2, BookOpen, AlertTriangle, 
  Download, FileDown, PieChart, TrendingUp, 
  MapPin, Calendar, Search, Settings
} from 'lucide-react';
import { motion } from 'motion/react';
import { SchoolReportData } from '../context/AdminContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, 
  Pie 
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

export const SecretariatDashboard: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { schools, teachers, addSchool, assignTeacherToSchool, promoteToAdmin, getSchoolReport } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [activeTab, setActiveTab] = useState<'schools' | 'teachers' | 'reports' | 'config'>('reports');
  
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [reportData, setReportData] = useState<SchoolReportData | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Simulação de Multi-Tenancy para visualização
  const currentYear = "2026";

  const handleLoadReport = async () => {
    if (!selectedSchoolId) return;
    setIsLoadingReport(true);
    const data = await getSchoolReport(selectedSchoolId);
    setReportData(data);
    setIsLoadingReport(false);
  };

  const handleExportCSV = () => {
    if (!reportData || !reportData.students) return;

    const headers = ['Aluno', 'Matrícula', 'Aulas Dadas', 'Presenças', 'Faltas', '% Frequência'];
    const rows = reportData.students.map(s => [
      `"${s.name}"`,
      `"${s.registration}"`,
      s.totalClasses,
      s.presences,
      s.absences,
      `${s.attendancePercentage}%`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    const schoolName = schools.find(s => s.id === selectedSchoolId)?.name || 'escola';
    link.setAttribute('download', `bolsa_familia_${schoolName.replace(/\s+/g, '_')}.csv`);
    link.click();
  };

  const filteredStudents = useMemo(() => {
    if (!reportData) return [];
    return reportData.students.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.registration.includes(searchTerm)
    );
  }, [reportData, searchTerm]);

  const stats = useMemo(() => {
    if (!reportData) return null;
    const atRisk = reportData.students.filter(s => s.attendancePercentage < 75).length;
    const stable = reportData.students.length - atRisk;
    return [
      { name: 'Regular', value: stable, color: '#10b981' },
      { name: 'Risco (Bolsa Família)', value: atRisk, color: '#ef4444' }
    ];
  }, [reportData]);

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;
    addSchool(newSchoolName);
    setNewSchoolName('');
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Estilo Governo */}
      <header className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="z-10">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
            <MapPin size={14} />
            Prefeitura Municipal de {theme.municipioNome}
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-ink tracking-tight">Painel Estratégico</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1 text-xs text-neutral-400 bg-neutral-50 px-2 py-1 rounded-full border border-neutral-100">
              <Calendar size={12} /> Ano Letivo: {currentYear}
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 font-medium">
              Sincronizado: Agora
            </span>
          </div>
        </div>
        <div className="flex gap-2 z-10">
          <Button variant="outline" className="gap-2 bg-white" onClick={() => window.print()}>
            <FileDown size={18} />
            Imprimir Dashboard
          </Button>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-white flex flex-col gap-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg w-fit"><Building2 size={20} /></div>
          <p className="text-xs text-neutral-400 font-bold uppercase">Escolas Ativas</p>
          <p className="text-3xl font-serif">{schools.length}</p>
        </Card>
        <Card className="p-6 bg-white flex flex-col gap-2">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg w-fit"><Users size={20} /></div>
          <p className="text-xs text-neutral-400 font-bold uppercase">Corpo Docente</p>
          <p className="text-3xl font-serif">{teachers.length}</p>
        </Card>
        <Card className="p-6 bg-white flex flex-col gap-2">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg w-fit"><TrendingUp size={20} /></div>
          <p className="text-xs text-neutral-400 font-bold uppercase">Média Presença</p>
          <p className="text-3xl font-serif">88.4%</p>
        </Card>
        <Card className="p-6 bg-white flex flex-col gap-2">
          <div className="p-2 bg-red-50 text-red-600 rounded-lg w-fit"><AlertTriangle size={20} /></div>
          <p className="text-xs text-neutral-400 font-bold uppercase">Risco Evasão</p>
          <p className="text-3xl font-serif text-red-500">12</p>
        </Card>
      </div>

      <div className="flex gap-1 p-1 bg-neutral-100 rounded-2xl w-fit">
        <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} label="Relatórios & Analytics" icon={<BarChart3 size={16} />} />
        <TabButton active={activeTab === 'schools'} onClick={() => setActiveTab('schools')} label="Rede Escolar" icon={<Building2 size={16} />} />
        <TabButton active={activeTab === 'teachers'} onClick={() => setActiveTab('teachers')} label="Professores" icon={<Users size={16} />} />
        <TabButton active={activeTab === 'config'} onClick={() => setActiveTab('config')} label="Configurações" icon={<Settings size={16} />} />
      </div>

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-primary/10">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase ml-1">Filtrar por Unidade Escolar</label>
                <select 
                  className="w-full p-3 rounded-2xl border border-neutral-200 bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                >
                  <option value="">Selecione uma escola para analisar</option>
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <Button 
                onClick={handleLoadReport} 
                disabled={!selectedSchoolId || isLoadingReport}
                className="gap-2 h-12 px-8 rounded-2xl shadow-lg shadow-primary/20"
              >
                {isLoadingReport ? <Loader2 size={18} className="animate-spin" /> : <PieChart size={18} />}
                Gerar Analítico
              </Button>
            </div>
          </Card>

          {reportData ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Charts Section */}
              <Card className="p-6 bg-white col-span-1 lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-serif text-xl">Distribuição de Frequência</h3>
                  <div className="text-xs text-neutral-400 bg-neutral-50 px-2 py-1 rounded">Tempo Real</div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.students.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                      <XAxis dataKey="name" hide />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="attendancePercentage" radius={[6, 6, 0, 0]}>
                        {reportData.students.slice(0, 10).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.attendancePercentage < 75 ? '#ef4444' : '#3b82f6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-6 bg-white flex flex-col items-center justify-center">
                <h3 className="font-serif text-xl mb-6 w-full">Resumo Bolsa Família</h3>
                <div className="h-[200px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={stats}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-serif text-red-500">{stats?.[1].value}</span>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase">Em Risco</span>
                  </div>
                </div>
                <div className="mt-4 w-full space-y-2">
                  {stats?.map(s => (
                    <div key={s.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></div>
                        <span className="text-neutral-500">{s.name}</span>
                      </div>
                      <span className="font-bold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Data Table Section */}
              <Card className="col-span-1 lg:col-span-3 overflow-hidden border-none shadow-xl">
                <div className="p-6 bg-white border-b border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <Input 
                      placeholder="Pesquisar por nome ou matrícula..." 
                      className="pl-10 h-11"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" onClick={handleExportCSV} className="gap-2 border-primary/20 text-primary hover:bg-primary/5 rounded-xl h-11 px-6">
                    <Download size={18} />
                    Exportar Relatório (.csv)
                  </Button>
                </div>
                <div className="overflow-x-auto bg-white">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-neutral-50 text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100">
                        <th className="p-6">Aluno</th>
                        <th className="p-6 text-center">Frequência</th>
                        <th className="p-6 text-center">Aulas / Faltas</th>
                        <th className="p-6 text-right">Status Social</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => {
                        const isAtRisk = student.attendancePercentage < 75;
                        return (
                          <tr key={student.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors group">
                            <td className="p-6">
                              <p className="font-medium text-ink group-hover:text-primary transition-colors">{student.name}</p>
                              <p className="text-xs text-neutral-400">Mat: {student.registration}</p>
                            </td>
                            <td className="p-6 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className={`text-lg font-serif ${isAtRisk ? 'text-red-500' : 'text-emerald-600'}`}>
                                  {student.attendancePercentage}%
                                </span>
                                <div className="w-24 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${isAtRisk ? 'bg-red-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${student.attendancePercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="p-6 text-center">
                              <p className="text-sm font-medium">{student.totalClasses} aulas</p>
                              <p className="text-xs text-red-400">{student.absences} faltas registradas</p>
                            </td>
                            <td className="p-6 text-right">
                              {isAtRisk ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-tight border border-red-100">
                                  <AlertTriangle size={12} />
                                  Notificar Bolsa Família
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-tight border border-emerald-100">
                                  Regular
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          ) : (
            <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-neutral-200">
              <BarChart3 size={64} className="mx-auto text-neutral-200 mb-4" />
              <h3 className="text-2xl font-serif text-neutral-400">Selecione uma unidade acima para visualizar os dados estratégicos.</h3>
            </div>
          )}
        </div>
      )}

      {/* Tabs Schools e Teachers permanecem funcionais */}
      {activeTab === 'schools' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {schools.map(school => (
            <Card key={school.id} className="p-6 hover:shadow-lg transition-all cursor-pointer border-t-4 border-t-primary">
              <h3 className="text-xl font-serif mb-2">{school.name}</h3>
              <div className="flex items-center justify-between text-sm text-neutral-500">
                <span>{teachers.filter(t => t.schoolId === school.id).length} Professores</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedSchoolId(school.id);
                    setActiveTab('reports');
                    // O useEffect ou a chamada direta pode carregar o relatório
                    setTimeout(() => handleLoadReport(), 100); 
                  }}
                >
                  Ver Unidade
                </Button>
              </div>
            </Card>
          ))}
          <Button onClick={() => setIsModalOpen(true)} variant="outline" className="h-full border-dashed border-2 flex flex-col gap-2 py-12 rounded-3xl border-neutral-300 hover:border-primary text-neutral-400 hover:text-primary transition-all">
            <Plus size={32} />
            Cadastrar Nova Escola
          </Button>
        </div>
      )}

      {activeTab === 'teachers' && (
        <Card className="overflow-hidden border-none shadow-xl">
           <table className="w-full text-left bg-white">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  <th className="p-6 font-medium">Professor</th>
                  <th className="p-6 font-medium">Escola Vinculada</th>
                  <th className="p-6 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(teacher => (
                  <tr key={teacher.uid} className="border-b border-neutral-100 last:border-0">
                    <td className="p-6">
                      <p className="font-medium text-ink">{teacher.teacherName || 'Professor sem nome'}</p>
                      <p className="text-xs text-neutral-400">{teacher.uid}</p>
                    </td>
                    <td className="p-6">
                      <select 
                        className="w-full max-w-xs p-2 rounded-xl border border-neutral-200 bg-white text-sm"
                        value={teacher.schoolId || ''}
                        onChange={(e) => assignTeacherToSchool(teacher.uid, e.target.value)}
                      >
                        <option value="">-- Sem escola vinculada --</option>
                        {schools.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-6 text-right">
                      <Button variant="outline" size="sm" onClick={() => promoteToAdmin(teacher.uid)}>
                        Tornar Secretaria
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </Card>
      )}
      {activeTab === 'config' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-3xl"
        >
          <Card className="p-8 bg-white space-y-8">
            <div>
              <h2 className="text-2xl font-serif mb-2">Identidade do Município</h2>
              <p className="text-sm text-neutral-500">Personalize o GEI com as cores e a logo oficial da sua prefeitura.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Nome do Município</label>
                  <Input 
                    value={theme.municipioNome} 
                    onChange={e => setTheme({ municipioNome: e.target.value })}
                    placeholder="Ex: Prefeitura de Salinas"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Logo Oficial (PNG/WebP)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setTheme({ logoUrl: reader.result as string });
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <p className="text-[10px] text-neutral-400 mt-2 italic">Recomendado: 400x400px, fundo transparente.</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Cores do Governo</label>
                <div className="grid grid-cols-2 gap-4">
                  <ColorPicker 
                    label="Cor Principal" 
                    value={theme.color2} 
                    onChange={c => setTheme({ color2: c, color3: c + 'CC' })} 
                  />
                  <ColorPicker 
                    label="Destaque" 
                    value={theme.color4} 
                    onChange={c => setTheme({ color4: c, color5: c + 'CC' })} 
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-neutral-100 flex justify-end">
              <Button className="px-12" onClick={() => toast.success('Identidade Visual salva!')}>Salvar Alterações</Button>
            </div>
          </Card>
        </motion.div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Escola">
        <form onSubmit={handleCreateSchool} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome da Escola</label>
            <Input 
              required 
              placeholder="Ex: Escola Municipal João Peixoto" 
              value={newSchoolName}
              onChange={e => setNewSchoolName(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: React.ReactNode }> = ({ active, onClick, label, icon }) => (
  <button 
    className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition-all ${active ? 'border-primary text-primary font-medium' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
  </button>
);
const ColorPicker: React.FC<{ label: string; value: string; onChange: (val: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <span className="text-[10px] font-bold text-neutral-500 uppercase">{label}</span>
    <div className="flex items-center gap-2">
      <input 
        type="color" 
        value={value} 
        onChange={e => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
      />
      <span className="text-xs font-mono text-neutral-400 uppercase">{value}</span>
    </div>
  </div>
);
