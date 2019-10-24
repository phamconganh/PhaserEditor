namespace phasereditor2d.pack.ui.importers {

    import io = colibri.core.io;

    export class SpritesheetImporter extends SingleFileImporter {

        constructor() {
            super(files.core.CONTENT_TYPE_IMAGE, core.SPRITESHEET_TYPE);
        }

        createItemData(file: io.FilePath) {

            const data = super.createItemData(file);

            data.frameConfig = {
                frameWidth: 32,
                frameHeight: 32
            }

            return data;
        }

    }
}