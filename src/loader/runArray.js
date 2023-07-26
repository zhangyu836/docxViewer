import {RunWrapper} from "./runWrapper"

export class RunArray {

    constructor(children) {
        this.list = [];
        for(let child of children) {
            let run = new RunWrapper(child);
            this.list.push(run);
        }
    }
    item(index) {
        return this.list[index];
    }
}
