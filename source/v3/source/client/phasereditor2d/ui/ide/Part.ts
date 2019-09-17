/// <reference path="../../../phasereditor2d.ui.controls/Controls.ts"/>

namespace phasereditor2d.ui.ide {

    export const EVENT_PART_TITLE_UPDATED = "partTitledUpdated";

    export abstract class Part extends controls.Control {
        private _id: string;
        private _title: string;
        private _selection: any[];
        private _partCreated: boolean;
        private _icon: controls.IIcon;

        public constructor(id: string) {
            super();

            this._id = id;
            this._title = "";
            this._selection = [];
            this._partCreated = false;

            this.getElement().setAttribute("id", id);

            this.getElement().classList.add("Part");

            this.getElement()["__part"] = this;
        }

        public getTitle() {
            return this._title;
        }

        public setTitle(title: string): void {
            this._title = title;
            this.dispatchEvent(new CustomEvent(EVENT_PART_TITLE_UPDATED, { detail: this }));
        }

        public setIcon(icon: controls.IIcon) {
            this._icon = icon;
            this.dispatchEvent(new CustomEvent(EVENT_PART_TITLE_UPDATED, { detail: this }));
        }

        public getIcon() {
            return this._icon;
        }

        public getId() {
            return this._id;
        }

        public setSelection(selection: any[]): void {
            this._selection = selection;
            this.dispatchEvent(new CustomEvent(controls.EVENT_SELECTION, {
                detail: selection
            }));
        }

        public getSelection() {
            return this._selection;
        }

        public getPropertyProvider(): controls.properties.PropertySectionProvider {
            return null;
        }

        public layout(): void {

        }

        public onPartClosed(): void {

        }

        public onPartShown(): void {
            if (!this._partCreated) {
                this._partCreated = true;
                this.createPart();
            }
        }

        protected createPart(): void {

        }
    }
}