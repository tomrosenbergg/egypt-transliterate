const fs = require("fs");
const vm = require("vm");

function loadEngine() {
  const code = fs.readFileSync("Code.gs", "utf8");
  const context = {};
  vm.createContext(context);
  vm.runInContext(code, context);
  if (typeof context.STRICT_ARABIZI !== "function") {
    throw new Error("STRICT_ARABIZI function was not found in Code.gs");
  }
  return context.STRICT_ARABIZI;
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}\nExpected: ${expected}\nActual:   ${actual}`);
  }
}

function run() {
  const transliterate = loadEngine();

  const cases = [
    ["هذا", "hāźā", "irregular word: هذا"],
    ["الرحمن", "ar-ra7mān", "irregular word: الرحمن"],
    ["الشمس", "ish-shms", "sun-letter assimilation after ال"],
    ["القمر", "il-'mr", "moon-letter article with ق mapping"],
    ["لِلشَّمْس", "lish-shams", "li + sun-letter assimilation"],
    ["عمرو", "3amr", "final normalization for عمرو"],
    ["ق", "'", "base mapping: ق"],
    ["ث", "ś", "base mapping: ث"],
    ["قال:الشمس", "'āl:ish-shms", "article handling after punctuation"],
    ["بالشمس", "bish-shms", "attached prefix + sun-letter article"],
    ["فالقمر", "fil-'mr", "attached prefix + moon-letter article"],
    ["كالشمس", "kish-shms", "attached kaf + sun-letter article"],
    ["هذا،ذلك", "hāźā،źālik", "punctuation-separated irregular words"],
    ["xاللهy", "xāllāhy", "irregular word should not trigger inside mixed token"],
    ["بالله", "billāh", "attached prefix + Allah form"],
    ["بهذا", "bhāźā", "attached ba + irregular demonstrative"],
    ["وهذا", "whāźā", "attached wa + irregular demonstrative"],
  ];

  for (const [input, expected, label] of cases) {
    const actual = transliterate(input);
    assertEqual(actual, expected, `${label} (${input})`);
  }

  console.log(`PASS: ${cases.length} transliteration checks`);
}

run();
