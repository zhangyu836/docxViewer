import Konva from "konva/lib";
let {Layer, Rect} = Konva;
import {PageView} from "./pageView";
import {fontChecker} from "../utils/fontcheck";

export class DocView {

    constructor(docLayout, stage) {
        this.docLayout = docLayout;
        this.stage = stage;
        let width = stage.width();
        let height = stage.height();
        this.canvasConfig = {width, height};
        this.renderBg();
        let layer = new Layer();
        stage.add(layer);
        this.canvas = layer;
        this.pageViews = [];
        this.renderedPages = [];
    }

    renderBg() {
        let layer = new Layer();
        let bg = new Rect({
            x: 0,
            y: 0,
            fill: 'lightsteelblue',
            strokeWidth: 1,
            ...this.canvasConfig
        });
        layer.add(bg);
        this.stage.add(layer);
    }

    getPageView(index) {
        let pageView = this.pageViews[index];
        if(!pageView) {
            let page = this.docLayout.pages.item(index);
            if(!page) {
                let len = this.docLayout.pages.items.length;
                return {pageView: null, len};
            }
            pageView = this.renderPageView(page);
            this.pageViews[index] = pageView;
            console.log(this.docLayout);
            console.log(this);
        }
        return {pageView};
    }
    renderPageView(page) {
        let pageView = new PageView({page, ...this.canvasConfig });
        pageView.renderPage(page);
        return pageView;
    }
    renderPageByIndex(index) {
        let {pageView, len} = this.getPageView(index);
        if(!pageView) {
            if(len) {
                console.log('page count', len);
                ({pageView} = this.getPageView(len - 1) );

            } else
                return;
        }
        if(!pageView) {
            console.log("no pages");
            return;
        }
        let pageNo = len? len : index + 1;
        console.log('page ', pageNo);
        this.clearCanvas();
        this.canvas.add(pageView);
        this.renderedPages.push(pageView);
        fontChecker.check();
    }
    clearCanvas() {
        this.canvas.removeChildren();
        this.renderedPages.length = 0;
    }

}
