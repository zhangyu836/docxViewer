import Konva from "konva/lib";
import * as lil from 'lil-gui';
import {DocLayout} from "./loader/docLoader";
import {DocView} from "./view/docView";


const gui = new lil.GUI({
        //container: gui_wrapper,
        //autoPlace: false
    }
);

const pageFolder = gui.addFolder('select page');
const pageConfig = {
    pageIndex: 0,
};

pageFolder
    .add(pageConfig, 'pageIndex', 0, 200, 0.01)
    .onChange((pageIndex) => {
       docxView.renderPageByIndex(Math.floor(pageIndex));
    });

let docxView = null;

export function getDocView(docx) {
    if(docxView) {
        docxView.clearCanvas();
    }
    let docLayout = new DocLayout(docx);
    let stage = new Konva.Stage({
        container: 'container',
        width: 1200,
        height: 1200,
    });
    docxView = new DocView(docLayout, stage);
    return docxView;
}
