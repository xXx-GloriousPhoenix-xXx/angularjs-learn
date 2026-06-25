function normalize(str) {
    return ` ${String(str).toLowerCase().trim()} `;
}

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

function trigramSimilarity(a, b) {
    if (!a || !b) return 0;

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

function fuzzyMatch(candidate, query, threshold = 0.3) {
    if (!query) return true;
    if (!candidate) return false;

    const candidateLower = candidate.toLowerCase();
    const queryLower = query.toLowerCase();

    if (candidateLower.includes(queryLower)) return true;

    return trigramSimilarity(candidate, query) >= threshold;
}

module.exports = {
    getTrigrams,
    trigramSimilarity,
    fuzzyMatch,
};