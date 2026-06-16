# FABLE5_SECURITY_CHECKLIST — www.brunodevai.com

**Data:** 2026-06-16  
**Protocolo:** Fable 5 - Checklist de seguranca adaptado para site estatico  
**Nota:** O Fable 5 foi desenvolvido para apps com backend (NeoFit 365). Para um site estatico,
as 5 categorias sao mantidas mas o escopo de cada item e adaptado ao contexto.

---

## Categoria 1 — INPUTS

*Para um site estatico sem formularios, o risco de input malicioso e praticamente zero.
Avaliar o que e possivel neste contexto.*

| # | Verificacao | Status | Detalhe |
|---|---|---|---|
| 1.1 | Existe formulario com input de usuario? | NAO APLICAVEL | Zero `<form>` ou `<input>` no site |
| 1.2 | Existe campo de texto livre? | NAO APLICAVEL | Sem campos |
| 1.3 | Existe fetch/XHR enviando dados? | NAO APLICAVEL | Zero chamadas de rede pelo JS do site |
| 1.4 | URL parameters sao usados para renderizar conteudo? | NAO | O site nao le `window.location.search` para renderizar |
| 1.5 | `innerHTML` e usado com conteudo de usuario? | NAO | O JS usa apenas `textContent` e DOM API estatico |
| 1.6 | `eval()` ou `Function()` sao usados? | NAO | Verificado: zero uso de eval no script inline |
| 1.7 | Recursos externos sao carregados com SRI? | IMPLEMENTADO | Three.js r128: `integrity` sha384 adicionado |
| 1.8 | Script inline protegido por CSP? | PARCIAL | Meta CSP adicionada; `unsafe-inline` necessario pela quantidade de JS inline |

**Score Inputs: 7/7 verificacoes relevantes passam ou sao N/A**

---

## Categoria 2 — SECRETS

*Site estatico: risco de vazamento de segredos no codigo-fonte visivel ao publico.*

| # | Verificacao | Status | Detalhe |
|---|---|---|---|
| 2.1 | API keys no HTML? | NAO | Zero chaves encontradas |
| 2.2 | Tokens de acesso no HTML? | NAO | Zero tokens |
| 2.3 | Credenciais de banco de dados? | NAO APLICAVEL | Sem banco |
| 2.4 | Service role keys? | NAO APLICAVEL | Sem Supabase |
| 2.5 | Numeros de telefone de API de SMS? | NAO | WhatsApp e via numero direto do WA (5563992601105) - nao e segredo de API |
| 2.6 | Webhook secrets? | NAO APLICAVEL | Sem webhooks |
| 2.7 | Gitleaks ativo no pre-commit? | IMPLEMENTADO | Hook corrigido e funcional em 2026-06-16 |
| 2.8 | .env commitado no repositorio? | NAO | Nenhum .env no repo |
| 2.9 | Numero de WhatsApp exposto no HTML? | ACEITO | `5563992601105` e publicamente visivel - e intencional (botao de contato) |

**Score Secrets: APROVADO - nenhum segredo real exposto**

---

## Categoria 3 — AUTH / ACCESS

*Site estatico publico: sem autenticacao, sem areas restritas. Risco de acesso indevido e minimo.*

| # | Verificacao | Status | Detalhe |
|---|---|---|---|
| 3.1 | Existe area restrita / painel admin? | NAO APLICAVEL | Site totalmente publico por design |
| 3.2 | Existe rota de API? | NAO APLICAVEL | Sem backend |
| 3.3 | Existe funcionalidade admin exposta? | NAO | Nenhuma |
| 3.4 | O repositorio GitHub e privado ou publico? | PUBLICO | `revellaia/brunodevai-site` e publico por necessidade (GitHub Pages gratis) |
| 3.5 | 2FA na conta GitHub? | VERIFICAR | Bruno deve habilitar 2FA na conta `revellaia` se ainda nao tiver |
| 3.6 | Acesso ao dominio (registrador) protegido por 2FA? | VERIFICAR | Conta do registrador do dominio deve ter 2FA |
| 3.7 | Cloudflare (se ativo) com 2FA? | VERIFICAR | Idem |

**Score Auth: 2 itens requerem verificacao manual (2FA nas contas)**

---

## Categoria 4 — DATA / LGPD

| # | Verificacao | Status | Detalhe |
|---|---|---|---|
| 4.1 | Dados pessoais sao coletados pelo site? | NAO | Site nao coleta nenhum dado |
| 4.2 | Dados sensiveis (art. 5 LGPD) sao coletados? | NAO | Nenhum |
| 4.3 | Analytics ativo? | NAO | Zero tracking |
| 4.4 | Cookies de terceiros? | NAO | Nenhum cookie |
| 4.5 | IP enviado a terceiros de forma involuntaria? | SIM - DOCUMENTADO | Google Fonts e Cloudflare CDN; risco baixo; documentado na Politica |
| 4.6 | Politica de privacidade redigida? | PARCIAL | Documento criado; pendente publicacao no site |
| 4.7 | Canal de contato para direitos do titular? | IMPLEMENTADO | bgmcruz1988@gmail.com declarado |
| 4.8 | Dados de contato (WhatsApp/e-mail) tem retencao definida? | PARCIAL | Pratica informal documentada; formalizacao recomendada |

**Score Data/LGPD: BAIXO RISCO - requere publicacao da politica de privacidade**

---

## Categoria 5 — ABUSE / BOTS

*Sem formularios, o vetor de abuso e extremamente reduzido.*

| # | Verificacao | Status | Detalhe |
|---|---|---|---|
| 5.1 | Formulario de contato pode ser spammado? | NAO APLICAVEL | Sem formularios |
| 5.2 | WhatsApp pode receber spam? | BAIXO RISCO | O link abre o app do usuario; nao ha automacao de mensagem pelo site |
| 5.3 | E-mail pode ser raspado do HTML? | SIM - ACEITO | `bgmcruz1988@gmail.com` visivel no HTML; risco de spam aceito para facilitar contato |
| 5.4 | Clickjacking possivel? | MITIGADO | Frame-buster JS adicionado; X-Frame-Options via Cloudflare recomendado |
| 5.5 | DDoS no site? | MITIGADO | GitHub Pages tem protecao basica; Cloudflare adiciona camada extra |
| 5.6 | Scraping de conteudo? | ACEITO | Conteudo publico; sem dados sensiveis para raspar |
| 5.7 | Open redirect? | NAO | Nenhum redirecionamento dinamico |

**Score Abuse/Bots: APROVADO - superficie de ataque muito reduzida**

---

## Resumo executivo Fable 5

| Categoria | Score | Maior Pendencia |
|---|---|---|
| Inputs | APROVADO | CSP com unsafe-inline (limitacao do site estatico) |
| Secrets | APROVADO | Nenhuma pendencia critica |
| Auth/Access | APROVADO COM AJUSTE | 2FA nas contas GitHub/registrador/Cloudflare |
| Data/LGPD | APROVADO COM AJUSTE | Publicar Politica de Privacidade no site |
| Abuse/Bots | APROVADO | X-Frame-Options via Cloudflare como melhoria |

**Veredito Fable 5: APROVADO COM AJUSTES**

O site e seguro para o nivel de risco esperado de um site vitrine estatico sem backend.
As pendencias sao baixo risco e documentadas com plano de correcao.

---

*Para sites com backend, revisitar e expandir cada categoria conforme NeoFit 365 - SECURITY_ROADMAP.md.*
