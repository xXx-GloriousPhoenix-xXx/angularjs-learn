/**
 * Trigram-based fuzzy string matching.
 *
 * Splits strings into overlapping 3-character sequences ("trigrams") and
 * compares sets of trigrams to measure similarity. This is the same
 * technique used by PostgreSQL's pg_trgm extension and most full-text
 * search engines for typo-tolerant, substring-ish matching — much closer
 * to how real search works than a plain `includes()` check.
 *
 * Example:
 *   "John"  -> ["  j", " jo", "joh", "ohn", "hn "]
 *   "Jhon"  -> ["  j", " jh", "jho", "hon", "on "]
 *   These share several trigrams, so similarity > 0 even though
 *   `"jhon".includes("john")` would be false.
 */

/**
 * Pads the string with a leading/trailing space and lowercases it.
 * Padding lets short words/prefixes still produce meaningful trigrams
 * and slightly boosts the weight of matching start/end of word.
 */
function normalize(str) {
    return ` ${String(str).toLowerCase().trim()} `;
}

/**
 * Returns the set of unique n-grams for a string. Falls back to a smaller
 * n for short strings (e.g. bigrams for 3-4 char words) — otherwise a
 * single-letter typo in a short word can wipe out every trigram and make
 * two clearly-similar words look 0% similar.
 */
function getNgrams(str, n = 3) {
    const normalized = normalize(str);
    const effectiveN = Math.min(n, Math.max(1, normalized.length));
    const ngrams = new Set();

    for (let i = 0; i <= normalized.length - effectiveN; i++) {
        ngrams.add(normalized.slice(i, i + effectiveN));
    }

    return ngrams;
}

function getTrigrams(str) {
    return getNgrams(str, 3);
}

/**
 * Jaccard similarity between two trigram sets: intersection size / union size.
 * Returns a number from 0 (nothing in common) to 1 (identical).
 */
function trigramSimilarity(a, b) {
    if (!a || !b) return 0;

    // Use a shared n based on the shorter (raw, unpadded) string, so short
    // words don't get unfairly destroyed by a fixed n=3 — see getNgrams comment.
    const shorterLength = Math.min(String(a).trim().length, String(b).trim().length);
    const n = shorterLength <= 4 ? 2 : 3;

    const ngramsA = getNgrams(a, n);
    const ngramsB = getNgrams(b, n);

    if (ngramsA.size === 0 || ngramsB.size === 0) return 0;

    let intersectionSize = 0;
    for (const ngram of ngramsA) {
        if (ngramsB.has(ngram)) intersectionSize++;
    }

    const unionSize = ngramsA.size + ngramsB.size - intersectionSize;
    return intersectionSize / unionSize;
}

/**
 * Convenience helper: does `candidate` match `query` well enough?
 * Combines a substring check (cheap, catches exact/partial matches)
 * with a trigram similarity threshold (catches typos/fuzzy matches).
 */
function fuzzyMatch(candidate, query, threshold = 0.3) {
    if (!query) return true;
    if (!candidate) return false;

    const candidateLower = candidate.toLowerCase();
    const queryLower = query.toLowerCase();

    // Cheap exact-substring check first — still the most common case
    if (candidateLower.includes(queryLower)) return true;

    return trigramSimilarity(candidate, query) >= threshold;
}

module.exports = {
    getTrigrams,
    trigramSimilarity,
    fuzzyMatch,
};