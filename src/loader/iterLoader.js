
export class IterLoader {
    constructor(options) {
        this.reset(options);
        this.setIter(options);
        this[Symbol.iterator] = this.iterItems;
    }
    reset(options) {
        this.options = options;
        this.items = [];
        this.step = options.step || 1;
        this.done = false;
    }
    setIter(options) {
        this.iter = options.iter;
    }
    *iterItems() {
        let i = 0;
        let item = this.item(i++);
        while(item) {
            yield item;
            item = this.item(i++);
        }
    }
    item(index) {
        if(!this.done && index >= this.items.length)
            this.load(index);
        return this.items[index] || null;
    }
    load(index) {
        let count = Math.max(index + 1 - this.items.length, this.step);
        while (count > 0) {
            let {value, done} = this.iter.next();
            if(!done) {
                let v = this.pack(value);
                if(v) {
                    this.items.push(v);
                    count--;
                }
            } else {
                this.done = true;
                break;
            }
        }
    }
    pack(value) {
        return value;
    }
}





