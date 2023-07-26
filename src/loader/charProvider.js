import {WordBreaker} from '@zhangyu836/word-breaker';
import {EmptyWord, EndWord, TabWord, Word} from '../node/word';

class WordStore {
    constructor() {
        this.words = [];
        this.currentWord = null;
    }
    addPart(text, run, type) {
        if(text==='\t') return this.addTab(run);
        if(!this.currentWord)
            this.currentWord = new Word(type);
        this.currentWord.addPart(text, run);
    }
    addTab(run) {
        if(this.currentWord) {
            this.words.push(this.currentWord);
            this.currentWord = null;
        }
        let word = new TabWord(run);
        this.words.push(word);
    }
    addEmptyPart(run) {
        if(this.currentWord) {
            this.words.push(this.currentWord);
            this.currentWord = null;
        }
        let word = new EmptyWord(run);
        this.words.push(word);
    }
    finish() {
        if(this.currentWord) {
            this.words.push(this.currentWord);
            this.currentWord = null;
        }
        let words = this.words;
        this.words = [];
        return words;
    }
}
export class CharProvider {

    //constructor(runs) {
    //    this.init(runs);
    //}
    init(runs) {
        this.runs = runs;
        this.pos = 0;
        this.runPos = 0;
        let {run, index} = this.firstCharRun(0);
        if(!run) {
            if(index==0) {
                this.runsType = 'noRuns';
            }
            else {
                this.runsType = 'noChars';
            }
        }
        this.runIndex = index;
        this.run = run;

        this.lastBreakPos = 0;
        this.lastBreakRunPos = 0;
        this.lastBreakRunIndex = 0;
    }
    advancePos() {
        if(!this.run) {
            //peek;
            //console.log(this.pos, this.runPos);
            return;
        }
        this.pos++;
        this.runPos++;
        if(this.runPos >= this.run.length){
            let {run, index} = this.firstCharRun(this.runIndex + 1);
            this.runIndex = index;
            this.run = run;
            this.runPos = 0;
        }
    }
    charCodeAtPos() {
        if(this.run)
            return this.run.charCodeAt(this.runPos);
    }

    firstCharRun(start) {
        let index = start;
        let run = this.runItem(index);
        while(run && run.length === 0) {
            run = this.runItem(++index);
        }
        return {run, index};
    }
    runItem(index) {
        return this.runs.item(index);
    }

    moreChar() {
        if(!this.run) return false;
        if (this.runPos >= this.run.length) {
            let {run} = this.firstCharRun(this.runIndex + 1);
            if (!run) return false;
        }
        return true;
    }

    posSave() {
        this.peekPos = this.pos;
        this.peekRunPos = this.runPos;
        this.peekRunIndex = this.runIndex;
        this.peekRun = this.run;
    }
    posRestore() {
        this.pos = this.peekPos;
        this.runPos = this.peekRunPos;
        this.runIndex = this.peekRunIndex;
        this.run = this.peekRun;
    }
    breakRun(pos, type, words) {
        let lastBreakRun = this.runItem(this.lastBreakRunIndex);
        if (!lastBreakRun) {
            if(isFinite(pos))
                console.log('no lastBreakRun!', pos, this.lastBreakPos);
            return;
        }
        let text = lastBreakRun.text;
        if (text.length === 0) {
            words.addEmptyPart(lastBreakRun);
            this.lastBreakRunPos = 0;
            this.lastBreakRunIndex++;
            this.breakRun(pos, type, words);
        } else {
            let breakLen = pos - this.lastBreakPos;
            let runLeft = lastBreakRun.length - this.lastBreakRunPos;
            let partText = text.substr(this.lastBreakRunPos, breakLen);
            words.addPart(partText, lastBreakRun, type);
            if (breakLen >= runLeft) {
                this.lastBreakRunPos = 0;
                this.lastBreakPos += runLeft;
                this.lastBreakRunIndex++;
                if (breakLen > runLeft) {
                    this.breakRun(pos, type, words);
                }
            } else {
                this.lastBreakRunPos += breakLen;
                this.lastBreakPos = pos;
            }
        }
    }

    makeIterator(runs) {
        function *iter(charProvider) {
            let wordBreaker = new WordBreaker(charProvider);
            let _wb = wordBreaker.nextBreak();
            let wordStore = new WordStore();
            while(_wb) {
                let {pos, type} = _wb;
                //console.log(pos, type);
                charProvider.breakRun(pos, type, wordStore);
                let words = wordStore.finish();
                //if(words.length > 1) {
                //    console.log('empty words', words);
                //}
                for(let word of words)
                    yield word;
                _wb = wordBreaker.nextBreak();
            }
        }
        function *noCharsIter() {
            for(let run of runs) {
                let word = new EmptyWord(run);
                yield word;
            }
        }
        function *noRunsIter() {
            let word = new EndWord();
            yield word;
        }

        this.init(runs);
        if(this.runsType==="noChars") {
            return noCharsIter();
        } else if( this.runsType==="noRuns") {
            return noRunsIter();
        } else {
            return iter(this);
        }
    }
}


