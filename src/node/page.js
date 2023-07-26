import {Sect} from "./sect";

export class Page {
    constructor(sectPr) {
        this.sectPr = sectPr;
        //this.options = options;
        this.sects = [];
        let {width, height} = sectPr;
        this.width = width;
        this.maxHeight = height;
        this.newSect(sectPr);
    }
    get availableHeight() {
        let h = this.maxHeight;
        for(let sect of this.sects) {
            h -= sect.height;
        }
        return h;
    }
    newSect(sectPr) {
        this.currentSect = new Sect(sectPr, this.availableHeight);
        this.sects.push(this.currentSect);
    }
    switchSect(sectPr) {
        if(this.sectPr.eqDim(sectPr)) {
            this.newSect(sectPr);
            return this.currentSect;
        }
    }
    switchCol() {
        return this.currentSect.switchCol();
    }
    get pageDone() {
        return !this.currentSect.moreColumn;
    }
    get notEmpty() {
        if(this.sects.length > 1) return true;
        return this.currentSect.notEmpty;
    }
}




