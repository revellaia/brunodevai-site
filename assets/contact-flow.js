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

  const ICON_CHAT='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5z"/></svg>';
  const ICON_MAIL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/></svg>';

  let back,panel,lastFocus=null,context='';

  function build(){
    /* Estilo do painel (.cf-*) vive em src/site.css (CSP sem 'unsafe-inline'). */
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
