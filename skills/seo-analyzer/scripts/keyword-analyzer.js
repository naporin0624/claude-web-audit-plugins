#!/usr/bin/env node

import { readFileSync } from "fs";
import { load } from "cheerio";

// Common stop words to filter out
const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "can",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "you",
  "your",
  "we",
  "our",
  "they",
  "their",
  "he",
  "she",
  "him",
  "her",
  "i",
  "my",
  "me",
  "as",
  "if",
  "so",
  "than",
  "then",
  "when",
  "where",
  "which",
  "who",
  "what",
  "how",
  "all",
  "each",
  "every",
  "both",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "not",
  "only",
  "same",
  "just",
  "also",
  "very",
  "about",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "between",
  "under",
  "again",
  "further",
  "once",
  // Japanese particles and common words
  "の",
  "を",
  "に",
  "は",
  "が",
  "で",
  "と",
  "も",
  "や",
  "から",
  "まで",
  "より",
  "など",
  "へ",
  "て",
  "です",
  "ます",
  "した",
  "する",
  "ある",
  "いる",
  "こと",
  "もの",
  "これ",
  "それ",
  "あれ",
  "この",
  "その",
  "あの",
]);

// Simple stemming (removes common suffixes)
function simpleStem(word) {
  return word
    .toLowerCase()
    .replace(/ing$/, "")
    .replace(/ed$/, "")
    .replace(/ly$/, "")
    .replace(/ies$/, "y")
    .replace(/es$/, "")
    .replace(/s$/, "");
}

// Extract words from text
function extractWords(text) {
  if (!text) return [];

  // Handle both English and Japanese
  const words = text
    .toLowerCase()
    .replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .filter((w) => !STOP_WORDS.has(w))
    .map(simpleStem)
    .filter((w) => w.length > 1);

  return words;
}

// Extract 2-word phrases
function extractPhrases(text) {
  if (!text) return [];

  const words = text
    .toLowerCase()
    .replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);

  const phrases = [];
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i];
    const w2 = words[i + 1];
    if (!STOP_WORDS.has(w1) && !STOP_WORDS.has(w2)) {
      phrases.push(`${w1} ${w2}`);
    }
  }

  return phrases;
}

// Count word frequency
function countFrequency(words) {
  const freq = new Map();
  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1);
  }
  return freq;
}

// Main analyzer class
class KeywordAnalyzer {
  constructor(html, filename) {
    this.$ = load(html);
    this.filename = filename;
  }

