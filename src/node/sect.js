import {Column} from "./column";

export class Sect {
    constructor(sectPr, maxHeight) {
        this.sectPr = sectPr;
        this.maxHeight = maxHeight;
        this.columnNums = sectPr.columnConfigs.length;
        this.columnConfigs = sectPr.columnConfigs;
        this.configIndex = 0;
        this.columns = [];
        this.newColumn();
    }
    get moreColumn() {
        return this.columnNums > this.columns.length;
    }
    newColumn() {
        if(!this.moreColumn) return null;
        let config = this.columnConfigs[this.configIndex++];
        this.currentColumn = new Column(config, this.maxHeight);
        this.columns.push(this.currentColumn);
        return this.currentColumn;
    }
    switchCol() {
        return this.newColumn();
    }
    nextColWidth() {
        let index;
        if(!this.moreColumn) {
            index = 0;
        } else {
            index = this.configIndex + 1;
        }
        let config = this.columnConfigs[index];
        return config.width;
    }
    get height() {
        let h = 0;
        for(let col of this.columns) {
            h = Math.max(h, col.height);
        }
        return h;
    }
    get notEmpty() {
        if(this.columns.length > 1) return true;
        return this.currentColumn.notEmpty;
    }
}






