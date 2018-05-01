import { ChainingContextualSubstitutionTable, Lookup } from '../tables';
import { SubstitutionResult } from '../types';

import getCoverageGlyphIndex from './coverage';
import getSubstitutionGlyph from './substitution';

/**
 * Process substitutions for GSUB lookup table 6, format 3.
 * https://docs.microsoft.com/en-us/typography/opentype/spec/gsub#63-chaining-context-substitution-format-3-coverage-based-glyph-contexts
 *
 * @param table JSON representation of the table
 * @param sequence Glyph sequence to which substitutions are applied
 * @param index The index where the input starts
 * @param lookups List of tables for lookups
 */
export default function process(table: ChainingContextualSubstitutionTable.Format3, sequence: number[], index: number, lookups: Lookup[]): SubstitutionResult | null {
    // Eliminate sequences that are too big or belong to
    // other groups
    if (
        table.backtrackCoverage.length > index ||
        table.lookaheadCoverage.length + table.inputCoverage.length + index > sequence.length
    ) {
        return null;
    }

    // Check if each backtrack character matches
    for (const [i, subTable] of table.backtrackCoverage.entries()) {
        if (getCoverageGlyphIndex(subTable, sequence[index - i - 1]) === null) {
            return null;
        }
    }

    // Check if each input character matches
    for (const [i, subTable] of table.inputCoverage.entries()) {
        if (getCoverageGlyphIndex(subTable, sequence[index + i]) === null) {
            return null;
        }
    }

    // Check if each lookahead character matches
    for (const [i, subTable] of table.lookaheadCoverage.entries()) {
        if (getCoverageGlyphIndex(
            subTable,
            sequence[index + table.inputCoverage.length + i]
        ) === null) {
            return null;
        }
    }

    for (const lookup of table.lookupRecords) {
        for (const substitutionTable of (lookups[lookup.lookupListIndex] as Lookup.Type1).subtables) {
            const sub = getSubstitutionGlyph(
                substitutionTable,
                sequence[index + lookup.sequenceIndex]
            );

            // If we found a substitution, set the replacement in
            // our substitution array
            if (sub !== null) {
                sequence[index + lookup.sequenceIndex] = sub;
            }
        }
    }

    return {
        index: index + table.inputCoverage.length - 1,
        contextRange: [
            index - table.backtrackCoverage.length,
            index + table.inputCoverage.length + table.lookaheadCoverage.length
        ]
    };
}
