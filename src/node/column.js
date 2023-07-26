import {Div} from "./div";

export class Column {
    constructor(config, maxHeight) {
        this.config = config;
        this.maxHeight = maxHeight;
        this.width = config.width;
        this.space = config.space;
        this.divs = [];
    }
    get availableHeight() {
        let h = this.maxHeight;
        for(let div of this.divs) {
            h -= div.boxHeight;
        }
        return h;
    }
    get height() {
        let h = 0;
        for(let div of this.divs) {
            h += div.boxHeight;
        }
        return h;
    }

    addDiv(div) {
        this.divs.push(div);
    }

    getDiv(para) {
        return new Div({maxHeight: this.availableHeight, width: this.width, para});
    }
    get notEmpty() {
        if(this.divs.length > 0) return true;
    }

}
