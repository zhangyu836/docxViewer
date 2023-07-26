
export class Div {
    constructor(options) {
        this.options = options;
        this.width = options.width;
        this.maxHeight = options.maxHeight;
        //this.para = options.para;
        this.format = options.para.format;
        this.availableHeight = this.format.getContentHeight(this.maxHeight);
        this.lines = [];
    }

    addLine(line) {
        let {height} = this.format.getLineHeight(line.wordsHeight);
        line.contentHeight = height;
        if(height <= this.availableHeight) {
            this.lines.push(line);
            this.availableHeight -= height;
            return true;
        }
        return false;
    }
    get linesHeight() {
        if(this._linesHeight) return this._linesHeight;
        let h = 0;
        for(let line of this.lines) {
            h += line.contentHeight;
        }
        this._linesHeight = h;
        return this._linesHeight;
    }
    get boxHeight() {
        return this.format.getBoxHeight(this.linesHeight);
    }
    getOffsetX(x) {
        return this.format.getOffsetX(x);
    }
    getOffsetY(y) {
        return this.format.getOffsetY(y);
    }
    getBorders(x, y) {
        let aBox = {x, y, width: this.width, contentHeight: this.linesHeight}
        return this.format.getBorders(aBox);
    }
    get isEmpty() {
        return this.lines.length === 0;
    }
    get notEmpty() {
        return this.lines.length > 0;
    }
    popLine() {
        let line = this.lines.pop();
        this.availableHeight += line.height;
    }
}
