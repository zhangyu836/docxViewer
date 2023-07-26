import {
    AlignmentConv, ParaBordersConv,
    IndentSpacingConv, LineSpacingConv, ShdConv
} from './prAttrConvs';

export class PrConv {
    static attrConvs = [];
    static prToConv(pr){
        let conv = {};
        for(let attrConv of this.attrConvs) {
            attrConv.fromPr(pr, conv);
        }
        return conv;
    }
    static toStyleObj(conv, styleObj){
        if(!styleObj)
            styleObj = {};
        for(let attrConv of this.attrConvs) {
            attrConv.toStyleObj(conv, styleObj);
        }
        return styleObj;
    }
    static getStyleObj(pr, styleObj) {
        let conv = this.prToConv(pr);
        return this.toStyleObj(conv, styleObj);
    }
}


export class PPrConv extends PrConv {
    static attrConvs = [IndentSpacingConv, AlignmentConv, LineSpacingConv,
        ShdConv, ParaBordersConv];
    static getStylePr(style) {
        return style._element.pPr;
    }
}



