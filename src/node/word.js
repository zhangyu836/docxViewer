import {classes} from "@zhangyu836/word-breaker";
import {textMetrics} from "../utils/textMetrics";
import {DefaultRun} from "../loader/runWrapper";

export class Word {

    constructor(type) {
        this.type = type;
        this.parts = [];
    }

    toString() {
        return this.text;
    }
    isSpace() {
        return this.type === classes.WSegSpace;
    }
    isTab() {
        return false;
    }
    isNewline() {
        return this.type === classes.Newline ||
            this.type === classes.CR ||
            this.type === classes.LF;
    }

    addPart(text, run) {
        let part = new Part(text, run);
        this.parts.push(part);
    }

    get text() {
        let a = [];
        for(let part of this.parts) {
            a.push(part.text);
        }
        return a.join('');

    }
    get width() {
        let w = 0;
        for(let part of this.parts) {
            w += part.width
        }
        return w;
    }
    get height() {
        if(this._height) return this._height;
        let h = 0;
        for(let part of this.parts) {
            h = Math.max(h, part.height);
        }
        this._height = h;
        return this._height;
    }
    get descent() {
        if(this._descent) return this._descent;
        let h = 0;
        for(let part of this.parts) {
            h = Math.max(h, part.descent);
        }
        this._descent = h;
        return this._descent;
    }
    wrap(width) {
        let availableWidth = width;
        for(let i = 0; i < this.parts.length; i++) {
            let part = this.parts[i];
            if(part.width < availableWidth) {
                availableWidth -= part.width;
            } else if(part.width === availableWidth) {
                return this.split(i + 1);
            } else {
                let [p0, p1] = part.wrap(availableWidth);
                if(p0) {
                    return this.split2(i, p0, p1);
                } else {
                    return this.split(i);
                }
            }
        }
    }
    split(i) {
        let ps0 = this.parts.slice(0, i);
        let w0 = new SubWord(this.type);
        w0.parts = ps0;
        let ps1 = this.parts.slice(i);
        let w1 = new SubWord(this.type);
        w1.parts = ps1;
        return [w0, w1];
    }
    split2(i, p0, p1) {
        let ps0 = this.parts.slice(0, i);
        let w0 = new SubWord(this.type);
        w0.parts = ps0;
        w0.parts.push(p0);
        let ps1 = this.parts.slice(i + 1);
        let w1 = new SubWord(this.type);
        w1.parts = ps1;
        w1.parts.unshift(p1);
        return [w0, w1];
    }
}
export class SubWord extends Word {
}
export class Part {
    constructor(text, run) {
        this._run = run;
        this._text = text;
        this._metrics = null;
    }
    get text() {
        return this._text;
    }
    set text(_text) {
        if(this._text!==_text) {
            this._metrics = null;
            this._text = _text;
        }
    }
    getParts(refresh) {
        if(!this.subParts) {
            this.subParts = [];
            this.subPartPool = [];
        } else if(refresh) {
            this.subParts.push(...this.subPartPool);
            this.subPartPool = this.subParts;
            this.subParts = [];
        }
        return [this.subPartPool, this.subParts];
    }

    getSubPart(text, part, refresh=false) {
        let [subPartPool, subParts] = this.getParts(refresh);
        let subPart;
        if(subPartPool.length > 0){
            subPart = subPartPool.shift();
            subPart.text = text;
        } else {
            subPart = new SubPart(text, this._run, part);
        }
        subParts.push(subPart);
        return subPart;
    }

    split(i) {
        let p0 = this.getSubPart(this._text.slice(0, i), this, true);
        let p1 = this.getSubPart(this._text.slice(i), this);
        return [p0, p1];
    }

    get metrics() {
        return this._metrics || (
            this._metrics = textMetrics.measureText(this._text, this.fontStyle));
    }

    get width() {
        return this.metrics.width;
    }
    get height() {
        return this.metrics.height;
    }
    get descent() {
        return this.metrics.descent;
    }
    get ascent() {
        return this.metrics.ascent;
    }
    get fontStyle() {
        return this._run.font;
    }

    wrap(width) {
        for(let i = 1; i <= this._text.length; i++) {
            let text = this._text.slice(0, i);
            let m = textMetrics.measureText(text, this.fontStyle);
            if( m.width > width){
                if(i===1) {
                    return [null, this];
                } else {
                    return this.split(i - 1);
                }
            } else if( m.width === width){
                return this.split(i);
            } else {
                if(i === this._text.length)
                    console.log(text, m.width, width);
            }
        }
    }
}

export class SubPart extends Part{
    constructor(text, run, part) {
        super(text, run);
        this.part = part;
    }
    getParts() {
        return [this.part.subPartPool, this.part.subParts];
    }
    split(i) {
        let p1 = this.getSubPart(this._text.slice(i), this.part);
        this.text = this._text.slice(0, i);
        return [this, p1];
    }
}
export class EmptyPart extends Part{
    constructor(_run) {
        super(' ', _run);
    }
    get width() {
        return 0;
    }
}
export class EmptyWord extends Word{
    constructor(_run) {
        super('empty');
        this.parts.push(new EmptyPart(_run));
    }
    isSpace() {
        return true;
    }
}
export class TabPart extends Part{
    constructor(_run) {
        super('    ', _run);
    }
}
export class TabWord extends Word{
    constructor(_run) {
        super('tab');
        this.parts.push(new TabPart(_run));
    }
    isTab() {
        return true;
    }
}
export class EndPart extends Part{
    constructor(_run) {
        super(' ', _run);
    }
    get width() {
        return 0;
    }
    get text() {
        return '';
    }
}
export class EndWord extends Word{
    constructor() {
        super('end');
        let _run = new DefaultRun();
        this.parts.push(new EndPart(_run));
    }
    isSpace() {
        return true;
    }
}
