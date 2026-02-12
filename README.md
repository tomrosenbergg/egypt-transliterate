# Egyptian Arabizi Transliteration

Single-mode transliteration for Egyptian Arabic.

This is designed to be practical and consistent, not official or academic.

## Main style

- `ع -> 3`
- `ح -> 7`
- `خ -> 5`
- `ق -> 2`
- `غ -> 8`
- `ج -> g` (Egyptian pronunciation)
- `ش -> sh`

Vowels:

- short vowels: `a / i / o` (when harakat are present)
- long vowels: `aa / i / oo` (we intentionally simplify `ee` -> `i`)

## Google Sheets

Use:

- `=EGY_ARABIZI(A2)`

Compatibility aliases:

- `=ARABIC_TO_LATIN(A2)`
- `=transliterateArabicSimple(A2)`
