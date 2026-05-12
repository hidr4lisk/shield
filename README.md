# Hidr4lisk_Shield

**Credential Security Lab** — an educational tool for credential security.
100% client-side · no analytics · no backend · no tracking.

🌐 **[Live demo](https://hidr4lisk.github.io/shield/)** · 🇦🇷 **[Leer en español](./README.es.md)**

---

## What it is

A single-page web app that teaches non-technical users why their passwords are weak or strong, whether they've been leaked in known breaches, how to generate truly secure passphrases, and how the choice of backend hashing dramatically changes the time it takes to crack them.

The whole point is **auditable privacy, not declared privacy**. Every technical decision is meant to be defensible by reading the source code.

## Modules

| # | Module | Description |
|---|--------|-------------|
| 01 | **Password Strength** | Strength analysis with zxcvbn-ts plus a custom wordlist for the Southern Cone (clubs, players, common patterns in Spanish). Returns entropy, warnings and real suggestions — not just a number. |
| 02 | **Breach Check** | Checks if a password was leaked using k-anonymity against the HaveIBeenPwned API. The server only sees the first 5 chars of the SHA-1 hash — the full password never leaves the browser. |
| 03 | **Diceware Generator** | Generates passphrases using the EFF Diceware method (7776 words, `crypto.getRandomValues()`). Shows the actual dice rolls, entropy and estimated crack time. |
| 04 | **Attack Scenarios** | Visualizes how long the same password would take to crack across three scenarios: rate-limited online login (10/s), modern bcrypt hash on GPU (1K/s), and unsalted MD5 on a multi-GPU rig (100B/s). |

## Privacy

- The only external connection is `api.pwnedpasswords.com` (module 02, k-anonymity)
- No cookies, no sensitive `localStorage`, no fingerprinting
- All processing happens in the browser
- Source code is auditable in this repo
- Strict CSP in `<meta>` blocks any unexpected connection
- Auto-clear of sensitive inputs after 60s of inactivity

## Stack

- **Vanilla JS** — ES modules, no frameworks
- **Tailwind CSS** — layout utilities, custom design system via CSS custom properties
- **esbuild** — bundles npm dependencies (zxcvbn-ts, EFF wordlist) for modules that need them
- **Web Crypto API** — SHA-1 for k-anonymity, `getRandomValues()` for Diceware
- **GitHub Pages** — static deploy via GitHub Actions

### Technical decisions

- **Why vanilla JS, no React?** The bundle stays under 200 KB, the source can be read by anyone learning frontend, and there's no framework lock-in. This is an educational project — the code is part of the value.
- **Why k-anonymity for HIBP?** Because sending the full password (or even its full hash) to any server contradicts the whole premise. With k-anonymity only the first 5 hex characters of the SHA-1 leave the browser, and HIBP returns ~800 suffixes for the client to compare locally.
- **Why no analytics?** Because "privacy tool with Google Analytics" is a contradiction. Not even Plausible. Not even a hit counter.
- **Why zxcvbn-ts instead of the original zxcvbn?** Because the original Dropbox library is unmaintained, has no native ESM build, and doesn't include modern translations. The `-ts` rewrite is TypeScript, modular, modern.

## Threat model

What it protects against:
- Sending the password to a server in plaintext (it never leaves the browser)
- Leaking which password you're checking against HIBP (k-anonymity)
- Predictable Diceware generation (uses `crypto.getRandomValues()`, not `Math.random()`)
- Bad UX leading to leaving the password on screen forever (auto-clear after 60s)

What it does **not** protect against:
- Keyloggers or malware on the user's device
- A compromised browser extension reading input values
- A malicious fork of the site not covered by the official CSP

Full details in [SECURITY.md](./SECURITY.md).

## Run it locally

```bash
git clone https://github.com/hidr4lisk/shield.git
cd shield
npm install
npm run build
npx serve .
```

For development with watch mode:

```bash
npm run dev:css   # Tailwind in watch
npm run dev:js    # esbuild in watch (strength module)
```

## Deploy

The `.github/workflows/deploy.yml` workflow builds and publishes to `gh-pages` on every push to `main`.

## Contributing

Bug reports, suggestions or PRs are welcome. A few guidelines:
- Each module should remain independent — if one breaks, the others keep working
- New external connections must be justified in the CSP and `SECURITY.md`
- Comments in Spanish, variable names in English (project convention)
- Commits in English, conventional format (`feat:`, `fix:`, `docs:`, etc.)

## Credits

- [Troy Hunt](https://haveibeenpwned.com/) for the HIBP API with k-anonymity model.
- [Electronic Frontier Foundation](https://www.eff.org/dice) for the Diceware wordlist.
- [zxcvbn-ts maintainers](https://zxcvbn-ts.github.io/zxcvbn/) for the modern strength-analysis library.
- Inspired by [WARP](https://hidr4lisk.github.io/warp/), another tool in the `hidr4lisk_` ecosystem.

## License

MIT — see [LICENSE](./LICENSE).

---

> Built by [Federico Furgiuele](https://hidralisk.online) — `hidr4lisk_`
