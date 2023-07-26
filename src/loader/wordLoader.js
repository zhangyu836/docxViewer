import {CharProvider} from "./charProvider";
import {IterLoader} from "./iterLoader";
import {RunLoader} from "./runLoader";
import {RunArray} from "./runArray";

export class WordLoader extends IterLoader {
    constructor(options) {
        super(options);
        this.step = 10;
    }
    setIter(options) {
        let {runs} = options;
        this.charProvider = new CharProvider();
        if(runs instanceof RunArray) {

        } else {
            runs = new RunLoader(options);
        }
        this.iter = this.charProvider.makeIterator(runs);
    }
}

