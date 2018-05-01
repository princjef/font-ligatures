import * as createDebugNamespace from 'debug';

import { ClassDefTable } from '../tables';

const debug = createDebugNamespace('font-ligatures:class-def');

/**
 * Get the number of the class to which the glyph belongs, or null if it doesn't
 * belong to any of them.
 *
 * @param table JSON representation of the class def table
 * @param glyphId Index of the glyph to look for
 */
export default function getGlyphClass(table: ClassDefTable, glyphId: number): number | null {
    switch (table.format) {
        // https://docs.microsoft.com/en-us/typography/opentype/spec/chapter2#class-definition-table-format-2
        case 2:
            for (const range of table.ranges) {
                if (range.start <= glyphId && range.end >= glyphId) {
                    return range.classId;
                }
            }

            return null;
        // https://docs.microsoft.com/en-us/typography/opentype/spec/chapter2#class-definition-table-format-1
        default:
            debug('class def format 1 not supported yet');
            return null;
    }
}
