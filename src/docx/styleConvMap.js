import {FontConv, FormatConv} from "./styleConv";
//import {TableStyleConv} from "./tblStyleConv";


class StyleConvMap {
    constructor(styleMap) {
        this.styleMap = styleMap
        this.idTo = new Map()
        this.nameTo = new Map()
        this.idToName = new Map()
    }
    addStyle(style) {
        let conv = this.newConv(style)
        this.addConv(conv)
    }
    addConv(conv) {
        let {styleId, name} = conv
        this.idTo.set(styleId, conv)
        this.nameTo.set(name, conv)
        this.idToName.set(styleId, name)
    }
    getConv(name) {
        return this.nameTo.get(name);
    }
}

class FormatConvMap extends  StyleConvMap {
    newConv(style) {
        return new FormatConv(style, this.styleMap)
    }
}

class FontConvMap extends  StyleConvMap {
    newConv(style) {
        return new FontConv(style, this.styleMap)
    }
    addConv(conv, formatConvMap) {
        let {styleId, name, linkId} = conv
        this.idTo.set(styleId, conv)
        this.nameTo.set(name, conv)
        this.idToName.set(styleId, name)
        if(linkId) {
            let formatName = formatConvMap.idToName.get(linkId);
            this.nameTo.set(formatName, conv);
        }
    }
}

export {FormatConvMap, FontConvMap}


