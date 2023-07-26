import {IterLoader} from "./iterLoader"
import {RunWrapper} from "./runWrapper"

export class RunLoader extends IterLoader {

    setIter(options) {
        let {para, runs} = options;
        this.iter = runs;
        this.para = para;
    }
    load(index) {
        let count = Math.max(index + 1 - this.items.length, this.step);
        while (count > 0) {
            let {value, done} = this.iter.next();
            if(!done) {
                if(value.runs) {
                    for(let run of value.runs) {
                        let v = this.pack(run);
                        if(v) {
                            this.items.push(v);
                            count--;
                        }
                    }

                } else {
                    let v = this.pack(value);
                    if(v) {
                        this.items.push(v);
                        count--;
                    }
                }

            } else {
                if(this.items.length === 0) {
                   // console.log(this, ' no runs');
                }
                this.done = true;
                break;
            }
        }
    }
    pack(value) {
        return new RunWrapper(value, this.options);
    }
}
