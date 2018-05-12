const chalk = require('chalk');
const stats = require('simple-statistics');
const columnify = require('columnify');
const prettyBytes = require('pretty-bytes');

const tests = [];
function test(name, fn) {
    let fns = {};

    const context = {
        setup(setupFn) {
            fns.setup = setupFn;
        },
        run(operation) {
            fns.operation = operation;
        }
    };

    fn(context);

    tests.push({ name, setup: fns.setup, operation: fns.operation });
}

async function run(iterations = 1000) {
    global.gc();

    console.log(`Starting memory: ${prettyBytes(process.memoryUsage().heapUsed)}\n`);

    for (const test of tests) {
        test.data = {};

        global.gc();
        test.data.startingMemory = process.memoryUsage().heapUsed;

        const context = await test.setup();

        global.gc();
        test.data.postLoadMemory = process.memoryUsage().heapUsed;

        const results = [];
        const lengths = [];

        for (let i = 0; i < iterations; i++) {
            const start = process.hrtime();
            const length = test.operation(context, i);
            const elapsed = process.hrtime(start);
            results.push(elapsed[0] * 1e3 + elapsed[1] * 1e-6);
            lengths.push(length);
        }

        const chars = results.map((val, index) =>
            Array(lengths[index]).fill(val / lengths[index]));

        const allChars = [];
        for (const charArr of chars) {
            allChars.push(...charArr);
        }

        test.data.avg = stats.mean(results);
        test.data.stdev = stats.standardDeviation(results);
        test.data.pct5 = stats.quantile(results, 0.05);
        test.data.pct50 = stats.quantile(results, 0.50);
        test.data.pct95 = stats.quantile(results, 0.95);
        test.data.charAvg = stats.mean(allChars);
        test.data.charStdev = stats.standardDeviation(allChars);

        global.gc();

        // This is only done to prevent the font (and its cache) from being GC'd
        test.context = context;
        delete test.context;

        test.data.endingMemory = process.memoryUsage().heapUsed;
    }

    console.log(columnify(
        [
            {
                name: '-'.repeat(Math.max(...tests.map(t => t.name.length))),
                avg: '------',
                '50%': '------',
                '95%': '------',
                'avg (char)': '----------',
                'mem start': '---------',
                'mem increase': '------------',
            },
            ...tests.map(test => ({
                name: chalk.bold(test.name),
                avg: chalk.cyan(test.data.avg.toFixed(4)),
                '50%': chalk.cyan(test.data.pct50.toFixed(4)),
                '95%': chalk.cyan(test.data.pct95.toFixed(4)),
                'avg (char)': chalk.cyan(test.data.charAvg.toFixed(7)),
                'mem start': chalk.magenta(prettyBytes(test.data.postLoadMemory)),
                'mem increase': chalk.magenta(prettyBytes(test.data.endingMemory - test.data.postLoadMemory)),
            }))
        ],
        {
            columnSplitter: ' | '
        }
    ));
}

module.exports = { test, run };