import Konva from 'konva/lib/index';
let { Group, Rect, Line } = Konva;
import {partPool} from "./pool";
import {PartView} from "./partView";

export class DivView extends Group {

    renderBorders(div, x, y) {
        let {left, right, top, bottom, backgroundColor, borderBox} = div.getBorders(x, y);
        if(backgroundColor) {
            let bg = new Rect({
                    x: borderBox.left,
                    y: borderBox.top,
                    width: borderBox.right - borderBox.left,
                    height: borderBox.bottom - borderBox.top,
                    fill: backgroundColor,
            })
            this.add(bg);
        }
        if(left) {
            let border = new Line({
                points: [borderBox.left, borderBox.top, borderBox.left, borderBox.bottom],
                stroke: left.color,
                strokeWidth: left.width,
                //lineDash: [10, 10],
            })
            this.add(border);
        }
        if(right) {
            let border = new Line({
                points: [borderBox.right, borderBox.top, borderBox.right, borderBox.bottom],
                stroke: right.color,
                strokeWidth: right.width
            })
            this.add(border);
        }
        if(top) {
            let border = new Line({
                points: [borderBox.left, borderBox.top, borderBox.right, borderBox.top],
                stroke: top.color,
                strokeWidth: top.width
            })
            this.add(border);
        }
        if(bottom) {
            let border = new Line({
                points: [borderBox.left, borderBox.bottom, borderBox.right, borderBox.bottom],
                stroke: bottom.color,
                strokeWidth: bottom.width
            })
            this.add(border);
        }
    }
    renderDiv(div, x, y) {
        this.renderBorders(div, x, y);
        let _x = div.getOffsetX(x);
        let _y = div.getOffsetY(y);
        for(let line of div.lines) {
            this.renderLine(line, _x, _y + line.wordsHeight - line.descent);
            _y += line.contentHeight;
        }
    }
    renderLine(line, x, y) {
        for(let word of line.words) {
            this.renderWord(word, x, y);
            x += word.width;
        }
    }
    renderWord(word, x, y) {
        for(let part of word.parts) {
            this.renderPart(part, x, y);
            x += part.width;
        }
    }
    renderPart(part, x, y) {
        let partView = this.getPartView(part, x, y);
        this.add(partView);
    }
    getPartView(part, x, y) {
        let partView = partPool.get(part);
        if(partView) {
            partView.setPart(part, x, y);
        } else {
            partView = new PartView(part, x, y);
            partPool.set(part, partView);
        }
        return partView;
    }
}
