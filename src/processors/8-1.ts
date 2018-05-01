import { ReverseChainingContextualSingleSubstitutionTable } from '../tables';
import { SubstitutionResult } from '../types';

import getCoverageGlyphIndex from './coverage';

/**
 * Process substitutions for GSUB lookup table 8, format 1.
 * https://docs.microsoft.com/en-us/typography/opentype/spec/gsub#81-reverse-chaining-contextual-single-substitution-format-1-coverage-based-glyph-contexts
 *
 * @param table JSON representation of the table
 * @param sequence Glyph sequence to which substitutions are applied
 * @param index The index where the input starts
 */
export default function process(table: ReverseChainingContextualSingleSubstitutionTable, sequence: number[], index: number): SubstitutionResult | null {
    // The glyph must be in the input coverage table
    const glyphIndex = getCoverageGlyphIndex(table.coverage, sequence[index]);
    if (glyphIndex === null) {
        return null;
    }

    // Check if each backtrack character matches
    for (const [i, subTable] of table.backtrackCoverage.entries()) {
        if (getCoverageGlyphIndex(subTable, sequence[index - i - 1]) === null) {
            return null;
        }
    }

    // Check if each lookahead character matches
    for (const [i, subTable] of table.lookaheadCoverage.entries()) {
        if (getCoverageGlyphIndex(subTable, sequence[index + i + 1]) === null) {
            return null;
        }
    }

    // tslint:disable-next-line
    if (table.substitutes[glyphIndex] !== undefined) {
        sequence[index] = table.substitutes[glyphIndex];
    }

    return {
        index: index,
        contextRange: [
            index - table.backtrackCoverage.length,
            index + table.lookaheadCoverage.length + 1
        ]
    };
}
