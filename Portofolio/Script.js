(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* Jalankan tiap fitur secara terpisah supaya satu error tidak mematikan yang lain */
  const run = (name, fn) => {
    try { fn(); } catch (err) { console.error('[portfolio] ' + name + ' gagal:', err); }
  };

  const header = $('#header');
  const menuBtn = $('#menuBtn');
  const menu = $('#navMenu');
  const toTop = $('#toTop');

  /* Menu mobile (dipakai juga oleh fitur lain, jadi didefinisikan di luar) */
  const setMenu = (open) => {
    if (!menu || !menuBtn) return;
    menu.classList.toggle('open', open);
    menuBtn.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  };

  /* 1. Navbar saat scroll + tombol back to top */
  run('scroll', () => {
    const onScroll = () => {
      if (header) header.classList.toggle('scrolled', window.scrollY > 40);
      if (toTop) toTop.classList.toggle('show', window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  });

  /* 2. Hamburger menu */
  run('menu', () => {
    if (!menu || !menuBtn) return;
    menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
    $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
    window.addEventListener('resize', () => { if (window.innerWidth > 820) setMenu(false); });
  });

  /* 3. Indikator menu aktif */
  run('nav-active', () => {
    if (!menu || !('IntersectionObserver' in window)) return;
    const links = $$('a[href^="#"]', menu);
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(a => {
      const id = a.getAttribute('href');
      const target = id.length > 1 ? $(id) : null;
      if (target) obs.observe(target);
    });
  });

  /* 4. Scroll reveal (class "js" hanya dipasang kalau fitur ini siap) */
  run('reveal', () => {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('js');
    const io = new IntersectionObserver((entries, o) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); o.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(el => io.observe(el));
  });

  /* 5. Filter skills */
  run('skills-filter', () => {
    const chips = $$('.chip');
    const rows = $$('.skill-list li');
    if (!chips.length || !rows.length) return;

    const norm = (t) => {
      t = (t || '').toLowerCase();
      if (t.includes('learn')) return 'learning';
      if (t.includes('interest')) return 'interested';
      if (t.includes('future')) return 'future';
      return 'all';
    };
    const statusOf = (li) => li.dataset.status || norm($('em', li) && $('em', li).textContent);
    const filterOf = (chip) => chip.dataset.filter || norm(chip.textContent);

    const apply = (f) => {
      chips.forEach(c => {
        const on = filterOf(c) === f;
        c.classList.toggle('active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      rows.forEach(li => {
        li.style.display = (f === 'all' || statusOf(li) === f) ? '' : 'none';
      });
      /* Sembunyikan kartu yang semua skill-nya tersembunyi */
      $$('.skills .card').forEach(card => {
        const anyVisible = $$('.skill-list li', card).some(li => li.style.display !== 'none');
        card.style.display = anyVisible ? '' : 'none';
      });
    };

    chips.forEach(chip => chip.addEventListener('click', () => apply(filterOf(chip))));
    apply('all');
  });

  /* 6. Lightbox */
  run('lightbox', () => {
    const lb = $('#lightbox');
    const lbImg = $('#lbImg');
    const lbCap = $('#lbCap');
    const lbClose = $('#lbClose');
    if (!lb || !lbImg) return;
    let lastFocus = null;

    const open = (img) => {
      lastFocus = document.activeElement;
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      if (lbCap) lbCap.textContent = img.alt;
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lbClose) lbClose.focus();
    };
    const close = () => {
      if (lb.hidden) return;
      lb.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    $$('.hobby-btn').forEach(btn => btn.addEventListener('click', () => {
      const img = $('img', btn);
      if (img) open(img);
    }));
    if (lbClose) lbClose.addEventListener('click', close);
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { close(); setMenu(false); }
    });
  });

  /* 7. Tahun otomatis di footer */
  run('year', () => {
    const yr = $('#year');
    if (yr) yr.textContent = new Date().getFullYear();
  });
})();
