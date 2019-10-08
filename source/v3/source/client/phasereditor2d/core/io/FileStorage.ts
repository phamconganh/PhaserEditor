namespace phasereditor2d.core.io {

    export interface IFileStorage {
        reload(): Promise<FilePath>;

        getRoot(): FilePath;

        hasFileStringInCache(file: FilePath): boolean;

        getFileStringFromCache(file: FilePath): string;

        getFileString(file: FilePath): Promise<string>;

        setFileString(file: FilePath, content: string): Promise<boolean>;
    }

    async function makeApiRequest(method: string, body?: any) {
        try {

            const resp = await fetch("../api", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "method": method,
                    "body": body
                })
            });

            const json = await resp.json();

            return json;

        } catch (e) {
            console.error(e);
            return new Promise((resolve, reject) => {
                resolve({
                    error: e.message
                });
            });
        }
    }

    export class ServerFileStorage implements IFileStorage {

        private _root: FilePath;
        private _fileStringContentMap: Map<string, string>;

        constructor() {
            this._fileStringContentMap = new Map();
        }

        getRoot(): FilePath {
            return this._root;
        }

        async reload(): Promise<FilePath> {
            this._fileStringContentMap = new Map();

            const data = await makeApiRequest("GetProjectFiles");

            //TODO: handle error
            const self = this;

            return new Promise(function (resolve, reject) {
                self._root = new FilePath(null, data);
                resolve(self._root);
            });
        }

        hasFileStringInCache(file: FilePath) {
            return this._fileStringContentMap.has(file.getId());
        }

        getFileStringFromCache(file: FilePath) {
            const id = file.getId();

            if (this._fileStringContentMap.has(id)) {
                const content = this._fileStringContentMap.get(id);
                return content;
            }

            return null;
        }

        async getFileString(file: FilePath): Promise<string> {
            const id = file.getId();

            if (this._fileStringContentMap.has(id)) {
                const content = this._fileStringContentMap.get(id);
                return content;
            }

            const data = await makeApiRequest("GetFileString", {
                path: file.getFullName()
            });

            if (data.error) {
                alert(`Cannot get file content of '${file.getFullName()}'`);
                return null;
            }

            const content = data["content"];
            this._fileStringContentMap.set(id, content);

            return content;
        }

        async setFileString(file: FilePath, content: string): Promise<boolean> {

            const data = await makeApiRequest("SetFileString", {
                path: file.getFullName(),
                content: content
            });

            if (data.error) {
                alert(`Cannot set file content to '${file.getFullName()}'`);
                return false;
            }

            this._fileStringContentMap.set(file.getId(), content);

            return true;
        }
    }
}