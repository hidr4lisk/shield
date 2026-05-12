import { initI18n, setLang, getLang, getStrings } from './core/i18n.js';

// Inicializar idioma (detecta localStorage → navigator.language → ES)
await initI18n();

// Botones de cambio de idioma en el top bar
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => setLang(btn.dataset.lang));
});

// Scrollspy — resalta el módulo activo en la nav según el scroll
const sections = document.querySelectorAll('.module-section');
const navLinks  = document.querySelectorAll('.module-nav__item');

if (sections.length && navLinks.length) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach(a => {
        const active = a.getAttribute('href') === `#${id}`;
        a.classList.toggle('active', active);
        a.setAttribute('aria-current', active ? 'true' : 'false');
      });
    });
  }, {
    rootMargin: '-88px 0px -50% 0px',
    threshold: 0,
  });

  sections.forEach(s => observer.observe(s));
}

// Inicializar módulo 1 — importado como bundle separado (esbuild)
try {
  const { init } = await import('../dist/modules/strength/index.js');
  init(document.getElementById('strength'), {
    lang:    getLang(),
    strings: getStrings(),
  });
} catch (err) {
  console.error('[shield] módulo strength no disponible:', err);
}

// Inicializar módulo 2 — sin dependencias npm, servido directamente
try {
  const { init: initPwned } = await import('./modules/pwned/index.js');
  initPwned(document.getElementById('pwned'), {
    lang:    getLang(),
    strings: getStrings(),
  });
} catch (err) {
  console.error('[shield] módulo pwned no disponible:', err);
}

// Inicializar módulo 3 — bundle separado (esbuild), wordlist lazy-loaded
try {
  const { init: initDiceware } = await import('../dist/modules/diceware/index.js');
  initDiceware(document.getElementById('diceware'), {
    lang:    getLang(),
    strings: getStrings(),
  });
} catch (err) {
  console.error('[shield] módulo diceware no disponible:', err);
}

// Inicializar módulo 4 — sin dependencias npm, servido directamente
try {
  const { init: initAttack } = await import('./modules/attack-scenarios/index.js');
  initAttack(document.getElementById('attack'), {
    lang:    getLang(),
    strings: getStrings(),
  });
} catch (err) {
  console.error('[shield] módulo attack-scenarios no disponible:', err);
}
