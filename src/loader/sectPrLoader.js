import {IterLoader} from "./iterLoader";

export class SectPrs extends IterLoader {
    setIter(options) {
        this.iter = options.sections.iter();
    }
    pack(value) {
        return new SectPr(value);
    }
}
export class SectPr {
    constructor(sectPr) {
        this.section = sectPr;
    }
    eqDim(sectPr) {
        let attrs = ['leftMargin', 'rightMargin', 'pageWidth',
            'topMargin', 'bottomMargin', 'pageHeight'];
        for(let attr of attrs) {
            //console.log(section.dim[p], this.dim[p])
            if(sectPr.dim[attr] !== this.dim[attr])
                return false;
        }
        return true;
    }
    get width() {
        return this.dim.width;
    }
    get height() {
        return this.dim.height;
    }
    get columnConfigs() {
        if(this._cols) return this._cols;
        let cols = this.section._sectPr.cols;
        if (!cols) {
            this._cols = [this.defaultCol];
            return this._cols;
        }
        let col_lst = cols.col_lst;
        if(col_lst.length === 0) {
            this._cols = [this.defaultCol];
            return this._cols;
        }
        let _cols = [];
        for(let col of col_lst) {
            let space = col.space ? col.space.px : 0;
            let width = col.w.px
            _cols.push({width, space });
        }
        this._cols = _cols;
        return this._cols;
    }

    get dim() {
        if(this._dim) return this._dim;
        if(this.section.left_margin){
            let leftMargin = this.section.left_margin.px;
            let rightMargin = this.section.right_margin.px;
            let pageWidth = this.section.page_width.px;
            let width = pageWidth - leftMargin - rightMargin;
            let topMargin = this.section.top_margin.px;
            let bottomMargin = this.section.bottom_margin.px;
            let pageHeight = this.section.page_height.px;
            let height = pageHeight - topMargin - bottomMargin;
            this._dim = {leftMargin, rightMargin, pageWidth, width,
                topMargin, bottomMargin, pageHeight, height};
        } else {
            this._dim = this.defaultDim;
        }
        return this._dim;
    }
    get defaultDim() {
        return {
            //borderWidth: '1px',
            //borderStyle: 'solid',
            //borderColor: 'darkgray',
            //backgroundColor: 'white',
            leftMargin: 120,
            rightMargin: 120,
            pageWidth: 816,
            width: 576,
            topMargin: 96,
            bottomMargin: 96,
            pageHeight: 1056,
            height: 864
        };
    }
    get defaultCol() {
        return {
            width: this.width,
            space: 0
        }
    }
}
