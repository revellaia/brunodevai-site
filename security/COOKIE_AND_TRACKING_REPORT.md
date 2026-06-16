# COOKIE_AND_TRACKING_REPORT — www.brunodevai.com

**Data:** 2026-06-16  
**Auditor:** Claude Code

---

## Estado auditado

### Cookies

| Tipo | Status | Origem | Necessidade |
|---|---|---|---|
| Cookies de sessao/autenticacao | NENHUM | - | N/A (sem login) |
| Cookies analiticos | NENHUM | - | N/A |
| Cookies de rastreamento (ads) | NENHUM | - | N/A |
| Cookies de preferencia | NENHUM | - | N/A |
| Cookies funcionais | NENHUM | - | N/A |

O site nao escreve nenhum cookie proprio. Confirmado por auditoria direta do `index.html` (zero ocorrencias de `document.cookie`).

### Armazenamento local

| Mecanismo | Status |
|---|---|
| `localStorage` | NENHUM |
| `sessionStorage` | NENHUM |
| IndexedDB | NENHUM |
| Service Worker / Cache API | NENHUM |

### Analytics e pixels de rastreamento

| Ferramenta | Status | Nota |
|---|---|---|
| Google Analytics 4 (GA4) | NAO INTEGRADO | Varredura inicial detectou falso positivo via base64 da logo; confirmado ausente |
| Google Tag Manager | NAO INTEGRADO | - |
| Meta Pixel (Facebook/Instagram) | NAO INTEGRADO | Mesmo falso positivo; confirmado ausente |
| TikTok Pixel | NAO INTEGRADO | - |
| Hotjar | NAO INTEGRADO | - |
| Microsoft Clarity | NAO INTEGRADO | - |
| PostHog | NAO INTEGRADO | - |
| Mixpanel | NAO INTEGRADO | - |

**Conclusao:** o site nao rastreia visitantes de nenhuma forma. Estado privacidade-first.

---

## Recursos de terceiros ativos

| Recurso | Provedor | Dado enviado | Finalidade | Risco LGPD |
|---|---|---|---|---|
| Three.js r128 | Cloudflare CDN (cdnjs) | IP do visitante (header HTTP padrao) | Biblioteca 3D para o hero | BAIXO - CDN de propósito geral |
| Bodoni Moda + Inter | Google Fonts (fonts.googleapis.com) | IP do visitante + user-agent + referer | Fontes tipograficas | BAIXO-MEDIO - Google e operador; IP e dado pessoal |

### Detalhe sobre Google Fonts e LGPD

O carregamento de fontes via Google Fonts envia o IP do visitante ao Google. Tecnicamente, o IP e dado pessoal conforme LGPD (dado que identifica indiretamente o individuo).

**Base legal provavel:** legítimo interesse do operador (Bruno) em fornecer tipografia de qualidade.

**Mitigacoes possiveis:**
1. **Auto-hospedar as fontes** (elimina o risco completamente) - baixar os arquivos .woff2 e servir do proprio repo
2. **Aceitar o risco** com documentacao na Politica de Privacidade (Google e empresa com DPA e politicas GDPR/LGPD reconhecidas)

**Recomendacao:** auto-hospedar as fontes na Fase C. Por enquanto, documentar na Politica de Privacidade.

---

## Politica para adicionar tracking no futuro

Se no futuro qualquer analytics, pixel ou cookie for ativado, as regras obrigatorias sao:

1. **Banner de consentimento ANTES** de qualquer script de rastreamento carregar
2. **Opt-in ativo** (checkbox desmarcado por padrao; nao pre-marcar)
3. **Opcao de recusar** sem perda de funcionalidade
4. **Documentar** na Politica de Privacidade: ferramenta, dado coletado, destinatario, retencao
5. **Carregar condicionalmente**: scripts so disparam apos consentimento
6. **Nao usar dados de comportamento** para fins diferentes do consentido

Exemplo de implementacao aceitavel para GA4:

```html
<!-- Carregar GA4 apenas apos consentimento -->
<script>
function loadGA4() {
  if (sessionStorage.getItem('consent-analytics') === 'yes') {
    // carrega gtag apenas aqui
  }
}
</script>
```

---

## Conclusao e status

**Status:** APROVADO

O site esta em estado de privacidade maxima para rastreamento. Nenhum dado de visitante e coletado ou enviado a terceiros (exceto IP ao Google Fonts e Cloudflare CDN - risco baixo, documentado). Nenhum banner de consentimento e necessario no estado atual.

**Acao obrigatoria antes de adicionar qualquer tracking:**
Ler e seguir a secao "Politica para adicionar tracking no futuro" acima.
