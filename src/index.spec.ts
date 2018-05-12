import * as path from 'path';
import test from 'ava';
import * as sinon from 'sinon';
import * as fontFinder from 'font-finder';

import { load } from './';

test.before(t => {
    sinon.stub(fontFinder, 'listVariants').callsFake(async (name: string) => {
        switch (name) {
            case 'Fira Code':
                return [{
                    path: path.join(__dirname, '../fonts/FiraCode-Regular.otf'),
                    weight: 400,
                    type: fontFinder.Type.Monospace,
                    style: fontFinder.Style.Regular
                }];
            case 'Iosevka':
                return [{
                    path: path.join(__dirname, '../fonts/iosevka-regular.ttf'),
                    weight: 400,
                    type: fontFinder.Type.Monospace,
                    style: fontFinder.Style.Regular
                }];
            case 'Monoid':
                return [{
                    path: path.join(__dirname, '../fonts/Monoid-Regular.ttf'),
                    weight: 400,
                    type: fontFinder.Type.Monospace,
                    style: fontFinder.Style.Regular
                }];
            case 'Ubuntu Mono':
                return [{
                    path: path.join(__dirname, '../fonts/UbuntuMono-Regular.ttf'),
                    weight: 400,
                    type: fontFinder.Type.Monospace,
                    style: fontFinder.Style.Regular
                }];
            default:
                return [];
        }
    });
});

interface Context {
    font: string;
    input: string;
    glyphs: number[];
    ranges: [number, number][];
}

const fira = (input: string, glyphs: number[], ranges: [number, number][]) =>
    ({ font: 'Fira Code', input, glyphs, ranges });

const iosevka = (input: string, glyphs: number[], ranges: [number, number][]) =>
    ({ font: 'Iosevka', input, glyphs, ranges });

const monoid = (input: string, glyphs: number[], ranges: [number, number][]) =>
    ({ font: 'Monoid', input, glyphs, ranges });

const ubuntu = (input: string, glyphs: number[], ranges: [number, number][]) =>
    ({ font: 'Ubuntu Mono', input, glyphs, ranges });

