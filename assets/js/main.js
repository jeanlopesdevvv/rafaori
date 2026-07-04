/**
 * main.js — Rafael França Advocacia
 * Interações, animações e comportamentos do site principal
 * v3.0.0
 */

(function () {
  'use strict';

  /* ============================================
     1. AOS INIT
  ============================================ */
  AOS.init({
    duration: 700,
    easing: 'ease-out-cubic',
    once: true,
    offset: 60,
  });

  /* ============================================
     2. HEADER: SCROLL + PROGRESS BAR
  ============================================ */
  const header       = document.getElementById('header');
  const progressBar  = document.getElementById('scroll-progress');

  function onScroll() {
    const scrollY    = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const progress   = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

    if (header) {
      header.classList.toggle('scrolled', scrollY > 40);
    }
    if (progressBar) {
      progressBar.style.width = progress + '%';
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ============================================
     3. HERO: MOUSE GLOW
  ============================================ */
  const heroSection = document.getElementById('hero');
  const heroGlow    = document.getElementById('hero-glow');

  if (heroSection && heroGlow) {
    heroSection.addEventListener('mousemove', function (e) {
      const rect = heroSection.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      heroGlow.style.left = x + 'px';
      heroGlow.style.top  = y + 'px';
    });
  }

  /* ============================================
     4. HERO: FADE-UP SEQUENCIAL
  ============================================ */
  const fadeEls = document.querySelectorAll('.fade-up-init');
  if (fadeEls.length > 0) {
    let delay = 80;
    fadeEls.forEach(function (el) {
      setTimeout(function () {
        el.classList.remove('fade-up-init');
        el.classList.add('fade-up-done');
      }, delay);
      delay += 120;
    });
  }

  /* ============================================
     5. HERO: PARTÍCULAS FLUTUANTES
  ============================================ */
  const particlesContainer = document.getElementById('particles');
  if (particlesContainer) {
    const PARTICLE_COUNT = 22;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = document.createElement('div');
      const size = Math.random() * 3 + 1;
      const x    = Math.random() * 100;
      const y    = Math.random() * 100;
      const dur  = Math.random() * 12 + 8;
      const del  = Math.random() * 6;
      const op   = Math.random() * 0.25 + 0.05;

      p.style.cssText = [
        'position:absolute',
        'border-radius:50%',
        'pointer-events:none',
        'background:' + (Math.random() > 0.6 ? '#10B981' : '#C3A166'),
        'width:' + size + 'px',
        'height:' + size + 'px',
        'left:' + x + '%',
        'top:' + y + '%',
        'opacity:' + op,
        'animation:float-particle ' + dur + 's ' + del + 's ease-in-out infinite alternate',
      ].join(';');

      particlesContainer.appendChild(p);
    }

    // Injetar keyframes se necessário
    if (!document.getElementById('particle-style')) {
      const style = document.createElement('style');
      style.id = 'particle-style';
      style.textContent = '@keyframes float-particle{0%{transform:translateY(0) scale(1)}100%{transform:translateY(-28px) scale(1.15)}}';
      document.head.appendChild(style);
    }
  }

  /* ============================================
     6. HERO: CONTADOR ANIMADO
  ============================================ */
  function animateCounter(el, target, duration) {
    const start = performance.now();
    const update = function (time) {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(progress * target);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  // IntersectionObserver para disparar contadores ao entrar na viewport
  const statsSection = document.getElementById('hero-stats');
  if (statsSection && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const counters = entry.target.querySelectorAll('[data-count]');
          counters.forEach(function (el) {
            const target = parseInt(el.getAttribute('data-count'), 10);
            animateCounter(el, target, 1800);
          });
          counterObserver.disconnect();
        }
      });
    }, { threshold: 0.3 });

    counterObserver.observe(statsSection);
  }

  /* ============================================
     7. MOBILE MENU
  ============================================ */
  const hamburger        = document.getElementById('hamburger');
  const mobileMenu       = document.getElementById('mobile-menu-overlay');
  const mobileClose      = document.getElementById('mobile-menu-close');
  const mobileLinks      = mobileMenu ? mobileMenu.querySelectorAll('.mobile-menu__link') : [];

  function openMenu() {
    if (!mobileMenu || !hamburger) return;
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Focus trap
    const firstFocusable = mobileMenu.querySelector('button, a, input');
    if (firstFocusable) firstFocusable.focus();
  }

  function closeMenu() {
    if (!mobileMenu || !hamburger) return;
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  if (hamburger) hamburger.addEventListener('click', openMenu);
  if (mobileClose) mobileClose.addEventListener('click', closeMenu);

  mobileLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Fechar com ESC
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('is-open')) {
      closeMenu();
    }
  });

  /* ============================================
     8. FAQ ACCORDION
  ============================================ */
  const faqList = document.getElementById('faq-list');
  if (faqList) {
    faqList.addEventListener('click', function (e) {
      const btn = e.target.closest('.faq__question');
      if (!btn) return;

      const item   = btn.closest('.faq__item');
      const answer = item.querySelector('.faq__answer');
      const isOpen = item.classList.contains('is-open');

      // Fechar todos
      faqList.querySelectorAll('.faq__item.is-open').forEach(function (openItem) {
        openItem.classList.remove('is-open');
        openItem.querySelector('.faq__answer').style.maxHeight = '0';
        openItem.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
        openItem.querySelector('.faq__answer').setAttribute('aria-hidden', 'true');
      });

      // Abrir clicado (se estava fechado)
      if (!isOpen) {
        item.classList.add('is-open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
        answer.setAttribute('aria-hidden', 'false');
      }
    });
  }

  /* ============================================
     9. SMOOTH SCROLL PARA ÂNCORAS
  ============================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerHeight = 72;
        const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ============================================
     10. BLOG PREVIEW — RENDERIZAR DO CMS
  ============================================ */
  function renderBlogPreview() {
    const grid = document.getElementById('blog-preview-grid');
    if (!grid || typeof CMS === 'undefined') return;

    const posts = CMS.getPosts({ limit: 3, status: 'published' });

    if (posts.length === 0) {
      // Placeholder com artigos de exemplo
      const placeholders = [
        {
          title: 'Demitido Sem Receber Tudo? Entenda Seus Direitos em 5 Minutos',
          date: '04 Jul 2026',
          excerpt: 'Saber quais verbas rescisórias são devidas pode valer milhares de reais. Veja o que a lei garante a você.',
          category: 'Trabalhista',
          slug: null,
        },
        {
          title: 'Plano de Saúde Negou Tratamento? Veja Como Agir Agora',
          date: '01 Jul 2026',
          excerpt: 'Uma liminar judicial pode garantir seu tratamento em 24 a 72 horas. Entenda como funciona esse processo.',
          category: 'Saúde',
          slug: null,
        },
        {
          title: 'Minha Conta Foi Bloqueada Judicialmente: O Que Fazer?',
          date: '27 Jun 2026',
          excerpt: 'O bloqueio Sisbajud pode ser revertido. Saiba quais são seus direitos e como agir rapidamente.',
          category: 'Bancário',
          slug: null,
        },
      ];

      grid.innerHTML = placeholders.map(function (p) {
        return (
          '<article class="blog-card">' +
          '<div class="blog-card__body">' +
          '<div class="blog-card__date">' + p.category + ' · ' + p.date + '</div>' +
          '<h3 class="blog-card__title">' + escapeHtml(p.title) + '</h3>' +
          '<p class="blog-card__excerpt">' + escapeHtml(p.excerpt) + '</p>' +
          '<a href="blog.html" class="blog-card__read">Ler no Blog <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>' +
          '</div></article>'
        );
      }).join('');
      return;
    }

    grid.innerHTML = posts.map(function (post) {
      const thumb = post.coverUrl
        ? '<div class="blog-card__thumb"><img src="' + escapeHtml(post.coverUrl) + '" alt="' + escapeHtml(post.title) + '" loading="lazy" /></div>'
        : '';
      return (
        '<article class="blog-card">' +
        thumb +
        '<div class="blog-card__body">' +
        '<div class="blog-card__date">' + escapeHtml(post.category || 'Jurídico') + ' · ' + formatDate(post.date || post.publishedAt) + '</div>' +
        '<h3 class="blog-card__title">' + escapeHtml(post.title) + '</h3>' +
        '<p class="blog-card__excerpt">' + escapeHtml(post.excerpt || '') + '</p>' +
        '<a href="post.html?id=' + encodeURIComponent(post.id) + '" class="blog-card__read">Ler Artigo <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>' +
        '</div></article>'
      );
    }).join('');
  }

  function formatDate(ts) {
    if (!ts) return '';
    try {
      let d;
      if (typeof ts === 'string' && ts.includes('-') && !ts.includes('T')) {
        const parts = ts.split('-');
        d = new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
        d = new Date(ts);
      }
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (_) { return ts; }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Carregar blog preview após CMS estar disponível
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderBlogPreview);
  } else {
    renderBlogPreview();
  }

})();
