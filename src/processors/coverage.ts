import { CoverageTable } from '../tables';

/**
 * Get the index of the given glyph in the coverage table, or null if it is not
 * present in the table.
 *
 * @param table JSON representation of the coverage table
 * @param glyphId Index of the glyph to look for
 */
export default function getCoverageGlyphIndex(table: CoverageTable, glyphId: number): number | null {
    switch (table.format) {
        // https://docs.microsoft.com/en-us/typography/opentype/spec/chapter2#coverage-format-1
        case 1:
            const index = table.glyphs.indexOf(glyphId);
            return index !== -1
                ? index
                : null;
        // https://docs.microsoft.com/en-us/typography/opentype/spec/chapter2#coverage-format-2
        case 2:
            const range = table.ranges
                .find(range => range.start <= glyphId && range.end >= glyphId);
            return range
                ? range.index
                : null;
    }
}
