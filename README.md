<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# GEI - Gestão Educacional Inteligente

Plataforma SaaS moderna para gestão pedagógica, focada em produtividade offline e inteligência artificial aplicada à educação.

## 🚀 Visão Geral
O GEI foi transformado em uma aplicação **Offline-First**, permitindo que professores em locais com internet limitada (como áreas rurais) trabalhem sem interrupções. Todos os dados são sincronizados automaticamente com a Secretaria de Educação assim que houver conectividade.

## ✨ Funcionalidades Principais

### 🧠 Planejador Inteligente (IA Nativa)
Módulo nativo que gera prompts mestres otimizados para:
- **Planos de Aula**: Estrutura completa (BNCC, Metodologia, Avaliação).
- **Plano de Unidade/Bimestre**: Cronograma detalhado.
- **Sequências Didáticas e Projetos (ABP)**.
- **PEI (Ensino Individualizado)**: Foco em inclusão e AEE.
- **Materiais de Apoio**: Geração automática de Quizzes, Textos de Apoio e Mapas Mentais.
- **Branding**: Documentos já saem com o nome do professor e da escola.

### 📶 Arquitetura Offline-First
- **Dexie.js (IndexedDB)**: Banco de dados local de alta performance.
- **SyncQueue**: Preparado para sincronização bidirecional com backend PostgreSQL.
- **PWA**: Instalável em desktops e celulares (Zorin OS, Android, iOS).

### 📊 Gestão de Secretaria
- **Monitoramento de Frequência**: Alerta automático para alunos do **Bolsa Família** (< 75% presença).
- **Exportação Excel**: Relatórios formatados para assistência social.
- **Gestão Multi-Escolar**: Visão consolidada de todo o município.

## 🛠️ Stack Técnica
- **Frontend**: React + Vite + TailwindCSS (v4).
- **Banco Local**: Dexie.js.
- **Ícones**: Lucide React.
- **Animações**: Motion (Framer Motion).
- **Mock Backend**: Context API (Preparado para integração real).

## 🏃 Como Rodar
1. `npm install`
2. `npm run dev`

## 📋 Changelog Recente
- [v1.2] Migração para Dexie.js (Offline-First).
- [v1.3] Implementação do AIPlanner Nativo.
- [v1.4] Módulo PEI (Inclusão) e Materiais de Apoio.
- [v1.5] Atualização do Manual do Usuário e Branding Automático.

---
Desenvolvido com ❤️ por **Antigravity** para **Sérgio**. 🇧🇷
