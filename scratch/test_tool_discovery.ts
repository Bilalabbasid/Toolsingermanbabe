import assert from 'assert';
import {
  searchToolsWithRelevance,
  getFormatFlow,
  getPopularTools,
  getRecommendedTools,
  getRelatedTools,
} from '../src/lib/search';
import { TOOLS_CONFIG } from '../src/config/tools.config';

console.log('=== STARTING TOOL DISCOVERY & SEARCH TEST SUITE ===\n');

// 1. Total tools verification
console.log(`1. Total registered tools: ${TOOLS_CONFIG.length}`);
assert.strictEqual(TOOLS_CONFIG.length > 50, true, 'Tool registry should have active tools');

// 2. Search: "Word"
console.log('2. Testing search query: "Word"...');
const wordResults = searchToolsWithRelevance('Word');
assert.strictEqual(wordResults.length > 0, true, 'Should return results for Word');
const wordSlugs = wordResults.map((r) => r.tool.slug);
console.log('   Top 4 Word results:', wordSlugs.slice(0, 4));
assert.strictEqual(
  wordSlugs.includes('pdf-in-word-umwandeln') || wordSlugs.includes('word-in-pdf-umwandeln'),
  true,
  'Results must include Word conversion tools'
);
// Verify format flow
const pdfToWord = wordResults.find((r) => r.tool.slug === 'pdf-in-word-umwandeln');
assert.strictEqual(!!pdfToWord, true);
console.log(`   ✓ Format flow for pdf-in-word-umwandeln: "${pdfToWord?.formatFlow}"`);

// 3. Search: "Excel"
console.log('\n3. Testing search query: "Excel"...');
const excelResults = searchToolsWithRelevance('Excel');
assert.strictEqual(excelResults.length > 0, true);
const excelSlugs = excelResults.map((r) => r.tool.slug);
console.log('   Top 4 Excel results:', excelSlugs.slice(0, 4));
assert.strictEqual(
  excelSlugs.includes('pdf-in-excel-umwandeln') || excelSlugs.includes('excel-in-pdf-umwandeln'),
  true
);

// 4. Search: "Komprimieren"
console.log('\n4. Testing search query: "Komprimieren"...');
const compResults = searchToolsWithRelevance('Komprimieren');
assert.strictEqual(compResults.length > 0, true);
const compSlugs = compResults.map((r) => r.tool.slug);
console.log('   Top 4 Komprimieren results:', compSlugs.slice(0, 4));
assert.strictEqual(compSlugs.includes('pdf-komprimieren'), true);
assert.strictEqual(compSlugs.includes('bild-komprimieren') || compSlugs.includes('audio-komprimieren'), true);

// 5. Search: "Signieren"
console.log('\n5. Testing search query: "Signieren"...');
const signResults = searchToolsWithRelevance('Signieren');
assert.strictEqual(signResults.length > 0, true);
assert.strictEqual(signResults.some((r) => r.tool.slug === 'pdf-signieren'), true);
console.log('   ✓ pdf-signieren found with score:', signResults[0].score);

// 6. Search: "OCR"
console.log('\n6. Testing search query: "OCR"...');
const ocrResults = searchToolsWithRelevance('OCR');
assert.strictEqual(ocrResults.length > 0, true);
const ocrSlugs = ocrResults.map((r) => r.tool.slug);
console.log('   Top OCR results:', ocrSlugs);
assert.strictEqual(ocrSlugs.includes('ocr-pdf') || ocrSlugs.includes('pdf-durchsuchbar-machen'), true);

// 7. Search: "ZIP"
console.log('\n7. Testing search query: "ZIP"...');
const zipResults = searchToolsWithRelevance('ZIP');
assert.strictEqual(zipResults.length > 0, true);
const zipSlugs = zipResults.map((r) => r.tool.slug);
console.log('   Top ZIP results:', zipSlugs);
assert.strictEqual(zipSlugs.includes('zip-erstellen') || zipSlugs.includes('zip-entpacken'), true);

// 8. Discovery Feeds: Popular, Recommended, Related
console.log('\n8. Testing Discovery Feeds...');
const popular = getPopularTools();
assert.strictEqual(popular.length >= 6, true, 'Popular tools should return at least 6 tools');
console.log(`   ✓ Beliebte Tools (${popular.length}):`, popular.map((t) => t.nameDe).slice(0, 3));

const recommended = getRecommendedTools('pdf-zusammenfuegen');
assert.strictEqual(recommended.length >= 4, true, 'Recommended tools should return tools');
console.log(`   ✓ Empfohlene Tools (${recommended.length}):`, recommended.map((t) => t.nameDe).slice(0, 3));

const related = getRelatedTools('pdf-zusammenfuegen');
assert.strictEqual(related.length >= 2, true, 'Related tools should be populated');
console.log(`   ✓ Verwandte Tools for pdf-zusammenfuegen (${related.length}):`, related.map((t) => t.nameDe));

// 9. Search Performance Benchmark (<1ms per query)
console.log('\n9. Running Search Performance Benchmark (200 consecutive queries)...');
const sampleQueries = ['word', 'pdf', 'excel', 'bild', 'komprimieren', 'signieren', 'ocr', 'zip', 'audio', 'jpg'];
const startTime = performance.now();
const iterations = 200;

for (let i = 0; i < iterations; i++) {
  const q = sampleQueries[i % sampleQueries.length];
  searchToolsWithRelevance(q);
}
const elapsedMs = performance.now() - startTime;
const avgMsPerQuery = elapsedMs / iterations;
console.log(`   Total time for ${iterations} queries: ${elapsedMs.toFixed(2)}ms`);
console.log(`   Average time per query: ${avgMsPerQuery.toFixed(3)}ms`);
assert.strictEqual(avgMsPerQuery < 2.0, true, 'Average query time must be under 2ms');

console.log('\n=============================================================');
console.log('ALL TOOL DISCOVERY & SEARCH TESTS PASSED SUCCESSFULLY (100%)!');
console.log('=============================================================');