const firaCases: Context[] = [
    fira('abc', [133, 145, 146], []),
    fira('.=', [1614, 1081], [[0, 2]]),
    fira('..=', [1614, 1614, 1083], [[0, 3]]),
    fira('.-', [1614, 1080], [[0, 2]]),
    fira(':=', [1614, 1055], [[0, 2]]),
    fira('=:=', [1614, 1614, 1483], [[0, 3]]),
    fira('=!=', [1614, 1614, 1484], [[0, 3]]),
    fira('__', [1614, 1099], [[0, 2]]),
    fira('==', [1614, 1485], [[0, 2]]),
    fira('!=', [1614, 1058], [[0, 2]]),
    fira('===', [1614, 1614, 1486], [[0, 3]]),
    fira('!==', [1614, 1614, 1059], [[0, 3]]),
    fira('=/=', [1614, 1614, 1491], [[0, 3]]),
    fira('<-<', [1614, 1614, 1513], [[0, 3]]),
    fira('<<-', [1614, 1614, 1522], [[0, 3]]),
    fira('<--', [1614, 1614, 1511], [[0, 3]]),
    fira('<-', [1614, 1510], [[0, 2]]),
    fira('<->', [1614, 1614, 1512], [[0, 3]]),
    fira('->', [1614, 1064], [[0, 2]]),
    fira('-->', [1614, 1614, 1063], [[0, 3]]),
    fira('->>', [1614, 1614, 1065], [[0, 3]]),
    fira('>->', [1614, 1614, 1493], [[0, 3]]),
    fira('<=<', [1614, 1614, 1519], [[0, 3]]),
    fira('<<=', [1614, 1614, 1523], [[0, 3]]),
    fira('<==', [1614, 1614, 1517], [[0, 3]]),
    fira('<=>', [1614, 1614, 1518], [[0, 3]]),
    fira('=>', [1614, 1488], [[0, 2]]),
    fira('==>', [1614, 1614, 1487], [[0, 3]]),
    fira('=>>', [1614, 1614, 1489], [[0, 3]]),
    fira('>=>', [1614, 1614, 1495], [[0, 3]]),
    fira('>>=', [1614, 1614, 1498], [[0, 3]]),
    fira('>>-', [1614, 1614, 1497], [[0, 3]]),
    fira('>-', [1614, 1492], [[0, 2]]),
    fira('<~>', [1614, 1614, 1526], [[0, 3]]),
    fira('-<', [1614, 1066], [[0, 2]]),
    fira('-<<', [1614, 1614, 1067], [[0, 3]]),
    fira('=<<', [1614, 1614, 1490], [[0, 3]]),
    fira('<~~', [1614, 1614, 1527], [[0, 3]]),
    fira('<~', [1614, 1525], [[0, 2]]),
    fira('~~', [1614, 1534], [[0, 2]]),
    fira('~>', [1614, 1533], [[0, 2]]),
    fira('~~>', [1614, 1614, 1535], [[0, 3]]),
    fira('<<<', [1614, 1614, 1524], [[0, 3]]),
    fira('<<', [1614, 1521], [[0, 2]]),
    fira('<=', [1614, 1516], [[0, 2]]),
    fira('<>', [1614, 1520], [[0, 2]]),
    fira('>=', [1614, 1494], [[0, 2]]),
    fira('>>', [1614, 1496], [[0, 2]]),
    fira('>>>', [1614, 1614, 1499], [[0, 3]]),
    fira('{.', [1001, 977], [[0, 2]]),
    fira('{|', [1614, 1049], [[0, 2]]),
    fira('[|', [1614, 1050], [[0, 2]]),
    fira('<:', [1614, 1506], [[0, 2]]),
    fira(':>', [1614, 1056], [[0, 2]]),
    fira('|]', [1614, 1474], [[0, 2]]),
    fira('|}', [1614, 1473], [[0, 2]]),
    fira('.}', [977, 1002], [[0, 2]]),
    fira('<|||', [1614, 1614, 1614, 1504], [[0, 4]]),
    fira('<||', [1614, 1614, 1503], [[0, 3]]),
    fira('<|', [1614, 1502], [[0, 2]]),
    fira('<|>', [1614, 1614, 1505], [[0, 3]]),
    fira('|>', [1614, 1477], [[0, 2]]),
    fira('||>', [1614, 1614, 1472], [[0, 3]]),
    fira('|||>', [1614, 1614, 1614, 1470], [[0, 4]]),
    fira('<$', [1614, 1507], [[0, 2]]),
    fira('<$>', [1614, 1614, 1508], [[0, 3]]),
    fira('$>', [1614, 1479], [[0, 2]]),
    fira('<+', [1614, 1514], [[0, 2]]),
    fira('<+>', [1614, 1614, 1515], [[0, 3]]),
    fira('+>', [1614, 1482], [[0, 2]]),
    fira('<*', [1614, 1500], [[0, 2]]),
    fira('<*>', [1614, 1614, 1501], [[0, 3]]),
    fira('*>', [1614, 1047], [[0, 2]]),
    // fira('\\n'),
    // fira('\\\\'),
    fira('/*', [1614, 1092], [[0, 2]]),
    fira('*/', [1614, 1048], [[0, 2]]),
    fira('///', [1614, 1614, 1097], [[0, 3]]),
    fira('//', [1614, 1096], [[0, 2]]),
    fira('</', [1614, 1528], [[0, 2]]),
    fira('<!--', [1614, 1614, 1614, 1509], [[0, 4]]),
    fira('</>', [1614, 1614, 1529], [[0, 3]]),
    fira('/>', [1614, 1095], [[0, 2]]),
    fira('0xff', [895, 270, 166, 166], [[0, 3]]),
    fira('10x10', [896, 895, 270, 896, 895], [[1, 4]]),
    fira('9:45', [904, 998, 899, 900], [[0, 2]]),
    fira('[:]', [1003, 998, 1004], [[0, 2]]),
    fira(';;', [1614, 1091], [[0, 2]]),
    fira('::', [1614, 1052], [[0, 2]]),
    fira(':::', [1614, 1614, 1053], [[0, 3]]),
    fira('..', [1614, 1082], [[0, 2]]),
    fira('...', [1614, 1614, 1085], [[0, 3]]),
    fira('..<', [1614, 1614, 1084], [[0, 3]]),
    fira('!!', [1614, 1057], [[0, 2]]),
    fira('??', [1614, 1090], [[0, 2]]),
    fira('%%', [1614, 1536], [[0, 2]]),
    fira('&&', [1614, 1468], [[0, 2]]),
    fira('||', [1614, 1469], [[0, 2]]),
    fira('?.', [1614, 1089], [[0, 2]]),
    fira('?:', [1614, 1087], [[0, 2]]),
    fira('++', [1614, 1480], [[0, 2]]),
    fira('+++', [1614, 1614, 1481], [[0, 3]]),
    fira('--', [1614, 1061], [[0, 2]]),
    fira('---', [1614, 1614, 1062], [[0, 3]]),
    fira('**', [1614, 1045], [[0, 2]]),
    fira('***', [1614, 1614, 1046], [[0, 3]]),
    fira('~=', [1614, 1532], [[0, 2]]),
    fira('~-', [1614, 1531], [[0, 2]]),
    fira('www', [1614, 1614, 271], [[0, 3]]),
    fira('-~', [1614, 1068], [[0, 2]]),
    fira('~@', [1614, 1530], [[0, 2]]),
    fira('^=', [1614, 1478], [[0, 2]]),
    fira('?=', [1614, 1088], [[0, 2]]),
    fira('/=', [1614, 1093], [[0, 2]]),
    fira('/==', [1614, 1614, 1094], [[0, 3]]),
    fira('-|', [1614, 1060], [[0, 2]]),
    fira('_|_', [1614, 1614, 1098], [[0, 3]]),
    fira('|-', [1614, 1475], [[0, 2]]),
    fira('|=', [1614, 1476], [[0, 2]]),
    fira('||=', [1614, 1614, 1471], [[0, 3]]),
    fira('#!', [1614, 1071], [[0, 2]]),
    fira('#=', [1614, 1075], [[0, 2]]),
    fira('##', [1614, 1072], [[0, 2]]),
    fira('###', [1614, 1614, 1073], [[0, 3]]),
    fira('####', [1614, 1614, 1614, 1074], [[0, 4]]),
    fira('#{', [1614, 1069], [[0, 2]]),
    fira('#[', [1614, 1070], [[0, 2]]),
    fira(']#', [1614, 1051], [[0, 2]]),
    fira('#(', [1614, 1076], [[0, 2]]),
    fira('#?', [1614, 1077], [[0, 2]]),
    fira('#_', [1614, 1078], [[0, 2]]),
    fira('#_(', [1614, 1614, 1079], [[0, 3]]),
    fira('::=', [1614, 1614, 1054], [[0, 3]]),
    fira('.?', [1614, 1086], [[0, 2]]),

    // TODO: this replacement should be possible with only a context of 0-3, but
    // there is a zero-length substitution for all four characters to prevent
    // the ==> sequence from becoming a ligature before we get to the
    // replacement for the ===. What's unclear is whether it's safe to exclude
    // zero-length substitutions from the context without breaking certain
    // glyphs. Leaving this as is for now because it should always yield the
    // right result (even if it's a little conservative).
    fira('===>', [1614, 1614, 1486, 1148], [[0, 4]])
];

