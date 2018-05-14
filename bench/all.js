const fs = require('fs');
const path = require('path');

const fontLigatures = require('../');

const { setup, test, run } = require('./harness');

const code = fs.readFileSync(path.join(__dirname, 'code.txt'), 'utf8').split('\n');
const noLigatures = fs.readFileSync(path.join(__dirname, 'no-ligatures.txt'), 'utf8').split('\n');

const cacheSize = 10000;

test('Fira Code: code', t => {
    t.setup(() =>
        fontLigatures.loadFile(path.join(__dirname, '../fonts/FiraCode-Regular.otf')));

    t.run((font, iteration) => {
        const line = code[iteration % code.length];
        font.findLigatureRanges(line);
        return line.length;
    });
});

test('Fira Code: no-ligatures', t => {
    t.setup(() =>
        fontLigatures.loadFile(path.join(__dirname, '../fonts/FiraCode-Regular.otf')));

    t.run((font, iteration) => {
        const line = noLigatures[iteration % noLigatures.length];
        font.findLigatureRanges(line);
        return line.length;
    });
});

test('Fira Code: code (cache)', t => {
    t.setup(async () => {
        const font = await fontLigatures.loadFile(
            path.join(__dirname, '../fonts/FiraCode-Regular.otf'),
            { cacheSize }
        );

        // Prime cache
        for (const line of code) {
            font.findLigatureRanges(line);
        }

        return font;
    });

    t.run((font, iteration) => {
        const line = code[iteration % code.length];
        font.findLigatureRanges(line);
        return line.length;
    });
});

test('Fira Code: no-ligatures (cache)', t => {
    t.setup(async () => {
        const font = await fontLigatures.loadFile(
            path.join(__dirname, '../fonts/FiraCode-Regular.otf'),
            { cacheSize }
        );

        // Prime cache
        for (const line of noLigatures) {
            font.findLigatureRanges(line);
        }

        return font;
    });

    t.run((font, iteration) => {
        const line = noLigatures[iteration % noLigatures.length];
        font.findLigatureRanges(line);
        return line.length;
    });
});

test('Iosevka: code', t => {
    t.setup(() =>
        fontLigatures.loadFile(path.join(__dirname, '../fonts/iosevka-regular.ttf')));

    t.run((font, iteration) => {
        const line = code[iteration % code.length];
        font.findLigatureRanges(line);
        return line.length;
    });
});

test('Iosevka: no-ligatures', t => {
    t.setup(() =>
        fontLigatures.loadFile(path.join(__dirname, '../fonts/iosevka-regular.ttf')));

    t.run((font, iteration) => {
        const line = noLigatures[iteration % noLigatures.length];
        font.findLigatureRanges(line);
        return line.length;
    });
});

test('Iosevka: code (cache)', t => {
    t.setup(async () => {
        const font = await fontLigatures.loadFile(
            path.join(__dirname, '../fonts/iosevka-regular.ttf'),
            { cacheSize }
        );

        // Prime cache
        for (const line of code) {
            font.findLigatureRanges(line);
        }

        return font;
    });

    t.run((font, iteration) => {
        const line = code[iteration % code.length];
        font.findLigatureRanges(line);
        return line.length;
    });
});

test('Iosevka: no-ligatures (cache)', t => {
    t.setup(async () => {
        const font = await fontLigatures.loadFile(
            path.join(__dirname, '../fonts/iosevka-regular.ttf'),
            { cacheSize }
        );

        // Prime cache
        for (const line of noLigatures) {
            font.findLigatureRanges(line);
        }

        return font;
    });

    t.run((font, iteration) => {
        const line = noLigatures[iteration % noLigatures.length];
        font.findLigatureRanges(line);
        return line.length;
    });
});

test('Monoid: code', t => {
    t.setup(() =>
        fontLigatures.loadFile(path.join(__dirname, '../fonts/Monoid-Regular.ttf')));

    t.run((font, iteration) => {
        const line = code[iteration % code.length];
        font.findLigatureRanges(line);
        return line.length;
    });
});

test('Monoid: no-ligatures', t => {
    t.setup(() =>
        fontLigatures.loadFile(path.join(__dirname, '../fonts/Monoid-Regular.ttf')));

    t.run((font, iteration) => {
        const line = noLigatures[iteration % noLigatures.length];
        font.findLigatureRanges(line);
        return line.length;
    });
});

test('Monoid: code (cache)', t => {
    t.setup(async () => {
        const font = await fontLigatures.loadFile(
            path.join(__dirname, '../fonts/Monoid-Regular.ttf'),
            { cacheSize }
        );

        // Prime cache
        for (const line of code) {
            font.findLigatureRanges(line);
        }

        return font;
    });

    t.run((font, iteration) => {
        const line = code[iteration % code.length];
        font.findLigatureRanges(line);
        return line.length;
    });
});

test('Monoid: no-ligatures (cache)', t => {
    t.setup(async () => {
        const font = await fontLigatures.loadFile(
            path.join(__dirname, '../fonts/Monoid-Regular.ttf'),
            { cacheSize }
        );

        // Prime cache
        for (const line of noLigatures) {
            font.findLigatureRanges(line);
        }

        return font;
    });

    t.run((font, iteration) => {
        const line = noLigatures[iteration % noLigatures.length];
        font.findLigatureRanges(line);
        return line.length;
    });
});

test('Ubuntu Mono: code', t => {
    t.setup(() =>
        fontLigatures.loadFile(path.join(__dirname, '../fonts/UbuntuMono-Regular.ttf')));

    t.run((font, iteration) => {
        const line = code[iteration % code.length];
        font.findLigatureRanges(line);
        return line.length;
    });
});

test('Ubuntu Mono: no-ligatures', t => {
    t.setup(() =>
        fontLigatures.loadFile(path.join(__dirname, '../fonts/UbuntuMono-Regular.ttf')));

    t.run((font, iteration) => {
        const line = noLigatures[iteration % noLigatures.length];
        font.findLigatureRanges(line);
        return line.length;
    });
});

test('Ubuntu Mono: code (cache)', t => {
    t.setup(async () => {
        const font = await fontLigatures.loadFile(
            path.join(__dirname, '../fonts/UbuntuMono-Regular.ttf'),
            { cacheSize }
        );

        // Prime cache
        for (const line of code) {
            font.findLigatureRanges(line);
        }

        return font;
    });

    t.run((font, iteration) => {
        const line = code[iteration % code.length];
        font.findLigatureRanges(line);
        return line.length;
    });
});

test('Ubuntu Mono: no-ligatures (cache)', t => {
    t.setup(async () => {
        const font = await fontLigatures.loadFile(
            path.join(__dirname, '../fonts/UbuntuMono-Regular.ttf'),
            { cacheSize }
        );

        // Prime cache
        for (const line of noLigatures) {
            font.findLigatureRanges(line);
        }

        return font;
    });

    t.run((font, iteration) => {
        const line = noLigatures[iteration % noLigatures.length];
        font.findLigatureRanges(line);
        return line.length;
    });
});

run(10000);
