import { ChainingContextualSubstitutionTable, Lookup } from '../tables';
import { SubstitutionResult } from '../types';

import getCoverageGlyphIndex from './coverage';
import getSubstitutionGlyph from './substitution';

/**
 * Process substitutions for GSUB lookup table 6, format 1.
 * https://docs.microsoft.com/en-us/typography/opentype/spec/gsub#61-chaining-context-substitution-format-1-simple-glyph-contexts
 *
 * @param table JSON representation of the table
 * @param sequence Glyph sequence to which substitutions are applied
 * @param index The index where the input starts
 * @param lookups List of tables for lookups
 */
export default function process(table: ChainingContextualSubstitutionTable.Format1, sequence: number[], index: number, lookups: Lookup[]): SubstitutionResult | null {
    const coverageIndex = getCoverageGlyphIndex(
        table.coverage,
        sequence[index]
    );

    // The first input character must ve contained in the
    // coverage table for this group to be valid
    if (coverageIndex === null) {
        return null;
    }

    const chainRuleSet = table.chainRuleSets[coverageIndex];

    // If the chain rule set is null, there's nothing to do
    // here.
    // TODO: determine if this should be considered a
    // substitution or not (currently assuming it's not)
    // tslint:disable-next-line
    if (chainRuleSet == null) {
        return null;
    }

    subTable:
    for (const subTable of chainRuleSet) {
        // Eliminate sequences that are too big or belong to
        // other groups
        if (
            subTable.backtrack.length > index ||
            // TODO: review this line (off by 1 because of first input?)
            subTable.lookahead.length + subTable.input.length + index > sequence.length
        ) {
            return null;
        }

        // Check if each backtrack character matches
        for (const [i, entry] of subTable.backtrack.entries()) {
            if (sequence[index - i - 1] !== entry) {
                continue subTable;
            }
        }

        // Check if each input character matches
        // NOTE: we add one to the index because in format 1
        // the input sequence does not include the first
        // input
        for (const [i, entry] of subTable.input.entries()) {
            if (sequence[index + i + 1] !== entry) {
                continue subTable;
            }
        }

        // Check if each lookahead character matches
        for (const [i, entry] of subTable.lookahead.entries()) {
            if (sequence[index + 1 + subTable.input.length + i] !== entry) {
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
