# BRUNODEVAI_SECURITY_BASELINE — www.brunodevai.com

**Data:** 2026-06-16  
**Auditor:** Claude Code (Arquiteto de Segurança)  
**Stack real auditada:** HTML estatico single-file, GitHub Pages, sem backend  
**Base de referencia:** Docs de seguranca NeoFit 365 (apex-pulse)

> Aviso de honestidade: este documento nao declara conformidade absoluta.
> Declara o estado real auditado e o plano de mitigacao aplicado.
> "Defesa em profundidade" para um site estatico e diferente de um app com backend.
> Nao se pode prometer o mesmo nivel de controles de um Next.js + Supabase.

---

## 1. Stack real do brunodevai.com

| Item | Detalhe |
|---|---|
| Tipo | Site estatico single-file (`index.html`, ~1381 linhas) |
| Hosting | GitHub Pages (branch `main`) |
| Dominio | www.brunodevai.com (HTTPS automatico pelo GitHub Pages) |
| Backend | NENHUM |
| Banco de dados | NENHUM |
| Formularios | NENHUM (zero `<form>`, zero `<input>`) |
| Cookies | NENHUM (zero `document.cookie`, zero `sessionStorage`) |
| LocalStorage | NENHUM |
| Fetch/XHR | NENHUM |
| Captacao de dados | Via WhatsApp direto (`openWA()`) e mailto - dados vao para apps externos |
| Script externo 1 | Three.js r128 de `cdnjs.cloudflare.com` |
| Script externo 2 | Google Fonts (Bodoni Moda + Inter) de `fonts.googleapis.com` |
| Analytics | NENHUM (falsos positivos confirmados - `gtag`/`fbq` eram base64 da logo) |
| Rastreamento | NENHUM pixel ou tag ativo |

---

## 2. Regras importadas do NeoFit 365

### 2.1 Aplicaveis e portadas

| Regra NeoFit 365 | Como se aplica em brunodevai.com |
|---|---|
| Nunca expor segredos no frontend | Nao ha segredos, mas aplica-se: nunca adicionar GA/pixel sem consentimento, nunca commitar .env |
| Integridade de recursos externos (SRI) | Three.js CDN: atributo `integrity` + `crossorigin` adicionado (ver Etapa 3) |
| Cabecalhos de seguranca HTTP | Meta-equivalentes adicionados; cabecalhos reais precisam do Cloudflare (ver roadmap) |
| Politica de logs: nunca logar dados sensiveis | Sem backend = sem logs de servidor proprios; applica-se ao git (nao commitar dados pessoais) |
| LGPD: minimizacao de dados | Site coleta zero dados; contato e via WhatsApp/email (dados ficam nos apps do usuario) |
| LGPD: transparencia sobre terceiros | Google Fonts envia IP para o Google; documentar + auto-hospedar ou aceitar o risco |
| Politica de privacidade acessivel | Criar pagina/secao de privacidade (ver Etapa 3) |
| Referrer-Policy | Meta tag adicionada: `strict-origin-when-cross-origin` |
| Content Security Policy | Meta CSP adicionada com origens restritas |
| Protecao contra clickjacking | Frame-buster JS adicionado (alternativa ao X-Frame-Options que requer header HTTP) |
| Auditoria de dependencias | Three.js r128 e estavel e auditado; Google Fonts nao ha versao com vulnerabilidade conhecida |
| Fable 5 checklist | Adaptado para contexto estatico (ver `FABLE5_SECURITY_CHECKLIST.md`) |
| Incident response minimo | Playbook simplificado documentado neste baseline |

### 2.2 Descartadas por nao se aplicarem ao site estatico

| Regra NeoFit 365 | Por que descartada |
|---|---|
| Validacao server-side de inputs | Sem backend, sem inputs |
| Rate limiting em endpoints | Sem backend, sem endpoints |
| CAPTCHA/Turnstile | Sem formularios |
| Auth (`auth.getUser()`, JWT, sessoes) | Sem autenticacao |
| RLS / Row Level Security | Sem banco de dados |
| Sanitizacao de payload / Allowlist | Sem dados enviados pelo usuario |
| CSRF protection | Sem formularios, sem sessao |
| XP/missoes server-side | Especifico do NeoFit 365 |
| Webhook validation | Sem integracoes de pagamento |
| localStorage hardening | Sem uso de localStorage |
| Supabase service role isolation | Sem Supabase |
| Anti-fraude de treino/XP | Especifico do NeoFit 365 |
| Dados de saude / art. 11 LGPD | Nenhum dado de saude coletado |

---

## 3. Estado atual da seguranca (pre-auditoria)

| Controle | Status | Observacao |
|---|---|---|
| HTTPS | IMPLEMENTADO | GitHub Pages forcado, certificado automatico |
| SRI no Three.js CDN | **FALHA** | Sem `integrity` attribute - vulneravel a CDN comprometida |
| Content Security Policy | **AUSENTE** | Sem CSP algum |
| Referrer-Policy | **AUSENTE** | Sem controle de vazamento de URL via Referer |
| X-Frame-Options | **AUSENTE** | Vulneravel a clickjacking |
| X-Content-Type-Options | **AUSENTE** | Sem nosniff |
| Permissions-Policy | **AUSENTE** | Camera/mic/geolocation potencialmente acessiveis via iframe |
| Analytics/Tracking | NENHUM | Positivo - sem dados de usuario coletados |
| Formularios seguros | N/A | Sem formularios no site |
| Cookies | NENHUM | Positivo - sem cookies proprios |
| Politica de privacidade | **AUSENTE** | Sem pagina ou secao de privacidade |
| Segredos no codigo | NENHUM | Nenhuma API key, token ou credencial no HTML |
| Google Fonts | ATIVO sem alternativa | IP do visitante enviado ao Google; risco baixo mas documentar |
| Gitleaks pre-commit | IMPLEMENTADO | Protege contra commit acidental de segredos |

