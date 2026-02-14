// ==========================================
// EGYPTIAN PRACTICAL + SILENT LETTER REMOVAL
// ==========================================

function STRICT_ARABIZI(text) {
  if (!text) return "";
  var s = String(text);
  var out = [];
  
  // Sun Letters for assimilation logic
  var sunLetters = "\u062a\u062b\u062f\u0630\u0631\u0632\u0633\u0634\u0635\u0636\u0637\u0638\u0644\u0646";

  var SMAP = {
    // --- HAMZAS & ALIFS ---
    "\u0621": "2",  // ء - Standalone Hamza
    "\u0622": "2ã", // آ - Alif Madda (Hamza + long Alif)
    "\u0623": "2",  // أ - Alif with Hamza above
    "\u0625": "2",  // إ - Alif with Hamza below
    "\u0624": "2",  // ؤ - Waw with Hamza
    "\u0626": "2",  // ئ - Ya with Hamza (Nabra)
    "\u0627": "ā",  // ا - Standard Alif

    // --- CONSONANTS ---
    "\u0628": "b",  // ب - Ba
    "\u062a": "t",  // ت - Ta
    "\u062b": "ś",  // ث - Tha
    "\u062c": "g",  // ج - Gim (Egyptian 'G')
    "\u062d": "7",  // ح - Ha (Deep breathy H)
    "\u062e": "5",  // خ - Kha (Raspy)
    "\u062f": "d",  // د - Dal
    "\u0630": "ź",  // ذ - Thal
    "\u0631": "r",  // ر - Ra (Rolled)
    "\u0632": "z",  // ز - Zain
    "\u0633": "s",  // س - Sin
    "\u0634": "sh", // ش - Shin
    "\u0635": "S",  // ص - Sad (Emphatic S)
    "\u0636": "D",  // ض - Dad (Emphatic D)
    "\u0637": "T",  // ط - Ta (Emphatic T)
    "\u0638": "Z",  // ظ - Za (Emphatic Z)
    "\u0639": "3",  // ع - Ain (Deep throat sound)
    "\u063a": "8",  // غ - Ghain (Gargling)
    "\u0641": "f",  // ف - Fa
    "\u0642": "'",  // ق - Qaf (Glottal stop in Cairo)
    "\u0643": "k",  // ك - Kaf
    "\u0644": "l",  // ل - Lam
    "\u0645": "m",  // م - Mim
    "\u0646": "n",  // ن - Nun
    "\u0647": "h",  // ه - Ha (Light H)
    "\u0648": "w",  // و - Waw
    "\u064a": "y",  // ي - Ya

    // --- SPECIALS ---
    "\u0649": "ā",  // ى - Alif Layina (Spelled as Ya, sounds like A)
    "\u0629": "ah"  // ة - Ta Marbuta (Feminine marker)
  };

  var diacritics = {
    "\u064e": "a",      // Fatha (short 'a')
    "\u064f": "u",      // Damma (short 'u')
    "\u0650": "i",      // Kasra (short 'i')
    "\u0651": "SHADDA", // Shadda (double consonant)
    "\u0652": "",       // Sukun (silent marker)
    "\u064b": "an",     // Tanwin Fatha
    "\u064c": "un",     // Tanwin Damma
    "\u064d": "in"      // Tanwin Kasra
  };

  var skipShaddaOnce = false;

  for (var i = 0; i < s.length; i++) {
    var ch = s[i];

    if (ch in diacritics) continue;

    // --- 1. SILENT ALIF (Alif al-Fariqa) ---
    // If we see Alif at end of word preceded by Waw, skip it.
    if (ch === "\u0627" && (i === s.length - 1 || /\s/.test(s[i+1]))) {
        if (s[i-1] === "\u0648") continue; 
    }

    // --- 2. DEFINITE ARTICLE (IL / SUN LETTERS) ---
    var isStartOfWord = (i === 0 || /\s/.test(s[i-1]));
    if (isStartOfWord && ch === "\u0627" && s[i+1] === "\u0644") {
      var lookAhead = 1; 
      var nextChar = s[i+2];
      if (s[i+2] === "\u0652") { nextChar = s[i+3]; lookAhead = 2; }

      if (sunLetters.indexOf(nextChar) !== -1) {
        var sunVal = SMAP[nextChar] || "";
        out.push("i" + sunVal + "-"); 
        i += lookAhead; 
        skipShaddaOnce = true; 
        continue;
      } else {
        out.push("il-");
        i += lookAhead;
        continue;
      }
    }

    if (ch === "\u0640") continue; // Skip Tatweel (ـ)

    // --- 3. BASE CHARACTER & SHADDA ---
    var base = SMAP[ch] || ch;
    var hasShadda = false;
    var vowel = "";
    
    // Check for stacked diacritics
    while (i + 1 < s.length && (s[i+1] in diacritics)) {
      var d = s[i+1];
      if (d === "\u0651") hasShadda = true;
      else vowel = diacritics[d];
      i++; 
    }

    if (hasShadda && !skipShaddaOnce) {
        // Double the base letter for strictness
        if (base.length > 1) base = base[0] + base; 
        else base = base + base;
    }
    
    skipShaddaOnce = false; 
    out.push(base + vowel);
  }

  var result = out.join("").replace(/\s+/g, " ").trim();

  // --- 4. THE "AMR" RULE ---
  // Replaces '3amrw' with '3amr' because the Waw is silent in Amr
  return result.replace(/\b3amrw\b/g, "3amr");
}