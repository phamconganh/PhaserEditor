namespace phasereditor2d.ui.ide.editors.scene.outline {

    export class SceneEditorOutlineContentProvider implements controls.viewers.ITreeContentProvider {

        getRoots(input: any): any[] {

            const editor: SceneEditor = input;

            const displayList = editor.getGameScene().sys.displayList;

            if (displayList) {
                return [displayList];
            }

            return [];
        }

        getChildren(parent: any): any[] {

            if (parent instanceof Phaser.GameObjects.DisplayList) {

                return parent.getChildren();

            } else if (parent instanceof Phaser.GameObjects.Container) {

                return parent.list;

            }

            return [];
        }

    }
}