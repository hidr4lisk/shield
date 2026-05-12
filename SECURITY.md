# Security Policy

## Threat Model

Hidr4lisk_Shield is a **client-side-only** educational tool. No data is sent to any server except:

- A k-anonymity prefix query to `api.pwnedpasswords.com` when the user explicitly requests a breach check.
  The request contains only the first 5 characters of the SHA-1 hash of the password. The full password never leaves the browser.

**What this tool does NOT protect against:**
- Keyloggers or malware on the user's device.
- A compromised browser extension reading input values.
- A malicious fork of this site not covered by the `Content-Security-Policy` header.

Users should verify they are on the official deployment (`https://hidr4lisk.github.io/shield/`) and can audit the source at `https://github.com/hidr4lisk/shield`.

## Reporting a Vulnerability

If you discover a security issue (XSS, CSP bypass, data leakage, etc.), please open a GitHub issue with the label `security` or email `hidralisk.online@gmail.com`.

Do not publicly disclose vulnerabilities before they are acknowledged.
