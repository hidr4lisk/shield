# Hidr4lisk_Shield

**Credential Security Lab** — herramienta educativa de seguridad de credenciales.
100% client-side · sin analytics · sin backend · sin tracking.

🌐 **[Demo en vivo](https://hidr4lisk.github.io/shield/)** · 🇬🇧 **[Read in English](./README.md)**

---

## Qué es

Una single-page app que le enseña a usuarios no técnicos por qué su contraseña es débil o fuerte, si fue filtrada en breaches conocidos, cómo generar passphrases realmente seguras, y cómo la elección del backend de hashing cambia drásticamente cuánto tarda en romperse.

El principio guía es **privacidad auditable, no privacidad declarada**. Cada decisión técnica debe poder defenderse leyendo el código.

## Módulos

| # | Módulo | Descripción |
|---|--------|-------------|
| 01 | **Password Strength** | Análisis de fortaleza con zxcvbn-ts + wordlist propia del Cono Sur (clubes, jugadores, patrones comunes en español). Entropía, warnings y sugerencias reales — no solo un número. |
| 02 | **Breach Check** | Verifica si una contraseña fue filtrada usando k-anonymity contra la API de HaveIBeenPwned. Solo se envían los primeros 5 chars del hash SHA-1 — la contraseña completa nunca sale del navegador. |
| 03 | **Diceware Generator** | Genera passphrases usando el método Diceware de la EFF (7776 palabras, `crypto.getRandomValues()`). Muestra la tirada de dados real, entropía y tiempo estimado de ruptura. |
| 04 | **Attack Scenarios** | Visualiza cuánto tarda la misma contraseña en romperse en tres escenarios: login online con rate limit (10/s), backend con hash bcrypt moderno (1K/s en GPU), y MD5 sin salt en un rig de varias GPUs (100B/s). |

## Privacidad

- La única conexión externa es `api.pwnedpasswords.com` (módulo 02, k-anonymity)
- Sin cookies, sin `localStorage` sensible, sin fingerprinting
- Todo el procesamiento ocurre en el navegador
- Código auditable en este repositorio
- CSP estricto en `<meta>` bloquea cualquier conexión inesperada
- Auto-clear de inputs sensibles tras 60s de inactividad

## Stack

- **Vanilla JS** — ES modules, sin frameworks
- **Tailwind CSS** — utilidades de layout, design system propio en CSS custom properties
- **esbuild** — bundling de dependencias npm (zxcvbn-ts, wordlist EFF) en los módulos que las necesitan
- **Web Crypto API** — SHA-1 para k-anonymity, `getRandomValues()` para Diceware
- **GitHub Pages** — deploy estático vía GitHub Actions

### Decisiones técnicas

- **¿Por qué vanilla JS sin React?** El bundle se mantiene bajo 200 KB, el código puede leerlo cualquiera aprendiendo frontend, y no hay lock-in con ningún framework. Este es un proyecto educativo — el código es parte del valor.
- **¿Por qué k-anonymity para HIBP?** Porque enviar la contraseña completa (o incluso su hash completo) a cualquier servidor contradice todo el pitch. Con k-anonymity solo los primeros 5 chars del SHA-1 salen del browser, y HIBP devuelve ~800 sufijos para comparar localmente.
- **¿Por qué sin analytics?** Porque "herramienta de privacidad con Google Analytics" es una contradicción. Ni Plausible. Ni un contador de visitas.
- **¿Por qué zxcvbn-ts y no zxcvbn original?** Porque la librería original de Dropbox no tiene mantenimiento, no tiene build ESM nativo, y le faltan traducciones modernas. El rewrite `-ts` está en TypeScript, es modular y moderno.

## Modelo de amenaza

Lo que protege:
- Enviar la contraseña en texto plano a un servidor (nunca sale del navegador)
- Filtrar contra qué contraseña estás chequeando en HIBP (k-anonymity)
- Generación predecible en Diceware (usa `crypto.getRandomValues()`, no `Math.random()`)
- UX que deja la contraseña en pantalla para siempre (auto-clear tras 60s)

Lo que **no** protege:
- Keyloggers o malware en el dispositivo del usuario
- Una extensión de navegador comprometida leyendo los inputs
- Un fork malicioso del sitio que no esté cubierto por el CSP oficial

Detalles completos en [SECURITY.md](./SECURITY.md).

## Correr localmente

```bash
git clone https://github.com/hidr4lisk/shield.git
cd shield
npm install
npm run build
npx serve .
```

Para desarrollo con watch:

```bash
npm run dev:css   # Tailwind en watch
npm run dev:js    # esbuild en watch (módulo strength)
```

## Deploy

El workflow `.github/workflows/deploy.yml` buildea y publica automáticamente a `gh-pages` en cada push a `main`.

## Contribuir

Bug reports, sugerencias o PRs son bienvenidos. Algunas convenciones:
- Cada módulo debe quedar independiente — si uno rompe, los otros siguen funcionando
- Cualquier conexión externa nueva debe justificarse en el CSP y en `SECURITY.md`
- Comentarios en español, nombres de variables en inglés (convención del proyecto)
- Commits en inglés, formato convencional (`feat:`, `fix:`, `docs:`, etc.)

## Créditos

- [Troy Hunt](https://haveibeenpwned.com/) por la API HIBP con el modelo de k-anonymity.
- [Electronic Frontier Foundation](https://www.eff.org/dice) por la wordlist Diceware.
- [Mantenedores de zxcvbn-ts](https://zxcvbn-ts.github.io/zxcvbn/) por la librería moderna de análisis de fortaleza.
- Inspirado en [WARP](https://hidr4lisk.github.io/warp/), otra herramienta del ecosistema `hidr4lisk_`.

## Licencia

MIT — ver [LICENSE](./LICENSE).

---

> Construido por [Federico Furgiuele](https://hidralisk.online) — `hidr4lisk_`
