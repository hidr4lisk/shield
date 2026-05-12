# shield

**Credential Security Lab** — herramienta educativa de seguridad de credenciales.  
100% client-side · sin analytics · sin backend · sin tracking.

🔗 **[hidr4lisk.github.io/shield](https://hidr4lisk.github.io/shield/)**

---

## Módulos

| # | Módulo | Descripción |
|---|--------|-------------|
| 01 | **Password Strength** | Análisis de fortaleza con zxcvbn-ts + wordlist del Cono Sur. Entropía, warnings y sugerencias reales. |
| 02 | **Breach Check** | Verifica si una contraseña fue filtrada usando k-anonymity contra la API de HaveIBeenPwned. El servidor nunca ve la contraseña completa. |
| 03 | **Diceware Generator** | Genera passphrases usando el método Diceware de la EFF (7776 palabras, `crypto.getRandomValues()`). Muestra tirada de dados, entropía y tiempo estimado de ruptura. |
| 04 | **Attack Scenarios** | *(próximamente)* Simulación de escenarios de ataque reales. |

## Privacidad

- La única conexión externa es `api.pwnedpasswords.com` (módulo 02, k-anonymity)
- Sin cookies, sin `localStorage` sensible, sin fingerprinting
- Todo el procesamiento ocurre en el navegador
- Código auditable en este repositorio

## Stack

- **Vanilla JS** — ES modules, sin frameworks
- **Tailwind CSS** — utilidades de layout, design system propio en CSS custom properties
- **esbuild** — bundling de dependencias npm (zxcvbn-ts, EFF wordlist)
- **Web Crypto API** — SHA-1 para k-anonymity, `getRandomValues()` para Diceware
- **GitHub Pages** — deploy estático vía GitHub Actions

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

## Licencia

MIT — ver [LICENSE](LICENSE)