const iosevkaCases: Context[] = [
    iosevka('<-', [31, 3127], [[0, 2]]),
    iosevka('<--', [31, 3129, 3139], [[0, 3]]),
    iosevka('<---', [31, 3129, 3150, 3139], [[0, 4]]),
    iosevka('<-----', [31, 3129, 3150, 3139, 3151, 3151], [[0, 6]]),
    iosevka('->', [3126, 33], [[0, 2]]),
    iosevka('-->', [3140, 3128, 33], [[0, 3]]),
    iosevka('--->', [3140, 3150, 3128, 33], [[0, 4]]),
    iosevka('----->', [3153, 3153, 3140, 3150, 3128, 33], [[0, 6]]),
    iosevka('<->', [31, 3149, 33], [[0, 3]]),
    iosevka('<-->', [31, 3129, 3128, 33], [[0, 4]]),
    iosevka('<--->', [31, 3129, 3150, 3128, 33], [[0, 5]]),
    iosevka('<----->', [31, 3129, 3150, 3150, 3150, 3128, 33], [[0, 7]]),

    iosevka('<=', [3094, 3095], [[0, 2]]),
    iosevka('<==', [31, 3158, 3168], [[0, 3]]),
    iosevka('<===', [31, 3158, 3179, 3168], [[0, 4]]),
    iosevka('<=====', [31, 3158, 3179, 3168, 3180, 3180], [[0, 6]]),
    iosevka('=>', [3155, 33], [[0, 2]]),
    iosevka('==>', [3169, 3157, 33], [[0, 3]]),
    iosevka('===>', [3169, 3179, 3157, 33], [[0, 4]]),
    iosevka('=====>', [3182, 3182, 3169, 3179, 3157, 33], [[0, 6]]),
    iosevka('<=>', [31, 3178, 33], [[0, 3]]),
    iosevka('<==>', [31, 3158, 3157, 33], [[0, 4]]),
    iosevka('<===>', [31, 3158, 3179, 3157, 33], [[0, 5]]),
    iosevka('<=====>', [31, 3158, 3179, 3179, 3179, 3157, 33], [[0, 7]]),

    iosevka('<!--', [31, 3184, 3130, 3139], [[0, 4]]),
    iosevka('<!---', [31, 3184, 3130, 3150, 3139], [[0, 5]]),
    iosevka('<!-----', [31, 3184, 3130, 3150, 3139, 3151, 3151], [[0, 7]]),

    iosevka('a:b', [68, 29, 69], []),
    iosevka('a::b', [68, 3012, 3013, 69], [[1, 3]]),
    iosevka('a:::b', [68, 3012, 3010, 3013, 69], [[1, 4]]),

    iosevka(':=', [3011, 32], [[0, 2]]),
    iosevka(':-', [3011, 16], [[0, 2]]),
    iosevka(':+', [3011, 14], [[0, 2]]),
    iosevka('=:', [32, 3011], [[0, 2]]),
    iosevka('-:', [16, 3011], [[0, 2]]),
    iosevka('+:', [14, 3011], [[0, 2]]),

    iosevka('<*', [31, 3023], [[0, 2]]),
    iosevka('*>', [3023, 33], [[0, 2]]),
    iosevka('<*>', [31, 3023, 33], [[1, 3]]),
    iosevka('<**>', [31, 3023, 3023, 33], [[1, 4]]),
    iosevka('<****>', [31, 3023, 3023, 3023, 3023, 33], [[0, 3], [3, 6]]),

    iosevka('==', [3083, 3084], [[0, 2]]),
    iosevka('!=', [3098, 3084], [[0, 2]]),
    iosevka('===', [3083, 3085, 3084], [[0, 3]]),
    iosevka('!==', [3099, 3085, 3084], [[0, 3]]),
    iosevka('====', [3083, 3085, 3085, 3084], [[0, 4]]),
    iosevka('!===', [3100, 3085, 3085, 3084], [[0, 4]])
];

