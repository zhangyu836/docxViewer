import { Text } from 'konva/lib/shapes/Text';

export class SimpleText extends Text {
    _sceneFunc(context) {
        let text = this.getAttr('text');
        let fontString = this.getAttr('fontString');
        context.setAttr('font', fontString);
        //let fontSize = this.getAttr('fontSize');
        //console.log(this.attrs, 'simple text attrs');
        //context.setAttr('fontStretch', 'extra-condensed');
        //context.setAttr('letterSpacing', `${-0.05*fontSize}pt`);

        //this._partialTextX = 0;
        //this._partialTextY = 0;
        this._partialText = text;
        context.fillStrokeShape(this);
    }

}
