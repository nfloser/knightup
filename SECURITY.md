# Security

Do not post private game diagnostics, tokens or personal reports in public issues. This foundation accepts only bounded JSON backups with known versioned completion IDs. No remote data collection is implemented. Future archive integration must validate API responses and preserve derived-report privacy.

Run `npm audit` and `npm audit --omit=dev` before dependency changes. CI blocks high/critical advisories. Build-time moderate/low transitive advisories are tracked in docs/ARCHITECTURE.md; untrusted files must never be fed into build configuration.
