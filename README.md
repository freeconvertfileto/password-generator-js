# Password Generator

Generate cryptographically random passwords with configurable length, character sets, and quantity, plus integrated MD5/SHA hash generation and bcrypt hashing via bcryptjs, entirely in the browser.

**Live Demo:** https://file-converter-free.com/en/developer-tools/password-generator-online

## How It Works

`generatePassword(length, charset)` fills a `Uint32Array` of the required length using `crypto.getRandomValues(arr)`, then maps each value to `charset[arr[i] % charset.length]` to produce an unbiased random character selection. The charset is assembled from up to four pools: uppercase (26), lowercase (26), digits (10), and symbols (27 characters). `getStrength(password)` scores 0-6 based on length thresholds (12, 16), presence of uppercase/lowercase/digits/symbols, producing four labels (Weak/Fair/Good/Strong). A separate hash section uses a pure-JS MD5 plus `crypto.subtle.digest` for SHA-1/256/512. A bcrypt section wraps the `dcodeIO.bcrypt` (bcryptjs) CDN library for `hashSync` and `compareSync` with configurable cost (4-14 rounds), run via `setTimeout` to allow the UI to render a spinner before the blocking computation.

## Features

- `crypto.getRandomValues` for unbiased random character selection
- Configurable length (slider), quantity (1-20), and character sets
- Per-password strength label (Weak/Fair/Good/Strong)
- Per-password copy button
- Integrated hash tool: MD5 (pure JS), SHA-1/256/512 (SubtleCrypto), live on input
- Hash verifier: compare plaintext against a known hash
- bcrypt hash generator and verifier (via bcryptjs CDN library)

## Browser APIs Used

- Web Crypto API (`crypto.getRandomValues`, `crypto.subtle.digest`)
- Clipboard API (`navigator.clipboard.writeText`)

## Code Structure

| File | Description |
|------|-------------|
| `password-generator.js` | `generatePassword` (`Uint32Array` + `crypto.getRandomValues`, modulo charset), `getStrength` 6-point scorer, pure-JS `md5`, async `hashSHA` via SubtleCrypto, `BCRYPT` wrapper for bcryptjs `hashSync`/`compareSync` |

## Usage

| Element ID / Selector | Purpose |
|----------------------|---------|
| `#passLength` | Password length slider |
| `#passCount` | Number of passwords |
| `#passUpper`, `#passLower`, `#passNumbers`, `#passSymbols` | Character set checkboxes |
| `#passGenerate` | Generate button |
| `#passOutput` | Generated passwords list |
| `#hasherInput` | Hash tool text input |
| `#hasherOutput` | Hash results (MD5/SHA-1/256/512) |
| `#verifyPlain`, `#verifyHash` | Hash verifier inputs |
| `#bcryptInput` | bcrypt password input |
| `#bcryptCost` | bcrypt cost slider (4-14) |
| `#bcryptGenBtn` | Generate bcrypt hash |
| `#bcryptVerifyPlain`, `#bcryptVerifyHash` | bcrypt verifier inputs |

## License

MIT
