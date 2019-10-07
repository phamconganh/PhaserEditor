namespace phasereditor2d.ui.ide.editors.scene {

    export class DropManager {

        private _editor: SceneEditor;

        constructor(editor: SceneEditor) {
            this._editor = editor;

            const canvas = this._editor.getOverlayLayer().getCanvas();
            canvas.addEventListener("dragover", e => this.onDragOver(e));
            canvas.addEventListener("drop", e => this.onDragDrop(e));
        }

        onDragDrop(e: DragEvent) {

            const dataArray = controls.Controls.getApplicationDragDataAndClean();

            if (this.acceptsDropDataArray(dataArray)) {

                this._editor.getObjectMaker().createWithDropEvent(e, dataArray);
                this._editor.refreshOutline();
                //TODO: for testing purpose only
                this._editor.setDirty(true);

                e.preventDefault();

                this._editor.getUndoManager().execute(new undo.AddObjectsOperation(this._editor));
            }
        }

        private onDragOver(e: DragEvent) {

            if (this.acceptsDropDataArray(controls.Controls.getApplicationDragData())) {
                e.preventDefault();
            }

        }

        private acceptsDropData(data: any): boolean {

            if (data instanceof pack.AssetPackItem) {
                if (data.getType() === pack.IMAGE_TYPE) {
                    return true;
                }
            } else if (data instanceof pack.AssetPackImageFrame) {
                return true;
            }

            return false;
        }

        private acceptsDropDataArray(dataArray: any[]) {

            if (!dataArray) {
                return false;
            }

            for (const item of dataArray) {
                if (!this.acceptsDropData(item)) {
                    return false;
                }
            }

            return true;

        }

    }

}