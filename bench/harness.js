const chalk = require('chalk');
const stats = require('simple-statistics');
const columnify = require('columnify');

let setupOperation;
async function setup(operation) {
    setupOperation = operation;
}

const tests = [];
function test(name, operation) {
    tests.push({ name, operation });
}

async function run(iterations = 1000) {
    const context = await setupOperation();

    for (const test of tests) {
        test.results = [];
        test.lengths = [];

        for (let i = 0; i < iterations; i++) {
            const start = process.hrtime();
            const length = test.operation(context, i);
            const elapsed = process.hrtime(start);
            test.results.push(elapsed[0] * 1e3 + elapsed[1] * 1e-6);
            test.lengths.push(length);
        }
    }

    console.log(columnify(
        tests.map(test => {
            const chars = test.results.map((val, index) =>
                Array(test.lengths[index]).fill(val / test.lengths[index]));

            const allChars = [];
            for (const charArr of chars) {
                allChars.push(...charArr);
            }

            return {
                name: chalk.bold(test.name),
                avg: chalk.magenta(stats.mean(test.results).toFixed(4)),
                stdev: chalk.magenta(stats.standardDeviation(test.results).toFixed(4)),
                '5%': chalk.cyan(stats.quantile(test.results, 0.05).toFixed(4)),
                '50%': chalk.cyan(stats.quantile(test.results, 0.50).toFixed(4)),
                '95%': chalk.cyan(stats.quantile(test.results, 0.95).toFixed(4)),
                'avg (char)': chalk.magenta(stats.mean(allChars).toFixed(7)),
                'stdev (char)': chalk.magenta(stats.standardDeviation(allChars).toFixed(7)),
            };
        }),
        {
            columnSplitter: '   '
        }
    ));
}

module.exports = { setup, test, run };