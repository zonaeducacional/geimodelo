import React from 'react';
import { ShieldCheck, Info, Scale, Lock } from 'lucide-react';
import { Card, Button, Modal } from './UI';

export const LegalTerms: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Segurança, Ética e IA no GEI">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        {/* LGPD Section */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck size={20} />
            <h3 className="font-bold uppercase text-xs tracking-widest">Proteção de Dados (LGPD)</h3>
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed">
            O GEI opera em conformidade com a <strong>Lei Geral de Proteção de Dados (Lei 13.709/2018)</strong>. 
            Seus dados e os de seus alunos são armazenados localmente e criptografados. 
            <strong>Nunca</strong> insira CPF, endereço residencial ou fotos de alunos em campos de texto que serão processados por Inteligência Artificial.
          </p>
        </section>

        {/* MEC Section */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-600">
            <Scale size={20} />
            <h3 className="font-bold uppercase text-xs tracking-widest">Normas do MEC para IA</h3>
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Seguindo as diretrizes do MEC para o uso de tecnologias emergentes:
          </p>
          <ul className="list-disc list-inside text-sm text-neutral-600 space-y-2 ml-2">
            <li><strong>Supervisão Humana:</strong> A IA é uma ferramenta de apoio. O professor deve revisar, editar e validar todo plano gerado antes da aplicação em sala.</li>
            <li><strong>Autoria Pedagógica:</strong> O professor é o autor intelectual. A IA auxilia na formatação e sugestão de competências da BNCC, mas a decisão didática é sua.</li>
            <li><strong>Combate ao Viés:</strong> Esteja atento a possíveis vieses nas respostas da IA e ajuste o conteúdo para a realidade sociocultural de sua turma.</li>
          </ul>
        </section>

        {/* AI Safety Section */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-amber-600">
            <Lock size={20} />
            <h3 className="font-bold uppercase text-xs tracking-widest">Boas Práticas de Segurança</h3>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
            <p className="text-xs text-amber-800 font-medium flex items-center gap-2">
              <Info size={14} /> Dica de Ouro:
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Ao usar o Planejador AI, use nomes fictícios ou apenas o primeiro nome do aluno para planos individuais (PEI). Isso garante 100% de privacidade para a criança.
            </p>
          </div>
        </section>

        <div className="pt-4 border-t border-neutral-100">
          <Button onClick={onClose} className="w-full">Entendido e Ciente</Button>
        </div>
      </div>
    </Modal>
  );
};
