/**
 * Egyptian Arabic -> Arabizi transliteration (single mode).
 * Practical and consistent for learners, not academic.
 */

var AR = {
  FATHA: "\u064e",
  DAMMA: "\u064f",
  KASRA: "\u0650",
  SUKUN: "\u0652",
  SHADDA: "\u0651",
  FATHATAN: "\u064b",
  DAMMATAN: "\u064c",
  KASRATAN: "\u064d",
  DAGGER_ALIF: "\u0670",
  TATWEEL: "\u0640",
  ALIF: "\u0627",
  ALIF_MAQSURA: "\u0649",
  WAW: "\u0648",
  YA: "\u064a",
};

var DIACRITIC = {};
DIACRITIC[AR.FATHA] = true;
DIACRITIC[AR.DAMMA] = true;
DIACRITIC[AR.KASRA] = true;
DIACRITIC[AR.SUKUN] = true;
DIACRITIC[AR.SHADDA] = true;
DIACRITIC[AR.FATHATAN] = true;
DIACRITIC[AR.DAMMATAN] = true;
DIACRITIC[AR.KASRATAN] = true;
DIACRITIC[AR.DAGGER_ALIF] = true;

// Egyptian-friendly Arabizi map.
var MAP = {
  "\u0621": "2", // ء
  "\u0622": "aa", // آ
  "\u0623": "2a", // أ
  "\u0625": "i", // إ
  "\u0624": "2", // ؤ
  "\u0626": "2", // ئ
  "\u0627": "a",
  "\u0628": "b",
  "\u0629": "a",
  "\u062a": "t",
  "\u062b": "s",
  "\u062c": "g",
  "\u062d": "7",
  "\u062e": "5",
  "\u062f": "d",
  "\u0630": "z",
  "\u0631": "r",
  "\u0632": "z",
  "\u0633": "s",
  "\u0634": "sh",
  "\u0635": "s",
  "\u0636": "d",
  "\u0637": "t",
  "\u0638": "z",
  "\u0639": "3",
  "\u063a": "8",
  "\u0641": "f",
  "\u0642": "2",
  "\u0643": "k",
  "\u0644": "l",
  "\u0645": "m",
  "\u0646": "n",
  "\u0647": "h",
  "\u0648": "w",
  "\u0649": "a",
  "\u064a": "y",
  "\u0671": "a",
  "\u067e": "p",
  "\u0686": "ch",
  "\u06a4": "v",
  "\u06af": "g",
};

/**
 * Main transliteration function.
 * @param {string} text Arabic text.
 * @return {string}
 */
function transliterateEgyptianArabizi(text) {
  if (text === null || text === undefined) return "";
  var s = String(text);
  var out = [];

  for (var i = 0; i < s.length; i++) {
    var ch = s[i];
    if (ch === AR.TATWEEL) continue;
    if (DIACRITIC[ch]) continue;

    var d = readDiacritics_(s, i + 1);
    i += d.count;

    // Prevent doubled leading vowels on hamzated alif forms:
    // إِ -> i (not ii), أَ -> 2a (not 2aa from short-vowel add-on)
    if (ch === "\u0625" && d.kasra) d.kasra = false;
    if (ch === "\u0623" && d.fatha) d.fatha = false;

    var base = MAP[ch] || ch;
    if (d.shadda) base = base + base;

    if (
      d.fatha &&
      (s[i + 1] === AR.ALIF || s[i + 1] === AR.ALIF_MAQSURA) &&
      !hasAttachedDiacritics_(s, i + 1)
    ) {
      out.push(base + "aa");
      i += 1;
      continue;
    }
    if (d.damma && s[i + 1] === AR.WAW && !hasAttachedDiacritics_(s, i + 1)) {
      out.push(base + "oo");
      i += 1;
      continue;
    }
    if (d.kasra && s[i + 1] === AR.YA && !hasAttachedDiacritics_(s, i + 1)) {
      out.push(base + "i");
      i += 1;
      continue;
    }

    if (d.fathatan) {
      if (s[i + 1] === AR.ALIF) i += 1;
      out.push(base + "an");
      continue;
    }
    if (d.dammatan) {
      out.push(base + "un");
      continue;
    }
    if (d.kasratan) {
      out.push(base + "in");
      continue;
    }

    if (d.fatha) out.push(base + "a");
    else if (d.damma) out.push(base + "o");
    else if (d.kasra) out.push(base + "i");
    else out.push(base);
  }

  return normalize_(out.join(""));
}

