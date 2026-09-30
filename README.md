# Gestão & Gargalos de Implantação

Dashboard interativo para acompanhamento de demandas de implantação de software, monitoramento de estagnação semanal e diagnóstico de gargalos por etapa operacional.

---

## 🚀 Como publicar na Vercel

O projeto já está 100% configurado com `vercel.json` e otimizado para o framework **Vite + React**.

### Opção 1: Via GitHub / GitLab / Bitbucket (Recomendado)
1. Suba este repositório para o seu GitHub (ou GitLab).
2. Acesse [vercel.com](https://vercel.com) e clique em **Add New... > Project**.
3. Importe o repositório.
4. A Vercel detectará automaticamente as configurações:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Clique em **Deploy**.

---

### Opção 2: Via Vercel CLI no terminal
Caso utilize o terminal:
```bash
# 1. Instale a CLI da Vercel (se ainda não tiver)
npm i -g vercel

# 2. Na pasta do projeto, execute:
vercel

# 3. Para publicar diretamente em produção:
vercel --prod
```

---

## 🛠️ Tecnologias Utilizadas
- **React 19**
- **Vite 8**
- **Tailwind CSS v4**
- **Lucide React** (Ícones)
- **TypeScript**
