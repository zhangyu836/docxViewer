
export class Theme {
    constructor(theme) {
        this.theme = theme;
    }
    get majorFont() {
        return this.getMFont('major');
    }
    get minorFont() {
        return this.getMFont('minor');
    }
    getMFont(m) {
        let fKey = m + 'Font';
        let _fKey = '_' + fKey;
        let cached = this[_fKey];
        if(cached || cached===null) return cached;
        let fontEle = this.theme[fKey];
        if(fontEle) {
            let mFont = new MFont(fontEle);
            this[_fKey] = mFont.fontObj;
        } else
            this[_fKey] = null;
        return this[_fKey];
    }

}
const cjkScripts = ['Hans', 'Hant', 'Jpan', 'Hang' ];
const csScripts = ['Arab', 'Hebr', 'Thaa', 'Thai', 'Viet'];
export class MFont {
    constructor(mFont) {
        this.mFont = mFont;
    }
    get ascii() {
        return this.mFont.latin.typeface;
    }
    get ea() {
        let ea = this.mFont.ea.typeface;
        if(!ea) {
            ea = this.getScheme(cjkScripts);
        }
        //console.log('mFont', ea);
        return ea;
    }
    get cs() {
        let cs = this.mFont.cs.typeface;
        if(!cs) {
            cs = this.getScheme(csScripts);
        }
        //console.log('mFont', cs);
        return cs;
    }
    getScheme(scripts) {
        let {typeFaces} = this;
        let a = [];
        for(let script of scripts) {
            let font = typeFaces[script];
            if(font)
                a.push(font);
        }
        return a.join(', ');
    }
    get typeFaces() {
        if(this._typeFaces) return this._typeFaces;
        let ls = this.mFont.font_lst;
        let tfs = {};
        for (let font of ls) {
            //console.log(font.script, font.typeface);
            tfs[font.script] = `"${font.typeface}"`;
        }
        this._typeFaces = tfs;
        return this.typeFaces;
    }
    get fontObj() {
        let {ea, cs, ascii} = this;
        return {ea, cs, ascii}
    }
}
