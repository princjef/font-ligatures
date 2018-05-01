import { ChainingContextualSubstitutionTable, Lookup } from '../tables';
import { SubstitutionResult } from '../types';

import getCoverageGlyphIndex from './coverage';
import getSubstitutionGlyph from './substitution';
import getGlyphClass from './classDef';

/**
 * Process substitutions for GSUB lookup table 6, format 2.
 * https://docs.microsoft.com/en-us/typography/opentype/spec/gsub#62-chaining-context-substitution-format-2-class-based-glyph-contexts
 *
 * @param table JSON representation of the table
 * @param sequence Glyph sequence to which substitutions are applied
 * @param index The index where the input starts
 * @param lookups List of tables for lookups
 */
export default function process(table: ChainingContextualSubstitutionTable.Format2, sequence: number[], index: number, lookups: Lookup[]): SubstitutionResult | null {
    // The first input character must be contained in the
    // coverage table for this group to be valid
    if (getCoverageGlyphIndex(table.coverage, sequence[index]) === null) {
        return null;
    }

    const firstInputClass = getGlyphClass(
        table.inputClassDef,
        sequence[index]
    )!;

    const classSet = table.chainClassSet[firstInputClass];

    // If the class set is null, there's nothing to do here
    // TODO: determine if this should be considered a
    // substitution or not (currently assuming it's not)
    // tslint:disable-next-line
    if (classSet == null) {
        return null;
    }

    subTable:
    for (const subTable of classSet) {
        // Eliminate sequences that are too big or belong to
        // other groups
        if (
            subTable.backtrack.length > index ||
            subTable.lookahead.length + subTable.input.length + index > sequence.length
        ) {
            continue;
        }

        // Check if each backtrack character matches
        for (const [i, entry] of subTable.backtrack.entries()) {
            if (getGlyphClass(table.backtrackClassDef, sequence[index - i - 1]) !== entry) {
                continue subTable;
            }
        }

        // Check if each input character matches
        // NOTE: we add one to the index because in format 2
        // the input sequence does not include the first
        // input
        for (const [i, entry] of subTable.input.entries()) {
            if (getGlyphClass(table.inputClassDef, sequence[index + i + 1]) !== entry) {
                continue subTable;
            }
        }

        // Check if each lookahead character matches
        for (const [i, entry] of subTable.lookahead.entries()) {
            if (getGlyphClass(table.lookaheadClassDef, sequence[index + 1 + subTable.input.length + i]) !== entry) {
                continue subTable;
            }
        }

        for (const lookup of subTable.lookupRecords) {
            for (const substitutionTable of (lookups[lookup.lookupListIndex] as Lookup.Type1).subtables) {
                const sub = getSubstitutionGlyph(
                    substitutionTable,
                    sequence[index + lookup.sequenceIndex]
                );

                if (sub !== null) {
                    // If we found a substitution, set the
                    // replacement in our substitution array
                    sequence[index + lookup.sequenceIndex] = sub;
                }
            }
        }

        return {
            index: index + subTable.input.length,
            contextRange: [
                index - subTable.backtrack.length,
                index + subTable.input.length + subTable.lookahead.length + 1
            ]
        };
    }

    return null;
}
