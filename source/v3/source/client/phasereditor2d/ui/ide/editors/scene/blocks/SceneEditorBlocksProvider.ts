namespace phasereditor2d.ui.ide.editors.scene.blocks {

    export class SceneEditorBlocksProvider extends EditorViewerProvider {

        async preload() {
            pack.PackFinder.preload();
        }

        getContentProvider(): controls.viewers.ITreeContentProvider {
            return new SceneEditorBlocksContentProvider();
        }

        getLabelProvider(): controls.viewers.ILabelProvider {
            return new SceneEditorBlocksLabelProvider();
        }

        getCellRendererProvider(): controls.viewers.ICellRendererProvider {
            return new SceneEditorBlocksCellRendererProvider();
        }

        getTreeViewerRenderer(viewer: controls.viewers.TreeViewer) {
            return new SceneEditorBlocksTreeRendererProvider(viewer);
        }

        getPropertySectionProvider(): controls.properties.PropertySectionProvider {
            return new SceneEditorBlocksPropertyProvider();
        }

        getInput() {
            return this;
        }
    }
}