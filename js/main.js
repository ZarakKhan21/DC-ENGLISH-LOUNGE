/* ============================================================
   DC ENGLISH LOUNGE — MAIN JAVASCRIPT
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ===================== NAVBAR SCROLL ===================== */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
        navbar.classList.remove('transparent');
      } else {
        navbar.classList.remove('scrolled');
        // Only add transparent on homepage
        if (document.body.classList.contains('page-home')) {
          navbar.classList.add('transparent');
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Run on load
  }

  /* ===================== HAMBURGER MENU ===================== */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen.toString());
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    mobileMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ===================== SCROLL REVEAL ===================== */
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, i * 80);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealElements.forEach(el => observer.observe(el));
  }

  /* ===================== REVIEWS SLIDER ===================== */
  const track      = document.getElementById('reviewsTrack');
  const prevBtn    = document.getElementById('reviewsPrev');
  const nextBtn    = document.getElementById('reviewsNext');
  const dotsWrap   = document.getElementById('reviewsDots');

  if (track && prevBtn && nextBtn) {
    const cards     = Array.from(track.querySelectorAll('.review-card'));
    let current     = 0;
    let autoTimer   = null;

    // How many visible at once
    const getVisible = () => {
      if (window.innerWidth < 768) return 1;
      if (window.innerWidth < 1024) return 2;
      return 3;
    };

    const totalSlides = () => {
      const vis = getVisible();
      return Math.max(1, cards.length - vis + 1);
    };

    // Build dots
    const buildDots = () => {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      const n = totalSlides();
      for (let i = 0; i < n; i++) {
        const dot = document.createElement('button');
        dot.className = 'reviews-dot' + (i === current ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      }
    };

    const goTo = (idx) => {
      const n = totalSlides();
      current = Math.max(0, Math.min(idx, n - 1));
      if (cards.length === 0) return;
      
      // Calculate actual card width including gap
      const trackStyle = getComputedStyle(track);
      const gap = parseInt(trackStyle.gap) || 24;
      const cardW = cards[0].offsetWidth + gap;
      
      track.style.transform = `translateX(-${current * cardW}px)`;
      // Update dots
      if (dotsWrap) {
        dotsWrap.querySelectorAll('.reviews-dot').forEach((d, i) => {
          d.classList.toggle('active', i === current);
        });
      }
    };

    prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

    const startAuto = () => {
      autoTimer = setInterval(() => {
        if (current >= totalSlides() - 1) {
          goTo(0);
        } else {
          goTo(current + 1);
        }
      }, 5000);
    };
    const resetAuto = () => {
      clearInterval(autoTimer);
      startAuto();
    };

    buildDots();
    startAuto();

    // Rebuild on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { current = 0; buildDots(); goTo(0); }, 200);
    });

    // Touch/swipe support
    let startX = 0;
    let startY = 0;
    let isSwiping = false;
    track.addEventListener('touchstart', e => { 
      startX = e.touches[0].clientX; 
      startY = e.touches[0].clientY;
      isSwiping = true;
    }, { passive: true });
    track.addEventListener('touchmove', e => {
      if (!isSwiping) return;
      const diffX = Math.abs(e.touches[0].clientX - startX);
      const diffY = Math.abs(e.touches[0].clientY - startY);
      if (diffY > diffX) isSwiping = false;
    }, { passive: true });
    track.addEventListener('touchend', e => {
      if (!isSwiping) return;
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { 
        diff > 0 ? goTo(current + 1) : goTo(current - 1); 
        resetAuto();
      }
      isSwiping = false;
    });
  }

  /* ===================== COURSE TABS ===================== */
  const tabs   = document.querySelectorAll('.course-tab');
  const panels = document.querySelectorAll('.course-tab-panel');

  if (tabs.length > 0) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;

        // Update tabs
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        // Update panels
        panels.forEach(p => p.classList.remove('active'));
        const targetPanel = document.getElementById(target);
        if (targetPanel) targetPanel.classList.add('active');
      });
    });
  }

  /* ===================== CONTACT FORM ===================== */
  // Form submission is handled by an inline script in contact.html
  // (mailto: handler — no backend required)

  /* ===================== SMOOTH SCROLL (anchors) ===================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ===================== COUNTER ANIMATION ===================== */
  const statNums = document.querySelectorAll('.stat-num, .about-stat-num, .sa-stat-num');
  if (statNums.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const text = el.textContent;
          const match = text.match(/\d+/);
          if (match) {
            const target = parseInt(match[0]);
            const suffix = text.replace(match[0], '');
            let count = 0;
            const step = Math.max(1, Math.floor(target / 60));
            const timer = setInterval(() => {
              count = Math.min(count + step, target);
              el.textContent = count + suffix;
              if (count >= target) clearInterval(timer);
            }, 25);
          }
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    statNums.forEach(n => counterObserver.observe(n));
  }

  /* ===================== MARQUEE PAUSE ON HOVER ===================== */
  const marqueeTrack = document.querySelector('.marquee-track');
  if (marqueeTrack) {
    marqueeTrack.addEventListener('mouseenter', () => marqueeTrack.style.animationPlayState = 'paused');
    marqueeTrack.addEventListener('mouseleave', () => marqueeTrack.style.animationPlayState = 'running');
  }

  /* ===================== ACTIVE NAV LINK ===================== */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link:not(.nav-cta)').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

});
