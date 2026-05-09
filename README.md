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

### 🎨 White-Label & SaaS Ready
- **Customização Dinâmica**: Logos, cores e nome do município configuráveis via Painel da Secretaria.
- **Persistência Local**: Branding e dados do usuário salvos no `localStorage` e `IndexedDB`.
- **Multi-Tenancy**: Estrutura preparada para isolamento de dados por prefeitura.

## 🛠️ Stack Técnica
- **Frontend**: React + Vite + TailwindCSS (v4).
- **Backend**: Node.js + Express (API REST).
- **Processamento de Imagem**: Sharp (Conversão Automática para WebP).
- **Banco Local**: Dexie.js (Offline-First).
- **Containerização**: Docker (Frontend, Backend, PostgreSQL).
- **Ícones**: Lucide React.
- **Animações**: Motion.

## 🚀 Deploy no VPS (Hostinger)
Este projeto está pronto para rodar atrás de um **Nginx Proxy Manager**.

1. **Via Docker Compose**:
   ```bash
   git pull origin main
   docker-compose up -d --build
   ```
2. **Configuração NPM**: Apontar o domínio (ex: gei.seudominio.com) para a porta `3000` do VPS.

## 🏃 Como Rodar Localmente
1. `npm install`
2. `npm run dev`

## 📋 Changelog Recente
- **[v2.0]** Modernização SaaS: Sistema White-Label dinâmico e Login Duplo (Professor/Secretaria).
- **[v2.1]** Persistência de Branding e Perfil no LocalStorage.
- **[v2.2]** Implementação de Upload de Arquivos Local (Avatar/Logo).
- **[v2.3]** Preparação para Deploy VPS com Docker/Nginx.

---
Desenvolvido com ❤️ por **Antigravity** para o **Sérgio**. 🇧🇷🚀
