
export class Line {
    constructor() {
        this.words = [];
        this._contentHeight = 0;

    }
    addWord(word) {
        this.words.push(word);
    }
    //get width() {
    //}
    get contentHeight() {
        return this._contentHeight;
    }
    set contentHeight(h) {
        return this._contentHeight = h;
    }

    get wordsHeight() {
        if(this._wordsHeight) return this._wordsHeight;
        let h = 0;
        for(let word of this.words) {
            h = Math.max(h, word.height);
        }
        this._wordsHeight = h;
        return this._wordsHeight;
    }
    get descent() {
        if(this._descent) return this._descent;
        let h = 0;
        for(let word of this.words) {
            h = Math.max(h, word.descent);
        }
        this._descent = h;
        return this._descent;
    }
    get text() {
        let a = [];
        for(let word of this.words) {
            a.push(word.text);
        }
        return a.join('');
    }
    get notEmpty() {
        return this.words.length > 0;
    }
}
