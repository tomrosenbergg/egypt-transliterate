// ==========================================
// EGYPTIAN PRACTICAL + SILENT LETTER REMOVAL
// ==========================================

function STRICT_ARABIZI(text) {
  if (!text) return "";
  var s = String(text);
  var out = [];
  
  // Sun Letters for assimilation logic
  var sunLetters = "\u062a\u062b\u062f\u0630\u0631\u0632\u0633\u0634\u0635\u0636\u0637\u0638\u0644\u0646";

  // [NEW] Dictionary of Irregular Words (Invisible Alifs / Unique Spellings)
  var IRREGULARS = {
    "\u0647\u0630\u0627": "hāźā",      // هذا (Hatha - This)
    "\u0647\u0630\u0647": "hāźihi",    // هذه (Hathihi - This f.)
    "\u0630\u0644\u0643": "źālik",     // ذلك (Thalika - That)
    "\u0644\u0643\u0646": "lākin",     // لكن (Lakin - But)
    "\u0637\u0647": "Tāhā",            // طه (Taha)
    "\u0627\u0644\u0631\u062d\u0645\u0646": "ar-ra7mān", // الرحمن (Ar-Rahman)
    "\u0627\u0644\u0644\u0647": "Allāh" // الله (Allah - Moved here for cleaner priority)
  };

  var SMAP = {
    // --- HAMZAS ---
    "\u0621": "2",  // ء
    "\u0622": "2ã", // آ
    "\u0623": "2",  // أ
    "\u0625": "2",  // إ
    "\u0624": "2",  // ؤ
    "\u0626": "2",  // ئ

    // --- CONSONANTS ---
    "\u0628": "b", "\u062a": "t", "\u062b": "ś", "\u062c": "g", 
    "\u062d": "7", "\u062e": "5", "\u062f": "d", "\u0630": "ź", 
    "\u0631": "r", "\u0632": "z", "\u0633": "s", "\u0634": "sh", 
    "\u0635": "S", "\u0636": "D", "\u0637": "T", "\u0638": "Z", 
    "\u0639": "3", "\u063a": "8", "\u0641": "f", "\u0642": "'", 
    "\u0643": "k", "\u0644": "l", "\u0645": "m", "\u0646": "n", 
    "\u0647": "h", "\u0648": "w", "\u064a": "y", 
    "\u0649": "ā", // Alif Layina
  };

  var diacritics = {
    "\u064e": "a", "\u064f": "u", "\u0650": "i",
    "\u0651": "SHADDA", "\u0652": "", 
    "\u064b": "an", "\u064c": "un", "\u064d": "in",
    "\u0670": "ā" 
  };

  function isDiacritic(ch) {
    return ch in diacritics;
  }

  function isTokenChar(ch) {
    return /[A-Za-z0-9_\u0660-\u0669\u0621-\u063A\u0641-\u064A\u0671]/.test(ch);
  }

  function prevBaseIndex(pos) {
    var j = pos;
    while (j >= 0 && (isDiacritic(s[j]) || s[j] === "\u0640")) j--;
    return j;
  }

  function nextBaseIndex(pos) {
    var j = pos;
    while (j < s.length && (isDiacritic(s[j]) || s[j] === "\u0640")) j++;
    return j;
  }

  var skipShaddaOnce = false;

  mainLoop: 
  for (var i = 0; i < s.length; i++) {
    var ch = s[i];

    if (isDiacritic(ch)) continue;
    var prevIdx = prevBaseIndex(i - 1);
    var isStartOfWord = (prevIdx < 0 || !isTokenChar(s[prevIdx]));

    // --- 0. DICTIONARY LOOKUP (IRREGULARS) ---
    // Standalone irregular words
    for (var key in IRREGULARS) {
        var afterIdx = nextBaseIndex(i + key.length);
        var beforeBoundary = (prevIdx < 0 || !isTokenChar(s[prevIdx]));
        var afterBoundary = (afterIdx >= s.length || !isTokenChar(s[afterIdx]));
        if (beforeBoundary && afterBoundary && s.substr(i, key.length) === key) {
            out.push(IRREGULARS[key]); // Output the stored value
            i += key.length - 1;       // Skip the length of the word
            continue mainLoop;         // Continue outer loop
        }
    }

    // Attached single-letter clitic + irregular (e.g. وهذا, بهذا)
    if (isStartOfWord && "\u0648\u0641\u0628\u0643\u0644".indexOf(ch) !== -1) {
        var cliticNext = i + 1;
        while (cliticNext < s.length && (isDiacritic(s[cliticNext]) || s[cliticNext] === "\u0640")) cliticNext++;
        for (var ckey in IRREGULARS) {
            var cAfter = nextBaseIndex(cliticNext + ckey.length);
            var cAfterBoundary = (cAfter >= s.length || !isTokenChar(s[cAfter]));
            if (cAfterBoundary && s.substr(cliticNext, ckey.length) === ckey) {
                var prefixVal = SMAP[ch] || ch;
                if (ckey === "\u0627\u0644\u0644\u0647") {
                    var allahTail = (ch === "\u0628" || ch === "\u0644") ? "illāh" : "allāh";
                    out.push(prefixVal + allahTail);
                } else {
                    out.push(prefixVal + IRREGULARS[ckey]);
                }
                i = cliticNext + ckey.length - 1;
                continue mainLoop;
            }
        }
    }

    // --- 1. SPECIAL CASE: "LILLAH" ---
    // (Note: "Allah" is now handled in IRREGULARS above, but "Lillah" is distinct)
    // Detect "Lillah" (Lam-Lam-Ha) - usually "Li-llah"
    if (ch === "\u0644" && s[i+1] === "\u0644" && s[i+2] === "\u0647") {
        out.push("llāh"); i += 2; continue;
    }

    // --- 2. SILENT ALIF CHECKS ---
    if (ch === "\u0627" && s[i-1] === "\u064b") continue; // Tanwin
    if (ch === "\u0627") { // Plural Waw
        var prevForSilent = prevBaseIndex(i - 1);
        var nextForSilent = nextBaseIndex(i + 1);
        if (prevForSilent >= 0 && s[prevForSilent] === "\u0648" &&
            (nextForSilent >= s.length || !isTokenChar(s[nextForSilent]))) continue;
    }
    if (ch === "\u0627" && s[i-1] === "\u0650" && s[i+1] === "\u0626") continue; // 100 (Mi'a)

    // --- 3. DEFINITE ARTICLE LOGIC ---
    // 3a. ATTACHED PREFIX + ARTICLE (e.g. بالشمس, فالقمر, كالشمس)
    if (isStartOfWord && "\u0648\u0641\u0628\u0643\u0644".indexOf(ch) !== -1) {
        var k = i + 1;
        while (k < s.length && (isDiacritic(s[k]) || s[k] === "\u0640")) k++;
        if (s[k] === "\u0627" && s[k + 1] === "\u0644") {
            var lookAheadPrefix = 1;
            var nextAfterArticle = s[k + 2];
            if (s[k + 2] === "\u0652") { nextAfterArticle = s[k + 3]; lookAheadPrefix = 2; }

            var prefixVal = SMAP[ch] || ch;
            if (nextAfterArticle === "\u0644" && s[k + lookAheadPrefix + 2] === "\u0647") {
                var allahTail = (ch === "\u0628" || ch === "\u0644") ? "illāh" : "allāh";
                out.push(prefixVal + allahTail);
                i = k + lookAheadPrefix + 2;
                continue;
            }

            if (sunLetters.indexOf(nextAfterArticle) !== -1) {
                var prefSunVal = SMAP[nextAfterArticle] || "";
                out.push(prefixVal + "i" + prefSunVal + "-");
                i = k + lookAheadPrefix;
                skipShaddaOnce = true;
                continue;
            } else {
                out.push(prefixVal + "il-");
                i = k + lookAheadPrefix;
                continue;
            }
        }
    }

    // 3b. PREPOSITION "LI" + SUN LETTER (e.g. Lil-Sahel -> Lis-Sahel)
    if (isStartOfWord && ch === "\u0644") {
        var idx = i + 1;
        if (s[idx] === "\u0650") idx++; 
        
        if (s[idx] === "\u0644") { 
             var nextC = s[idx+1];
             var jump = idx; 
             if (s[idx+1] === "\u0652") { nextC = s[idx+2]; jump++; }

             // Ensure we don't break "Lillah" (Lam-Lam-Ha)
             var isAllah = (nextC === "\u0644" && s[jump+2] === "\u0647");

             if (!isAllah && sunLetters.indexOf(nextC) !== -1) {
                  var sunVal = SMAP[nextC] || "";
                  out.push("li" + sunVal + "-");
                  i = jump; 
                  skipShaddaOnce = true; 
                  continue;
             }
        }
    }

    // 3c. STANDARD AL- + SUN LETTER
    if (isStartOfWord && ch === "\u0627" && s[i+1] === "\u0644") {
      var lookAhead = 1; 
      var nextChar = s[i+2];
      if (s[i+2] === "\u0652") { nextChar = s[i+3]; lookAhead = 2; }

      // Check for Allah (Al-Lah) - Handled by Dictionary, but safe to keep as fallback
      if (nextChar === "\u0644" && s[i+lookAhead+2] === "\u0647") {
         out.push("Allāh"); i += lookAhead + 2; continue;
      }

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

    if (ch === "\u0640") continue; 

    // --- 4. BASE CHARACTER LOGIC ---
    var base = "";

    // Dynamic Alif
    if (ch === "\u0627") {
        var nextIsVowel = (i + 1 < s.length && (s[i+1] === "\u064e" || s[i+1] === "\u064f" || s[i+1] === "\u0650"));
        base = nextIsVowel ? "" : "ā"; 
    }
    // Context-Aware Ta Marbuta
    else if (ch === "\u0629") {
        var nextIsDiacritic = (i + 1 < s.length && s[i+1] in diacritics && s[i+1] !== "\u0652");
        base = nextIsDiacritic ? "t" : "ah";
    }
    else {
        base = SMAP[ch] || ch;
    }

    // --- 5. VOWELS & SHADDA ---
    var hasShadda = false;
    var vowel = "";
    
    while (i + 1 < s.length && (s[i+1] in diacritics)) {
      var d = s[i+1];
      if (d === "\u0651") hasShadda = true;
      else vowel = diacritics[d];
      i++; 
    }

    if (hasShadda && !skipShaddaOnce) {
        if (base.length > 1) base = base[0] + base; 
        else base = base + base;
    }
    
    skipShaddaOnce = false; 
    out.push(base + vowel);
  }

  var result = out.join("").replace(/\s+/g, " ").trim();
  return result.replace(/\b3amrw\b/g, "3amr").replace(/\b3mrw\b/g, "3amr");
}