const monoidCases: Context[] = [
    monoid('<!--', [775, 775, 775, 643], [[0, 4]]),
    monoid('-->', [779, 779, 628], [[0, 3]]),
    monoid('<--', [776, 776, 627], [[0, 3]]),
    monoid('->>', [780, 780, 626], [[0, 3]]),
    monoid('<<-', [777, 777, 625], [[0, 3]]),
    monoid('->', [781, 623], [[0, 2]]),
    monoid('<-', [778, 624], [[0, 2]]),
    monoid('=>', [793, 666], [[0, 2]]),
    monoid('<=>', [785, 785, 760], [[0, 3]]),
    monoid('<==>', [786, 786, 786, 771], [[0, 4]]),
    monoid('==>', [787, 787, 672], [[0, 3]]),
    monoid('<==', [788, 788, 671], [[0, 3]]),
    monoid('>>=', [791, 791, 758], [[0, 3]]),
    monoid('=<<', [792, 792, 759], [[0, 3]]),
    monoid('--', [667, 667], [[0, 2]]),
    monoid(':=', [29, 761], [[0, 2]]),
    monoid('=:=', [789, 789, 665], [[0, 3]]),
    monoid('==', [794, 641], [[0, 2]]),
    monoid('!==', [782, 782, 646], [[0, 3]]),
    monoid('!=', [783, 629], [[0, 2]]),
    monoid('<=', [790, 630], [[0, 2]]),
    monoid('>=', [792, 631], [[0, 2]]),
    monoid('//', [621, 664], [[0, 2]]),
    monoid('/**', [18, 753, 753], [[0, 3]]),
    monoid('/*', [18, 753], [[0, 2]]),
    monoid('*/', [754, 18], [[0, 2]]),
    monoid('&&', [633, 775], [[0, 2]]),
    monoid('.&', [17, 755], [[0, 2]]),
    monoid('||', [634, 635], [[0, 2]]),
    monoid('!!', [769, 770], [[0, 2]]),
    monoid('::', [772, 773], [[0, 2]]),
    monoid('>>', [637, 638], [[0, 2]]),
    monoid('<<', [639, 640], [[0, 2]]),
    monoid('¯\\_(ツ)_/¯', [113, 765, 66, 767, 613, 768, 66, 766, 113], [[0, 3], [3, 6], [6, 9]]),
    monoid('__', [763, 764], [[0, 2]])
];

