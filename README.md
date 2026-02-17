# Egyptian Arabic Transliteration Engine

This repository contains a single rule-based transliteration engine for Arabic text:

- Function: `STRICT_ARABIZI(text)`
- File: `/Users/tom/Documents/GitHub/egypt-transliterate/Code.gs`

The engine is deterministic and rule-ordered. It is designed for practical, consistent output rather than academic transliteration.

## What It Produces

The output is mixed Arabizi/Latin and is not strictly ASCII.

- Arabizi-style symbols: `2`, `3`, `5`, `7`, `8`
- Latin digraphs: `sh`
- Extended Latin characters: `ā`, `ã`, `ś`, `ź`

Examples:

- `هذا -> hāźā`
- `الشمس -> ish-shms`
- `القمر -> il-'mr`
- `بالشمس -> bish-shms`
- `فالقمر -> fil-'mr`

## API

### Google Apps Script function

```javascript
STRICT_ARABIZI(text: any): string
```

- Returns `""` for falsy input.
- Otherwise converts input to string and transliterates character-by-character with rule overrides.

## Character Mapping

### Hamza forms

- `ء -> 2`
- `أ -> 2`
- `إ -> 2`
- `ؤ -> 2`
- `ئ -> 2`
- `آ -> 2ã`

### Main consonants

- `ب -> b`
- `ت -> t`
- `ث -> ś`
- `ج -> g`
- `ح -> 7`
- `خ -> 5`
- `د -> d`
- `ذ -> ź`
- `ر -> r`
- `ز -> z`
- `س -> s`
- `ش -> sh`
- `ص -> S`
- `ض -> D`
- `ط -> T`
- `ظ -> Z`
- `ع -> 3`
- `غ -> 8`
- `ف -> f`
- `ق -> '`
- `ك -> k`
- `ل -> l`
- `م -> m`
- `ن -> n`
- `ه -> h`
- `و -> w`
- `ي -> y`
- `ى -> ā`

### Diacritics

- `َ -> a`
- `ُ -> u`
- `ِ -> i`
- `ً -> an`
- `ٌ -> un`
- `ٍ -> in`
- `ّ -> shadda marker (gemination logic)`
- `ْ -> ""` (sukun is silent)
- `ٰ -> ā`

## Rule Order (How The Engine Works)

Rules are applied in this order for each character. Order matters.

1. Skip isolated diacritics.
2. Irregular dictionary lookup for whole words.
3. Attached clitic + irregular lookup for leading single-letter clitics (`و/ف/ب/ك/ل`), such as `وهذا`, `بهذا`.
4. Special-case `لله` pattern (`llāh` path).
5. Silent-alif checks.
6. Definite article logic:
- Attached clitic + `ال` (for example `بالشمس`, `فالقمر`, `كالشمس`).
- `لِ + ال` sun-letter assimilation.
- Bare `ال` with sun/moon letter handling.
7. Base-character mapping.
8. Following-diacritic sweep (vowel + shadda handling).
9. Post-processing cleanup:
- normalize whitespace (`\s+` to single space, then trim)
- normalize `عمرو`-style endings (`3mrw` / `3amrw` -> `3amr`)

## Irregular Dictionary

Current built-in entries:

- `هذا -> hāźā`
- `هذه -> hāźihi`
- `ذلك -> źālik`
- `لكن -> lākin`
- `طه -> Tāhā`
- `الرحمن -> ar-ra7mān`
- `الله -> Allāh`

These irregulars are boundary-aware for standalone words and also handled behind common one-letter clitics.

## Definite Article Behavior

### Sun letters

Sun-letter set used for assimilation:

- `ت ث د ذ ر ز س ش ص ض ط ظ ل ن`

Examples:

- `الشمس -> ish-shms`
- `لِلشَّمْس -> lish-shams`
- `بالشمس -> bish-shms`

### Moon letters

Examples:

- `القمر -> il-'mr`
- `فالقمر -> fil-'mr`

## Word Boundary Model

The engine computes boundaries using non-diacritic base characters and a token-character classifier.

- Token characters include Arabic letters, ASCII letters, digits, and underscore.
- Punctuation is treated as a boundary.
- This enables behavior like:
- `قال:الشمس -> 'āl:ish-shms`
- `هذا،ذلك -> hāźā،źālik`

## Known Limitations

These are current behavior limits, not bugs unless you want different output policy.

- Not full morphological analysis; mostly rule-based surface transliteration.
- `مائة / مِئَة / مئة` and related hamza/alif variants are not fully normalized to one consistent output.
- Underscore `_` is treated as an in-token character, so article behavior across `_` may differ from spaces/punctuation.
- Output intentionally includes non-ASCII characters (`ā`, `ś`, `ź`, `ã`).

## Tests

A small regression suite is included:

- File: `/Users/tom/Documents/GitHub/egypt-transliterate/test.js`
- Run: `node /Users/tom/Documents/GitHub/egypt-transliterate/test.js`

The test set currently covers:

- irregular words
- article assimilation (sun/moon)
- attached clitics + article
- punctuation boundaries
- clitic + irregular words
- mixed-token edge case (`xاللهy`)

## Repository Files

- `/Users/tom/Documents/GitHub/egypt-transliterate/Code.gs`: transliteration engine
- `/Users/tom/Documents/GitHub/egypt-transliterate/test.js`: Node regression tests
