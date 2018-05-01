import { SubstitutionTable } from '../tables';

import getCoverageGlyphIndex from './coverage';

/**
 * Get the substitution glyph for the givne glyph, or null if the glyph was not
 * found in the table.
 *
 * @param table JSON representation of the substitution table
 * @param glyphId The index of the glpyh to find substitutions for
 */
export default function getSubstitutionGlyph(table: SubstitutionTable, glyphId: number): number | null {
    const coverageIndex = getCoverageGlyphIndex(table.coverage, glyphId);
    if (coverageIndex === null) {
        return null;
    }

    switch (table.substFormat) {
        // https://docs.microsoft.com/en-us/typography/opentype/spec/gsub#11-single-substitution-format-1
        case 1:
            // TODO: determine if there's a rhyme or reason to the 16-bit
            // wraparound and if it can ever be a different number
            return (glyphId + table.deltaGlyphId) % (2 ** 16);
        // https://docs.microsoft.com/en-us/typography/opentype/spec/gsub#12-single-substitution-format-2
        case 2:
            // tslint:disable-next-line
            return table.substitute[coverageIndex] != null
                ? table.substitute[coverageIndex]
                : null;
    }
}