const otherCases = [
    ubuntu('==>', [32, 32, 33], [])
];

for (const { font, input, glyphs, ranges } of [
    ...firaCases,
    ...iosevkaCases,
    ...monoidCases,
    ...otherCases
]) {
    test(`findLigatures() > ${font}: '${input}'`, async t => {
        const inst = await load(font);
        const result = inst.findLigatures(input);
        t.deepEqual(result.outputGlyphs, glyphs);
        t.deepEqual(result.contextRanges, ranges);
    });

    test(`findLigatureRanges() > ${font}: '${input}'`, async t => {
        const inst = await load(font);
        const result = inst.findLigatureRanges(input);
        t.deepEqual(result, ranges);
    });
}

test('findLigatures() caches successive calls correctly', async t => {
    const font = await load('Fira Code', { cacheSize: 100 });
    const result1 = font.findLigatures('in --> out');
    const result2 = font.findLigatures('in --> out');
    t.deepEqual(result1, result2);
});

test('findLigatureRanges() caches successive calls correctly', async t => {
    const font = await load('Fira Code', { cacheSize: 100 });
    const result1 = font.findLigatureRanges('in --> out');
    const result2 = font.findLigatureRanges('in --> out');
    t.deepEqual(result1, result2);
});

test('caches calls to findLigatures() after findLigatureRanges() correctly', async t => {
    const uncached = await load('Fira Code');
    const uncachedResult1 = uncached.findLigatureRanges('in --> out');
    const uncachedResult2 = uncached.findLigatures('in --> out');

    const font = await load('Fira Code', { cacheSize: 100 });
    const result1 = font.findLigatureRanges('in --> out');
    const result2 = font.findLigatures('in --> out');

    t.deepEqual(result1, uncachedResult1);
    t.deepEqual(result2, uncachedResult2);
    t.deepEqual(result1, result2.contextRanges);
});

test('caches calls to findLigatureRanges() after findLigatures() correctly', async t => {
    const uncached = await load('Fira Code');
    const uncachedResult1 = uncached.findLigatures('in --> out');
    const uncachedResult2 = uncached.findLigatureRanges('in --> out');

    const font = await load('Fira Code', { cacheSize: 100 });
    const result1 = font.findLigatures('in --> out');
    const result2 = font.findLigatureRanges('in --> out');

    t.deepEqual(result1, uncachedResult1);
    t.deepEqual(result2, uncachedResult2);
    t.deepEqual(result1.contextRanges, result2);
});

test('throws if the font is not found', async t => {
    try {
        await load('Nonexistant');
        t.fail();
    } catch (e) {
        t.true(e instanceof Error);
    }
});
