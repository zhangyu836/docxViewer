import {IterLoader} from "./iterLoader";
import {ParaWrapper} from "./paraWrapper";

export class ParaLoader extends IterLoader {
    setIter(options) {
        let {contentIter} = options;
        this.iter = contentIter;
        this.options = options;
    }
    pack(para) {
        if(para.contentIter){
            return new ParaWrapper({...this.options, para});
        }
    }
}


