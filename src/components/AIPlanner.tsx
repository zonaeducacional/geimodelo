import React, { useState } from 'react';
import { Card, Button, Input, Select } from './UI';
import { 
  Sparkles, Copy, ExternalLink, BookOpen, 
  Layers, Map, Rocket, GraduationCap,
  CheckCircle2, Info, Users
} from 'lucide-react';
import { toast } from 'sonner';
import { useDiary } from '../context/DiaryContext';

type PlanType = 'aula' | 'unidade' | 'curso' | 'sequencia' | 'projeto' | 'pei';

export const AIPlanner: React.FC = () => {
  const { user, settings } = useDiary();
  const [activeTab, setActiveTab] = useState<PlanType>('aula');
  
  // Tenta pegar o nome da escola das configurações ou usa um padrão
  const schoolName = settings?.[0]?.schoolName || user?.municipio || 'Escola Municipal';
  const teacherName = user?.displayName || 'Professor(a)';

  const [formData, setFormData] = useState({
    subject: '',
    grade: '',
    topic: '',
    duration: '',
    objectives: '',
    methodology: '',
    context: '',
    period: '', // Unidade/Semestre/Bimestre
    lessonCount: '', // Quantidade de aulas
    supportMaterial: 'texto', // texto, quiz, outro
    otherMaterial: '', // Texto para o "outro"
    studentName: '', // Para PEI
    diagnosis: '', // Para PEI
    potentials: '', // Para PEI
    barriers: '' // Para PEI
  });
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const generatePrompt = () => {
    const { 
      subject, grade, topic, duration, objectives, methodology, 
      context, period, lessonCount, supportMaterial, otherMaterial,
      studentName, diagnosis, potentials, barriers
    } = formData;
    
    if (activeTab !== 'pei' && (!subject || !grade || !topic)) {
      toast.error('Por favor, preencha Disciplina, Série e Tema.');
      return;
    }

    if (activeTab === 'pei' && (!studentName || !diagnosis)) {
      toast.error('Por favor, preencha o Nome do Aluno e o Diagnóstico.');
      return;
    }

    const materialText = supportMaterial === 'outro' ? otherMaterial : (supportMaterial === 'quiz' ? 'um Quiz interativo' : 'um Texto de Apoio pedagógico');

    const formattingInstruction = `
---
IDENTIFICAÇÃO DO DOCUMENTO:
- Escola: ${schoolName}
- Professor(a): ${teacherName}
${activeTab === 'pei' ? `- Aluno(a): ${studentName}\n- Diagnóstico/CID: ${diagnosis}` : `- Disciplina: ${subject}\n- Série/Ano: ${grade}`}

INSTRUÇÕES DE FORMATAÇÃO E SAÍDA:
1. NÃO adicione avisos de IA, introduções ou conclusões automáticas.
2. Saia o texto PRONTO para Microsoft Word ou Google Docs (Estilo .docx).
3. Use títulos claros, listas e negrito. Garanta uma formatação elegante para impressão.
4. Inclua obrigatoriamente as competências e habilidades da BNCC pertinentes.
${activeTab !== 'pei' ? `5. Crie também ${materialText} como material complementar ao final do plano.` : ''}
---`;

    let basePrompt = '';

    switch (activeTab) {
      case 'aula':
        basePrompt = `Atue como Especialista Pedagógico sênior. Crie um PLANO DE AULA:
- Tema: ${topic}
- Duração: ${duration}
- Metodologia: ${methodology}
- Contexto: ${context}

Estrutura: Cabeçalho, Objetivos, Conteúdos, Desenvolvimento (Início/Meio/Fim), Avaliação.
${formattingInstruction}`;
        break;
      case 'unidade':
        basePrompt = `Crie um PLANO DE UNIDADE DIDÁTICA:
- Período: ${period}
- Tema Central: ${topic}
- Qtd. Aulas: ${lessonCount}
- Objetivos: ${objectives}

Estruture o cronograma detalhado por aulas/semanas.
${formattingInstruction}`;
        break;
      case 'curso':
        basePrompt = `Crie um PLANO DE CURSO ANUAL/SEMESTRAL:
- Ementa Geral: ${topic}

Detalhe todas as unidades (Bimestres), habilidades BNCC por unidade e metodologia macro.
${formattingInstruction}`;
        break;
      case 'sequencia':
        basePrompt = `Crie uma SEQUÊNCIA DIDÁTICA:
- Tema: ${topic}
- Número de aulas: ${lessonCount || duration}
- Metodologia: ${methodology}

Mostre a evolução gradual do tema em cada encontro.
${formattingInstruction}`;
        break;
      case 'projeto':
        basePrompt = `Crie um PROJETO DIDÁTICO INTERDISCIPLINAR (ABP):
- Problema/Tema: ${topic}
- Duração: ${lessonCount || duration}
- Produto Final: ${objectives}

Detalhe as fases: Lançamento, Pesquisa, Criação e Socialização.
${formattingInstruction}`;
        break;
      case 'pei':
        basePrompt = `Atue como Especialista em Educação Especial e Inclusiva. Crie um PEI (Plano de Ensino Individualizado) completo e humanizado:
- Aluno: ${studentName}
- Diagnóstico/Público-alvo da EE: ${diagnosis}
- Potencialidades/Habilidades já consolidadas: ${potentials}
- Barreiras/Dificuldades identificadas: ${barriers}
- Objetivos de Aprendizagem (Curto/Médio/Longo Prazo): ${objectives}
- Adaptações Curriculares e Recursos (AEE): ${methodology}

Estruture o documento com: Avaliação Inicial, Metas Pedagógicas, Adaptações de Acesso, Recursos de Tecnologia Assistiva e Plano de Monitoramento/Avaliação.
${formattingInstruction}`;
        break;
    }

    setGeneratedPrompt(basePrompt);
    toast.success('Prompt mestre gerado com sucesso!');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast.success('Copiado para a área de transferência!');
  };

  const openAI = (platform: 'gemini' | 'claude' | 'chatgpt') => {
    if (!generatedPrompt) {
      toast.error('Gere o prompt primeiro!');
      return;
    }
    copyToClipboard();
    const urls = {
      gemini: 'https://gemini.google.com/',
      claude: 'https://claude.ai/',
      chatgpt: 'https://chatgpt.com/'
    };
    window.open(urls[platform], '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-neutral-100 shadow-xl">
      <div className="flex border-b border-neutral-100 bg-neutral-50/50 p-1">
        <TabItem active={activeTab === 'aula'} onClick={() => setActiveTab('aula')} icon={<BookOpen size={16} />} label="Aula" />
        <TabItem active={activeTab === 'unidade'} onClick={() => setActiveTab('unidade')} icon={<Layers size={16} />} label="Unidade" />
        <TabItem active={activeTab === 'curso'} onClick={() => setActiveTab('curso')} icon={<Map size={16} />} label="Curso" />
        <TabItem active={activeTab === 'sequencia'} onClick={() => setActiveTab('sequencia')} icon={<Rocket size={16} />} label="Seq." />
        <TabItem active={activeTab === 'projeto'} onClick={() => setActiveTab('projeto')} icon={<GraduationCap size={16} />} label="Projeto" />
        <TabItem active={activeTab === 'pei'} onClick={() => setActiveTab('pei')} icon={<Users size={16} />} label="PEI" />
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Form Side */}
        <div className="w-full md:w-1/2 p-6 border-r border-neutral-100 overflow-y-auto space-y-4">
          {activeTab === 'pei' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-400 uppercase mb-1 block">Nome do Aluno</label>
                  <Input 
                    placeholder="Nome completo" 
                    value={formData.studentName}
                    onChange={e => setFormData({...formData, studentName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-400 uppercase mb-1 block">Diagnóstico / CID</label>
                  <Input 
                    placeholder="Ex: Autismo (TEA)" 
                    value={formData.diagnosis}
                    onChange={e => setFormData({...formData, diagnosis: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase mb-1 block">Potencialidades / O que o aluno já sabe</label>
                <textarea 
                  className="w-full px-4 py-2 bg-neutral-50 border border-neutral-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm h-20 resize-none"
                  placeholder="Liste habilidades, interesses e pontos fortes..."
                  value={formData.potentials}
                  onChange={e => setFormData({...formData, potentials: e.target.value})}
                ></textarea>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase mb-1 block">Barreiras / Desafios</label>
                <textarea 
                  className="w-full px-4 py-2 bg-neutral-50 border border-neutral-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm h-20 resize-none"
                  placeholder="O que impede a aprendizagem no momento?"
                  value={formData.barriers}
                  onChange={e => setFormData({...formData, barriers: e.target.value})}
                ></textarea>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-400 uppercase mb-1 block">Disciplina</label>
                  <Input 
                    placeholder="Ex: História" 
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-400 uppercase mb-1 block">Série/Ano</label>
                  <Input 
                    placeholder="Ex: 6º Ano" 
                    value={formData.grade}
                    onChange={e => setFormData({...formData, grade: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 uppercase mb-1 block">Tema / Assunto</label>
                <Input 
                  placeholder="Ex: Revolução Francesa" 
                  value={formData.topic}
                  onChange={e => setFormData({...formData, topic: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {activeTab === 'unidade' ? (
                  <>
                    <div>
                      <label className="text-xs font-bold text-neutral-400 uppercase mb-1 block">Unidade/Bimestre</label>
                      <Input 
                        placeholder="Ex: I Unidade" 
                        value={formData.period}
                        onChange={e => setFormData({...formData, period: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-400 uppercase mb-1 block">Qtd. Aulas</label>
                      <Input 
                        placeholder="Ex: 12 aulas" 
                        value={formData.lessonCount}
                        onChange={e => setFormData({...formData, lessonCount: e.target.value})}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-bold text-neutral-400 uppercase mb-1 block">
                        {activeTab === 'sequencia' || activeTab === 'projeto' ? 'Qtd. Aulas' : 'Duração'}
                      </label>
                      <Input 
                        placeholder={activeTab === 'sequencia' || activeTab === 'projeto' ? "Ex: 5 aulas" : "Ex: 50 min"} 
                        value={activeTab === 'sequencia' || activeTab === 'projeto' ? formData.lessonCount : formData.duration}
                        onChange={e => setFormData({...formData, [activeTab === 'sequencia' || activeTab === 'projeto' ? 'lessonCount' : 'duration']: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-400 uppercase mb-1 block">Material de Apoio</label>
                      <Select 
                        value={formData.supportMaterial}
                        onChange={e => setFormData({...formData, supportMaterial: e.target.value})}
                      >
                        <option value="texto">Texto de Apoio</option>
                        <option value="quiz">Quiz Interativo</option>
                        <option value="outro">Outro...</option>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              {formData.supportMaterial === 'outro' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="text-xs font-bold text-neutral-400 uppercase mb-1 block">Qual material?</label>
                  <Input 
                    placeholder="Ex: Mapa mental, roteiro de vídeo..." 
                    value={formData.otherMaterial}
                    onChange={e => setFormData({...formData, otherMaterial: e.target.value})}
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="text-xs font-bold text-neutral-400 uppercase mb-1 block">
              {activeTab === 'pei' ? 'Adaptações e Recursos (AEE)' : 'Metodologia'}
            </label>
            <textarea 
              className="w-full px-4 py-2 bg-neutral-50 border border-neutral-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm h-20 resize-none"
              placeholder={activeTab === 'pei' ? "Ex: Uso de prancha de comunicação, tempo estendido..." : "Descreva como pretende ensinar..."}
              value={formData.methodology}
              onChange={e => setFormData({...formData, methodology: e.target.value})}
            ></textarea>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-400 uppercase mb-1 block">
              {activeTab === 'pei' ? 'Objetivos / Metas Pedagógicas' : 'Objetivos / Contexto / Produto Final'}
            </label>
            <textarea 
              className="w-full px-4 py-2 bg-neutral-50 border border-neutral-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm h-24 resize-none"
              placeholder={activeTab === 'pei' ? "Metas de curto, médio e longo prazo..." : "Informações adicionais para a IA..."}
              value={formData.objectives}
              onChange={e => setFormData({...formData, objectives: e.target.value})}
            ></textarea>
          </div>

          <Button onClick={generatePrompt} className="w-full gap-2 py-4">
            <Sparkles size={20} />
            Gerar Prompt Mestre
          </Button>
        </div>

        {/* Result Side */}
        <div className="w-full md:w-1/2 p-6 bg-neutral-50/50 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg flex items-center gap-2">
              <CheckCircle2 size={20} className="text-green-500" />
              Prompt Otimizado
            </h3>
            {generatedPrompt && (
              <button onClick={copyToClipboard} className="text-secondary hover:underline text-sm flex items-center gap-1">
                <Copy size={14} />
                Copiar
              </button>
            )}
          </div>

          <div className="flex-1 bg-white rounded-2xl border border-neutral-100 p-4 font-mono text-[10px] text-neutral-600 overflow-y-auto whitespace-pre-wrap relative group">
            {generatedPrompt ? generatedPrompt : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 opacity-40">
                <Info size={48} className="mb-4" />
                <p>Preencha os dados ao lado e clique em "Gerar" para criar seu prompt mestre otimizado para IA.</p>
              </div>
            )}
          </div>

          {generatedPrompt && (
            <div className="mt-6 space-y-3">
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest text-center font-bold">Levar para minha IA favorita</p>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={() => openAI('claude')} className="gap-2 border-orange-100 hover:bg-orange-50 text-orange-700">
                  Claude
                </Button>
                <Button variant="outline" size="sm" onClick={() => openAI('gemini')} className="gap-2 border-blue-100 hover:bg-blue-50 text-blue-700">
                  Gemini
                </Button>
                <Button variant="outline" size="sm" onClick={() => openAI('chatgpt')} className="gap-2 border-green-100 hover:bg-green-50 text-green-700">
                  ChatGPT
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-all border-b-2 ${
      active ? 'border-primary text-primary bg-white shadow-sm' : 'border-transparent text-neutral-400 hover:text-neutral-600'
    }`}
  >
    {icon}
    <span className="hidden sm:inline uppercase tracking-tighter">{label}</span>
  </button>
);
