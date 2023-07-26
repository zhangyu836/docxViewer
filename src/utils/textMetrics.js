import {offscreenCanvasCreator} from './offscreencanvas';

export const defaultFontStyle = {
    fontSize: 10,// pt
    fontFamily: 'Cambria',
    fontWeight: 'normal',
    fontVariant: 'normal',
    fontStyle: 'normal',
    fontString: '10pt Cambria'
};

export function toFontString(attributes) {
    const { fontSize, fontFamily, fontStyle, fontVariant, fontWeight } =
        attributes;
    const fontSizeString = `${fontSize}pt`;
    return `${fontStyle} ${fontVariant} ${fontWeight} ${fontSizeString} ${fontFamily}`;
}

export class TextMetrics {

    measureText(text, style) {
        const { fontSize, fontString: font } = style;
        const context = offscreenCanvasCreator.getOrCreateContext();
        context.font = font;
        //context.fontStretch = "ultra-condensed";
        //context.letterSpacing = `${-0.05*fontSize}pt`;
        const m = context.measureText(text);
        let ascent, descent;
        if (m.fontBoundingBoxAscent) {
            ascent = m.fontBoundingBoxAscent;
            descent = m.fontBoundingBoxDescent;
        } else {
            let h = fontSize * 4/3;
            ascent = m.actualBoundingBoxAscent;
            descent = m.actualBoundingBoxDescent;
            let as = (h - ascent - descent) * 0.9;
            let ds = (h - ascent - descent) * 0.1;
            ascent += as;
            descent += ds;
            //console.log(m, font, text, as, ds);
        }
        let height = ascent + descent;
        let width = m.width;
        return {font, width, height, ascent, descent };
    }
}

export const textMetrics = new TextMetrics();
