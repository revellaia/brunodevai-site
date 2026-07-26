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

    // Apply data-i18n
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      const key = el.dataset.i18n;
      if (t[key] !== undefined) {
        el.innerHTML = t[key];
      }
    });

    // Lang button
    const langBtn = document.getElementById('aboutLangBtn');
    if (langBtn) {
      langBtn.textContent = t.nav_lang || 'EN';
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
          f.setAttribute('aria-selected', 'false');
        });
        filter.setAttribute('aria-selected', 'true');

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
    const tabs = document.querySelectorAll('.about-area-tab');
    const panels = document.querySelectorAll('.about-area-panel');

    if (!tabs.length || !panels.length) return;

    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        const target = tab.dataset.tab;

        tabs.forEach(function(t) {
          t.setAttribute('aria-selected', 'false');
        });
        tab.setAttribute('aria-selected', 'true');

        panels.forEach(function(p) {
          p.classList.remove('active');
        });
        document.getElementById(target).classList.add('active');
      });
    });
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
    if (mobileDrawer) {
      // Focus trap when drawer opens
      const observer = new MutationObserver(function() {
        if (mobileDrawer.classList.contains('open')) {
          const firstLink = mobileDrawer.querySelector('a');
          if (firstLink) {
            setTimeout(function() { firstLink.focus(); }, 100);
          }
        }
      });
      observer.observe(mobileDrawer, { attributes: true, attributeFilter: ['class'] });
    }
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
    }
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