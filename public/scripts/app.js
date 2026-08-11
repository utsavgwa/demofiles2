/*
 * Site-wide progressive enhancement. Every page is readable and navigable without this file.
 *
 * Four behaviours: the mobile menu, carousel pagination, scroll reveals, and the legal
 * table-of-contents highlight. Each is opt-in via markup, so nothing runs on a page that
 * does not use it.
 */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------- mobile menu */

  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('mobile-nav');
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      nav.hidden = !open;
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Escape closes the menu and returns focus to the control that opened it.
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* ------------------------------------------------------------ carousels */

  function initCarousel(root) {
    var track = root.querySelector('.carousel-track');
    var dots = root.querySelector('.carousel-dots');
    if (!track || !dots) return;

    var pageWidth = function () {
      return track.clientWidth || 1;
    };
    var pageCount = function () {
      return Math.max(1, Math.ceil(track.scrollWidth / pageWidth()));
    };
    var currentPage = function () {
      return Math.round(track.scrollLeft / pageWidth());
    };

    function renderDots() {
      var count = pageCount();
      dots.hidden = count < 2;
      if (count < 2) {
        dots.textContent = '';
        return;
      }
      dots.textContent = '';
      for (var i = 0; i < count; i++) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Show items ' + (i + 1) + ' of ' + count);
        dot.setAttribute('aria-selected', String(i === currentPage()));
        dot.dataset.index = String(i);
        dots.appendChild(dot);
      }
    }

    function syncDots() {
      var active = currentPage();
      Array.prototype.forEach.call(dots.children, function (dot, i) {
        dot.setAttribute('aria-selected', String(i === active));
      });
    }

    dots.addEventListener('click', function (event) {
      var dot = event.target.closest('.carousel-dot');
      if (!dot) return;
      track.scrollTo({
        left: Number(dot.dataset.index) * pageWidth(),
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    });

    // Arrow keys page the track when focus is inside the dot strip.
    dots.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      var next = currentPage() + (event.key === 'ArrowRight' ? 1 : -1);
      var clamped = Math.min(Math.max(next, 0), pageCount() - 1);
      track.scrollTo({ left: clamped * pageWidth(), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      var target = dots.children[clamped];
      if (target) target.focus();
    });

    track.addEventListener('scroll', debounce(syncDots, 80));
    window.addEventListener('resize', debounce(renderDots, 150));
    renderDots();
  }

  /* -------------------------------------------------------- scroll reveal */

  // Elements are tagged here rather than in the templates so the markup stays semantic and
  // the animation can be removed in one place. Content is visible by default in CSS; the
  // "pre-reveal" state is only applied once we know JS and IntersectionObserver are available.
  var REVEAL_SELECTOR = [
    '.section > .container > .heading',
    '.section > .container > .preheading',
    '.card',
    '.blog-card',
    '.testimonial-card',
    '.plan-card',
    '.principle',
    '.book-group',
    '.compare-table',
    '.prose',
    '.hero-figure',
  ].join(',');

  function initReveals() {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

    var targets = Array.prototype.slice.call(document.querySelectorAll(REVEAL_SELECTOR));
    if (!targets.length) return;

    document.documentElement.classList.add('reveal-enabled');

    // Anything already on screen at first paint is shown immediately: animating it would
    // flash the page in front of someone who has not scrolled yet.
    var viewportHeight = window.innerHeight;
    targets.forEach(function (el) {
      el.classList.add('reveal');
      if (el.getBoundingClientRect().top < viewportHeight * 0.9) el.classList.add('is-visible');
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ------------------------------------------------- legal contents rail */

  function initTocHighlight() {
    var toc = document.querySelector('.legal-toc');
    if (!toc || !('IntersectionObserver' in window)) return;

    var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
    var sections = links
      .map(function (link) {
        return document.getElementById(link.hash.slice(1));
      })
      .filter(Boolean);
    if (!sections.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = toc.querySelector('a[href="#' + entry.target.id + '"]');
          if (!link) return;
          if (entry.isIntersecting) {
            links.forEach(function (l) {
              l.removeAttribute('aria-current');
            });
            link.setAttribute('aria-current', 'true');
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ---------------------------------------------------- footer easter egg */

  function initInkwell() {
    var inkwell = document.querySelector('.footer-inkwell');
    if (!inkwell) return;
    inkwell.addEventListener('click', function () {
      inkwell.classList.remove('shake');
      void inkwell.offsetWidth; // force reflow so the animation can restart
      inkwell.classList.add('shake');
    });
  }

  /* ---------------------------------------------------------------- utils */

  function debounce(fn, wait) {
    var timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, wait);
    };
  }

  /* ----------------------------------------------------------------- boot */

  initMobileNav();
  document.querySelectorAll('[data-carousel]').forEach(initCarousel);
  initReveals();
  initTocHighlight();
  initInkwell();
})();
