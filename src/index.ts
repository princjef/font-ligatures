import * as util from 'util';
import * as opentype from 'opentype.js';
import * as fontFinder from 'font-finder';

import { Font, LigatureData, FlattenedLookupTree, LookupTree } from './types';
import mergeTrees from './merge';
import walkTree from './walk';

import buildTreeGsubType6Format1 from './processors/6-1';
import buildTreeGsubType6Format2 from './processors/6-2';
import buildTreeGsubType6Format3 from './processors/6-3';
import buildTreeGsubType8Format1 from './processors/8-1';
import flatten from './flatten';

class FontImpl implements Font {
    private _font: opentype.Font;
    private _lookupTrees: { tree: FlattenedLookupTree; processForward: boolean; }[] = [];

    constructor(font: opentype.Font) {
        this._font = font;

        const caltFeatures = this._font.tables.gsub.features.filter(f => f.tag === 'calt');
        const lookupIndices: number[] = caltFeatures
            .reduce((acc, val) => [...acc, ...val.feature.lookupListIndexes], []);
        const lookupGroups = this._font.tables.gsub.lookups
            .filter((l, i) => lookupIndices.some(idx => idx === i));

        const allLookups = this._font.tables.gsub.lookups;

        for (const lookup of lookupGroups) {
            const trees: LookupTree[] = [];
            switch (lookup.lookupType) {
                case 6:
                    for (const [index, table] of lookup.subtables.entries()) {
                        switch (table.substFormat) {
                            case 1:
                                trees.push(buildTreeGsubType6Format1(table, allLookups, index));
                                break;
                            case 2:
                                trees.push(buildTreeGsubType6Format2(table, allLookups, index));
                                break;
                            case 3:
                                trees.push(buildTreeGsubType6Format3(table, allLookups, index));
                                break;
                        }
                    }
                    break;
                case 8:
                    for (const [index, table] of lookup.subtables.entries()) {
                        trees.push(buildTreeGsubType8Format1(table, index));
                    }
                    break;
            }

            this._lookupTrees.push({
                tree: flatten(mergeTrees(trees)),
                processForward: lookup.lookupType !== 8
            });
        }
    }

    findLigatures(text: string): LigatureData {
        const glyphIds: number[] = [];
        for (const char of text) {
            glyphIds.push(this._font.charToGlyphIndex(char));
        }

        // If there are no lookup groups, there's no point looking for
        // replacements. This gives us a minor performance boost for fonts with
        // no ligatures
        if (this._lookupTrees.length === 0) {
            return {
                inputGlyphs: glyphIds,
                outputGlyphs: glyphIds,
                contextRanges: []
            };
        }

        const result = this._findInternal(glyphIds.slice());

        return {
            inputGlyphs: glyphIds,
            outputGlyphs: result.sequence,
            contextRanges: result.ranges
        };
    }

    findLigatureRanges(text: string): [number, number][] {
        // Short circuit the process if there are no possible ligatures in the
        // font
        if (this._lookupTrees.length === 0) {
            return [];
        }

        const glyphIds: number[] = [];
        for (const char of text) {
            glyphIds.push(this._font.charToGlyphIndex(char));
        }

        const result = this._findInternal(glyphIds);

        return result.ranges;
    }

    private _findInternal(sequence: number[]): { sequence: number[]; ranges: [number, number][]; } {
        const individualContextRanges: [number, number][] = [];

        for (const { tree, processForward } of this._lookupTrees) {
            for (let i = 0; i < sequence.length; i++) {
                const index = processForward ? i : sequence.length - i - 1;
                const result = walkTree(tree, sequence, index, index);
                if (result) {
                    for (let j = 0; j < result.substitutions.length; j++) {
                        const sub = result.substitutions[j];
                        if (sub !== null) {
                            sequence[index + j] = sub;
                        }
                    }

                    individualContextRanges.push([
                        result.contextRange[0] + index,
                        result.contextRange[1] + index
                    ]);

                    i += result.length - 1;
                }
            }
        }

        // Collapse context ranges
        // TODO: should we do the same for substitution ranges?
        individualContextRanges.sort((a, b) => a[0] - b[0] || a[1] - b[0]);

        const contextRanges: [number, number][] = individualContextRanges.length > 0
            ? [individualContextRanges.shift()!]
            : [];
        for (const range of individualContextRanges) {
            if (range[0] < contextRanges[contextRanges.length - 1][1]) {
                // This overlaps with the previous range. Combine them
                contextRanges[contextRanges.length - 1][1] = Math.max(
                    range[1],
                    contextRanges[contextRanges.length - 1][1]
                );
            } else {
                // This is a new range. Add it to the end
                contextRanges.push(range);
            }
        }

        return { sequence, ranges: contextRanges };
    }
}

/**
 * Load the font with the given name. The returned value can be used to find
 * ligatures for the font.
 *
 * @param name Font family name for the font to load
 */
export async function load(name: string): Promise<Font> {
    // We just grab the first font variant we find for now.
    // TODO: allow users to specify information to pick a specific variant
    const [fontInfo] = await fontFinder.listVariants(name);

    if (!fontInfo) {
        throw new Error(`Font ${name} not found`);
    }

    return loadFile(fontInfo.path);
}

/**
 * Load the font at the given file path. The returned value can be used to find
 * ligatures for the font.
 *
 * @param path Path to the file containing the font
 */
export async function loadFile(path: string): Promise<Font> {
    const font = await util.promisify<string, opentype.Font>(opentype.load as any)(path);
    return new FontImpl(font);
}

export { Font, LigatureData };
