# CONSELHO DE SEGURANCA — www.brunodevai.com

**Data:** 2026-06-16  
**Protocolo:** Conselho de 7 LLMs adaptado para auditoria de seguranca  
**Objeto:** Auditoria de seguranca do site vitrine brunodevai.com  
**Pauta:** Aprovar ou reprovar o plano de seguranca proposto; identificar riscos nao contemplados

---

## Resumo para o Conselho

Site estatico single-file (`index.html`, 1381 linhas) hospedado no GitHub Pages.
Sem backend, sem banco de dados, sem formularios, sem autenticacao.
Contato via WhatsApp direto e mailto.
Recursos externos: Three.js r128 (Cloudflare CDN) e Google Fonts.
Zero analytics/tracking (confirmado por auditoria).

Plano de seguranca proposto: SRI para Three.js, meta CSP, Referrer-Policy, frame-buster JS,
e recomendacoes de Cloudflare headers para Fase B.

---

## Conselheiro 1 - Cetico

**"Essa auditoria nao serve de nada sem headers reais."**

O plano propoe meta CSP com `unsafe-inline`. Isso nao protege contra XSS - a instrucao `unsafe-inline` anula o beneficio de CSP para scripts. Para um site com 1300 linhas de JS inline, a unica CSP efetiva seria usar nonces gerados por servidor em cada request, o que requer backend. 

Meta CSP no estado atual protege apenas contra carga de recursos de dominios nao listados - o que e util, mas nao e uma protecao XSS real.

A protecao real contra clickjacking via X-Frame-Options so e possivel via header HTTP - que o GitHub Pages nao suporta. O frame-buster JS proposto e contornavel por atacantes com acesso ao iframe (via `sandbox` attribute no iframe).

**Meu risco nao contemplado:** a maior ameaca real para este site e o comprometimento da conta GitHub (`revellaia`). Se um atacante ganhar acesso ao repositorio, ele pode modificar o `index.html` e publicar em 2 minutos. A auditoria nao aborda a seguranca da conta GitHub como prioridade 1.

**Minha exigencia:** Ativar 2FA na conta `revellaia` no GitHub. Isso e mais urgente que meta CSP.

---

## Conselheiro 2 - Primeiros Principios

**"O que um atacante realmente quer deste site?"**

Um site vitrine estatico tem dois ativos de valor para um atacante:

1. **Reputacao**: vandalizar o site ou injetar conteudo fraudulento (malware, phishing) para prejudicar a imagem do Bruno
2. **Clientes**: roubar o contato de visitantes para spam/phishing

O vetor de ataque mais provavel e o comprometimento da conta GitHub, nao um ataque sofisticado de XSS. A probabilidade de XSS em um site sem input de usuario e praticamente zero.

O SRI para Three.js e uma protecao real e valiosa: se o Cloudflare CDN fosse comprometido e servisse um Three.js malicioso, o SRI bloquearia. Isso ja foi documentado em ataques de supply chain.

O frame-buster JS e protecao valida para o cenario mais comum de clickjacking (iframe simples). O limite do JS e correto e deve ser documentado, mas nao invalida o controle.

**Meu parecer:** plano tecnicamente correto para a stack. As limitacoes sao inerentes ao GitHub Pages e bem documentadas. O plano prioriza corretamente Cloudflare para os headers reais.

---

## Conselheiro 3 - Expansivo

**"Este baseline pode ser o padrao para todos os sites do ecossistema."**

Cada site entregue por Bruno (Pires, Paula, Memoré, proximos clientes) deveria ter este mesmo baseline. A `security/` folder e o padrão de documentação podem virar um template no `WebDesign-Architect/`.

Oportunidade: criar um `SITE_SECURITY_TEMPLATE/` no workspace `WebDesign-Architect/` com:
- Os 7 documentos pre-preenchidos para site estatico
- Checklist de deploy incluindo seguranca
- Script Python para verificar em-dashes E verificar SRI ao mesmo tempo

Isso transformaria o baseline de um documento isolado em um ativo da fabrica de sites.

**Minha contribuicao:** recomendar que o brunodevai.md (guia de manutencao) inclua a secao de seguranca na checklist de deploy. Atualmente o checklist de deploy nao menciona verificacao de SRI ou CSP.

---

## Conselheiro 4 - Observador

**"O que o plano NAO cobre que pode importar?"**

**Supply chain das dependencias:** Three.js r128 e de 2021. Cinco anos de vulnerabilidades potenciais. O SRI garante que a versao entregue e exatamente a que foi auditada, mas nao garante que essa versao nao tem vulnerabilidade conhecida. O mitigador: Three.js e uma biblioteca de renderizacao 3D sem acesso a DOM de dados do usuario, entao o risco de CVEs aplicaveis ao contexto e baixo.

**Google Fonts e a questao juridica real:** Apos o GDPR europeu, varios tribunais europeus multaram sites por usar Google Fonts sem aviso. A LGPD brasileira e inspirada no GDPR. A probabilidade de uma acao formal contra um site individual pequeno e baixa, mas o risco existe. A mitigacao mais limpa e auto-hospedar as fontes.

**Vetor de ataque esquecido:** o link do WhatsApp `wa.me/5563992601105` com texto pre-preenchido pode ser abusado para enviar mensagens nao-solicitadas ao numero do Bruno via deep-link. Nao ha controle para isso (e uma limitacao do WhatsApp), mas vale documentar como risco aceito.

