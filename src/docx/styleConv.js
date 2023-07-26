import {PrConv, PPrConv} from "./pprConv";
import {RPrConv} from "./rprConv";

class StyleConv {
    static prConv = PrConv;
    constructor(style, styleMap) {
        this.style = style;
        this.styleMap = styleMap;
    }
    get baseId() {
        if (this.style.base_style)
            return this.style.base_style.style_id;
    }
    get conv() {
        if(!this._conv)
            this._conv = this.constructor.fromStyle(this.style);
        return this._conv;
    }
    get linkId() {
        let elem = this.style._element;
        let link = elem.find('w:link');
        if(link){
            return link.getAttribute("w:val");
        }
    }
    get name() {
        return this.style.name;
    }
    get styleId() {
        return this.style.style_id;
    }
    static fromStyle(style, theme) {
        let pr = this.prConv.getStylePr(style);
        if(pr){
            let conv = this.prConv.prToConv(pr, theme);
            return conv;
        } else {
            return {};
        }
    }
}

class FormatConv extends StyleConv {
    static prConv = PPrConv;
    //constructor(style, styleMap) {
    //    super(style, styleMap);
    //    this.numberingMap = styleMap.numberingMap;
    //}
    get formatElement() {
        return this.format._element;
    }
    get conv() {
        if(!this._conv) {
            let base = this.styleMap.idToFormat(this.baseId);
            let conv = this.constructor.fromStyle(this.style);
            if(base)
                this._conv = {...base.conv, ...conv};
            else
                this._conv = conv;
        }
        return this._conv;
    }
    //get numberingObj() {
    //    let numbering = this.numberingMap.get(this.styleId);
    //    return numbering ? numbering.styleObj : null;
    //}
    get font() {
        if(!this._font) {
            let linkId = this.linkId;
            if(linkId) {
                let fontConv = this.styleMap.idToFont(linkId);
                //console.log(fontConv, fontConv.conv, 'font by linked', this.styleId)
                //return fontConv.conv;
                this._font = fontConv.conv;
            } else {
                let rpr = this.style._element.rPr;
                if(rpr) {
                    let conv = RPrConv.prToConv(rpr, this.styleMap.theme);
                    //console.log(conv, 'font by style rpr', this.styleId);
                    //return conv;
                    this._font = conv;
                } else {
                    //console.log('font by style rpr, no rpr', this.styleId);
                    this._font = {};
                }
            }
        }
        return this._font;
    }
}


class FontConv extends StyleConv {
    static prConv = RPrConv;
    constructor(style, styleMap) {
        super(style, styleMap);
        this.theme = styleMap.theme;
    }
    get conv() {
        if(!this._conv) {
            let base = this.styleMap.idToFont(this.baseId);
            let conv = this.constructor.fromStyle(this.style, this.theme );
            if(base)
                this._conv = {...base.conv, ...conv};
            else
                this._conv = conv;
        }
        return this._conv;
    }
    get fontElement() {
        return this.font._element;
    }
}

export {FontConv, FormatConv, StyleConv}
