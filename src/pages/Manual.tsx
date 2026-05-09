import React from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  GraduationCap, 
  Building2, 
  Users, 
  Settings, 
  CheckSquare, 
  FileText, 
  BarChart3, 
  Download,
  ArrowLeft,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { Card, Button } from '../components/UI';

export const Manual: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="outline" 
          onClick={handleBack} 
          className="mb-8 gap-2"
        >
          <ArrowLeft size={18} />
          Voltar
        </Button>

        <header className="mb-12 text-center">
          <h1 className="text-4xl font-serif mb-4 text-ink">Manual do Usuário</h1>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
            Guia passo a passo de como utilizar o Diário de Classe Online, dividido por perfil de acesso.
          </p>
        </header>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* PROFESSOR */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <GraduationCap size={28} />
              </div>
              <h2 className="text-2xl font-serif text-ink">1. Professor(a)</h2>
            </div>
            <Card className="p-0 overflow-hidden">
              <div className="p-6 bg-white space-y-8">
                
                <div className="flex gap-4">
                  <div className="mt-1 text-blue-500"><Settings size={24} /></div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">A. Primeiro Acesso & Vínculo</h3>
                    <p className="text-neutral-600 mb-2">Ao entrar no sistema pela primeira vez, você precisa se vincular à sua escola:</p>
                    <ul className="list-disc list-inside text-neutral-600 space-y-1 ml-2">
                      <li>No painel principal, clique no botão <strong>"Personalizar"</strong> (ícone de engrenagem).</li>
                      <li>No campo "Escola", abra a lista e <strong>selecione a sua escola</strong> (cadastrada pela Secretaria).</li>
                      <li>Preencha seu nome e o ano letivo, depois clique em <strong>Salvar Dados</strong>.</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 text-blue-500"><BookOpen size={24} /></div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">B. Criando Turmas e Alunos</h3>
                    <ul className="list-disc list-inside text-neutral-600 space-y-1 ml-2">
                      <li>Clique em <strong>"Nova Turma"</strong> no painel principal, digite o nome (ex: 3º Ano A) e a disciplina.</li>
                      <li>Clique em <strong>"Ver Detalhes"</strong> na turma criada.</li>
                      <li>Vá na aba <strong>"Alunos"</strong>, digite o nome e a matrícula do aluno e clique em Adicionar.</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 text-blue-500"><CheckSquare size={24} /></div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">C. Fazer a Chamada (Frequência)</h3>
                    <ul className="list-disc list-inside text-neutral-600 space-y-1 ml-2">
                      <li>Dentro da turma, acesse a aba <strong>"Frequência"</strong>.</li>
                      <li>Escolha a data e digite o nome da aula (ex: "Aula 1 - Matemática").</li>
                      <li>Marque as caixinhas dos alunos que estão <strong>Presentes</strong> (desmarque os que faltaram).</li>
                      <li>Clique em <strong>"Salvar Chamada"</strong>.</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 text-blue-500"><Sparkles size={24} /></div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">E. Planejamento Inteligente (IA)</h3>
                    <ul className="list-disc list-inside text-neutral-600 space-y-1 ml-2">
                      <li>Acesse a aba <strong>"Planejamento"</strong> dentro de uma turma.</li>
                      <li>Utilize os geradores nativos para criar <strong>Planos de Aula, Sequências, Projetos</strong> ou <strong>PEI</strong>.</li>
                      <li>Preencha os campos e clique em <strong>Gerar Prompt Mestre</strong>.</li>
                      <li>Copie o prompt e utilize nos botões de atalho (Claude, Gemini ou ChatGPT) para obter o documento pronto.</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 text-blue-500"><Users size={24} /></div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">F. Educação Inclusiva (PEI)</h3>
                    <ul className="list-disc list-inside text-neutral-600 space-y-1 ml-2">
                      <li>No Planejador AI, selecione a aba <strong>PEI</strong> para alunos com necessidades especiais.</li>
                      <li>O sistema gera um plano individualizado focado em <strong>Potencialidades, Barreiras e Adaptações (AEE)</strong>.</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 text-blue-500"><ShieldAlert size={24} /></div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">G. Funcionamento Offline</h3>
                    <p className="text-neutral-600">
                      O GEI funciona <strong>sem internet</strong>. Seus dados são salvos no navegador e serão sincronizados automaticamente com a Secretaria assim que houver conexão.
                    </p>
                  </div>
                </div>

              </div>
            </Card>
          </motion.section>

          {/* SECRETARIA DE EDUCAÇÃO (SUPERADMIN) */}
          <motion.section variants={itemVariants}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                <Building2 size={28} />
              </div>
              <h2 className="text-2xl font-serif text-ink">2. Secretaria de Educação (Superadmin)</h2>
            </div>
            <Card className="p-0 overflow-hidden">
              <div className="p-6 bg-white space-y-8">
                
                <div className="flex gap-4">
                  <div className="mt-1 text-emerald-500"><Building2 size={24} /></div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">A. Monitoramento e Bolsa Família</h3>
                    <ul className="list-disc list-inside text-neutral-600 space-y-1 ml-2">
                      <li>O Painel da Secretaria consolida as faltas de todos os alunos do município.</li>
                      <li>Gere relatórios por escola para identificar alunos com <strong>baixa frequência (Bolsa Família)</strong>.</li>
                      <li>Exporte dados para Excel para integração com sistemas federais.</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 text-emerald-500"><Settings size={24} /></div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">B. Personalização do Município</h3>
                    <ul className="list-disc list-inside text-neutral-600 space-y-1 ml-2">
                      <li>Cadastre escolas e configure a identidade visual (Logo/Cores) do município para todos os usuários.</li>
                    </ul>
                  </div>
                </div>

              </div>
            </Card>
          </motion.section>

        </motion.div>
      </div>
    </div>
  );
};

