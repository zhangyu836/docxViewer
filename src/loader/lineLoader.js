import {Line} from "../node/line";
import {Word} from "../node/word";

class Context {
    constructor() {
        this.wordPos = 0;
        this.preWord = null;
        this.lineNo = 0;
        this.firstWrapped = false;
    }
    save(src) {
        this.wordPos = src.wordPos;
        this.preWord = src.preWord;
        this.lineNo = src.lineNo;
        this.firstWrapped = src.firstWrapped;
    }
    restore(target) {
        target.wordPos = this.wordPos;
        target.preWord = this.preWord;
        target.lineNo = this.lineNo;
        target.firstWrapped = this.firstWrapped;
    }
}
class LineWidths {
    constructor(width) {
        this.widths = new Map();
        if(width)
            this.setFirstWidth(width);
    }
    setFirstWidth(width) {
        this.setWidth(0, width);
    }
    setWidth(index, width) {
        this.widths.set(index, width);
    }
    getWidth(index) {
        for(let i = index; i >= 0; i--) {
            let width = this.widths.get(i);
            if(width) return width;
        }
    }
}


export class LineLoader {
    constructor(words, width) {
        this.init(words, width);
    }

    init(words, width) {
        this.lineNo = 0;
        this.wordPos = 0;
        this.preWord = null;
        this.firstWrapped = false;
        this.contexts = new Map();
        this.words = words;
        this.lineWidths = new LineWidths(width);
    }

    saveLineContext(lineNo=null) {
        let no = lineNo || this.lineNo;
        let context = this.contexts.get(no) || new Context();
        context.save(this);
        this.contexts.set(no, context);
    }
    getLineContext(lineNo=null) {
        let no = lineNo || this.lineNo;
        console.log(this.contexts)
        let context = this.contexts.get(no);
        console.log(context);
        return this.contexts.get(no);
    }
    backward(nextWidth) {
        this.lineWidths.setWidth(this.lineNo - 1, nextWidth);
        let context = this.getLineContext(this.lineNo - 1);
        if(context.preWord && context.firstWrapped) {
            context = this.getLineContext(this.lineNo - 2);
            context.restore(this);
            return 1;
        } else {
            context.restore(this);
            return 0;
        }
    }
    nextLine() {
        this.saveLineContext();
        let line = new Line();
        let word;
        let availableWidth = this.lineWidths.getWidth(this.lineNo);
        if(this.preWord) {
            word = this.preWord;
            this.firstWrapped = false;
            this.preWord = null;
        } else {
            word = this.words.item(this.wordPos++);
        }

        while(word) {
            if(word.parts.length === 0) {
                console.log('empty parts')
                word = this.words.item(this.wordPos++);
                continue;
            }
            if(word.isSpace() || word.isTab()) {
                line.addWord(word);
                availableWidth -= word.width;
                word = this.words.item(this.wordPos++);
                continue;
            }
            if(word.isNewline()) {
                line.addWord(word);
                this.lineNo++;
                return line;
            }
            if(availableWidth < 0) {
                this.wordPos--;
                this.lineNo++;
                return line;
            }

            if(word.width <= availableWidth) {
                line.addWord(word);
                availableWidth -= word.width;
                word = this.words.item(this.wordPos++);
                continue;
            } else {
                let nextWidth = this.lineWidths.getWidth(this.lineNo + 1);
                if(word.width <= nextWidth) {
                    this.wordPos--;
                    this.lineNo++;
                    return line;
                } else {
                    let [w0, w1] = word.wrap(availableWidth);
                    if(w0) {
                        line.addWord(w0);
                        this.preWord = w1;
                        if(word instanceof Word) {
                            this.firstWrapped = true;
                        }
                    } else{
                        this.wordPos--;
                    }
                    this.lineNo++;
                    return line;
                }
            }
        }

        if(line.notEmpty){
            this.lineNo++;
            return line;
        } else {
            if(this.lineNo===0)
                console.log('empty para', this.lineNo);
        }
    }
}
