import {defaultFontStyle, toFontString} from "../utils/textMetrics";
import {RPrConv} from "./rprConv";

export class RunFont {
    constructor(run, para, styleMap) {
        this.run = run;
        this.para = para;
        this.styleMap = styleMap;
    }
    get fontFromStyleMap() {
        if(!this.run || !this.run._element) {
            return;
        }
        let styleId = this.run._element.style;
        if(styleId) {
            return this.styleMap.idToFont(styleId).conv;
        }
    }
    get fontFromPara() {
        return this.para.font;
    }
    get fontFromRun() {
        if(!this.run || !this.run._element) {
            return;
        }
        let rpr = RPrConv.getStylePr(this.run);
        if (rpr)
            return RPrConv.prToConv(rpr, this.styleMap.theme);
    }
    get font() {
        if(this._font) return this._font;
        let conv = {...this.styleMap.defaultFont, ...this.fontFromStyleMap,
            ...this.fontFromPara, ...this.fontFromRun};
        let obj = RPrConv.toStyleObj(conv);
        let _font = {...defaultFontStyle, ...obj};
        _font.fontString = toFontString(_font);
        this._font = _font;
        return this._font;
    }
}
