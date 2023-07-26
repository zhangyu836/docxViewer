import {FontConv, FormatConv} from './styleConv';
//import {TableStyleConv} from './tblStyleConv';
import {FormatConvMap, FontConvMap} from "./styleConvMap";
import {LineSpacingConv} from "./prAttrConvs";
//, TableStyleConvMap

export class StyleMap {
    constructor(styles, theme) {
        this.styles = styles;
        this.theme = theme;
        //this.numberingMap = numberingMap;

        this.formatConvMap = new FormatConvMap(this);
        this.fontConvMap = new FontConvMap(this);
        //this.tableStyleConvMap = new TableStyleConvMap(this);

        this.loadStyles();
        this.loadDefaults();
    }
    loadStyles(){
        for(let style of this.styles) {
            let type = style.type
            if (type===1){
                let formatConv = new FormatConv(style, this);
                this.formatConvMap.addConv(formatConv);
            } else if(type===2){
                let fontConv = new FontConv(style, this);
                this.fontConvMap.addConv(fontConv, this.formatConvMap);
            } else if(type===3) {
                //let tableConv = new TableStyleConv(style, this);
                //this.tableStyleConvMap.addConv(tableConv);
            }
        }
    }
    loadDefaults() {
        let format = this.styles.default_format();
        let conv = {
            marginLeft: 0,
            marginRight: 0,
            marginTop: 0,
            marginBottom: 0,
            lineSpacing: new LineSpacingConv()
        }
        if(format){
            let formatConv = FormatConv.fromStyle(format);
            Object.assign(conv, formatConv);
            console.log('default format', conv);
        }
        this.defaultFormat = conv;
        let font = this.styles.default_font();
        let conv2 = {};
        if(font){
            let fontConv = FontConv.fromStyle(font, this.theme);
            Object.assign(conv2, fontConv);
            console.log('default font', conv2);
        }
        this.defaultFont = conv2;
    }
    getFont(name) {
        let font = this.fontConvMap.getConv(name);
        if(font) {
            return font.conv
        }
        return null;
    }
    getFormat(name) {
        let format = this.formatConvMap.getConv(name);
        if(format) {
            return format.conv
        }
        return null;
    }
    //getFormatNumbering(name) {
    //    let format = this.formatConvMap.getConv(name);
    //    if(format)
    //        return format.numberingObj;
    //}
    idToFont(id) {
        return this.fontConvMap.idTo.get(id);
    }
    idToFontName(id) {
        return this.fontConvMap.idToName.get(id);
    }
    idToFormat(id) {
        return this.formatConvMap.idTo.get(id);
    }
    idToFormatName(id) {
        return this.formatConvMap.idToName.get(id);
    }
}

