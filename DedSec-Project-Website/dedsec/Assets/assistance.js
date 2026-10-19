(() => {
  'use strict';

  const isGreek = () => document.documentElement.lang.toLowerCase().startsWith('el');
  const normalize = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9α-ω:+._/-]+/gi, ' ')
    .trim();

  const copyText = async (text) => {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.inset = '-1000px auto auto -1000px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus({ preventScroll: true });
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    if (!copied) throw new Error('Copy failed');
  };

  const feedback = (button, success, successEn, successEl) => {
    const original = button.textContent;
    button.textContent = success
      ? (isGreek() ? successEl : successEn)
      : (isGreek() ? 'Η αντιγραφή απέτυχε' : 'Copy failed');
    button.classList.toggle('copy-success', success);
    button.classList.toggle('copy-fail', !success);
    window.setTimeout(() => {
      button.textContent = original;
      button.classList.remove('copy-success', 'copy-fail');
    }, 1800);
  };

  const initCodeCopy = () => {
    document.querySelectorAll('.assistance-code-copy').forEach((button) => {
      button.addEventListener('click', async () => {
        const code = button.closest('.assistance-code')?.querySelector('code');
        const text = code?.textContent?.trim();
        if (!text) return;
        try {
          await copyText(text);
          feedback(button, true, 'Commands copied', 'Οι εντολές αντιγράφηκαν');
        } catch (_) {
          feedback(button, false, '', '');
        }
      });
    });
  };

  const initSupportReports = () => {
    document.querySelectorAll('.assistance-report-btn').forEach((button) => {
      button.addEventListener('click', async () => {
        const title = isGreek() ? button.dataset.guideTitleGr : button.dataset.guideTitleEn;
        const report = isGreek()
          ? `Οδηγός: ${title}\nΣυσκευή / έκδοση Android:\nΠηγή και έκδοση Termux:\nΑκριβής εντολή:\nΤρέχων φάκελος (pwd):\nΈκδοση runtime / πακέτου:\nΠλήρες error ή output:\nΤι δοκίμασα ήδη:\nΤι άλλαξε πριν εμφανιστεί:\n\nΑφαίρεσα passwords, tokens, private keys, ακριβείς προσωπικές διαδρομές και προσωπικά στοιχεία: ΝΑΙ / ΟΧΙ`
          : `Guide: ${title}\nDevice / Android version:\nTermux source and version:\nExact command:\nCurrent folder (pwd):\nRuntime / package version:\nComplete error or output:\nWhat I already tried:\nWhat changed before it appeared:\n\nPasswords, tokens, private keys, exact personal paths, and personal information removed: YES / NO`;
        try {
          await copyText(report);
          feedback(button, true, 'Support report copied', 'Η αναφορά αντιγράφηκε');
        } catch (_) {
          feedback(button, false, '', '');
        }
      });
    });
  };

  // One searchable bilingual guide list: no categories or collapsed guide sections.
  const initFinder = () => {
    const search = document.getElementById('assistance-search');
    const cards = [...document.querySelectorAll('.assistance-flat-grid .assistance-card')];
    const status = document.getElementById('assistance-results-status');
    const noResults = document.getElementById('assistance-no-results');
    if (!search || !cards.length) return;

    const apply = () => {
      const needle = normalize(search.value);
      let count = 0;
      for (const card of cards) {
        const haystack = normalize([card.dataset.search, card.dataset.title,
          card.dataset.signatures, card.textContent].join(' '));
        const matches = !needle || haystack.includes(needle);
        card.hidden = !matches;
        card.classList.toggle('is-filtered-out', !matches);
        if (matches) count++;
      }
      if (status) {
        status.textContent = isGreek()
          ? `${count} ${count === 1 ? 'οδηγός' : 'οδηγοί'} ${needle ? 'βρέθηκαν' : 'διαθέσιμοι'}.`
          : `${count} ${count === 1 ? 'guide' : 'guides'} ${needle ? 'found' : 'available'}.`;
      }
      if (noResults) noResults.hidden = count > 0;
    };

    search.addEventListener('input', apply);
    search.addEventListener('keydown', event => {
      if (event.key === 'Escape' && search.value) {
        search.value = '';
        apply();
      }
    });
    apply();
  };

  const initNavigationAccessibility = () => {
    const burger = document.getElementById('burger-menu');
    const menu = document.getElementById('nav-menu');
    if (!burger || !menu) return;
    const sync = () => burger.setAttribute('aria-expanded', String(menu.classList.contains('active')));
    burger.setAttribute('aria-controls', 'nav-menu');
    sync();
    burger.addEventListener('click', () => window.setTimeout(sync, 0));
    const observer = new MutationObserver(sync);
    observer.observe(menu, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !menu.classList.contains('active')) return;
      menu.classList.remove('active');
      burger.classList.remove('active');
      sync();
      burger.focus();
    });
  };

  const init = () => {
    initCodeCopy();
    initSupportReports();
    initFinder();
    initNavigationAccessibility();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