**Meu parecer:** o plano esta incompleto sem mencionar self-hosting de fontes como prioridade media-alta. E sem 2FA como prioridade 1 para a conta GitHub.

---

## Conselheiro 5 - Executor

**"O que realmente pode ser implementado agora e o que e faco pior do que nao fazer?"**

O SRI para Three.js: implementacao imediata, risco zero de regressao. FAZER.

A meta CSP com `unsafe-inline`: util para restringir origens de scripts/fontes/imagens. Nao prejudica nada. FAZER.

O frame-buster JS: 3 linhas, sem impacto de performance, protege contra o caso basico. FAZER.

Referrer-Policy meta tag: muda como o Referer e enviado para sites externos. Sem impacto de UX. FAZER.

Auto-hospedar fontes: alto esforco inicial (baixar, converter woff2, ajustar CSS), elimina chamada ao Google Fonts. Vale fazer na proxima atualizacao grande do site.

Headers Cloudflare: o painel do Cloudflare permite adicionar Transform Rules com headers. Se Cloudflare ja esta ativo no dominio (provavel, pois e o registrador mais comum para .com), leva 5 minutos. FAZER EM BREVE.

**O que eu NAO faria:** remover o e-mail do HTML para evitar raspagem. A fricao para o usuario nao vale o beneficio. O e-mail ja e publico em varias outras fontes.

---

## Conselheiro 6 - Guardiao (LGPD)

**"A LGPD nao e so uma lista de riscos; e uma obrigacao legal."**

O site nao coleta dados sensiveis. Essa e a melhor defesa LGPD possivel.

Contudo, a ausencia de Politica de Privacidade publica no site e uma lacuna real. O art. 9 da LGPD exige que o controlador informe ao titular sobre o tratamento de dados - mesmo que seja minimo. A Politica de Privacidade redigida no `PRIVACY_POLICY.md` precisa estar visivelmente acessivel no site, nao apenas como documento interno.

Dado que o site nao tem backend, a publicacao e simples: criar `politica-de-privacidade.html` e adicionar link no footer.

**Minha posicao:** o site nao pode ser considerado LGPD-compliant enquanto a Politica de Privacidade nao for publica no site. Isso deve ser Prioridade 2 (depois do 2FA da conta GitHub).

O e-mail `bgmcruz1988@gmail.com` como canal para direitos do titular e adequado para esta escala de operacao. Nao e necessario DPO formal para um operador individual de baixo volume sem dados sensiveis.

---

## Veredito do Presidente Relator

### Decisao analisada

Aprovar o plano de seguranca para brunodevai.com conforme documentado, com as seguintes condicoes.

### Parecer consolidado

O plano de seguranca e **tecnicamente correto e proporcional ao risco** de um site vitrine estatico.

As implementacoes propostas (SRI, meta CSP, Referrer-Policy, frame-buster) sao a melhoria maxima possivel dentro das limitacoes do GitHub Pages. As limitacoes sao corretamente reconhecidas e o caminho para headers reais via Cloudflare esta documentado.

### Riscos criticos identificados pelo Conselho

| # | Risco Critico | Responsavel | Urgencia |
|---|---|---|---|
| C1 | Conta GitHub sem 2FA: comprometimento = site vandalizavel em minutos | Bruno (acao manual) | IMEDIATA |
| C2 | Politica de Privacidade nao publicada no site (art. 9 LGPD) | Claude Code + Bruno | ALTA |

### Riscos altos

| # | Risco Alto | Acao |
|---|---|---|
| A1 | Google Fonts envia IP sem auto-hospedagem | Documentado; auto-hospedar na Fase C |
| A2 | Headers reais (X-Frame-Options, X-Content-Type-Options, HSTS) ausentes | Configurar via Cloudflare na Fase B |

### Riscos medios

| # | Risco Medio | Acao |
|---|---|---|
| M1 | meta CSP com unsafe-inline: nao protege XSS inline | Limitacao inerente; documentada |
| M2 | Frame-buster JS contornavel com sandbox iframe | Risco teorico baixo; X-Frame-Options via Cloudflare corrige |

### Decisao final

**APROVADO COM AJUSTES**

O baseline pode ser considerado suficiente para producao desde que:
1. 2FA seja ativado na conta GitHub `revellaia` (critico, acao do Bruno)
2. Politica de Privacidade seja publicada como pagina ou secao no site (alta, proxima sprint)

As implementacoes tecnicas (SRI, meta CSP, Referrer-Policy, frame-buster) devem ser commitadas no `index.html` imediatamente.

### Proximo passo obrigatorio

1. Bruno: ativar 2FA no GitHub (revellaia) hoje
2. Claude: commitar as melhorias no index.html
3. Bruno: criar `politica-de-privacidade.html` e adicionar link no footer
4. Bruno: configurar headers Cloudflare (Transform Rules) esta semana

### Teste de validacao de menor risco

Verificar: apos o commit das melhorias, acessar o site e abrir DevTools > Network. Confirmar que Three.js e carregado com o header `Integrity-Check` sem erros de SRI. Se falhar, o hash sha384 estava incorreto e precisa ser recomputado.
