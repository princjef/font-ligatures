const fontLigatures = require('../');

const fontName = process.argv[2];
const text = process.argv[3].split('\n');
const iterations = Number(process.argv[4]) || 1000;

(async () => {
    const loadStart = process.hrtime();
    const font = await fontLigatures.load(fontName);
    const loadTotal = elapsedMs(loadStart);

    const runDurations = [];
    for (let i = 0; i < iterations; i++) {
        const start = process.hrtime();
        font.findLigatures(text[i % text.length]);
        runDurations.push(elapsedMs(start));
    }

    const avg = runDurations.reduce((acc, val) => acc + val, 0) / runDurations.length;
    const max = Math.max(...runDurations);
    const min = Math.min(...runDurations);

    console.log('Font load Time (ms): ', loadTotal);
    console.log('Text Processing Avg (ms): ', avg);
    console.log('Text Processing Min (ms): ', min);
    console.log('Text Processing Max (ms): ', max);
})().catch(e => {
    console.error(e);
    process.exit(1);
});

function elapsedMs(start) {
    const total = process.hrtime(start);
    return total[0] * 1e3 + total[1] * 1e-6;
}