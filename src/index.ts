import * as util from 'util';
import * as createDebugNamespace from 'debug';
import * as opentype from 'opentype.js';
import * as fontFinder from 'font-finder';

import { SubstitutionResult, Font, LigatureData } from './types';
import { Lookup } from './tables';

import processGsubType6Format1 from './processors/6-1';
import processGsubType6Format2 from './processors/6-2';
import processGsubType6Format3 from './processors/6-3';
import processGsubType8Format1 from './processors/8-1';

const debug = createDebugNamespace('font-ligatures:load');

class FontImpl implements Font {
    private _font: opentype.Font;
    private _lookupGroups: Lookup[];

    constructor(font: opentype.Font) {
        this._font = font;

        const caltFeatures = this._font.tables.gsub.features.filter(f => f.tag === 'calt');
        const lookupIndices: number[] = caltFeatures
            .reduce((acc, val) => [...acc, ...val.feature.lookupListIndexes], []);
        this._lookupGroups = this._font.tables.gsub.lookups
            .filter((l, i) => lookupIndices.some(idx => idx === i));
    }

    findLigatures(text: string): LigatureData {
        const glyphIds: number[] = [];
        for (const char of text) {
            glyphIds.push(this._font.charToGlyphIndex(char));
        }

        // If there are no lookup groups, there's no point looking for
        // replacements. This gives us a minor performance boost for fonts with
        // no ligatures
        if (this._lookupGroups.length === 0) {
            return {
                inputGlyphs: glyphIds,
                outputGlyphs: glyphIds,
                contextRanges: []
            };
        }

        let result: number[] = glyphIds.slice();
        const individualContextRanges: [number, number][] = [];

        for (const lookup of this._lookupGroups) {
            switch (lookup.lookupType) {
                // https://docs.microsoft.com/en-us/typography/opentype/spec/gsub#lookuptype-6-chaining-contextual-substitution-subtable
                case 6:
                    for (let index = 0; index < result.length; index++) {
                        for (const table of lookup.subtables) {
                            let res: SubstitutionResult | null = null;
                            switch (table.substFormat) {
                                case 1:
                                    res = processGsubType6Format1(
                                        table,
                                        result,
                                        index,
                                        this._font.tables.gsub.lookups
                                    );
                                    break;
                                case 2:
                                    res = processGsubType6Format2(
                                        table,
                                        result,
                                        index,
                                        this._font.tables.gsub.lookups
                                    );
                                    break;
                                case 3:
                                    res = processGsubType6Format3(
                                        table,
                                        result,
                                        index,
                                        this._font.tables.gsub.lookups
                                    );
                                    break;
                            }

                            // If there was a substitution performed, update
                            // with the information with the substitution.
                            if (res !== null) {
                                index = res.index;
                                individualContextRanges.push(res.contextRange);
                                break;
                            }
                        }
                    }

                    break;
                // https://docs.microsoft.com/en-us/typography/opentype/spec/gsub#lookuptype-8-reverse-chaining-contextual-single-substitution-subtable
                case 8:
                    for (let index = result.length - 1; index >= 0; index--) {
                        for (const table of lookup.subtables) {
                            const res = processGsubType8Format1(
                                table,
                                result,
                                index
                            );

                            // If there was a substitution performed, update
                            // with the information with the substitution.
                            if (res !== null) {
                                index = res.index;
                                individualContextRanges.push(res.contextRange);
                            }
                        }
                    }

                    break;
                default:
                    debug(`substitution lookup type ${(lookup as any).lookupType} is not supported yet`);
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

        return { inputGlyphs: glyphIds, outputGlyphs: result, contextRanges };
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
