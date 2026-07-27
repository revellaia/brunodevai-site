/* ============================================================
   ABOUT JS — BrunoDev.AI
   Resilient video controller + about page interactions
   ============================================================ */

(function() {
  'use strict';

  /* ============================================================
     RESILIENT VIDEO CONTROLLER
     Centralized controller for the about page hero video
     States: idle, poster, metadata-loading, ready, play-requested,
             playing, paused, autoplay-blocked, reduced, error
     ============================================================ */
  const VideoController = (function() {
    const video = document.getElementById('aboutHeroVideo');
    if (!video) return null;

    const posterEl = document.querySelector('.about-video-poster');
    const playBtn = document.querySelector('.about-video-play-btn');
    const playBtnText = playBtn ? playBtn.querySelector('.play-btn-text') : null;
    const stateLabel = document.querySelector('.about-video-state');
    const container = document.querySelector('.about-video-container');

    const KEY = 'brunodevai:motion-preference';
    const VALID = ['system', 'full', 'reduced'];

    let state = 'idle';
    let generation = 1;
    let autoplayAttempted = false;
    let autoplayBlocked = false;
    let userInteracted = false;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    let visibilityHandler = null;
    let orientationHandler = null;
    let metadataHandler = null;
    let playPromise = null;
    let retryTimeout = null;

    /* === State Machine === */
    function setState(newState) {
      if (state === 'error' && newState !== 'error') return; // lock error until recovery
      if (state === newState) return;
      state = newState;
      updateUI();
    }

    function updateUI() {
      if (!container) return;
      container.dataset.videoState = state;

      if (stateLabel) {
        const i18n = window.ABOUT_I18N ? window.ABOUT_I18N.PT : null;
        const lang = document.documentElement.lang === 'en' ? 'EN' : 'PT';
        const t = window.ABOUT_I18N ? window.ABOUT_I18N[lang] : null;
        switch (state) {
          case 'playing':
            stateLabel.textContent = '';
            break;
          case 'paused':
          case 'autoplay-blocked':
            stateLabel.textContent = t ? t.video_paused : '';
            break;
          case 'loading':
          case 'metadata-loading':
            stateLabel.textContent = t ? t.video_loading : '';
            break;
          case 'error':
            stateLabel.textContent = t ? t.video_error : '';
            break;
          default:
            stateLabel.textContent = '';
        }
      }

      if (playBtn) {
        const lang = document.documentElement.lang === 'en' ? 'EN' : 'PT';
        const t = window.ABOUT_I18N ? window.ABOUT_I18N[lang] : null;
        const isReduced = isExplicitlyReduced();
        const show = state === 'autoplay-blocked' || state === 'paused' || state === 'error';

        playBtn.hidden = !show;
        if (playBtnText && t) {
          playBtnText.textContent = state === 'error' ? t.video_play : t.video_play;
        }
        if (playBtnText && t) {
          playBtn.setAttribute('aria-label', t.video_play_aria);
        }
      }

      if (posterEl) {
        posterEl.hidden = state === 'playing' || state === 'ready';
      }

      if (video) {
        if (state === 'reduced' || isExplicitlyReduced()) {
          video.pause();
        }
      }
    }

    /* === Preference Check === */
    function readPreference() {
      try {
        const saved = localStorage.getItem(KEY);
        if (saved && VALID.includes(saved)) return saved;
      } catch (e) {}
      return 'system';
    }

    function isExplicitlyReduced() {
      const pref = readPreference();
      if (pref === 'reduced') return true;
      if (pref === 'full') return false;
      // system: check media query
      try {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      } catch (e) {
        return false;
      }
    }

    function shouldPlay() {
      if (isExplicitlyReduced()) return false;
      if (userInteracted) return true;
      return true; // will handle autoplay rejection
    }

    /* === Core Play/Pause === */
    function attemptPlay() {
      if (!video || !shouldPlay()) {
        setState('reduced');
        return Promise.resolve();
      }
      if (state === 'playing') return Promise.resolve();
      if (state === 'error') return Promise.resolve();

      setState('play-requested');
      autoplayAttempted = true;

      video.muted = true;
      video.playsInline = true;

      try {
        playPromise = video.play();
        if (playPromise && typeof playPromise.then === 'function') {
          return playPromise
            .then(() => {
              setState('playing');
              autoplayBlocked = false;
              retryCount = 0;
            })
            .catch(function(err) {
              if (err.name === 'AbortError' && state !== 'playing') {
                // AbortError during src change is expected
                return;
              }
              if (err.name === 'NotAllowedError') {
                autoplayBlocked = true;
                setState('autoplay-blocked');
                return;
              }
              // Other error
              if (retryCount < MAX_RETRIES) {
                retryCount++;
                setState('metadata-loading');
                if (video.readyState >= 2) {
                  scheduleRetry();
                }
              } else {
                setState('error');
              }
            });
        }
      } catch (err) {
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          scheduleRetry();
        } else {
          setState('error');
        }
      }
      return Promise.resolve();
    }

    function scheduleRetry() {
      cancelRetry();
      retryTimeout = setTimeout(function() {
        if (isCurrentGeneration()) {
          attemptPlay();
        }
      }, 1500 * retryCount);
    }

    function cancelRetry() {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
        retryTimeout = null;
      }
    }

    function pauseVideo() {
      if (!video) return;
      try {
        video.pause();
      } catch (e) {}
      if (state === 'playing') {
        setState('paused');
      }
    }

    function userPlay() {
      userInteracted = true;
      if (!video) return;
      setState('play-requested');
      video.muted = true;
      try {
        const p = video.play();
        if (p && typeof p.then === 'function') {
          p.then(function() {
            setState('playing');
            autoplayBlocked = false;
          }).catch(function() {
            setState('paused');
          });
        }
      } catch (e) {
        setState('paused');
      }
    }

    /* === Generation Tracking === */
    function isCurrentGeneration() {
      return generation === VideoController.generation;
    }

    function newGeneration() {
      generation++;
      VideoController.generation = generation;
    }

    /* === Event Handlers === */
    function onMetadata() {
      if (!isCurrentGeneration()) return;
      setState('ready');
      if (shouldPlay() && !autoplayBlocked) {
        attemptPlay();
      }
    }

    function onVisibilityChange() {
      if (!isCurrentGeneration()) return;
      if (document.hidden) {
        if (state === 'playing') {
          pauseVideo();
        }
      } else {
        // Tab returned
        if (state === 'paused' || state === 'autoplay-blocked') {
          if (!autoplayBlocked && shouldPlay()) {
            attemptPlay();
          }
        }
      }
    }

    function onOrientationChange() {
      if (!isCurrentGeneration()) return;
      // Restore playback state after orientation without restarting
      if (state === 'playing' || state === 'play-requested') {
        if (!video.paused) return;
        if (shouldPlay()) {
          attemptPlay();
        }
      }
    }

    function onPageshow(e) {
      if (!isCurrentGeneration()) return;
      if (e.persisted) {
        // Back/forward cache restore
        if (state === 'playing' && video.paused) {
          attemptPlay();
        }
      }
    }

    function onPlayClick() {
      userPlay();
    }

    /* === Init === */
    function init() {
      if (!video) return null;

      // Initial state
      setState('poster');

      // Check reduced motion
      if (isExplicitlyReduced()) {
        setState('reduced');
        video.pause();
        return this;
      }

      // Attach events
      metadataHandler = function() { onMetadata(); };
      video.addEventListener('loadedmetadata', metadataHandler, { once: true });

      visibilityHandler = function() { onVisibilityChange(); };
      document.addEventListener('visibilitychange', visibilityHandler);

      orientationHandler = function() { onOrientationChange(); };
      window.addEventListener('orientationchange', orientationHandler);

      window.addEventListener('pageshow', onPageshow);

      if (playBtn) {
        playBtn.addEventListener('click', onPlayClick);
      }

      // If metadata already loaded
      if (video.readyState >= 2) {
        setState('ready');
        attemptPlay();
      } else {
        setState('metadata-loading');
      }
    }

    /* === Public API === */
    const publicAPI = {
      generation: 1,
      state: function() { return state; },
      play: function() { userPlay(); },
      pause: function() { pauseVideo(); },
      attemptPlay: function() { attemptPlay(); },
      isExplicitlyReduced: isExplicitlyReduced,
      shouldPlay: shouldPlay,
      destroy: function() {
        newGeneration();
        cancelRetry();
        if (video) {
          video.removeEventListener('loadedmetadata', metadataHandler);
          video.pause();
        }
        document.removeEventListener('visibilitychange', visibilityHandler);
        window.removeEventListener('orientationchange', orientationHandler);
        window.removeEventListener('pageshow', onPageshow);
        if (playBtn) {
          playBtn.removeEventListener('click', onPlayClick);
        }
      },
      refreshI18n: function() {
        updateUI();
      }
    };

    init();
    return publicAPI;
  })();

  window.AboutVideoController = VideoController;

  /* ============================================================
     I18N INIT — about page
     ============================================================ */
  function initI18n() {
    const i18n = window.ABOUT_I18N;
    if (!i18n) return;

    // Determine language from URL or HTML lang
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    let lang = 'pt';

    if (langParam === 'en') {
      lang = 'en';
    } else if (document.documentElement.lang === 'en') {
      lang = 'en';
    }

    const t = i18n[lang === 'en' ? 'EN' : 'PT'];
    if (!t) return;

    // Set HTML attributes
    document.documentElement.lang = t.html_lang;
    document.documentElement.dir = t.html_dir;

    // SEO
    document.title = t.meta_title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = t.meta_desc;
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = t.meta_title;
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = t.meta_desc;
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.content = t.meta_title;
    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.content = t.meta_desc;
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.content = lang === 'en' ? 'en_US' : 'pt_BR';

    // Apply data-i18n
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      const key = el.dataset.i18n;
      if (t[key] !== undefined) {
        el.innerHTML = t[key];
      }
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(function(el) {
      const key = el.dataset.i18nAlt;
      if (t[key] !== undefined) el.setAttribute('alt', t[key]);
    });

    // Lang button
    const langBtn = document.getElementById('aboutLangBtn');
    if (langBtn) {
      langBtn.textContent = t.nav_lang || 'EN';
      langBtn.setAttribute(
        'aria-label',
        lang === 'en' ? 'Switch language to PT' : 'Trocar idioma para EN'
      );
    }

    // Store current lang for toggle
    window.ABOUT_CURRENT_LANG = lang;
  }

  /* ============================================================
     LANG TOGGLE
     ============================================================ */
  function initLangToggle() {
    const langBtn = document.getElementById('aboutLangBtn');
    if (!langBtn) return;

    langBtn.addEventListener('click', function() {
      const currentLang = window.ABOUT_CURRENT_LANG || 'pt';
      const newLang = currentLang === 'pt' ? 'en' : 'pt';
      window.ABOUT_CURRENT_LANG = newLang;

      // Update URL params
      const url = new URL(window.location);
      url.searchParams.set('lang', newLang);
      window.history.replaceState({}, '', url);

      // Reload i18n
      initI18n();

      // Refresh video controller UI
      if (window.AboutVideoController && window.AboutVideoController.refreshI18n) {
        window.AboutVideoController.refreshI18n();
      }

      // Update lang btn
      const t = window.ABOUT_I18N ? window.ABOUT_I18N[newLang === 'en' ? 'EN' : 'PT'] : null;
      if (t) {
        langBtn.textContent = t.nav_lang || (newLang === 'en' ? 'PT' : 'EN');
        langBtn.setAttribute(
          'aria-label',
          newLang === 'en' ? 'Switch language to PT' : 'Trocar idioma para EN'
        );
      }
    });
  }

  /* ============================================================
     PORTFOLIO FILTERS
     ============================================================ */
  function initPortfolioFilters() {
    const filters = document.querySelectorAll('.portfolio-filter');
    const cards = document.querySelectorAll('.portfolio-card');

    if (!filters.length || !cards.length) return;

    filters.forEach(function(filter) {
      filter.addEventListener('click', function() {
        const category = filter.dataset.filter;

        filters.forEach(function(f) {
          f.setAttribute('aria-pressed', 'false');
        });
        filter.setAttribute('aria-pressed', 'true');

        cards.forEach(function(card) {
          if (category === 'all' || card.dataset.category === category) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }

  /* ============================================================
     AREA TABS
     ============================================================ */
  function initAreaTabs() {
    const tabs = Array.from(document.querySelectorAll('.about-area-tab'));
    const panels = Array.from(document.querySelectorAll('.about-area-panel'));

    if (!tabs.length || !panels.length) return;

    function activate(tab, moveFocus) {
      const target = document.getElementById(tab.dataset.tab);
      tabs.forEach(function(item) {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.setAttribute('tabindex', selected ? '0' : '-1');
      });
      panels.forEach(function(panel) {
        const selected = panel === target;
        panel.classList.toggle('active', selected);
        panel.hidden = !selected;
      });
      if (moveFocus) tab.focus();
    }

    tabs.forEach(function(tab, index) {
      const target = document.getElementById(tab.dataset.tab);
      const tabId = 'area-tab-' + tab.dataset.tab.replace('area-', '');
      tab.id = tabId;
      tab.setAttribute('aria-controls', tab.dataset.tab);
      tab.setAttribute('tabindex', index === 0 ? '0' : '-1');
      if (target) target.setAttribute('aria-labelledby', tabId);
      tab.addEventListener('click', function() {
        activate(tab, false);
      });
      tab.addEventListener('keydown', function(event) {
        let next = index;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        activate(tabs[next], true);
      });
    });
    activate(tabs.find(function(tab) { return tab.getAttribute('aria-selected') === 'true'; }) || tabs[0], false);
  }

  /* ============================================================
     SCROLL REVEAL
     ============================================================ */
  function initReveal() {
    const els = document.querySelectorAll('.about-reveal');
    if (!els.length) return;

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    els.forEach(function(el) {
      observer.observe(el);
    });
  }

  /* ============================================================
     NAV TRAP ENHANCEMENTS
     ============================================================ */
  function initNavEnhance() {
    const mobileDrawer = document.getElementById('mobileDrawer');
    const burger = document.getElementById('aboutBurger');
    if (!mobileDrawer || !burger) return;

    let wasOpen = false;
    const focusables = function() {
      return Array.from(mobileDrawer.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'));
    };
    const observer = new MutationObserver(function() {
      const isOpen = mobileDrawer.classList.contains('open');
      if (isOpen && !wasOpen) {
        const first = focusables()[0];
        if (first) first.focus();
      } else if (!isOpen && wasOpen) {
        burger.focus();
      }
      wasOpen = isOpen;
    });
    observer.observe(mobileDrawer, { attributes: true, attributeFilter: ['class'] });

    document.addEventListener('keydown', function(event) {
      if (event.key !== 'Tab' || !mobileDrawer.classList.contains('open')) return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  /* ============================================================
     MOTION PREFERENCE INTEGRATION
     ============================================================ */
  function initMotionSync() {
    // Sync with home's motion system if available
    if (window.BrunoMotion) {
      window.BrunoMotion.onChange(function(isReduced) {
        if (window.AboutVideoController) {
          if (isReduced) {
            window.AboutVideoController.pause();
          } else {
            window.AboutVideoController.attemptPlay();
          }
        }
      });
      return;
    }

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    function localPreference() {
      try {
        const saved = localStorage.getItem('brunodevai:motion-preference');
        if (saved === 'full' || saved === 'reduced') return saved;
      } catch (e) {}
      return 'system';
    }
    function applyLocalMotion() {
      const preference = localPreference();
      const reduced = preference === 'reduced' || (preference === 'system' && media.matches);
      document.documentElement.classList.toggle('motion-reduced', reduced);
      document.documentElement.dataset.motion = reduced ? 'reduced' : 'full';
    }
    applyLocalMotion();
    if (typeof media.addEventListener === 'function') media.addEventListener('change', applyLocalMotion);
    else if (typeof media.addListener === 'function') media.addListener(applyLocalMotion);
  }

  /* ============================================================
     YEAR
     ============================================================ */
  document.getElementById('aboutYr').textContent = new Date().getFullYear();

  /* ============================================================
     INIT
     ============================================================ */
  document.addEventListener('DOMContentLoaded', function() {
    initI18n();
    initLangToggle();
    initPortfolioFilters();
    initAreaTabs();
    initReveal();
    initNavEnhance();
    initMotionSync();
  });

})();
