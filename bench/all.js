const fs = require('fs');
const path = require('path');

const fontLigatures = require('../');

const { setup, test, run } = require('./harness');

const code = fs.readFileSync(path.join(__dirname, 'code.txt'), 'utf8').split('\n');
const noLigatures = fs.readFileSync(path.join(__dirname, 'no-ligatures.txt'), 'utf8').split('\n');

setup(async () => {
    return {
        fira: await fontLigatures.loadFile(path.join(__dirname, '../fonts/FiraCode-Regular.otf')),
        iosevka: await fontLigatures.loadFile(path.join(__dirname, '../fonts/iosevka-regular.ttf')),
        monoid: await fontLigatures.loadFile(path.join(__dirname, '../fonts/Monoid-Regular.ttf')),
        ubuntu: await fontLigatures.loadFile(path.join(__dirname, '../fonts/UbuntuMono-Regular.ttf')),
    };
});

test('Fira Code: code.txt', (context, iteration) => {
    const line = code[iteration % code.length];
    context.fira.findLigatures(line);
    return line.length;
});

test('Fira Code: noLigatures.txt', (context, iteration) => {
    const line = noLigatures[iteration % noLigatures.length];
    context.fira.findLigatures(line);
    return line.length;
});

test('Iosevka: code.txt', (context, iteration) => {
    const line = code[iteration % code.length];
    context.iosevka.findLigatures(line);
    return line.length;
});

test('Iosevka: noLigatures.txt', (context, iteration) => {
    const line = noLigatures[iteration % noLigatures.length];
    context.iosevka.findLigatures(line);
    return line.length;
});

test('Monoid: code.txt', (context, iteration) => {
    const line = code[iteration % code.length];
    context.monoid.findLigatures(line);
    return line.length;
});

test('Monoid: noLigatures.txt', (context, iteration) => {
    const line = noLigatures[iteration % noLigatures.length];
    context.monoid.findLigatures(line);
    return line.length;
});

test('Ubuntu Mono: code.txt', (context, iteration) => {
    const line = code[iteration % code.length];
    context.ubuntu.findLigatures(line);
    return line.length;
});

test('Ubuntu Mono: noLigatures.txt', (context, iteration) => {
    const line = noLigatures[iteration % noLigatures.length];
    context.ubuntu.findLigatures(line);
    return line.length;
});

run();
