import {Page} from "./page";

export class Layout {
    constructor(sectPrs) {
        this.sectPrs = sectPrs;
        this.prIndex = 0;
        this.newPage();
    }
    get currentPr() {
        return this.sectPrs.item(this.prIndex);
    }
    newPage() {
        let page = new Page(this.currentPr);
        this.currentPage = page;
        return page;
    }
    getPage() {
        return this.currentPage;
    }
    switchSect() {
        this.prIndex++;
        let sect = this.currentPage.switchSect(this.currentPr);
        if(sect) return {sect};
        else {
            let page = this.currentPage;
            this.newPage(this.currentPr);
            return {page};
        }
    }
    switchCol() {
        let col = this.currentPage.switchCol();
        if(col) return {col};
        else {
            let page = this.currentPage;
            this.newPage(this.currentPr);
            return {page};
        }
    }
    pageDone() {
        return this.currentPage.pageDone;
    }
    getColumn() {
        return this.currentPage.currentSect.currentColumn;
    }
    nextColWidth() {
        return this.currentPage.currentSect.nextColWidth();
    }
}



