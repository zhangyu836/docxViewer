import {PPrConv} from "./pprConv";
import {RPrConv} from "./rprConv";

export class ParaFont {
    constructor(para, styleMap) {
        this.para = para;
        this.styleMap = styleMap;
    }
    get fontFromStyleMap() {
        let styleId = this.para._element.style;
        if(!styleId) {
            styleId = "Normal";
        }
        let format = this.styleMap.idToFormat(styleId) ;
        if(format){
            return format.font;
        }
    }
    get fontFromRpr() {
        let ppr = PPrConv.getStylePr(this.para);
        if(ppr) {
            let {rPr} = ppr;
            if (rPr) {
                return RPrConv.prToConv(rPr, this.styleMap.theme);
            }
        }
    }
    get font() {
        if(!this._font)
            this._font = {...this.fontFromStyleMap, ...this.fontFromRpr};
        return this._font;
    }
}
