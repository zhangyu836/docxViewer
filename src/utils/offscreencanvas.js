

export class OffscreenCanvasCreator {
    canvas = null;
    context = null;
    getOrCreateCanvas(offscreenCanvas, contextAttributes ) {
        if (this.canvas) {
            return this.canvas;
        }
        if (offscreenCanvas) {
            this.canvas = offscreenCanvas;
            this.context = this.canvas.getContext('2d', contextAttributes);
        } else {
            try {
                // OffscreenCanvas2D measureText can be up to 40% faster.
                this.canvas = new window.OffscreenCanvas(0, 0);
                this.context = this.canvas.getContext('2d', contextAttributes);
                if (!this.context || !this.context.measureText) {
                    this.canvas = document.createElement('canvas');
                    this.context = this.canvas.getContext('2d', contextAttributes);
                }
            } catch (ex) {
                this.canvas = document.createElement('canvas');
                this.context = this.canvas.getContext('2d', contextAttributes);
            }
        }

        this.canvas.width = 10;
        this.canvas.height = 10;
        //this.context.fontKerning = "none";
        //this.context.textRendering = "optimizeLegibility";
        return this.canvas;
    }

    getOrCreateContext(offscreenCanvas, contextAttributes ) {
        if (this.context) {
            return this.context;
        }
        this.getOrCreateCanvas(offscreenCanvas, contextAttributes);
        return this.context;
    }
}

export const offscreenCanvasCreator = new OffscreenCanvasCreator();


