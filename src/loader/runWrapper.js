import {defaultFontStyle} from "../utils/textMetrics";
import {RunFont} from "../docx/runFont";

export class RunWrapper {
    constructor(run, options) {
        this._run = run;
        this.text = run.text;
        this.para = options.para;
        this.styleMap = options.styleMap;
    }
    get length() {
        return this.text.length;
    }
    charCodeAt(index){
        return this.text.charCodeAt(index);
    }

    get font() {
        if(!this._font)
            this._font = new RunFont(this._run, this.para, this.styleMap).font;
        return this._font;
    }
}

export class DefaultRun {
    constructor(para) {
        this.para = para;
    }
    get font() {
        return defaultFontStyle;
    }
}
