var phasereditor2d;
(function (phasereditor2d) {
    async function main() {
        console.log("Preloading UI resources");
        await phasereditor2d.ui.controls.Controls.preload();
        console.log("Starting the workbench");
        const workbench = phasereditor2d.ui.ide.Workbench.getWorkbench();
        workbench.start();
    }
    phasereditor2d.main = main;
})(phasereditor2d || (phasereditor2d = {}));
window.addEventListener("load", phasereditor2d.main);
var phasereditor2d;
(function (phasereditor2d) {
    var core;
    (function (core) {
        class ContentTypeRegistry {
            constructor() {
                this._resolvers = [];
                this._cache = new Map();
            }
            registerResolver(resolver) {
                this._resolvers.push(resolver);
            }
            getCachedContentType(file) {
                const id = file.getId();
                if (this._cache.has(id)) {
                    return this._cache.get(id);
                }
                return core.CONTENT_TYPE_ANY;
            }
            async findContentType(file) {
                const id = file.getId();
                if (this._cache.has(id)) {
                    return Promise.resolve(this._cache.get(id));
                }
                for (const resolver of this._resolvers) {
                    const ct = await resolver.computeContentType(file);
                    if (ct !== core.CONTENT_TYPE_ANY) {
                        this._cache.set(id, ct);
                        return Promise.resolve(ct);
                    }
                }
                return Promise.resolve(core.CONTENT_TYPE_ANY);
            }
        }
        core.ContentTypeRegistry = ContentTypeRegistry;
    })(core = phasereditor2d.core || (phasereditor2d.core = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var core;
    (function (core) {
        core.CONTENT_TYPE_ANY = "any";
    })(core = phasereditor2d.core || (phasereditor2d.core = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var core;
    (function (core) {
        var io;
        (function (io) {
            const EMPTY_FILES = [];
            class FilePath {
                constructor(parent, fileData) {
                    this._parent = parent;
                    this._name = fileData.name;
                    this._isFile = fileData.isFile;
                    this._fileSize = fileData.size;
                    this._modTime = fileData.modTime;
                    {
                        const i = this._name.lastIndexOf(".");
                        if (i >= 0) {
                            this._ext = this._name.substring(i + 1);
                        }
                        else {
                            this._ext = "";
                        }
                    }
                    if (fileData.children) {
                        this._files = [];
                        for (let child of fileData.children) {
                            this._files.push(new FilePath(this, child));
                        }
                        this._files.sort((a, b) => {
                            const a1 = a._isFile ? 1 : 0;
                            const b1 = b._isFile ? 1 : 0;
                            return a1 - b1;
                        });
                    }
                    else {
                        this._files = EMPTY_FILES;
                    }
                }
                getExtension() {
                    return this._ext;
                }
                getName() {
                    return this._name;
                }
                getId() {
                    if (this._id) {
                        return this._id;
                    }
                    this._id = this.getFullName() + "@" + this._modTime + "@" + this._fileSize;
                }
                getFullName() {
                    if (this._parent) {
                        return this._parent.getFullName() + "/" + this._name;
                    }
                    return this._name;
                }
                getUrl() {
                    if (this._parent) {
                        return this._parent.getUrl() + "/" + this._name;
                    }
                    return "../project";
                }
                getParent() {
                    return this._parent;
                }
                isFile() {
                    return this._isFile;
                }
                isFolder() {
                    return !this.isFile();
                }
                getFiles() {
                    return this._files;
                }
                toString() {
                    if (this._parent) {
                        return this._parent.toString() + "/" + this._name;
                    }
                    return this._name;
                }
                toStringTree() {
                    return this.toStringTree2(0);
                }
                toStringTree2(depth) {
                    let s = " ".repeat(depth * 4);
                    s += this.getName() + (this.isFolder() ? "/" : "") + "\n";
                    if (this.isFolder()) {
                        for (let file of this._files) {
                            s += file.toStringTree2(depth + 1);
                        }
                    }
                    return s;
                }
            }
            io.FilePath = FilePath;
        })(io = core.io || (core.io = {}));
    })(core = phasereditor2d.core || (phasereditor2d.core = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var core;
    (function (core) {
        var io;
        (function (io) {
            function makeApiRequest(method, body) {
                return fetch("../api", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "method": method,
                        "body": body
                    })
                });
            }
            class ServerFileStorage {
                getRoot() {
                    return this._root;
                }
                async reload() {
                    const resp = await makeApiRequest("GetProjectFiles");
                    const data = await resp.json();
                    //TODO: handle error
                    const self = this;
                    return new Promise(function (resolve, reject) {
                        self._root = new io.FilePath(null, data);
                        resolve(self._root);
                    });
                }
            }
            io.ServerFileStorage = ServerFileStorage;
        })(io = core.io || (core.io = {}));
    })(core = phasereditor2d.core || (phasereditor2d.core = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var controls;
        (function (controls) {
            class Control {
                constructor(tagName = "div") {
                    this._bounds = { x: 0, y: 0, width: 0, height: 0 };
                    this._children = [];
                    this._element = document.createElement(tagName);
                    this.addClass("control");
                    this._layout = null;
                    this._container = null;
                    this._scrollY = 0;
                }
                getScrollY() {
                    return this._scrollY;
                }
                setScrollY(scrollY) {
                    this._scrollY = scrollY;
                }
                getContainer() {
                    return this._container;
                }
                getLayout() {
                    return this._layout;
                }
                setLayout(layout) {
                    this._layout = layout;
                    this.layout();
                }
                addClass(...tokens) {
                    for (let token of tokens) {
                        this._element.classList.add(token);
                    }
                }
                getElement() {
                    return this._element;
                }
                getControlPosition(windowX, windowY) {
                    const b = this.getElement().getBoundingClientRect();
                    return {
                        x: windowX - b.left,
                        y: windowY - b.top
                    };
                }
                containsLocalPoint(x, y) {
                    return x >= 0 && x <= this._bounds.width && y >= 0 && y <= this._bounds.height;
                }
                setBounds(bounds) {
                    if (bounds.x !== undefined) {
                        this._bounds.x = bounds.x;
                    }
                    this._bounds.x = bounds.x === undefined ? this._bounds.x : bounds.x;
                    this._bounds.y = bounds.y === undefined ? this._bounds.y : bounds.y;
                    this._bounds.width = bounds.width === undefined ? this._bounds.width : bounds.width;
                    this._bounds.height = bounds.height === undefined ? this._bounds.height : bounds.height;
                    this.layout();
                }
                setBoundsValues(x, y, w, h) {
                    this.setBounds({ x: x, y: y, width: w, height: h });
                }
                getBounds() {
                    return this._bounds;
                }
                setLocation(x, y) {
                    this._element.style.left = x + "px";
                    this._element.style.top = y + "px";
                    this._bounds.x = x;
                    this._bounds.y = y;
                }
                layout() {
                    controls.setElementBounds(this._element, this._bounds);
                    if (this._layout) {
                        this._layout.layout(this);
                    }
                    else {
                        for (let child of this._children) {
                            child.layout();
                        }
                    }
                }
                add(control) {
                    control._container = this;
                    this._children.push(control);
                    this._element.appendChild(control.getElement());
                    control.onControlAdded();
                }
                onControlAdded() {
                }
                getChildren() {
                    return this._children;
                }
            }
            controls.Control = Control;
        })(controls = ui.controls || (ui.controls = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./Control.ts"/>
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var controls;
        (function (controls) {
            class PaddingPane extends controls.Control {
                constructor(control, padding = 5) {
                    super();
                    this._padding = padding;
                    this.getElement().classList.add("paddingPane");
                    this.setControl(control);
                }
                setControl(control) {
                    this._control = control;
                    if (this._control) {
                        this.add(control);
                    }
                }
                getControl() {
                    return this._control;
                }
                setPadding(padding) {
                    this._padding = padding;
                }
                getPadding() {
                    return this._padding;
                }
                layout() {
                    const b = this.getBounds();
                    controls.setElementBounds(this.getElement(), b);
                    if (this._control) {
                        this._control.setBoundsValues(this._padding, this._padding, b.width - this._padding * 2, b.height - this._padding * 2);
                    }
                }
            }
            controls.PaddingPane = PaddingPane;
        })(controls = ui.controls || (ui.controls = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="../../../phasereditor2d.ui.controls/PaddingPanel.ts"/>
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var ide;
        (function (ide) {
            class DesignWindow extends ui.controls.PaddingPane {
                constructor() {
                    super();
                    this._toolbar = new ui.toolbar.Toolbar();
                    this._outlineView = new ide.outline.OutlineView();
                    this._filesView = new ide.files.FilesView();
                    this._inspectorView = new ide.inspector.InspectorView();
                    this._blocksView = new ide.blocks.BlocksView();
                    this._editorArea = new ide.EditorArea();
                    this._split_Files_Blocks = new ui.controls.SplitPanel(this._filesView, this._blocksView);
                    this._split_Editor_FilesBlocks = new ui.controls.SplitPanel(this._editorArea, this._split_Files_Blocks, false);
                    this._split_Outline_EditorFilesBlocks = new ui.controls.SplitPanel(this._outlineView, this._split_Editor_FilesBlocks);
                    this._split_OutlineEditorFilesBlocks_Inspector = new ui.controls.SplitPanel(this._split_Outline_EditorFilesBlocks, this._inspectorView);
                    this.setControl(this._split_OutlineEditorFilesBlocks_Inspector);
                    window.addEventListener("resize", e => {
                        this.setBoundsValues(0, 0, window.innerWidth, window.innerHeight);
                    });
                    this.initialLayout();
                }
                initialLayout() {
                    const b = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
                    this._split_Files_Blocks.setSplitFactor(0.2);
                    this._split_Editor_FilesBlocks.setSplitFactor(0.6);
                    this._split_Outline_EditorFilesBlocks.setSplitFactor(0.15);
                    this._split_OutlineEditorFilesBlocks_Inspector.setSplitFactor(0.8);
                    this.setBounds(b);
                }
                getOutlineView() {
                    return this._outlineView;
                }
                getFilesView() {
                    return this._filesView;
                }
                getBlocksView() {
                    return this._blocksView;
                }
                getInspectorView() {
                    return this._inspectorView;
                }
                getEditorArea() {
                    return this._editorArea;
                }
            }
            ide.DesignWindow = DesignWindow;
        })(ide = ui.ide || (ui.ide = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./Control.ts"/>
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var controls;
        (function (controls) {
            class IconImpl {
                constructor(img) {
                    this.img = img;
                }
                paint(context, x, y, w, h) {
                    // we assume the image size is under 16x16 (for now)
                    w = w ? w : 16;
                    h = h ? h : 16;
                    const imgW = this.img.naturalWidth;
                    const imgH = this.img.naturalHeight;
                    const dx = (w - imgW) / 2;
                    const dy = (h - imgH) / 2;
                    context.drawImage(this.img, (x + dx) | 0, (y + dy) | 0);
                }
            }
            class ImageImpl {
                constructor(imageElement) {
                    this.imageElement = imageElement;
                    this._ready = false;
                }
                preload() {
                    if (this._ready) {
                        return Promise.resolve();
                    }
                    return this.imageElement.decode().then(_ => {
                        this._ready = true;
                    });
                }
                paint(context, x, y, w, h, center) {
                    if (this._ready) {
                        const naturalWidth = this.imageElement.naturalWidth;
                        const naturalHeight = this.imageElement.naturalHeight;
                        let renderHeight = h;
                        let renderWidth = w;
                        let imgW = naturalWidth;
                        let imgH = naturalHeight;
                        // compute the right width
                        imgW = imgW * (renderHeight / imgH);
                        imgH = renderHeight;
                        // fix width if it goes beyond the area
                        if (imgW > renderWidth) {
                            imgH = imgH * (renderWidth / imgW);
                            imgW = renderWidth;
                        }
                        let scale = imgW / naturalWidth;
                        let imgX = x + (center ? renderWidth / 2 - imgW / 2 : 0);
                        let imgY = y + renderHeight / 2 - imgH / 2;
                        let imgDstW = naturalWidth * scale;
                        let imgDstH = naturalHeight * scale;
                        if (imgDstW > 0 && imgDstH > 0) {
                            context.drawImage(this.imageElement, imgX, imgY, imgDstW, imgDstH);
                        }
                    }
                    else {
                        context.strokeRect(x, y, w, h);
                    }
                }
            }
            class Controls {
                static preload() {
                    return Promise.all(Controls.ICONS.map(name => {
                        const icon = this.getIcon(name);
                        return icon.img.decode();
                    }));
                }
                static getImage(url, id) {
                    if (Controls._images.has(id)) {
                        return Controls._images.get(id);
                    }
                    const img = new ImageImpl(new Image());
                    img.imageElement.src = url;
                    Controls._images.set(id, img);
                    return img;
                }
                static getIcon(name) {
                    if (Controls._icons.has(name)) {
                        return Controls._icons.get(name);
                    }
                    const img = new Image();
                    img.src = "phasereditor2d.ui.controls/images/16/" + name + ".png";
                    const icon = new IconImpl(img);
                    Controls._icons.set(name, icon);
                    return icon;
                }
                static getSmoothingPrefix(context) {
                    const vendors = ['i', 'webkitI', 'msI', 'mozI', 'oI'];
                    for (let i = 0; i < vendors.length; i++) {
                        const s = vendors[i] + 'mageSmoothingEnabled';
                        if (s in context) {
                            return s;
                        }
                    }
                    return null;
                }
                ;
                static disableCanvasSmoothing(context) {
                    const prefix = this.getSmoothingPrefix(context);
                    if (prefix) {
                        context[prefix] = false;
                    }
                    return context;
                }
                ;
            }
            Controls._icons = new Map();
            Controls._images = new Map();
            Controls.ICON_TREE_COLLAPSE = "tree-collapse";
            Controls.ICON_TREE_EXPAND = "tree-expand";
            Controls.ICON_FILE = "file";
            Controls.ICON_FOLDER = "folder";
            Controls.ICON_FILE_FONT = "file-font";
            Controls.ICON_FILE_IMAGE = "file-image";
            Controls.ICON_FILE_VIDEO = "file-movie";
            Controls.ICON_FILE_SCRIPT = "file-script";
            Controls.ICON_FILE_SOUND = "file-sound";
            Controls.ICON_FILE_TEXT = "file-text";
            Controls.ICONS = [
                Controls.ICON_TREE_COLLAPSE,
                Controls.ICON_TREE_EXPAND,
                Controls.ICON_FILE,
                Controls.ICON_FOLDER,
                Controls.ICON_FILE_FONT,
                Controls.ICON_FILE_IMAGE,
                Controls.ICON_FILE_SCRIPT,
                Controls.ICON_FILE_SOUND,
                Controls.ICON_FILE_TEXT,
                Controls.ICON_FILE_VIDEO
            ];
            Controls.LIGHT_THEME = {
                treeItemOverBackground: "#0000000a",
                treeItemSelectionBackground: "#33e",
                treeItemSelectionForeground: "#f0f0f0",
                treeItemForeground: "#000"
            };
            Controls.DARK_THEME = {
                treeItemOverBackground: "#ffffff0a",
                treeItemSelectionBackground: "#33e",
                treeItemSelectionForeground: "#f0f0f0",
                treeItemForeground: "#f0f0f0"
            };
            Controls.theme = Controls.LIGHT_THEME;
            controls.Controls = Controls;
        })(controls = ui.controls || (ui.controls = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var controls;
        (function (controls) {
            class PanelTitle extends controls.Control {
                constructor() {
                    super();
                    this.getElement().classList.add("panelTitle");
                    this._textControl = new controls.Control();
                    this.add(this._textControl);
                    this._toolbar = new PanelToolbar();
                    this.add(this._toolbar);
                }
                setText(text) {
                    this._textControl.getElement().innerHTML = text;
                }
                getToolbar() {
                    return this._toolbar;
                }
                layout() {
                    super.layout();
                    const b = this.getBounds();
                    const elem = this._textControl.getElement();
                    elem.style.top = controls.FONT_OFFSET + "px";
                    elem.style.left = controls.FONT_OFFSET * 2 + "px";
                    const toolbarWidth = this._toolbar.getActions().length * controls.ACTION_WIDTH;
                    this._toolbar.setBoundsValues(b.width - toolbarWidth, 0, toolbarWidth, controls.ROW_HEIGHT);
                }
            }
            class PanelToolbar extends controls.Control {
                constructor() {
                    super();
                    this._actions = [];
                    this._buttons = [];
                    this.getElement().classList.add("panelToolbar");
                }
                addAction(action) {
                    this._actions.push(action);
                    const b = new controls.ActionButton(action);
                    this._buttons.push(b);
                    this.add(b);
                }
                getActions() {
                    return this._actions;
                }
                layout() {
                    super.layout();
                    const b = this.getBounds();
                    for (let i = 0; i < this._buttons.length; i++) {
                        const btn = this._buttons[i];
                        btn.setBoundsValues(i * controls.ACTION_WIDTH, 0, controls.ACTION_WIDTH, b.height);
                    }
                }
            }
            class Panel extends controls.Control {
                constructor(hasTitle = true) {
                    super();
                    this.getElement().classList.add("panel");
                    if (hasTitle) {
                        this._panelTitle = new PanelTitle();
                        this.add(this._panelTitle);
                    }
                    this._clientArea = new controls.Control("div");
                    this._clientArea.addClass("panelClientArea");
                    this.add(this._clientArea);
                }
                setTitle(title) {
                    this._title = title;
                    this._panelTitle.setText(title);
                }
                getTitle() {
                    return this._title;
                }
                getToolbar() {
                    return this._panelTitle.getToolbar();
                }
                getClientArea() {
                    return this._clientArea;
                }
                layout() {
                    //super.layout();
                    controls.setElementBounds(this.getElement(), this.getBounds());
                    const b = this.getBounds();
                    if (this._panelTitle) {
                        this._panelTitle.setBoundsValues(controls.PANEL_BORDER_SIZE, controls.PANEL_BORDER_SIZE, b.width - controls.PANEL_BORDER_SIZE * 2, controls.ROW_HEIGHT);
                        this._clientArea.setBounds({
                            x: controls.PANEL_BORDER_SIZE,
                            y: controls.PANEL_BORDER_SIZE + controls.ROW_HEIGHT,
                            width: b.width - controls.PANEL_BORDER_SIZE * 2,
                            height: b.height - controls.PANEL_BORDER_SIZE * 2 - controls.ROW_HEIGHT
                        });
                    }
                    else {
                        this._clientArea.setBounds({
                            x: controls.PANEL_BORDER_SIZE,
                            y: controls.PANEL_BORDER_SIZE,
                            width: b.width - controls.PANEL_BORDER_SIZE * 2,
                            height: b.height - controls.PANEL_BORDER_SIZE * 2
                        });
                    }
                }
            }
            controls.Panel = Panel;
        })(controls = ui.controls || (ui.controls = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="../../../phasereditor2d.ui.controls/Controls.ts"/>
/// <reference path="../../../phasereditor2d.ui.controls/Panel.ts"/>
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var ide;
        (function (ide) {
            class Part extends ui.controls.Panel {
                constructor(id) {
                    super();
                    this._id = id;
                    this.getElement().classList.add("part");
                }
                getId() {
                    return this._id;
                }
            }
            ide.Part = Part;
        })(ide = ui.ide || (ui.ide = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./Part.ts"/>
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var ide;
        (function (ide) {
            class EditorArea extends ide.Part {
                constructor() {
                    super("editorArea");
                }
            }
            ide.EditorArea = EditorArea;
        })(ide = ui.ide || (ui.ide = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var ide;
        (function (ide) {
            ide.CONTENT_TYPE_IMAGE = "image";
            ide.CONTENT_TYPE_AUDIO = "audio";
            ide.CONTENT_TYPE_VIDEO = "video";
            ide.CONTENT_TYPE_SCRIPT = "script";
            ide.CONTENT_TYPE_TEXT = "text";
            class ExtensionContentTypeResolver {
                constructor(defs) {
                    this._map = new Map();
                    for (const def of defs) {
                        this._map.set(def[0].toUpperCase(), def[1]);
                    }
                }
                computeContentType(file) {
                    const ext = file.getExtension().toUpperCase();
                    if (this._map.has(ext)) {
                        return Promise.resolve(this._map.get(ext));
                    }
                    return Promise.resolve(phasereditor2d.core.CONTENT_TYPE_ANY);
                }
            }
            ide.ExtensionContentTypeResolver = ExtensionContentTypeResolver;
            class DefaultExtensionTypeResolver extends ExtensionContentTypeResolver {
                constructor() {
                    super([
                        ["png", ide.CONTENT_TYPE_IMAGE],
                        ["jpg", ide.CONTENT_TYPE_IMAGE],
                        ["bmp", ide.CONTENT_TYPE_IMAGE],
                        ["gif", ide.CONTENT_TYPE_IMAGE],
                        ["webp", ide.CONTENT_TYPE_IMAGE],
                        ["mp3", ide.CONTENT_TYPE_AUDIO],
                        ["wav", ide.CONTENT_TYPE_AUDIO],
                        ["ogg", ide.CONTENT_TYPE_AUDIO],
                        ["mp4", ide.CONTENT_TYPE_VIDEO],
                        ["ogv", ide.CONTENT_TYPE_VIDEO],
                        ["mp4", ide.CONTENT_TYPE_VIDEO],
                        ["webm", ide.CONTENT_TYPE_VIDEO],
                        ["js", ide.CONTENT_TYPE_SCRIPT],
                        ["html", ide.CONTENT_TYPE_SCRIPT],
                        ["css", ide.CONTENT_TYPE_SCRIPT],
                        ["ts", ide.CONTENT_TYPE_SCRIPT],
                        ["json", ide.CONTENT_TYPE_SCRIPT],
                        ["txt", ide.CONTENT_TYPE_TEXT],
                        ["md", ide.CONTENT_TYPE_TEXT],
                    ]);
                }
            }
            ide.DefaultExtensionTypeResolver = DefaultExtensionTypeResolver;
        })(ide = ui.ide || (ui.ide = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var toolbar;
        (function (toolbar) {
            class Toolbar {
                constructor() {
                    this._toolbarElement = document.createElement("div");
                    this._toolbarElement.innerHTML = `

            <button>Load</button>
            <button>Play</button>

            `;
                    this._toolbarElement.classList.add("toolbar");
                    document.getElementsByTagName("body")[0].appendChild(this._toolbarElement);
                }
                getElement() {
                    return this._toolbarElement;
                }
            }
            toolbar.Toolbar = Toolbar;
        })(toolbar = ui.toolbar || (ui.toolbar = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var ide;
        (function (ide) {
            class ViewPart extends ide.Part {
                constructor(id) {
                    super(id);
                    this.getElement().classList.add("view");
                }
            }
            ide.ViewPart = ViewPart;
        })(ide = ui.ide || (ui.ide = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="../../../phasereditor2d.ui.controls/Controls.ts"/>
/// <reference path="../../../phasereditor2d.ui.controls/PaddingPanel.ts"/>
/// <reference path="../ide/ViewPart.ts"/>
/// <reference path="../ide/DesignWindow.ts"/>
/// <reference path="../../core/io/FileStorage.ts"/>
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var ide;
        (function (ide) {
            class Workbench {
                constructor() {
                    this._contentType_icon_Map = new Map();
                    this._contentType_icon_Map.set(ide.CONTENT_TYPE_IMAGE, ui.controls.Controls.getIcon(ui.controls.Controls.ICON_FILE_IMAGE));
                    this._contentType_icon_Map.set(ide.CONTENT_TYPE_AUDIO, ui.controls.Controls.getIcon(ui.controls.Controls.ICON_FILE_SOUND));
                    this._contentType_icon_Map.set(ide.CONTENT_TYPE_VIDEO, ui.controls.Controls.getIcon(ui.controls.Controls.ICON_FILE_VIDEO));
                    this._contentType_icon_Map.set(ide.CONTENT_TYPE_SCRIPT, ui.controls.Controls.getIcon(ui.controls.Controls.ICON_FILE_SCRIPT));
                    this._contentType_icon_Map.set(ide.CONTENT_TYPE_TEXT, ui.controls.Controls.getIcon(ui.controls.Controls.ICON_FILE_TEXT));
                }
                static getWorkbench() {
                    if (!Workbench._workbench) {
                        Workbench._workbench = new Workbench();
                    }
                    return this._workbench;
                }
                async start() {
                    await this.initFileStorage();
                    this.initContentTypes();
                    this._designWindow = new ide.DesignWindow();
                    document.getElementById("body").appendChild(this._designWindow.getElement());
                }
                initFileStorage() {
                    this._fileStorage = new phasereditor2d.core.io.ServerFileStorage();
                    return this._fileStorage.reload();
                }
                initContentTypes() {
                    const reg = new phasereditor2d.core.ContentTypeRegistry();
                    reg.registerResolver(new ide.DefaultExtensionTypeResolver());
                    this._contentTypeRegistry = reg;
                }
                getContentTypeRegistry() {
                    return this._contentTypeRegistry;
                }
                getFileStorage() {
                    return this._fileStorage;
                }
                getContentTypeIcon(contentType) {
                    if (this._contentType_icon_Map.has(contentType)) {
                        return this._contentType_icon_Map.get(contentType);
                    }
                    return null;
                }
            }
            ide.Workbench = Workbench;
        })(ide = ui.ide || (ui.ide = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="../Part.ts"/>
/// <reference path="../ViewPart.ts"/>
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var ide;
        (function (ide) {
            var blocks;
            (function (blocks) {
                class BlocksView extends ide.ViewPart {
                    constructor() {
                        super("blocksView");
                        this.setTitle("Blocks");
                    }
                }
                blocks.BlocksView = BlocksView;
            })(blocks = ide.blocks || (ide.blocks = {}));
        })(ide = ui.ide || (ui.ide = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="../ViewPart.ts"/>
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var ide;
        (function (ide) {
            var inspector;
            (function (inspector) {
                class InspectorView extends ide.ViewPart {
                    constructor() {
                        super("inspectorView");
                        this.setTitle("Inspector");
                    }
                }
                inspector.InspectorView = InspectorView;
            })(inspector = ide.inspector || (ide.inspector = {}));
        })(ide = ui.ide || (ui.ide = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="../ViewPart.ts"/>
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var ide;
        (function (ide) {
            var outline;
            (function (outline) {
                class OutlineView extends ide.ViewPart {
                    constructor() {
                        super("outlineView");
                        this.setTitle("Outline");
                    }
                }
                outline.OutlineView = OutlineView;
            })(outline = ide.outline || (ide.outline = {}));
        })(ide = ui.ide || (ui.ide = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var controls;
        (function (controls) {
            class Rect {
                constructor(x = 0, y = 0, w = 0, h = 0) {
                    this.x = x;
                    this.y = y;
                    this.w = w;
                    this.h = h;
                }
                set(x, y, w, h) {
                    this.x = x;
                    this.y = y;
                    this.w = w;
                    this.h = h;
                }
                contains(x, y) {
                    return x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h;
                }
            }
            controls.Rect = Rect;
        })(controls = ui.controls || (ui.controls = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var controls;
        (function (controls) {
            var viewers;
            (function (viewers) {
                class LabelCellRenderer {
                    renderCell(args) {
                        const img = this.getImage(args.obj);
                        let x = args.x;
                        const ctx = args.canvasContext;
                        if (img) {
                            img.paint(ctx, x, args.y, 16, args.h);
                        }
                    }
                    cellHeight(args) {
                        return controls.ROW_HEIGHT;
                    }
                    preload(obj) {
                        return Promise.resolve();
                    }
                }
                viewers.LabelCellRenderer = LabelCellRenderer;
            })(viewers = controls.viewers || (controls.viewers = {}));
        })(controls = ui.controls || (ui.controls = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var controls;
        (function (controls) {
            var viewers;
            (function (viewers) {
                class ImageCellRenderer {
                    constructor(center) {
                        this._center = center;
                    }
                    renderCell(args) {
                        const img = this.getImage(args.obj);
                        img.paint(args.canvasContext, args.x, args.y, args.w, args.h, this._center);
                    }
                    cellHeight(args) {
                        return args.view.getCellSize();
                    }
                    preload(obj) {
                        return this.getImage(obj).preload();
                    }
                }
                viewers.ImageCellRenderer = ImageCellRenderer;
            })(viewers = controls.viewers || (controls.viewers = {}));
        })(controls = ui.controls || (ui.controls = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="../Rect.ts"/>
/// <reference path="../../phasereditor2d.ui.controls/Controls.ts"/>
/// <reference path="./LabelCellRenderer.ts"/>
/// <reference path="./ImageCellRenderer.ts"/>
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var controls;
        (function (controls) {
            var viewers;
            (function (viewers) {
                class Viewer extends controls.Control {
                    constructor() {
                        super("canvas");
                        this._labelProvider = null;
                        this._lastSelectedItemIndex = -1;
                        this._contentHeight = 0;
                        this.getElement().tabIndex = 1;
                        this._filterText = "";
                        this._cellSize = 48;
                        this.initContext();
                        this._input = null;
                        this._expandedObjects = new Set();
                        this._selectedObjects = new Set();
                        window.cc = this;
                        this.initListeners();
                    }
                    initListeners() {
                        const canvas = this.getCanvas();
                        canvas.addEventListener("mousemove", e => this.onMouseMove(e));
                        canvas.addEventListener("mouseup", e => this.onMouseUp(e));
                        canvas.addEventListener("wheel", e => this.onWheel(e));
                        canvas.addEventListener("keydown", e => this.onKeyDown(e));
                    }
                    getLabelProvider() {
                        return this._labelProvider;
                    }
                    setLabelProvider(labelProvider) {
                        this._labelProvider = labelProvider;
                    }
                    setFilterText(filterText) {
                        this._filterText = filterText;
                        this.repaint();
                    }
                    getFilterText() {
                        return this._filterText;
                    }
                    prepareFiltering() {
                        this._filterIncludeSet = new Set();
                        this.buildFilterIncludeMap();
                    }
                    isFilterIncluded(obj) {
                        return this._filterIncludeSet.has(obj);
                    }
                    matches(obj) {
                        const labelProvider = this.getLabelProvider();
                        const filter = this.getFilterText();
                        if (labelProvider === null) {
                            return true;
                        }
                        if (filter === "") {
                            return true;
                        }
                        const label = labelProvider.getLabel(obj);
                        if (label.indexOf(filter) !== -1) {
                            return true;
                        }
                        return false;
                    }
                    getPaintItemAt(e) {
                        for (let item of this._paintItems) {
                            if (item.contains(e.offsetX, e.offsetY)) {
                                return item;
                            }
                        }
                        return null;
                    }
                    fireSelectionChanged() {
                    }
                    onKeyDown(e) {
                        if (e.key === "Escape") {
                            if (this._selectedObjects.size > 0) {
                                this._selectedObjects.clear();
                                this.repaint();
                                this.fireSelectionChanged();
                            }
                        }
                    }
                    onWheel(e) {
                        if (!e.shiftKey) {
                            return;
                        }
                        if (e.deltaY < 0) {
                            this.setCellSize(this.getCellSize() + controls.ROW_HEIGHT);
                        }
                        else if (this._cellSize > 16) {
                            this.setCellSize(this.getCellSize() - controls.ROW_HEIGHT);
                        }
                        this.repaint();
                    }
                    onMouseUp(e) {
                        if (e.button !== 0) {
                            return;
                        }
                        const item = this.getPaintItemAt(e);
                        if (item === null) {
                            return;
                        }
                        let selChanged = false;
                        const data = item.data;
                        if (e.ctrlKey || e.metaKey) {
                            this._selectedObjects.add(data);
                            selChanged = true;
                        }
                        else if (e.shiftKey) {
                            if (this._lastSelectedItemIndex >= 0 && this._lastSelectedItemIndex != item.index) {
                                const start = Math.min(this._lastSelectedItemIndex, item.index);
                                const end = Math.max(this._lastSelectedItemIndex, item.index);
                                for (let i = start; i <= end; i++) {
                                    this._selectedObjects.add(this._paintItems[i].data);
                                }
                                selChanged = true;
                            }
                        }
                        else {
                            this._selectedObjects.clear();
                            this._selectedObjects.add(data);
                            selChanged = true;
                        }
                        if (selChanged) {
                            this.repaint();
                            this.fireSelectionChanged();
                            this._lastSelectedItemIndex = item.index;
                        }
                    }
                    onMouseMove(e) {
                        if (e.buttons !== 0) {
                            return;
                        }
                        const item = this.getPaintItemAt(e);
                        const over = item === null ? null : item.data;
                        if (over !== this._overObject) {
                            this._overObject = over;
                            this.repaint();
                        }
                    }
                    getOverObject() {
                        return this._overObject;
                    }
                    initContext() {
                        this._context = this.getCanvas().getContext("2d");
                        this._context.imageSmoothingEnabled = false;
                        controls.Controls.disableCanvasSmoothing(this._context);
                        this._context.font = `${controls.FONT_HEIGHT}px sans-serif`;
                    }
                    setExpanded(obj, expanded) {
                        if (expanded) {
                            this._expandedObjects.add(obj);
                        }
                        else {
                            this._expandedObjects.delete(obj);
                        }
                    }
                    isExpanded(obj) {
                        return this._expandedObjects.has(obj);
                    }
                    isCollapsed(obj) {
                        return !this.isExpanded(obj);
                    }
                    isSelected(obj) {
                        return this._selectedObjects.has(obj);
                    }
                    paintTreeHandler(x, y, collapsed) {
                        if (collapsed) {
                            this._context.strokeStyle = "#000";
                            this._context.strokeRect(x, y, 16, 16);
                        }
                        else {
                            this._context.fillStyle = "#000";
                            this._context.fillRect(x, y, 16, 16);
                        }
                    }
                    async repaint() {
                        this.prepareFiltering();
                        this.repaint2();
                        await this.preload();
                        this.repaint2();
                        this.updateScrollPane();
                    }
                    updateScrollPane() {
                        if (this.getContainer() instanceof controls.ScrollPane) {
                            const pane = this.getContainer();
                            pane.updateScroll(this._contentHeight);
                        }
                    }
                    repaint2() {
                        this._paintItems = [];
                        const canvas = this.getCanvas();
                        this._context.clearRect(0, 0, canvas.width, canvas.height);
                        if (this._cellRendererProvider && this._contentProvider && this._input !== null) {
                            this.paint();
                        }
                    }
                    paintItemBackground(obj, x, y, w, h) {
                        let fillStyle = null;
                        if (this.isSelected(obj)) {
                            fillStyle = controls.Controls.theme.treeItemSelectionBackground;
                            ;
                        }
                        else if (obj === this._overObject) {
                            fillStyle = controls.Controls.theme.treeItemOverBackground;
                        }
                        if (fillStyle != null) {
                            this._context.save();
                            this._context.fillStyle = fillStyle;
                            this._context.fillRect(x, y, w, h);
                            this._context.restore();
                        }
                    }
                    setScrollY(scrollY) {
                        const b = this.getBounds();
                        scrollY = Math.max(-this._contentHeight + b.height, scrollY);
                        scrollY = Math.min(0, scrollY);
                        super.setScrollY(scrollY);
                        this.repaint();
                    }
                    layout() {
                        const b = this.getBounds();
                        ui.controls.setElementBounds(this.getElement(), {
                            x: b.x,
                            y: b.y,
                            width: b.width | 0,
                            height: b.height | 0
                        });
                        const canvas = this.getCanvas();
                        canvas.width = b.width | 0;
                        canvas.height = b.height | 0;
                        this.initContext();
                        this.repaint();
                    }
                    getCanvas() {
                        return this.getElement();
                    }
                    getCellSize() {
                        return this._cellSize;
                    }
                    setCellSize(cellSize) {
                        this._cellSize = Math.max(controls.ROW_HEIGHT, cellSize);
                    }
                    getContentProvider() {
                        return this._contentProvider;
                    }
                    setContentProvider(contentProvider) {
                        this._contentProvider = contentProvider;
                    }
                    getCellRendererProvider() {
                        return this._cellRendererProvider;
                    }
                    setCellRendererProvider(cellRendererProvider) {
                        this._cellRendererProvider = cellRendererProvider;
                    }
                    getInput() {
                        return this._input;
                    }
                    setInput(input) {
                        this._input = input;
                    }
                }
                viewers.Viewer = Viewer;
            })(viewers = controls.viewers || (controls.viewers = {}));
        })(controls = ui.controls || (ui.controls = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="../../../../../phasereditor2d.ui.controls/Controls.ts"/>
/// <reference path="../../../../../phasereditor2d.ui.controls/viewers/Viewer.ts"/>
/// <reference path="../../Part.ts"/>
/// <reference path="../../ViewPart.ts"/>
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var ide;
        (function (ide) {
            var files;
            (function (files) {
                var viewers = phasereditor2d.ui.controls.viewers;
                class FileCellRenderer extends viewers.LabelCellRenderer {
                    getImage(obj) {
                        const file = obj;
                        if (file.isFile()) {
                            const ct = ide.Workbench.getWorkbench().getContentTypeRegistry().getCachedContentType(file);
                            const icon = ide.Workbench.getWorkbench().getContentTypeIcon(ct);
                            if (icon) {
                                return icon;
                            }
                        }
                        else {
                            return ui.controls.Controls.getIcon(ui.controls.Controls.ICON_FOLDER);
                        }
                        return ui.controls.Controls.getIcon(ui.controls.Controls.ICON_FILE);
                    }
                    preload(obj) {
                        const file = obj;
                        if (file.isFile()) {
                            return ide.Workbench.getWorkbench().getContentTypeRegistry().findContentType(file);
                        }
                        return super.preload(obj);
                    }
                }
                files.FileCellRenderer = FileCellRenderer;
            })(files = ide.files || (ide.files = {}));
        })(ide = ui.ide || (ui.ide = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="../../../../../phasereditor2d.ui.controls/Controls.ts"/>
/// <reference path="../../../../../phasereditor2d.ui.controls/viewers/Viewer.ts"/>
/// <reference path="../../Part.ts"/>
/// <reference path="../../ViewPart.ts"/>
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var ide;
        (function (ide) {
            var files;
            (function (files) {
                class FileCellRendererProvider {
                    getCellRenderer(file) {
                        if (ide.Workbench.getWorkbench().getContentTypeRegistry().getCachedContentType(file) === ui.ide.CONTENT_TYPE_IMAGE) {
                            return new files.FileImageRenderer(false);
                        }
                        return new files.FileCellRenderer();
                    }
                    preload(file) {
                        return ide.Workbench.getWorkbench().getContentTypeRegistry().findContentType(file);
                    }
                }
                files.FileCellRendererProvider = FileCellRendererProvider;
            })(files = ide.files || (ide.files = {}));
        })(ide = ui.ide || (ui.ide = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="../../../../../phasereditor2d.ui.controls/Controls.ts"/>
/// <reference path="../../../../../phasereditor2d.ui.controls/viewers/Viewer.ts"/>
/// <reference path="../../Part.ts"/>
/// <reference path="../../ViewPart.ts"/>
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var ide;
        (function (ide) {
            var files;
            (function (files) {
                var viewers = phasereditor2d.ui.controls.viewers;
                class FileImageRenderer extends viewers.ImageCellRenderer {
                    constructor(center) {
                        super(center);
                    }
                    getLabel(file) {
                        return file.getName();
                    }
                    getImage(file) {
                        return ui.controls.Controls.getImage(file.getUrl(), file.getId());
                    }
                }
                files.FileImageRenderer = FileImageRenderer;
            })(files = ide.files || (ide.files = {}));
        })(ide = ui.ide || (ui.ide = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="../../../../../phasereditor2d.ui.controls/Controls.ts"/>
/// <reference path="../../../../../phasereditor2d.ui.controls/viewers/Viewer.ts"/>
/// <reference path="../../Part.ts"/>
/// <reference path="../../ViewPart.ts"/>
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var ide;
        (function (ide) {
            var files;
            (function (files) {
                class FileLabelProvider {
                    getLabel(obj) {
                        return obj.getName();
                    }
                }
                files.FileLabelProvider = FileLabelProvider;
            })(files = ide.files || (ide.files = {}));
        })(ide = ui.ide || (ui.ide = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="../../../../../phasereditor2d.ui.controls/Controls.ts"/>
/// <reference path="../../../../../phasereditor2d.ui.controls/viewers/Viewer.ts"/>
/// <reference path="../../Part.ts"/>
/// <reference path="../../ViewPart.ts"/>
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var ide;
        (function (ide) {
            var files;
            (function (files) {
                var io = phasereditor2d.core.io;
                class FileTreeContentProvider {
                    getRoots(input) {
                        if (input instanceof io.FilePath) {
                            return [input];
                        }
                        if (input instanceof Array) {
                            return input;
                        }
                        return this.getChildren(input);
                    }
                    getChildren(parent) {
                        return parent.getFiles();
                    }
                }
                files.FileTreeContentProvider = FileTreeContentProvider;
            })(files = ide.files || (ide.files = {}));
        })(ide = ui.ide || (ui.ide = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="../../../../../phasereditor2d.ui.controls/Controls.ts"/>
/// <reference path="../../../../../phasereditor2d.ui.controls/viewers/Viewer.ts"/>
/// <reference path="../../Part.ts"/>
/// <reference path="../../ViewPart.ts"/>
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var ide;
        (function (ide) {
            var files;
            (function (files) {
                var viewers = phasereditor2d.ui.controls.viewers;
                class FilesView extends ide.ViewPart {
                    constructor() {
                        super("filesView");
                        this.setTitle("Files");
                        //const root = new core.io.FilePath(null, TEST_DATA);
                        const root = ide.Workbench.getWorkbench().getFileStorage().getRoot();
                        //console.log(root.toStringTree());
                        const viewer = new viewers.TreeViewer();
                        viewer.setLabelProvider(new files.FileLabelProvider());
                        viewer.setContentProvider(new files.FileTreeContentProvider());
                        viewer.setCellRendererProvider(new files.FileCellRendererProvider());
                        viewer.setInput(root);
                        const filteredViewer = new viewers.FilteredViewer(viewer);
                        this.getClientArea().add(filteredViewer);
                        this.getClientArea().setLayout(new ui.controls.FillLayout());
                        viewer.repaint();
                    }
                }
                files.FilesView = FilesView;
                const TEST_DATA = {
                    "name": "",
                    "isFile": false,
                    "children": [
                        {
                            "name": ".gitignore",
                            "isFile": true,
                            "contentType": "any"
                        },
                        {
                            "name": "COPYRIGHTS",
                            "isFile": true,
                            "contentType": "any"
                        },
                        {
                            "name": "assets",
                            "isFile": false,
                            "children": [
                                {
                                    "name": "animations.json",
                                    "isFile": true,
                                    "contentType": "json"
                                },
                                {
                                    "name": "atlas",
                                    "isFile": false,
                                    "children": [
                                        {
                                            "name": ".DS_Store",
                                            "isFile": true,
                                            "contentType": "any"
                                        },
                                        {
                                            "name": "atlas-props.json",
                                            "isFile": true,
                                            "contentType": "json"
                                        },
                                        {
                                            "name": "atlas-props.png",
                                            "isFile": true,
                                            "contentType": "img"
                                        },
                                        {
                                            "name": "atlas.json",
                                            "isFile": true,
                                            "contentType": "json"
                                        },
                                        {
                                            "name": "atlas.png",
                                            "isFile": true,
                                            "contentType": "img"
                                        },
                                        {
                                            "name": "hello.atlas",
                                            "isFile": true,
                                            "contentType": "any"
                                        },
                                        {
                                            "name": "hello.json",
                                            "isFile": true,
                                            "contentType": "json"
                                        },
                                        {
                                            "name": "hello.png",
                                            "isFile": true,
                                            "contentType": "img"
                                        }
                                    ]
                                },
                                {
                                    "name": "environment",
                                    "isFile": false,
                                    "children": [
                                        {
                                            "name": ".DS_Store",
                                            "isFile": true,
                                            "contentType": "any"
                                        },
                                        {
                                            "name": "bg-clouds.png",
                                            "isFile": true,
                                            "contentType": "img"
                                        },
                                        {
                                            "name": "bg-mountains.png",
                                            "isFile": true,
                                            "contentType": "img"
                                        },
                                        {
                                            "name": "bg-trees.png",
                                            "isFile": true,
                                            "contentType": "img"
                                        },
                                        {
                                            "name": "tileset.png",
                                            "isFile": true,
                                            "contentType": "img"
                                        }
                                    ]
                                },
                                {
                                    "name": "fonts",
                                    "isFile": false,
                                    "children": [
                                        {
                                            "name": "arcade.png",
                                            "isFile": true,
                                            "contentType": "img"
                                        },
                                        {
                                            "name": "arcade.xml",
                                            "isFile": true,
                                            "contentType": "any"
                                        },
                                        {
                                            "name": "atari-classic.png",
                                            "isFile": true,
                                            "contentType": "img"
                                        },
                                        {
                                            "name": "atari-classic.xml",
                                            "isFile": true,
                                            "contentType": "any"
                                        }
                                    ]
                                },
                                {
                                    "name": "html",
                                    "isFile": false,
                                    "children": [
                                        {
                                            "name": "hello.html",
                                            "isFile": true,
                                            "contentType": "any"
                                        }
                                    ]
                                },
                                {
                                    "name": "levels-pack-1.json",
                                    "isFile": true,
                                    "contentType": "json"
                                },
                                {
                                    "name": "maps",
                                    "isFile": false,
                                    "children": [
                                        {
                                            "name": ".DS_Store",
                                            "isFile": true,
                                            "contentType": "any"
                                        },
                                        {
                                            "name": "map.json",
                                            "isFile": true,
                                            "contentType": "json"
                                        }
                                    ]
                                },
                                {
                                    "name": "scenes",
                                    "isFile": false,
                                    "children": [
                                        {
                                            "name": "Acorn.js",
                                            "isFile": true,
                                            "contentType": "js"
                                        },
                                        {
                                            "name": "Ant.js",
                                            "isFile": true,
                                            "contentType": "js"
                                        },
                                        {
                                            "name": "EnemyDeath.js",
                                            "isFile": true,
                                            "contentType": "js"
                                        },
                                        {
                                            "name": "GameOver.js",
                                            "isFile": true,
                                            "contentType": "js"
                                        },
                                        {
                                            "name": "GameOver.scene",
                                            "isFile": true,
                                            "contentType": "phasereditor2d.scene"
                                        },
                                        {
                                            "name": "Gator.js",
                                            "isFile": true,
                                            "contentType": "js"
                                        },
                                        {
                                            "name": "Grasshopper.js",
                                            "isFile": true,
                                            "contentType": "js"
                                        },
                                        {
                                            "name": "Level.js",
                                            "isFile": true,
                                            "contentType": "js"
                                        },
                                        {
                                            "name": "Level.scene",
                                            "isFile": true,
                                            "contentType": "phasereditor2d.scene"
                                        },
                                        {
                                            "name": "Player.js",
                                            "isFile": true,
                                            "contentType": "js"
                                        },
                                        {
                                            "name": "Preload.js",
                                            "isFile": true,
                                            "contentType": "js"
                                        },
                                        {
                                            "name": "Preload.scene",
                                            "isFile": true,
                                            "contentType": "phasereditor2d.scene"
                                        },
                                        {
                                            "name": "TitleScreen.js",
                                            "isFile": true,
                                            "contentType": "js"
                                        },
                                        {
                                            "name": "TitleScreen.scene",
                                            "isFile": true,
                                            "contentType": "phasereditor2d.scene"
                                        }
                                    ]
                                },
                                {
                                    "name": "sounds",
                                    "isFile": false,
                                    "children": [
                                        {
                                            "name": ".DS_Store",
                                            "isFile": true,
                                            "contentType": "any"
                                        },
                                        {
                                            "name": "enemy-death.ogg",
                                            "isFile": true,
                                            "contentType": "sound"
                                        },
                                        {
                                            "name": "hurt.ogg",
                                            "isFile": true,
                                            "contentType": "sound"
                                        },
                                        {
                                            "name": "item.ogg",
                                            "isFile": true,
                                            "contentType": "sound"
                                        },
                                        {
                                            "name": "jump.ogg",
                                            "isFile": true,
                                            "contentType": "sound"
                                        },
                                        {
                                            "name": "music-credits.txt",
                                            "isFile": true,
                                            "contentType": "txt"
                                        },
                                        {
                                            "name": "the_valley.ogg",
                                            "isFile": true,
                                            "contentType": "sound"
                                        }
                                    ]
                                },
                                {
                                    "name": "sprites",
                                    "isFile": false,
                                    "children": [
                                        {
                                            "name": ".DS_Store",
                                            "isFile": true,
                                            "contentType": "any"
                                        },
                                        {
                                            "name": "credits-text.png",
                                            "isFile": true,
                                            "contentType": "img"
                                        },
                                        {
                                            "name": "game-over.png",
                                            "isFile": true,
                                            "contentType": "img"
                                        },
                                        {
                                            "name": "instructions.png",
                                            "isFile": true,
                                            "contentType": "img"
                                        },
                                        {
                                            "name": "loading.png",
                                            "isFile": true,
                                            "contentType": "img"
                                        },
                                        {
                                            "name": "press-enter-text.png",
                                            "isFile": true,
                                            "contentType": "img"
                                        },
                                        {
                                            "name": "title-screen.png",
                                            "isFile": true,
                                            "contentType": "img"
                                        }
                                    ]
                                },
                                {
                                    "name": "svg",
                                    "isFile": false,
                                    "children": [
                                        {
                                            "name": "demo.svg",
                                            "isFile": true,
                                            "contentType": "svg"
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "name": "data.json",
                            "isFile": true,
                            "contentType": "json"
                        },
                        {
                            "name": "fake-assets",
                            "isFile": false,
                            "children": [
                                {
                                    "name": "Collisions Layer.png",
                                    "isFile": true,
                                    "contentType": "img"
                                },
                                {
                                    "name": "Main Layer.png",
                                    "isFile": true,
                                    "contentType": "img"
                                },
                                {
                                    "name": "fake-pack.json",
                                    "isFile": true,
                                    "contentType": "json"
                                }
                            ]
                        },
                        {
                            "name": "index.html",
                            "isFile": true,
                            "contentType": "any"
                        },
                        {
                            "name": "jsconfig.json",
                            "isFile": true,
                            "contentType": "json"
                        },
                        {
                            "name": "lib",
                            "isFile": false,
                            "children": [
                                {
                                    "name": "phaser.js",
                                    "isFile": true,
                                    "contentType": "js"
                                }
                            ]
                        },
                        {
                            "name": "main.js",
                            "isFile": true,
                            "contentType": "js"
                        },
                        {
                            "name": "typings",
                            "isFile": false,
                            "children": [
                                {
                                    "name": "phaser.d.ts",
                                    "isFile": true,
                                    "contentType": "ts"
                                }
                            ]
                        }
                    ]
                };
            })(files = ide.files || (ide.files = {}));
        })(ide = ui.ide || (ui.ide = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var controls;
        (function (controls) {
            class Action {
            }
            controls.Action = Action;
        })(controls = ui.controls || (ui.controls = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var controls;
        (function (controls) {
            class ActionButton extends controls.Control {
                constructor(action) {
                    super("button");
                    this._action = action;
                    this.getElement().classList.add("actionButton");
                }
                getAction() {
                    return this._action;
                }
            }
            controls.ActionButton = ActionButton;
        })(controls = ui.controls || (ui.controls = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var controls;
        (function (controls) {
            class FillLayout {
                constructor(padding = 0) {
                    this._padding = 0;
                    this._padding = padding;
                }
                getPadding() {
                    return this._padding;
                }
                setPadding(padding) {
                    this._padding = padding;
                }
                layout(parent) {
                    const children = parent.getChildren();
                    if (children.length > 1) {
                        console.warn("[FillLayout] Invalid number for children or parent control.");
                    }
                    const b = parent.getBounds();
                    controls.setElementBounds(parent.getElement(), b);
                    if (children.length > 0) {
                        const child = children[0];
                        child.setBoundsValues(this._padding, this._padding, b.width - this._padding * 2, b.height - this._padding * 2);
                    }
                }
            }
            controls.FillLayout = FillLayout;
        })(controls = ui.controls || (ui.controls = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var controls;
        (function (controls) {
            const SCROLL_BAR_WIDTH = 15;
            class ScrollPane extends controls.Control {
                constructor(clientControl) {
                    super();
                    this._clientContentHeight = 0;
                    this._startDragY = -1;
                    this._startScrollY = 0;
                    this._clientControl = clientControl;
                    this.add(this._clientControl);
                    this._scrollBar = document.createElement("div");
                    this._scrollBar.classList.add("scrollBar");
                    this.getElement().appendChild(this._scrollBar);
                    this._scrollHandler = document.createElement("div");
                    this._scrollHandler.classList.add("scrollHandler");
                    this.getElement().appendChild(this._scrollHandler);
                    const l2 = (e) => this.onMouseDown(e);
                    const l3 = (e) => this.onMouseUp(e);
                    const l4 = (e) => this.onMouseMove(e);
                    const l5 = (e) => {
                        if (!this.getElement().isConnected) {
                            window.removeEventListener("mousedown", l2);
                            window.removeEventListener("mouseup", l3);
                            window.removeEventListener("mousemove", l4);
                            window.removeEventListener("mousemove", l5);
                        }
                    };
                    window.addEventListener("mousedown", l2);
                    window.addEventListener("mouseup", l3);
                    window.addEventListener("mousemove", l4);
                    window.addEventListener("mousemove", l5);
                    this._clientControl.getElement().addEventListener("wheel", e => this.onClientWheel(e));
                    this._scrollBar.addEventListener("mousedown", e => this.onBarMouseDown(e));
                }
                updateScroll(clientContentHeight) {
                    const scrollY = this._clientControl.getScrollY();
                    const b = this.getBounds();
                    let newScrollY = scrollY;
                    newScrollY = Math.max(-this._clientContentHeight + b.height, newScrollY);
                    newScrollY = Math.min(0, newScrollY);
                    if (newScrollY != scrollY) {
                        this._clientContentHeight = clientContentHeight;
                        this.setClientScrollY(scrollY);
                    }
                    else if (clientContentHeight !== this._clientContentHeight) {
                        this._clientContentHeight = clientContentHeight;
                        this.layout();
                    }
                }
                onBarMouseDown(e) {
                    const b = this.getBounds();
                    this.setClientScrollY(-e.offsetY / b.height * (this._clientContentHeight - b.height));
                }
                onClientWheel(e) {
                    if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) {
                        return;
                    }
                    let y = this._clientControl.getScrollY();
                    y += e.deltaY < 0 ? 30 : -30;
                    this.setClientScrollY(y);
                }
                setClientScrollY(y) {
                    const b = this.getBounds();
                    y = Math.max(-this._clientContentHeight + b.height, y);
                    y = Math.min(0, y);
                    this._clientControl.setScrollY(y);
                    this.layout();
                }
                onMouseDown(e) {
                    if (e.target === this._scrollHandler) {
                        this._startDragY = e.y;
                        this._startScrollY = this._clientControl.getScrollY();
                    }
                }
                onMouseMove(e) {
                    if (this._startDragY !== -1) {
                        let delta = e.y - this._startDragY;
                        const b = this.getBounds();
                        delta = delta / b.height * this._clientContentHeight;
                        this.setClientScrollY(this._startScrollY - delta);
                    }
                }
                onMouseUp(e) {
                    if (this._startDragY !== -1) {
                        this._startDragY = -1;
                    }
                }
                layout() {
                    const b = this.getBounds();
                    controls.setElementBounds(this.getElement(), b);
                    if (b.height < this._clientContentHeight) {
                        this._clientControl.setBoundsValues(0, 0, b.width - SCROLL_BAR_WIDTH, b.height);
                        // scroll bar
                        this._scrollBar.style.display = "inherit";
                        controls.setElementBounds(this._scrollBar, {
                            x: b.width - SCROLL_BAR_WIDTH,
                            y: 0,
                            width: SCROLL_BAR_WIDTH - 2,
                            height: b.height
                        });
                        // handler
                        this._scrollHandler.style.display = "inherit";
                        const h = Math.max(10, b.height / this._clientContentHeight * b.height);
                        const y = -(b.height - h) * this._clientControl.getScrollY() / (this._clientContentHeight - b.height);
                        controls.setElementBounds(this._scrollHandler, {
                            x: b.width - SCROLL_BAR_WIDTH,
                            y: y,
                            width: SCROLL_BAR_WIDTH - 2,
                            height: h
                        });
                    }
                    else {
                        this._clientControl.setBoundsValues(0, 0, b.width, b.height);
                        this._scrollBar.style.display = "none";
                        this._scrollHandler.style.display = "none";
                    }
                }
            }
            controls.ScrollPane = ScrollPane;
        })(controls = ui.controls || (ui.controls = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var controls;
        (function (controls) {
            class SplitPanel extends controls.Control {
                constructor(left, right, horizontal = true) {
                    super();
                    this._startDrag = -1;
                    this.getElement().classList.add("split");
                    this._horizontal = horizontal;
                    this._splitPosition = 50;
                    this._splitFactor = 0.5;
                    this._splitWidth = 2;
                    const l1 = (e) => this.onMouseLeave(e);
                    const l2 = (e) => this.onMouseDown(e);
                    const l3 = (e) => this.onMouseUp(e);
                    const l4 = (e) => this.onMouseMove(e);
                    const l5 = (e) => {
                        if (!this.getElement().isConnected) {
                            window.removeEventListener("mouseleave", l1);
                            window.removeEventListener("mousedown", l2);
                            window.removeEventListener("mouseup", l3);
                            window.removeEventListener("mousemove", l4);
                            window.removeEventListener("mousemove", l5);
                        }
                    };
                    window.addEventListener("mouseleave", l1);
                    window.addEventListener("mousedown", l2);
                    window.addEventListener("mouseup", l3);
                    window.addEventListener("mousemove", l4);
                    window.addEventListener("mousemove", l5);
                    if (left) {
                        this.setLeftControl(left);
                    }
                    if (right) {
                        this.setRightControl(right);
                    }
                }
                onMouseDown(e) {
                    const pos = this.getControlPosition(e.x, e.y);
                    const offset = this._horizontal ? pos.x : pos.y;
                    const inside = Math.abs(offset - this._splitPosition) <= controls.SPLIT_OVER_ZONE_WIDTH && this.containsLocalPoint(pos.x, pos.y);
                    if (inside) {
                        e.preventDefault();
                        this._startDrag = this._horizontal ? e.x : e.y;
                        this._startPos = this._splitPosition;
                    }
                }
                onMouseUp(e) {
                    this._startDrag = -1;
                }
                onMouseMove(e) {
                    const pos = this.getControlPosition(e.x, e.y);
                    const offset = this._horizontal ? pos.x : pos.y;
                    const screen = this._horizontal ? e.x : e.y;
                    const boundsSize = this._horizontal ? this.getBounds().width : this.getBounds().height;
                    const cursorResize = this._horizontal ? "ew-resize" : "ns-resize";
                    const inside = Math.abs(offset - this._splitPosition) <= controls.SPLIT_OVER_ZONE_WIDTH && this.containsLocalPoint(pos.x, pos.y);
                    if (inside) {
                        if (e.buttons === 0 || this._startDrag !== -1) {
                            e.preventDefault();
                            this.getElement().style.cursor = cursorResize;
                        }
                    }
                    else {
                        this.getElement().style.cursor = "inherit";
                    }
                    if (this._startDrag !== -1) {
                        this.getElement().style.cursor = cursorResize;
                        const newPos = this._startPos + screen - this._startDrag;
                        if (newPos > 100 && boundsSize - newPos > 100) {
                            this._splitPosition = newPos;
                            this._splitFactor = this._splitPosition / boundsSize;
                            this.layout();
                        }
                    }
                }
                onMouseLeave(e) {
                    this.getElement().style.cursor = "inherit";
                    this._startDrag = -1;
                }
                setHorizontal(horizontal = true) {
                    this._horizontal = horizontal;
                }
                setVertical(vertical = true) {
                    this._horizontal = !vertical;
                }
                getSplitFactor() {
                    return this._splitFactor;
                }
                getSize() {
                    const b = this.getBounds();
                    return this._horizontal ? b.width : b.height;
                }
                setSplitFactor(factor) {
                    this._splitFactor = Math.min(Math.max(0, factor), 1);
                    this._splitPosition = this.getSize() * this._splitFactor;
                }
                setLeftControl(control) {
                    this._leftControl = control;
                    this.add(control);
                }
                getLeftControl() {
                    return this._leftControl;
                }
                setRightControl(control) {
                    this._rightControl = control;
                    this.add(control);
                }
                getRightControl() {
                    return this._rightControl;
                }
                layout() {
                    controls.setElementBounds(this.getElement(), this.getBounds());
                    if (!this._leftControl || !this._rightControl) {
                        return;
                    }
                    this.setSplitFactor(this._splitFactor);
                    const pos = this._splitPosition;
                    const sw = this._splitWidth;
                    let b = this.getBounds();
                    if (this._horizontal) {
                        this._leftControl.setBoundsValues(0, 0, pos - sw, b.height);
                        this._rightControl.setBoundsValues(pos + sw, 0, b.width - pos - sw, b.height);
                    }
                    else {
                        this._leftControl.setBoundsValues(0, 0, b.width, pos - sw);
                        this._rightControl.setBoundsValues(0, pos + sw, b.width, b.height - pos - sw);
                    }
                }
            }
            controls.SplitPanel = SplitPanel;
        })(controls = ui.controls || (ui.controls = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var controls;
        (function (controls) {
            controls.CONTROL_PADDING = 3;
            controls.ROW_HEIGHT = 20;
            controls.FONT_HEIGHT = 14;
            controls.FONT_OFFSET = 2;
            controls.ACTION_WIDTH = 20;
            controls.PANEL_BORDER_SIZE = 4;
            controls.SPLIT_OVER_ZONE_WIDTH = 6;
            function setElementBounds(elem, bounds) {
                if (bounds.x !== undefined) {
                    elem.style.left = bounds.x + "px";
                }
                if (bounds.x !== undefined) {
                    elem.style.top = bounds.y + "px";
                }
                if (bounds.x !== undefined) {
                    elem.style.width = bounds.width + "px";
                }
                if (bounds.x !== undefined) {
                    elem.style.height = bounds.height + "px";
                }
            }
            controls.setElementBounds = setElementBounds;
            function getElementBounds(elem) {
                return {
                    x: elem.clientLeft,
                    y: elem.clientTop,
                    width: elem.clientWidth,
                    height: elem.clientHeight
                };
            }
            controls.getElementBounds = getElementBounds;
        })(controls = ui.controls || (ui.controls = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var controls;
        (function (controls) {
            var viewers;
            (function (viewers) {
                class FilteredViewer extends controls.Control {
                    constructor(viewer) {
                        super();
                        this._viewer = viewer;
                        this.addClass("filteredViewer");
                        this._filterElement = document.createElement("input");
                        this.getElement().appendChild(this._filterElement);
                        this._scrollPane = new controls.ScrollPane(this._viewer);
                        this.add(this._scrollPane);
                        this._filterElement.addEventListener("input", e => this.onFilterInput(e));
                    }
                    onFilterInput(e) {
                        this._viewer.setFilterText(this._filterElement.value);
                    }
                    getViewer() {
                        return this._viewer;
                    }
                    layout() {
                        const b = this.getBounds();
                        controls.setElementBounds(this.getElement(), b);
                        const inputH = controls.ROW_HEIGHT;
                        controls.setElementBounds(this._filterElement, {
                            x: controls.CONTROL_PADDING,
                            y: controls.CONTROL_PADDING,
                            width: b.width - controls.CONTROL_PADDING * 2 - /* padding=4 */ 4
                        });
                        this._filterElement.style.minHeight = inputH + "px";
                        this._filterElement.style.maxHeight = inputH + "px";
                        this._filterElement.style.height = inputH + "px";
                        const paneY = inputH + /*padding=4*/ 4 + controls.CONTROL_PADDING * 2;
                        this._scrollPane.setBounds({
                            x: 0,
                            y: paneY,
                            width: b.width + 2,
                            height: b.height - paneY
                        });
                    }
                }
                viewers.FilteredViewer = FilteredViewer;
            })(viewers = controls.viewers || (controls.viewers = {}));
        })(controls = ui.controls || (ui.controls = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./Viewer.ts"/>
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var controls;
        (function (controls) {
            var viewers;
            (function (viewers) {
                class PaintItem extends controls.Rect {
                    constructor(index, data) {
                        super();
                        this.index = index;
                        this.data = data;
                    }
                }
                viewers.PaintItem = PaintItem;
            })(viewers = controls.viewers || (controls.viewers = {}));
        })(controls = ui.controls || (ui.controls = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var controls;
        (function (controls) {
            var viewers;
            (function (viewers) {
                class RenderCellArgs {
                    constructor(canvasContext, x, y, w, h, obj, view) {
                        this.canvasContext = canvasContext;
                        this.x = x;
                        this.y = y;
                        this.w = w;
                        this.h = h;
                        this.obj = obj;
                        this.view = view;
                    }
                }
                viewers.RenderCellArgs = RenderCellArgs;
                ;
            })(viewers = controls.viewers || (controls.viewers = {}));
        })(controls = ui.controls || (ui.controls = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
/// <reference path="./Viewer.ts"/>
var phasereditor2d;
(function (phasereditor2d) {
    var ui;
    (function (ui) {
        var controls;
        (function (controls) {
            var viewers;
            (function (viewers) {
                const TREE_ICON_SIZE = 16;
                const LABEL_MARGIN = TREE_ICON_SIZE + 0;
                class TreeViewer extends viewers.Viewer {
                    constructor() {
                        super();
                        this._treeIconList = [];
                        this.getCanvas().addEventListener("click", e => this.onClick(e));
                    }
                    onClick(e) {
                        for (let icon of this._treeIconList) {
                            if (icon.rect.contains(e.offsetX, e.offsetY)) {
                                this.setExpanded(icon.obj, !this.isExpanded(icon.obj));
                                this.repaint();
                                return;
                            }
                        }
                    }
                    visitObjects(visitor) {
                        const list = this.getContentProvider().getRoots(this.getInput());
                        this.visitObjects2(list, visitor);
                    }
                    visitObjects2(objects, visitor) {
                        for (var obj of objects) {
                            visitor(obj);
                            if (this.isExpanded(obj) || this.getFilterText() !== "") {
                                const list = this.getContentProvider().getChildren(obj);
                                this.visitObjects2(list, visitor);
                            }
                        }
                    }
                    async preload() {
                        const list = [];
                        this.visitObjects(obj => {
                            const provider = this.getCellRendererProvider();
                            list.push(provider.preload(obj));
                            const renderer = provider.getCellRenderer(obj);
                            list.push(renderer.preload(obj));
                        });
                        return Promise.all(list);
                    }
                    paint() {
                        let x = 0;
                        let y = this.getScrollY();
                        this._treeIconList = [];
                        // TODO: missing taking the scroll offset to compute the non-painting area
                        const contentProvider = this.getContentProvider();
                        const roots = contentProvider.getRoots(this.getInput());
                        this._contentHeight = this.paintItems(roots, x, y) - this.getScrollY();
                    }
                    setFilterText(filter) {
                        super.setFilterText(filter);
                        if (filter !== "") {
                            this.expandFilteredParents(this.getContentProvider().getRoots(this.getInput()));
                            this.repaint();
                        }
                    }
                    expandFilteredParents(objects) {
                        const contentProvider = this.getContentProvider();
                        for (const obj of objects) {
                            if (this.isFilterIncluded(obj)) {
                                const children = contentProvider.getChildren(obj);
                                if (children.length > 0) {
                                    this.setExpanded(obj, true);
                                    this.expandFilteredParents(children);
                                }
                            }
                        }
                    }
                    buildFilterIncludeMap() {
                        const roots = this.getContentProvider().getRoots(this.getInput());
                        this.buildFilterIncludeMap2(roots);
                    }
                    buildFilterIncludeMap2(objects) {
                        let result = false;
                        for (const obj of objects) {
                            let resultThis = this.matches(obj);
                            const children = this.getContentProvider().getChildren(obj);
                            const resultChildren = this.buildFilterIncludeMap2(children);
                            resultThis = resultThis || resultChildren;
                            if (resultThis) {
                                this._filterIncludeSet.add(obj);
                                result = true;
                            }
                        }
                        return result;
                    }
                    paintItems(objects, x, y) {
                        const b = this.getBounds();
                        for (let obj of objects) {
                            const children = this.getContentProvider().getChildren(obj);
                            const expanded = this.isExpanded(obj);
                            if (this._filterIncludeSet.has(obj)) {
                                const renderer = this.getCellRendererProvider().getCellRenderer(obj);
                                const args = new viewers.RenderCellArgs(this._context, x + LABEL_MARGIN, y, b.width - x - LABEL_MARGIN, 0, obj, this);
                                const cellHeight = renderer.cellHeight(args);
                                args.h = cellHeight;
                                super.paintItemBackground(obj, 0, y, b.width, cellHeight);
                                if (y > -this.getCellSize() && y < b.height) {
                                    // render tree icon
                                    if (children.length > 0) {
                                        const iconY = y + (cellHeight - TREE_ICON_SIZE) / 2;
                                        const icon = controls.Controls.getIcon(expanded ? controls.Controls.ICON_TREE_COLLAPSE : controls.Controls.ICON_TREE_EXPAND);
                                        icon.paint(this._context, x, iconY);
                                        this._treeIconList.push({
                                            rect: new controls.Rect(x, iconY, TREE_ICON_SIZE, TREE_ICON_SIZE),
                                            obj: obj
                                        });
                                    }
                                    this.renderCell(args, renderer);
                                    const item = new viewers.PaintItem(this._paintItems.length, obj);
                                    item.set(args.x, args.y, args.w, args.h);
                                    this._paintItems.push(item);
                                }
                                y += cellHeight;
                            }
                            if (expanded) {
                                y = this.paintItems(children, x + LABEL_MARGIN, y);
                            }
                        }
                        return y;
                    }
                    renderCell(args, renderer) {
                        const label = this.getLabelProvider().getLabel(args.obj);
                        let x = args.x;
                        let y = args.y;
                        const ctx = args.canvasContext;
                        ctx.fillStyle = controls.Controls.theme.treeItemForeground;
                        let args2;
                        if (args.h <= controls.ROW_HEIGHT) {
                            args2 = new viewers.RenderCellArgs(args.canvasContext, args.x, args.y, 16, args.h, args.obj, args.view);
                            x += 20;
                            y += 15;
                        }
                        else {
                            args2 = new viewers.RenderCellArgs(args.canvasContext, args.x, args.y, args.w, args.h - 20, args.obj, args.view);
                            y += args2.h + 15;
                        }
                        renderer.renderCell(args2);
                        ctx.save();
                        if (args.view.isSelected(args.obj)) {
                            ctx.fillStyle = controls.Controls.theme.treeItemSelectionForeground;
                        }
                        ctx.fillText(label, x, y);
                        ctx.restore();
                    }
                    getContentProvider() {
                        return super.getContentProvider();
                    }
                    setContentProvider(contentProvider) {
                        super.setContentProvider(contentProvider);
                    }
                }
                viewers.TreeViewer = TreeViewer;
            })(viewers = controls.viewers || (controls.viewers = {}));
        })(controls = ui.controls || (ui.controls = {}));
    })(ui = phasereditor2d.ui || (phasereditor2d.ui = {}));
})(phasereditor2d || (phasereditor2d = {}));
