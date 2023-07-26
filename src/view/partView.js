import { Group } from 'konva/lib/Group';
import {SimpleText} from "./simpleText";

export class PartView extends Group {

    constructor(part, x, y) {
        super({});
        this.part = part;
        this.ox = x;
        this.oy = y;
        this.simpleText;
    }
    setPart(part, _x, _y) {
        let text = this.simpleText.getAttr('text');
        this.simpleText.setPosition({x: _x, y: _y});
        if(text != part.text){
            this.simpleText.setAttr('text', part.text);
            //console.log(text, part.text);
        }
    }

    get simpleText() {
        let text = new SimpleText({
            x: this.ox,
            y: this.oy,
            text: this.part.text,
            ...this.part.fontStyle,
        });
        this.add( text );
        return text;

    }

}
