import {LineLoader} from "./lineLoader";
import {WordLoader} from "./wordLoader";
import {ParaFont} from "../docx/paraFont";
import {ParaFormat} from "../docx/paraFormat";

export class ParaWrapper {
    constructor(options) {
        this.options = options;
        this.para = options.para;
        this.styleMap = options.styleMap;
    }
    isBr(type) {
        let brs = this.para._element.xpath(`.//w:br[@w:type="${type}"]`);
        if(brs.length > 0) {
            if(brs.length > 1) {
                console.log("more than 1 brs", type);
            }
            return true;
        }
        return false;
    }
    get isPageBr() {
        return this.isBr("page");
    }
    get isColBr() {
        return this.isBr("column");
    }
    get isSectPr() {
        let pPr = this.para._element.pPr;
        if(pPr && pPr.sectPr)
            return true;
    }
    initLines(layout) {
        this.layout = layout;
        let width = layout.getColumn().width;
        let contentWidth = this.format.getContentWidth(width);
        //if(contentWidth != width)
        //    console.log(width, contentWidth, 'contentWidth', this.format);
        this.words = new WordLoader({...this.options,
            runs: this.para.contentIter(), para: this});
        this.lines = new LineLoader(this.words, contentWidth);
        this.preLine = null;
    }
    get format() {
        if(!this._format)
            this._format = new ParaFormat(this.para, this.styleMap);
        return this._format;
    }
    get font() {
        if(!this._font)
            this._font = new ParaFont(this.para, this.styleMap).font;
        return this._font;
    }
    wrap() {
        let line = this.preLine || this.lines.nextLine();
        this.preLine = null;
        let col = this.layout.getColumn();
        let div = col.getDiv(this);
        while(line) {
            if(div.addLine(line)) {
                line = this.lines.nextLine();
            } else {
                let nextWidth = this.layout.nextColWidth();
                if(nextWidth !== col.width) {
                    let adjustLine = this.lines.backward(this.format.getContentWidth(nextWidth));
                    if(adjustLine) {
                        div.popLine();
                        line = this.lines.nextLine();
                        div.addLine(line);
                    }
                } else {
                    this.preLine = line;
                }
                if(!div.isEmpty) {
                    col.addDiv(div);
                }
                return {colDone: true};
            }
        }
        if(!div.isEmpty)
            col.addDiv(div);
        return {paraDone: true};
    }
}