/**
 * Google Sheets custom function.
 * =EGY_ARABIZI(A2)
 */
function EGY_ARABIZI(text) {
  return transliterateEgyptianArabizi(text);
}

// Backward compatibility wrappers.
function transliterateArabicSimple(text) {
  return transliterateEgyptianArabizi(text);
}
function ARABIC_TO_LATIN(text) {
  return transliterateEgyptianArabizi(text);
}

function readDiacritics_(s, start) {
  var out = {
    fatha: false,
    damma: false,
    kasra: false,
    shadda: false,
    fathatan: false,
    dammatan: false,
    kasratan: false,
    count: 0,
  };

  for (var i = start; i < s.length; i++) {
    var ch = s[i];
    if (!DIACRITIC[ch]) break;
    out.count++;
    if (ch === AR.FATHA) out.fatha = true;
    else if (ch === AR.DAMMA) out.damma = true;
    else if (ch === AR.KASRA) out.kasra = true;
    else if (ch === AR.SHADDA) out.shadda = true;
    else if (ch === AR.FATHATAN) out.fathatan = true;
    else if (ch === AR.DAMMATAN) out.dammatan = true;
    else if (ch === AR.KASRATAN) out.kasratan = true;
  }

  return out;
}

function hasAttachedDiacritics_(s, index) {
  return !!s[index + 1] && DIACRITIC[s[index + 1]] === true;
}

function normalize_(s) {
  return s
    .replace(/\u060c/g, ",")
    .replace(/\u061b/g, ";")
    .replace(/\u061f/g, "?")
    .replace(/\s+/g, " ")
    .replace(/ ?([,;?!:.])/g, "$1")
    // Egyptian colloquial cleanup for final plural -وا (e.g., إنتوا -> intoo, راحوا -> raa7oo).
    .replace(/ooa\b/g, "oo")
    .replace(/owa\b/g, "oo")
    .replace(/([^o])oa\b/g, "$1oo")
    .replace(/([^w])wa\b/g, "$1oo")
    // Always normalize the definite article to "il-".
    .replace(/\bal(?=[aiou])/g, "il-")
    .replace(/\bal(?=[b-df-hj-np-tv-z23578])/g, "il-")
    // Prevent over-doubling after article (il-shsh... -> il-sh..., il-ss... -> il-s...).
    .replace(/\bil-shsh/g, "il-sh")
    .replace(/\bil-(ss|zz|tt|dd|nn|rr|ll)/g, function (_, grp) {
      return "il-" + grp[0];
    })
    // If article is followed by vowel-initial form, keep a clear separator.
    .replace(/\bil([aiou])(?=[a-z0-9])/g, "il-$1")
    // Soften common hamza+oo sequences in everyday Egyptian spelling.
    .replace(/\bil-2a?oo/g, "il-oo")
    .replace(/\b2a?oo/g, "oo")
    .replace(/\bil-2oo/g, "il-oo")
    .replace(/\b2oo/g, "oo")
    .trim();
}

function testTransliteration() {
  var samples = [
    "السلام عليكم",
    "أنا عايز أشرب قهوة",
    "إحنا رايحين بكرة",
    "مَرْحَبًا بِكُمْ",
  ];

  for (var i = 0; i < samples.length; i++) {
    Logger.log(samples[i] + " => " + transliterateEgyptianArabizi(samples[i]));
  }
}
