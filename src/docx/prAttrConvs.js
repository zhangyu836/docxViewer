const MULTIPLE = 5;

class IndentSpacingConv {
    constructor(textIndent = 0,
                marginLeft = 0, marginRight = 0,
                marginTop = 0, marginBottom = 0) {
        this.textIndent = textIndent;
        this.marginLeft = marginLeft;
        this.marginRight = marginRight;
        this.marginTop = marginTop;
        this.marginBottom = marginBottom;
    }
    static fromPr(pr, conv) {
        if(pr.first_line_indent)
            conv.textIndent = pr.first_line_indent.px;
        if(pr.ind_left)
            conv.marginLeft = pr.ind_left.px;
        if(pr.ind_right)
            conv.marginRight = pr.ind_right.px;
        if(pr.spacing_before)
            conv.marginTop =  pr.spacing_before.px;
        if(pr.spacing_after)
            conv.marginBottom = pr.spacing_after.px;
    }
}

class LineSpacingConv {
    constructor(spacing=0, type="asIs") {
        this.spacing = spacing;
        this.type = type;
    }
    static fromPr(pr, conv) {
        let lsc = conv.lineSpacing = new this();
        let {spacing_line, spacing_lineRule} = pr;
        if (spacing_line === null) {
            return ;
        }
        if (spacing_lineRule === MULTIPLE) {
            lsc.spacing = (spacing_line.pt / 12);
            lsc.type = 'multiple';
        } else {
            lsc.spacing = spacing_line.px;
            lsc.type = 'px';
        }
       // return lsc;
    }
    getLineHeight(lineHeight) {
        let height, advance;
        if(this.type === 'multiple') {
            height = lineHeight * this.spacing;
            advance = lineHeight + (height - lineHeight)/2;
        } else if(this.type === 'px'){
            height = this.spacing;
            advance = lineHeight + (height - lineHeight)/2;
        } else {
            height = lineHeight;
            advance = lineHeight;
        }
        return {height, advance};
    }
}
class ShdConv {
    constructor() {
        this.backgroundColor = null;
    }
    static fromPr(pr, conv) {
        let {shd} = pr;
        if(shd){
            let color = shd.fill;
            if(color!='auto')
                conv.backgroundColor = `#${color}`;
        }
    }
}
class AlignmentConv {
    constructor() {
        this.textAlign = "left";
    }
    static fromPr(pr, conv) {
        let {jc_val} = pr;
        if(jc_val){
            let alignment = "left";
            switch (jc_val){
                case 0:
                    alignment = "left";
                    break;
                case 1:
                    alignment = "center";
                    break;
                case 2:
                    alignment = "right";
                    break;
                case 3:
                    alignment = "justify";
                    break;
            }
            conv.textAlign = alignment;
        }
    }
}

class LineConv{
    static from(val){
        switch (val) {
            case "dash":
            case "dashDotDotHeavy":
            case "dashDotHeavy":
            case "dashedHeavy":
            case "dashLong":
            case "dashLongHeavy":
            case "dotDash":
            case "dotDotDash":
                return "dashed";
            case "dotted":
            case "dottedHeavy":
                return "dotted";
            case "double":
                return "double";
            case "single":
            case "thick":
            case "words":
                return "solid";
            case "nil":
                return "none";
        }
        return "solid";
    }
}
let sides = ['left', 'right', 'top', 'bottom'];

class BorderConv {
    constructor(side, style=null, width=0,
                color='#000000', padding=0) {
        this.side = side;
        this.style = style;
        this.width = width;
        this.color = color;
        this.padding = padding;
    }
    from(prBorder) {
        let {val} = prBorder;
        if (val === "nil")
            return;
        this.style = LineConv.from(val);
        let {sz, color, space} = prBorder;
        if(sz) {
            this.width = sz * 0.125 * 4/3;
        }
        if(color) {
            if(color !== "auto")
                this.color = `#${color}`;
        }
        if(space) {
            this.padding = space * 4/3;
        }
    }
}
class BordersConv {
    constructor(init=false) {
        if(init) {
            this.left = new BorderConv('left');
            this.right = new BorderConv('right');
            this.top = new BorderConv('top');
            this.bottom = new BorderConv('bottom');
        }
    }
    static fromPr(prBorders, conv) {
        for(let side of sides) {
            let border = prBorders[side];
            if(!border) continue;
            let convBorder = conv[side] = new BorderConv(side);
            //if(!convBorder) {
            //    convBorder = new BorderConv(side);
            //    conv[side] = convBorder;
            //}
            convBorder.from(border);
        }
    }
}

class ParaBordersConv extends BordersConv {
    static getPrBorders(pr) {
        return pr.pBdr;
    }
    static fromPr(pr, conv) {
        let borders = this.getPrBorders(pr);
        if (!borders) return;
        super.fromPr(borders, conv);
    }
}

class TblBordersConv extends ParaBordersConv {
    static getPrBorders(pr) {
        return pr.tblBorders;
    }
}
class TcBordersConv extends ParaBordersConv {
    static getPrBorders(pr) {
        return pr.tcBorders;
    }
}

class RunBorderConv {
    constructor(init=false) {
        if(init) {
            this.border = new BorderConv('all');
        }
    }
    static fromPr(pr, conv) {
        let prBorder = pr.bdr;
        if(!prBorder) return;
        if(!conv.border) {
            conv.border = new BorderConv('all');
        }
        conv.border.from(prBorder, conv.border);
    }
}

export {IndentSpacingConv, LineSpacingConv, AlignmentConv,
    ParaBordersConv, TblBordersConv, TcBordersConv,
    ShdConv, RunBorderConv, LineConv }