---

## 4. Riscos encontrados

| # | Risco | Severidade | Categoria |
|---|---|---|---|
| R1 | Three.js sem SRI: CDN comprometida injeta JS malicioso | ALTA | Integridade de recursos |
| R2 | Sem CSP: XSS pode carregar recursos de qualquer origem | MEDIA | XSS / Recursos externos |
| R3 | Sem X-Frame-Options: site pode ser iframeado (clickjacking) | MEDIA | Clickjacking |
| R4 | Sem Referrer-Policy: URL completa vaza em navegacao para parceiros | BAIXA | Privacidade |
| R5 | Google Fonts: IP do visitante enviado ao Google sem consentimento | BAIXA | LGPD / Privacidade |
| R6 | Sem politica de privacidade: nao comunica ao usuario o que e processado | BAIXA-MEDIA | LGPD / Transparencia |
| R7 | Sem Permissions-Policy: microfoneMicrophone/camera acessiveis via iframe | BAIXA | Permissoes do navegador |
| R8 | Sem X-Content-Type-Options: MIME-sniffing possivel | BAIXA | MIME sniffing |

---

## 5. Plano de implementacao

### Fase A - Implementadas nesta sessao (no index.html)

- [x] SRI (`integrity` + `crossorigin`) no Three.js r128: `sha384-CI3ELBVUz9XQO+97x6nwMDPosPR5XvsxW2ua7N1Xeygeh1IxtgqtCkGfQY9WWdHu`
- [x] Meta `Referrer-Policy: strict-origin-when-cross-origin`
- [x] Meta CSP (permissiva mas restritiva de origens externas)
- [x] Frame-buster JS (protecao contra clickjacking sem header HTTP)
- [x] Criacao dos 7 documentos de seguranca (esta pasta `security/`)

### Fase B - Requerem Cloudflare (Bruno configura no painel)

- [ ] Header `X-Frame-Options: DENY` via Cloudflare Transform Rules
- [ ] Header `X-Content-Type-Options: nosniff`
- [ ] Header `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- [ ] Header `Strict-Transport-Security: max-age=31536000; includeSubDomains` (HSTS)
- [ ] CSP via header (mais forte que meta tag; permite `frame-ancestors 'none'`)
- [ ] Rate limiting Cloudflare (protecao contra crawlers e DDoS de camada 7)

### Fase C - Melhorias opcionais de privacidade

- [ ] Auto-hospedar fontes (eliminar chamada ao Google Fonts): baixar Bodoni Moda + Inter e servir do repo
- [ ] Adicionar secao de Politica de Privacidade visivelmente no site (link no footer)
- [ ] Se GA ou pixel forem adicionados no futuro: banner de consentimento OBRIGATORIO antes de carregar

---

## 6. Politica: adicionar analytics ou pixel no futuro

Se, no futuro, Google Analytics, Meta Pixel, TikTok Pixel ou qualquer tag de rastreamento for adicionada:

**OBRIGATORIO antes de ativar:**
1. Banner de consentimento de cookies (LGPD art. 7, I - consentimento)
2. Documentar na Politica de Privacidade: qual ferramenta, que dados, com quem compartilha
3. Opção clara de recusar
4. Os scripts so devem carregar APOS o consentimento (nao ao carregarr a pagina)

Violar esta regra pode configurar infração a LGPD.

---

## 7. Incident response simplificado

Para um site estatico sem backend, os incidentes relevantes sao:

| Incidente | Acao imediata |
|---|---|
| CDN Three.js comprometida | Remover script do CDN; usar copia local; re-verificar SRI |
| Conta GitHub comprometida | Revogar tokens, ativar 2FA, auditar commits recentes, reverter se necessario |
| Dominio sequestrado | Contatar registrador; Cloudflare pode adicionar camada extra de protecao |
| Dado de cliente vazado | N/A: site nao armazena dados de clientes |
| Gitleaks alerta de segredo | Remover o arquivo do git history; revogar a credencial exposta imediatamente |

Contato de incidente: bgmcruz1988@gmail.com

---

## 8. Checklist de producao

- [ ] SRI no Three.js verificado (sha384-CI3ELBVUz9XQO+97x6nwMDPosPR5XvsxW2ua7N1Xeygeh1IxtgqtCkGfQY9WWdHu)
- [ ] Meta Referrer-Policy presente no `<head>`
- [ ] Meta CSP presente no `<head>`
- [ ] Frame-buster JS presente no `<head>`
- [ ] Politica de Privacidade acessivel no site
- [ ] Zero travessoes no HTML (py check)
- [ ] Zero segredos no codigo (Gitleaks)
- [ ] Headers Cloudflare configurados (Fase B)
- [ ] Fonts auto-hospedadas ou risco de Google Fonts documentado e aceito

---

*Documento criado em 2026-06-16. Manter junto do codigo em `security/`.*
