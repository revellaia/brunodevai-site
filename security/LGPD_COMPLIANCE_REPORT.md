# LGPD_COMPLIANCE_REPORT — www.brunodevai.com

**Data:** 2026-06-16  
**Referencia:** Lei 13.709/2018 (LGPD)  
**Aviso:** Este documento nao constitui parecer juridico. Exige revisao por profissional especializado para validade formal.

---

## 1. Perfil do site sob a otica da LGPD

| Aspecto | Estado |
|---|---|
| Tipo de agente | Controlador de dados (Bruno Goebel Cruz, pessoa fisica) |
| Volume de dados coletados | MINIMO: apenas IP via infraestrutura de terceiros (involuntario); dados de contato via WhatsApp/e-mail (fora do site) |
| Dados sensiveis (art. 5, II LGPD) | NENHUM: o site nao coleta saude, biometria, origem racial, religiao, opiniao politica, etc. |
| Tratamento de dados de criancas (art. 14) | Nao direcionado; nenhuma coleta especifica |
| Transferencias internacionais | IP enviado a GitHub, Cloudflare, Google (infra tecnica) |
| DPO/Encarregado (art. 41) | DISPENSADO para pessoa fisica / microempresa sem grande volume de dados sensiveis (verificar com juridico) |

---

## 2. Dados e bases legais

| Dado | Quem coleta | Base legal provavel | Art. LGPD | Status |
|---|---|---|---|---|
| IP do visitante (CDN Three.js) | Cloudflare | Legitimo interesse (infra) | art. 7, IX | BAIXO RISCO - CDN padrao |
| IP + User-Agent (Google Fonts) | Google | Legitimo interesse (infra) | art. 7, IX | BAIXO RISCO - servico de fontes |
| IP (GitHub Pages) | GitHub | Execucao de servico | art. 7, V | BAIXO RISCO - hospedagem |
| Nome + contato (WhatsApp/e-mail) | Bruno (externo ao site) | Consentimento (contato voluntario) | art. 7, I | OK - usuario inicia o contato |

**Nenhum dado sensivel (art. 11 LGPD) e coletado ou processado.**

---

## 3. Obrigacoes operacionais LGPD

| Obrigacao | Artigo | Status | Observacao |
|---|---|---|---|
| Politica de Privacidade acessivel | art. 9 | PENDENTE publicacao no site | Documento redigido em `PRIVACY_POLICY.md`; falta adicionar secao/link no site |
| Transparencia sobre terceiros | art. 9, VI | PARCIAL | Documentado internamente; precisa estar visivelmente no site |
| Canal para exercicio de direitos | art. 18 | IMPLEMENTADO | E-mail bgmcruz1988@gmail.com declarado |
| Consentimento para coleta de dados sensiveis | art. 11 | N/A | Nenhum dado sensivel coletado |
| Banner de cookies / consentimento analytics | art. 7, I | N/A por enquanto | Necessario apenas se tracking for adicionado |
| DPO/Encarregado | art. 41 | DISPENSADO provavel | Volume e natureza dos dados nao exigem (confirmar com juridico) |
| Registro de operacoes (ROPA) | art. 37 | PARCIAL | Este documento e o embrião; formalizar se escala |
| Plano de resposta a incidente | art. 48 | DOCUMENTADO | Ver secao 7 do BRUNODEVAI_SECURITY_BASELINE.md |
| Retenção e descarte | art. 15-16 | PARCIAL | Dados de contato: ate resolucao + pedido de remocao; nenhuma retencao automatizada |

---

## 4. Riscos LGPD identificados

| # | Risco | Severidade | Mitigacao |
|---|---|---|---|
| 1 | Ausencia de Politica de Privacidade visivelmente no site | MEDIA | Publicar link no footer (ver roadmap) |
| 2 | Google Fonts: IP enviado ao Google sem aviso ao usuario | BAIXA | Documentar na Politica ou auto-hospedar fontes |
| 3 | Se analytics for adicionado sem banner: infracao clara | ALTA (condicional) | Regra documentada em COOKIE_AND_TRACKING_REPORT.md |
| 4 | Dados de contato por WhatsApp sem retencao definida | BAIXA | Documentar pratica de retencao informal |

---

## 5. Direitos do titular - estado operacional

| Direito (art. 18) | Canal | Prazo de resposta |
|---|---|---|
| Confirmacao e acesso | bgmcruz1988@gmail.com | 15 dias uteis |
| Correcao | Idem | 15 dias uteis |
| Eliminacao de dados de contato | Idem | 15 dias uteis |
| Portabilidade | Idem | 15 dias uteis |
| Informacao sobre terceiros | Documentada nesta politica | Imediata (consulta publica) |
| Revogacao de consentimento | Idem | 15 dias uteis |

---

## 6. Avaliacao geral

O www.brunodevai.com e um dos sites com menor superficie de risco LGPD possivel:

- Nenhuma conta, nenhum login, nenhuma base de dados de usuarios
- Nenhum dado sensivel
- Contato apenas por canais externos (WhatsApp/e-mail) onde o usuario tem total controle
- Nenhum rastreamento, nenhum pixel, nenhum cookie proprio

**Status geral LGPD:** BAIXO RISCO - requer apenas publicacao da Politica de Privacidade no site.

---

## 7. Proximos passos obrigatorios

1. **Adicionar link "Politica de Privacidade"** no footer do `index.html` apontando para `/politica-de-privacidade.html` (ou secao inline)
2. **Criar `politica-de-privacidade.html`** baseado em `security/PRIVACY_POLICY.md`, em HTML estatico compativel com o design do site
3. **Se analytics for integrado:** seguir protocolo de consentimento obrigatorio (ver COOKIE_AND_TRACKING_REPORT.md)
4. **Revisao juridica** desta politica por profissional de protecao de dados antes de alegar conformidade formal

---

*Este relatorio e atualizado a cada mudanca significativa no site ou nas praticas de coleta de dados.*