  analyze() {
    const $ = this.$;

    // Extract text from key locations
    const title = $("title").text().trim();
    const description = $('meta[name="description"]').attr("content") || "";
    const h1Text = $("h1")
      .map((_, el) => $(el).text().trim())
      .get()
      .join(" ");
    const h2Text = $("h2")
      .map((_, el) => $(el).text().trim())
      .get()
      .join(" ");
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();

    // Extract and count words
    const titleWords = extractWords(title);
    const descWords = extractWords(description);
    const h1Words = extractWords(h1Text);
    const h2Words = extractWords(h2Text);
    const bodyWords = extractWords(bodyText);

    // Extract phrases
    const titlePhrases = extractPhrases(title);
    const h1Phrases = extractPhrases(h1Text);
    const descPhrases = extractPhrases(description);

    // Count frequencies
    const wordFreq = countFrequency(bodyWords);
    const phraseFreq = countFrequency([
      ...extractPhrases(h1Text),
      ...extractPhrases(h2Text),
      ...extractPhrases(bodyText.substring(0, 2000)),
    ]);

    // Score words by placement
    const wordScores = new Map();

    for (const word of titleWords) {
      wordScores.set(word, (wordScores.get(word) || 0) + 10);
    }
    for (const word of h1Words) {
      wordScores.set(word, (wordScores.get(word) || 0) + 8);
    }
    for (const word of descWords) {
      wordScores.set(word, (wordScores.get(word) || 0) + 5);
    }
    for (const word of h2Words) {
      wordScores.set(word, (wordScores.get(word) || 0) + 3);
    }

    // Add frequency bonus
    for (const [word, freq] of wordFreq) {
      if (wordScores.has(word)) {
        wordScores.set(word, wordScores.get(word) + Math.min(freq, 10));
      }
    }

    // Score phrases
    const phraseScores = new Map();
    for (const phrase of titlePhrases) {
      phraseScores.set(phrase, (phraseScores.get(phrase) || 0) + 15);
    }
    for (const phrase of h1Phrases) {
      phraseScores.set(phrase, (phraseScores.get(phrase) || 0) + 12);
    }
    for (const phrase of descPhrases) {
      phraseScores.set(phrase, (phraseScores.get(phrase) || 0) + 8);
    }
    for (const [phrase, freq] of phraseFreq) {
      if (phraseScores.has(phrase)) {
        phraseScores.set(phrase, phraseScores.get(phrase) + Math.min(freq * 2, 10));
      } else if (freq >= 2) {
        phraseScores.set(phrase, freq * 2);
      }
    }

    // Get top keywords and phrases
    const topWords = [...wordScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, score]) => ({
        word,
        score,
        frequency: wordFreq.get(word) || 0,
        inTitle: titleWords.includes(word),
        inH1: h1Words.includes(word),
        inDescription: descWords.includes(word),
      }));

    const topPhrases = [...phraseScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([phrase, score]) => ({
        phrase,
        score,
        frequency: phraseFreq.get(phrase) || 0,
        inTitle: titlePhrases.includes(phrase),
        inH1: h1Phrases.includes(phrase),
      }));

    // Calculate density for top keyword
    const totalWords = bodyWords.length;
    const densities = topWords.slice(0, 3).map((kw) => ({
      word: kw.word,
      density:
        totalWords > 0
          ? ((kw.frequency / totalWords) * 100).toFixed(2) + "%"
          : "0%",
    }));

    // Check placement recommendations
    const recommendations = [];

    if (topPhrases.length > 0) {
      const topPhrase = topPhrases[0];
      if (!topPhrase.inTitle) {
        recommendations.push(
          `Consider adding "${topPhrase.phrase}" to your title tag`
        );
      }
      if (!topPhrase.inH1) {
        recommendations.push(
          `Consider including "${topPhrase.phrase}" in your H1 heading`
        );
      }
    }

    if (topWords.length > 0 && !topWords[0].inDescription) {
      recommendations.push(
        `Primary keyword "${topWords[0].word}" not found in meta description`
      );
    }

    return {
      file: this.filename,
      timestamp: new Date().toISOString(),
      stats: {
        totalWords: totalWords,
        uniqueWords: wordFreq.size,
      },
      primaryKeywords: topWords,
      keyPhrases: topPhrases,
      density: densities,
      recommendations,
      placement: {
        title,
        h1: h1Text.substring(0, 100),
        description: description.substring(0, 160),
      },
    };
  }
}

// Format report as text
function formatTextReport(report) {
  let output = `# Keyword Analysis: ${report.file}\n\n`;

  output += `## Stats\n`;
  output += `- Total words: ${report.stats.totalWords}\n`;
  output += `- Unique words: ${report.stats.uniqueWords}\n\n`;

  output += `## Primary Keywords (by score)\n\n`;
  output += `| Keyword | Score | Freq | Title | H1 | Description |\n`;
  output += `|---------|-------|------|-------|----|-----------|\n`;
  for (const kw of report.primaryKeywords) {
    output += `| ${kw.word} | ${kw.score} | ${kw.frequency} | ${kw.inTitle ? "✓" : ""} | ${kw.inH1 ? "✓" : ""} | ${kw.inDescription ? "✓" : ""} |\n`;
  }

  if (report.keyPhrases.length > 0) {
    output += `\n## Key Phrases\n\n`;
    output += `| Phrase | Score | Freq | Title | H1 |\n`;
    output += `|--------|-------|------|-------|----|\n`;
    for (const p of report.keyPhrases) {
      output += `| ${p.phrase} | ${p.score} | ${p.frequency} | ${p.inTitle ? "✓" : ""} | ${p.inH1 ? "✓" : ""} |\n`;
    }
  }

  output += `\n## Keyword Density\n\n`;
  for (const d of report.density) {
    output += `- ${d.word}: ${d.density}\n`;
  }

  if (report.recommendations.length > 0) {
    output += `\n## Recommendations\n\n`;
    for (const rec of report.recommendations) {
      output += `- ${rec}\n`;
    }
  }

  output += `\n## Current Placement\n\n`;
  output += `**Title**: ${report.placement.title || "(empty)"}\n`;
  output += `**H1**: ${report.placement.h1 || "(empty)"}\n`;
  output += `**Description**: ${report.placement.description || "(empty)"}\n`;

  return output;
}

// Main execution
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: keyword-analyzer.js <file.html> [--json]");
    process.exit(1);
  }

  const filepath = args[0];
  const jsonOutput = args.includes("--json");

  let html;
  try {
    html = readFileSync(filepath, "utf-8");
  } catch (err) {
    console.error(`Error reading file: ${err.message}`);
    process.exit(1);
  }

  const filename = filepath.split("/").pop();
  const analyzer = new KeywordAnalyzer(html, filename);
  const report = analyzer.analyze();

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatTextReport(report));
  }
}

main();
