import {PageLoader} from "./pageLoader";
import {SectPrs} from "./sectPrLoader";
import {Layout} from "../node/layout";
import {StyleMap} from "../docx/styleMap";
import {Theme} from "../docx/theme";

export class DocLayout {
    constructor(doc) {
        let theme = new Theme(doc.theme);
        let sectPrs = new SectPrs({sections: doc.sections});
        let layout = new Layout(sectPrs);
        let styleMap = new StyleMap(doc.styles, theme);
        let contentIter = doc._body.contentIter();
        this.pages = new PageLoader({
            contentIter,
            layout,
            styleMap,
            doc,
        });
    }
}
