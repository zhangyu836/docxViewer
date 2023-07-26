import Konva from 'konva/lib/index';
let { Group, Rect } = Konva;
import {DivView} from "./divView";

export class PageView extends Group {
    constructor({page, width, height, y = 55.5}) {
        super({});
        let {pageWidth, leftMargin, topMargin} = page.sectPr.dim;
        let x = (width - pageWidth) / 2;
        this.page = page;
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.ox = x;
        this.oy = y;
        this.contentX = x + leftMargin;
        this.contentY = y + topMargin;
    }
    get pageDim() {
        return this.page.sectPr.dim;
    }

    renderPage(page) {
        this.renderOutline();
        let {contentX, contentY} = this;
        for (let sect of page.sects) {
            this.renderSect(sect, contentX, contentY, this);
            contentY += sect.height;
        }
    }

    renderOutline() {
        let {pageWidth, pageHeight, width, height} = this.pageDim;
        const pageRect = new Rect({
                x: this.ox,
                y: this.oy,
                width: pageWidth,
                height: pageHeight,
                fill: '#f5f5f5'
        });
        this.add(pageRect);
        const contentRect = new Rect({
            x: this.contentX,
            y: this.contentY,
            width,
            height,
            fill: 'white'
        });
        this.add(contentRect);
    }

    renderSect(sect, x, y, canvas) {
        for (let col of sect.columns) {
            this.renderCol(col, x, y, canvas);
            x += col.width;
            x += col.space;
        }
    }

    renderCol(col, x, y, canvas) {
        for (let div of col.divs) {
            let divView = new DivView({});
            divView.renderDiv(div, x, y, canvas);
            y += div.boxHeight;
            canvas.add(divView);
        }
    }
}
