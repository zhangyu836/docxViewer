import {PPrConv} from "./pprConv";

export class ParaFormat {
    constructor(para, styleMap) {
        this.para = para;
        this.styleMap = styleMap;
    }
    get formatFromStyleMap(){
        let styleId = this.para._element.style;
        if(!styleId) {
            styleId = "Normal";
        }
        let format = this.styleMap.idToFormat(styleId) ;
        if(format){
            return format.conv;
        }
    }
    get formatFromPpr(){
        let ppr = PPrConv.getStylePr(this.para);
        if(ppr) {
            return PPrConv.prToConv(ppr);
        }
    }
    get format() {
        if(!this._format)
            this._format = {...this.styleMap.defaultFormat,
                ...this.formatFromStyleMap, ...this.formatFromPpr};
        return this._format;
    }
    getBorders(aBox) {
        let {left, right, top, bottom, backgroundColor} = this.format;
        let borderBox = this.paraBox.getBorderBox(aBox);
        return {left, right, top, bottom, backgroundColor, borderBox};
    }
    getBoxHeight(contentHeight) {
        return this.paraBox.getBoxHeight(contentHeight);
    }
    getContentWidth(width) {
        return this.paraBox.getContentWidth(width);
    }
    getContentHeight(height) {
        return this.paraBox.getContentHeight(height);
    }
    getOffsetX(x) {
        return this.paraBox.getOffsetX(x);
    }
    getOffsetY(y) {
        return this.paraBox.getOffsetY(y);
    }
    getLineHeight(height) {
        return this.format.lineSpacing.getLineHeight(height);
    }
    get paraBox() {
        if(!this._paraBox)
            this._paraBox = new ParaBox(this.format);
        return this._paraBox;
    }
}


function cap(side) {
    return side.charAt(0).toUpperCase() + side.slice(1,);
}

class BoxSide {
    constructor(side, format) {
        let Side = cap(side);
        let margin = format['margin'+Side] || 0;
        let border = format[side];
        let padding = 0;
        let width = 0;
        if(border) {
            ( {padding, width} = border);
        }
        this.margin = margin;
        this.padding = padding;
        this.width = width;
        this.border = border;
    }
}
class BoxSides {
    constructor(format) {
        let sides = ['left', 'right', 'top', 'bottom'];
        for(let side of sides ) {
            this[side] = new BoxSide(side, format);
        }
    }
}

function adjustLine(n) {
    return Math.floor(n) + 0.5;
}

export class ParaBox {
    constructor(format) {
        this.format = format;
    }
    get sides() {
        if(!this._sides)
            this._sides = new BoxSides(this.format);
        return this._sides;
    }
    getBorderBox(aBox) {
        let {x, y, width, contentHeight} = aBox;
        let {left: leftSide, right: rightSide,
            top: topSide, bottom: bottomSide} = this.sides;

        let left = adjustLine(x + leftSide.margin -
            leftSide.padding - leftSide.width);
        let right = adjustLine(x + width -
            rightSide.margin + rightSide.padding + rightSide.width);
        let top = adjustLine(y + topSide.margin);
        let bottom = adjustLine(top + contentHeight +
            topSide.padding + topSide.width + bottomSide.padding);
        return {left, right, top, bottom};
    }
    getBoxHeight(contentHeight) {
        let {top, bottom} = this.sides;
        return contentHeight + top.margin + top.padding + top.width
            + bottom.margin + bottom.padding + bottom.width;
    }
    getContentWidth(width) {
        let {left, right} = this.sides;
        return width - left.margin - right.margin;
    }
    getContentHeight(height) {
        let {top, bottom} = this.sides;
        return height - top.margin - top.padding - top.width
            - bottom.margin - bottom.padding - bottom.width;
    }
    getOffsetX(x) {
        let {left} = this.sides;
        return x + left.margin;
    }
    getOffsetY(y) {
        let {top} = this.sides;
        return y + top.margin + top.padding + top.width;
    }
}
