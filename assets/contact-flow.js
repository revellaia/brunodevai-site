/* COMMERCIAL CONTACT FLOW
   Fluxo comercial único do Bruno Dev.AI. Qualquer elemento com [data-contact-flow]
   abre este painel (WhatsApp ou e-mail). [data-contact-context] opcional entra na
   mensagem como modelo de interesse. Idioma segue <html lang>. Sem backend, sem coleta. */
(function(){
  'use strict';
  if(window.BrunoContactFlow)return;

  const WA_NUMBER='5563992601105';
  const WA_DISPLAY='(63) 99260-1105';
  const EMAIL='commercial@brunodevai.com';

  const COPY={
    pt:{
      title:'Vamos conversar sobre o seu projeto.',
      text:'Conte brevemente o que você precisa. Respondo com os próximos passos, uma direção inicial e o escopo mais adequado para o projeto.',
      waLabel:'WhatsApp',emailLabel:'E-mail',
      waBtn:'Falar no WhatsApp',emailBtn:'Enviar e-mail',
      close:'Fechar',newTab:'abre em nova aba',
      waMsg:ctx=>ctx
        ?'Olá, Bruno. Vim pelo Bruno Dev.AI e tenho interesse no modelo '+ctx+'. Quero entender o melhor caminho, o escopo e uma proposta.'
        :'Olá, Bruno. Vim pelo Bruno Dev.AI e gostaria de conversar sobre um projeto. Quero entender o melhor caminho, o escopo e uma proposta.',
      subject:'Novo projeto | Bruno Dev.AI',
      body:ctx=>'Olá, Bruno.\n\n'
        +(ctx?'Vim pelo Bruno Dev.AI e gostaria de conversar sobre um novo projeto a partir do modelo '+ctx+'.':'Vim pelo Bruno Dev.AI e gostaria de conversar sobre um novo projeto.')
        +'\n\nProjeto/empresa:\nO que preciso:\nPrazo desejado:\n\nGostaria de entender o melhor caminho, o escopo inicial e uma proposta.'
    },
    en:{
      title:"Let's talk about your project.",
      text:"Tell me briefly what you need. I'll reply with the next steps, an initial direction and the most suitable scope for your project.",
      waLabel:'WhatsApp',emailLabel:'Email',
      waBtn:'Chat on WhatsApp',emailBtn:'Send an email',
      close:'Close',newTab:'opens in a new tab',
      waMsg:ctx=>ctx
        ?"Hi Bruno, I found you through Bruno Dev.AI and I'm interested in the "+ctx+" model. I'd like to understand the best approach, scope and proposal."
        :"Hi Bruno, I found you through Bruno Dev.AI and I'd like to discuss a project. I'd like to understand the best approach, scope and proposal.",
      subject:'New project | Bruno Dev.AI',
      body:ctx=>'Hi Bruno,\n\n'
        +(ctx?"I found you through Bruno Dev.AI and I'd like to discuss a new project based on the "+ctx+' model.':"I found you through Bruno Dev.AI and I'd like to discuss a new project.")
        +"\n\nProject/company:\nWhat I need:\nPreferred timeline:\n\nI'd like to understand the best approach, initial scope and proposal."
    }
  };

  const lang=()=>/^en/i.test(document.documentElement.lang)?'en':'pt';
  const whatsappUrl=(l,ctx)=>'https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(COPY[l].waMsg(ctx));
  const mailtoUrl=(l,ctx)=>'mailto:'+EMAIL+'?subject='+encodeURIComponent(COPY[l].subject)+'&body='+encodeURIComponent(COPY[l].body(ctx).replace(/\n/g,'\r\n'));

  const CSS=`
.cf-back{position:fixed;inset:0;z-index:1200;background:rgba(4,5,4,.82);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity .3s}
.cf-back[hidden]{display:none}
.cf-back.show{opacity:1}
.cf-panel{position:relative;width:100%;max-width:620px;max-height:calc(100dvh - 40px);overflow:auto;background:var(--void-2,#141613);color:var(--text-hi,#f4f2ec);border:1px solid rgba(216,179,104,.22);border-radius:16px;padding:40px clamp(22px,4vw,40px) 34px;box-shadow:0 40px 90px rgba(0,0,0,.55);font-family:var(--font-body,'Inter',system-ui,sans-serif);transform:translateY(16px);transition:transform .35s var(--ease,cubic-bezier(.22,.61,.36,1))}
.cf-back.show .cf-panel{transform:translateY(0)}
.cf-x{position:absolute;top:14px;right:14px;width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.5);color:var(--text-hi,#f4f2ec);cursor:pointer;display:grid;place-items:center;font-size:18px;transition:border-color .2s}
.cf-x:hover{border-color:var(--neon,#A8FF60)}
.cf-title{font-family:var(--font-display,'Fraunces',Georgia,serif);font-weight:400;font-size:clamp(26px,3.4vw,36px);line-height:1.2;color:var(--text-hi,#f4f2ec);margin:0 44px 12px 0;letter-spacing:normal}
.cf-text{font-size:15px;line-height:1.7;color:var(--text-lo,#9a9b94);font-weight:300;margin:0 0 26px}
.cf-options{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.cf-option{display:flex;flex-direction:column;gap:6px;padding:20px;border:1px solid rgba(216,179,104,.18);border-radius:12px;background:rgba(255,255,255,.015);min-width:0}
.cf-label{display:flex;align-items:center;gap:8px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold-lit,#D8B368)}
.cf-label svg{width:15px;height:15px;flex:none}
.cf-value{font-size:14px;color:var(--text-hi,#f4f2ec);overflow-wrap:anywhere;margin-bottom:12px}
.cf-btn{margin-top:auto;min-height:48px;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:0 18px;font-size:13px;font-weight:700;letter-spacing:.04em;text-decoration:none;text-align:center;transition:all .3s var(--ease,ease)}
.cf-btn.primary{background:var(--neon,#A8FF60);color:var(--void,#0c0d0b)}
.cf-btn.primary:hover{box-shadow:0 0 34px var(--neon-dim,rgba(168,255,96,.16));transform:translateY(-2px)}
.cf-btn.ghost{border:1px solid rgba(216,179,104,.5);color:var(--gold-lit,#D8B368)}
.cf-btn.ghost:hover{border-color:var(--neon,#A8FF60);color:var(--text-hi,#f4f2ec)}
.cf-btn:focus-visible,.cf-x:focus-visible{outline:2px solid var(--gold-lit,#D8B368);outline-offset:3px}
body.cf-locked{overflow:hidden}
@media(max-width:560px){.cf-options{grid-template-columns:1fr}.cf-panel{padding:34px 20px 24px}.cf-text{margin-bottom:20px}}
@media(prefers-reduced-motion:reduce){.cf-back,.cf-panel,.cf-btn{transition:none}.cf-btn.primary:hover{transform:none}}
`;

  const ICON_CHAT='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5z"/></svg>';
  const ICON_MAIL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/></svg>';

  let back,panel,lastFocus=null,context='';

  function build(){
    const style=document.createElement('style');
    style.textContent=CSS;
    document.head.appendChild(style);
    back=document.createElement('div');
    back.className='cf-back';
    back.id='contactFlow';
    back.hidden=true;
    back.innerHTML=`<div class="cf-panel" role="dialog" aria-modal="true" aria-labelledby="cfTitle" aria-describedby="cfText">
  <button class="cf-x" type="button" data-cf-close>✕</button>
  <h2 class="cf-title" id="cfTitle"></h2>
  <p class="cf-text" id="cfText"></p>
  <div class="cf-options">
    <div class="cf-option">
      <span class="cf-label">${ICON_CHAT}<span data-cf="waLabel"></span></span>
      <span class="cf-value">${WA_DISPLAY}</span>
      <a class="cf-btn primary" data-cf-whatsapp target="_blank" rel="noopener noreferrer"></a>
    </div>
    <div class="cf-option">
      <span class="cf-label">${ICON_MAIL}<span data-cf="emailLabel"></span></span>
      <span class="cf-value">${EMAIL.replace('@','@<wbr>')}</span>
      <a class="cf-btn ghost" data-cf-email></a>
    </div>
  </div>
</div>`;
    document.body.appendChild(back);
    panel=back.firstElementChild;
    back.addEventListener('click',e=>{if(e.target===back||e.target.closest('[data-cf-close]'))close()});
  }

  function render(){
    const l=lang(),c=COPY[l];
    panel.querySelector('#cfTitle').textContent=c.title;
    panel.querySelector('#cfText').textContent=c.text;
    panel.querySelector('[data-cf="waLabel"]').textContent=c.waLabel;
    panel.querySelector('[data-cf="emailLabel"]').textContent=c.emailLabel;
    panel.querySelector('[data-cf-close]').setAttribute('aria-label',c.close);
    const wa=panel.querySelector('[data-cf-whatsapp]');
    wa.textContent=c.waBtn+' →';
    wa.href=whatsappUrl(l,context);
    wa.setAttribute('aria-label',c.waBtn+': '+WA_DISPLAY+' ('+c.newTab+')');
    const mail=panel.querySelector('[data-cf-email]');
    mail.textContent=c.emailBtn+' →';
    mail.href=mailtoUrl(l,context);
    mail.setAttribute('aria-label',c.emailBtn+': '+EMAIL);
  }

  function open(ctx,source){
    if(!back)build();
    context=(ctx||'').trim();
    lastFocus=source||document.activeElement;
    render();
    back.hidden=false;
    document.body.classList.add('cf-locked');
    requestAnimationFrame(()=>back.classList.add('show'));
    panel.querySelector('[data-cf-whatsapp]').focus();
  }

  function close(){
    if(!back||back.hidden)return;
    back.classList.remove('show');
    document.body.classList.remove('cf-locked');
    setTimeout(()=>{if(!back.classList.contains('show'))back.hidden=true},300);
    if(lastFocus&&document.contains(lastFocus))lastFocus.focus({preventScroll:true});
  }

  document.addEventListener('click',e=>{
    const trigger=e.target.closest&&e.target.closest('[data-contact-flow]');
    if(!trigger||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    e.preventDefault();
    open(trigger.dataset.contactContext,trigger);
  });

  document.addEventListener('keydown',e=>{
    if(!back||back.hidden)return;
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();return}
    if(e.key==='Tab'){
      e.stopPropagation();
      const f=panel.querySelectorAll('button,a[href]'),first=f[0],last=f[f.length-1];
      if(!panel.contains(document.activeElement)){e.preventDefault();first.focus()}
      else if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
  },true);

  window.BrunoContactFlow={open,close,whatsappUrl,mailtoUrl,WA_NUMBER,EMAIL};
})();
