import {IterLoader} from "./iterLoader";
import {ParaLoader} from "./paraLoader";

function *wrapParas(paras, options) {
    let {layout} = options;
    for(let para of paras) {
        if(para.isPageBr) {
            yield layout.currentPage;
            if(para.isSectPr) {
                let {page} = layout.switchSect();
                if(page) {
                    //yield page;
                }
            } else
                layout.newPage();
            continue;
        }
        if(para.isColBr) {
            let {page} = layout.switchCol();
            if(page) {
                yield page;
            }
            //continue;
        }
        if(para.isSectPr) {
            let {page} = layout.switchSect();
            if(page) {
                yield page;
            }
            continue;
        }
        para.initLines(layout);
        for(;;) {
            let {colDone, paraDone} = para.wrap(layout);
            if(colDone) {
                if(layout.pageDone) {
                    yield layout.currentPage;
                    layout.newPage();
                }
            } else if(paraDone) {
                break;
            } else {
                console.log('no ret state')
            }
        }
    }
    if(layout.currentPage.notEmpty)
        yield layout.currentPage;
}

export class PageLoader extends IterLoader {
    setIter(options) {
        this.paras = new ParaLoader(options);
        this.iter = wrapParas(this.paras, options);
    }
    setOptions(options) {
        this.iter = wrapParas(this.paras, options);
        this.reset({})
    }
}

