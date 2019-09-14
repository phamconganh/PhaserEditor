/// <reference path="../../../../../phasereditor2d.ui.controls/Controls.ts"/>
/// <reference path="../../../../../phasereditor2d.ui.controls/viewers/Viewer.ts"/>
/// <reference path="../../../../../phasereditor2d.ui.controls/properties/PropertySectionProvider.ts"/>
/// <reference path="../../../../../phasereditor2d.ui.controls/properties/PropertySection.ts"/>
/// <reference path="../../Part.ts"/>
/// <reference path="../../ViewPart.ts"/>
/// <reference path="../../ViewerView.ts"/>

namespace phasereditor2d.ui.ide.files {

    import viewers = phasereditor2d.ui.controls.viewers;

    export class FilesView extends ide.ViewerView {

        constructor() {
            super("filesView", new viewers.TreeViewer());
            
            this.setTitle("Files");

            const root = Workbench.getWorkbench().getFileStorage().getRoot();

            const viewer = this._viewer;
            viewer.setLabelProvider(new FileLabelProvider());
            viewer.setContentProvider(new FileTreeContentProvider());
            viewer.setCellRendererProvider(new FileCellRendererProvider());
            viewer.setInput(root);

            viewer.repaint();
        }

        private _propertyProvider = new FilePropertySectionProvider();

        getPropertyProvider() {
            return this._propertyProvider;
        }

    }
}