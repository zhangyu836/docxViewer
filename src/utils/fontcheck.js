import {offscreenCanvasCreator} from "./offscreencanvas";

function fontCheck(testFont) {
    //from https://github.com/rwoodr/fontcheck
    let baseFonts = ['serif', 'sans-serif', 'monospace'];
    // Text to use for all measurments
    let testString = 'abcdefghijklmnopqrstuvwxyz& #0123456789';
    // Font size for all measurments
    let fontSize = '32px';
    // Canvas context
    let context = offscreenCanvasCreator.getOrCreateContext();

    // Return result of comparing test font to base fonts
    return baseFonts.some(baseFont => {
        // Measure base font
        context.font = fontSize + ' ' + baseFont;
        let baseFontWidth = context.measureText(testString).width;

        // Measure test font, include base font fallback
        context.font = fontSize + ' ' + testFont + ',' + baseFont;
        let testFontWidth = context.measureText(testString).width;

        // Return true immediately if the widths are different (font available)
        // Or return false after all base fonts checked (font not available)
        return (baseFontWidth !== testFontWidth);
    });
}

class FontChecker {
    constructor() {
        this.toBeChecked = [];
        this.checked = new Map();
    }
    addTbc(fontName) {
        let c = this.checked.get(fontName);
        if(!c && !this.toBeChecked.includes(fontName)) {
            this.toBeChecked.push(fontName);
        }
    }
    check() {
        for(let fontName of this.toBeChecked) {
            if(fontCheck(fontName)) {
                //console.log("font available", fontName);
                this.checked.set(fontName, true);
            } else {
                console.log("font not available", fontName);
                this.checked.set(fontName, false);
            }
        }
        this.toBeChecked.length = 0;
    }
}

export const fontChecker = new FontChecker();
