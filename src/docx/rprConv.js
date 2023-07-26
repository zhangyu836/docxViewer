//import {RunBorderConv} from "./prAttrConvs";
import {PrConv} from "./pprConv";
import {fontChecker} from "../utils/fontcheck";

const ST_HexColorAuto = 'auto';
const boolAttrs = ['b', 'i', 'caps', 'smallCaps'];//, 'rtl', 'strike', 'outline'
const boolAttrs2 = ['subscript', 'superscript'];


function parseRFonts(rFonts, theme, conv) {
    if(!rFonts) return;
    let {ascii, hAnsi, eastAsia, cs, asciiTheme,
        hAnsiTheme, eastAsiaTheme, csTheme, hint } = rFonts;
    if(asciiTheme) {
        //console.log(asciiTheme, 'asciiTheme');//,
        let m = asciiTheme.slice(0,5) + 'Font';
        conv.ascii = theme[m].ascii;
        fontChecker.addTbc(conv.ascii);
    }
    if(ascii) {
        //console.log(ascii, 'ascii');
        conv.ascii = ascii;
        fontChecker.addTbc(conv.ascii);
    }
    if(eastAsiaTheme) {
        //console.log(eastAsiaTheme, 'eastAsiaTheme');
        let m = eastAsiaTheme.slice(0,5) + 'Font'
        conv.ea = theme[m].ea;
        fontChecker.addTbc(conv.ea);
    }
    if(eastAsia) {
        //console.log(eastAsia, 'eastAsia');
        conv.ea = eastAsia;
        fontChecker.addTbc(conv.ea);
    }
    if(csTheme) {
        //console.log(csTheme, 'csTheme');
        let m = csTheme.slice(0,5) + 'Font'
        conv.cs = theme[m].cs;
        fontChecker.addTbc(conv.cs);
    }
    if(cs) {
        //console.log(cs, 'cs');
        conv.cs = cs;
        fontChecker.addTbc(conv.cs);
    }
    if(hint) {
        //console.log(hint, 'hint')
        if(hint==='eastAsia') {
            conv.ea = theme['majorFont'].ea;
            fontChecker.addTbc(conv.ea);
        }
    } //else
    //console.log(ascii, hAnsi, eastAsia, cs, asciiTheme,
    //    hAnsiTheme, eastAsiaTheme, csTheme, hint);
    return conv;

}
function fixFont(font) {
    if(font.includes(';')) {
        let a = font.split(';');
        let b = [];
        for(let p of a) {
            b.push(`"${p}"`);
        }
        //console.log(b.join(', '), font, 'fixFont')
        return b.join(', ');
    }
    return font;
}

export function joinFontName(fontObj) {
    let {ascii, ea, cs} = fontObj;
    let a = [];
    if(ascii) {
        a.push(fixFont(ascii));
    }
    if(ea) {
        a.push(fixFont(ea));
    }
    if(cs) {
        //console.log(cs);
        a.push(fixFont(cs));
    }
    return a.join(',');
}

export class RPrConv extends PrConv {
    static getStylePr(style) {
        return style._element.rPr;
    }
    static prToConv(pr, theme) {
        let conv = {};
        for(let attr of boolAttrs){
            let v = pr._get_bool_val(attr);
            if(v!==null) {
                conv[attr] = v;
            }
        }
        for(let attr of boolAttrs2){
            let v = pr[attr];
            if(v!==null) {
                conv[attr] = v;
            }
        }
        let {sz_val, color, u_val} = pr;//, highlight_val, u_val
        if(sz_val)
            conv.fontSize = sz_val.pt;
        else {
            //let szCs = pr.find('w:szCs');
            //if (szCs) {
            //    console.log('szCs', szCs);
            //}
        }

        if(color){
            if (color.val != ST_HexColorAuto) {
                conv.fontColor = color.val;
            }
        }
        //if(highlight_val){
            //console.log(highlight_val, 'highlight')
            //conv.highlight = enums.WD_COLOR.to_xml(highlight_val);
        //}
        if(u_val)
            conv.underline = u_val;
        //RunBorderConv.from(pr, conv);
        let {rFonts} = pr;
        if (rFonts)
            parseRFonts(rFonts, theme, conv);
        return conv;
    }
    static toStyleObj(conv, obj){
        if(!obj)
            obj = {};
        if (conv.b) {
            obj.fontWeight = 'bold';
        }
        if (conv.i) {
            obj.fontStyle = 'italic';
        }
        if (conv.underline) {
            obj.textDecoration = 'underline';
        }
        //if (conv.rtl) {
        //    obj.direction = 'rtl';
        //}
        if(conv.caps) {
            obj.fontVariant = 'all-small-caps';
        }
        if(conv.smallCaps) {
            obj.fontVariant = 'small-caps';
        }
        //if (conv.outline) {
        //    obj.outline = 'auto';
       // }
        if (conv.fontColor) {
            obj.fill = `#${conv.fontColor}`;
        }
        if (conv.fontSize) {
            obj.fontSize = conv.fontSize;
        }
        //if (conv.highlight) {
        //    obj.backgroundColor = conv.highlight;
        //}
        //if(conv.fontName) {
            obj.fontFamily = joinFontName(conv);
        //}
        //RunBorderConv.toStyleObj(conv, obj);
        return obj;
    }
}





