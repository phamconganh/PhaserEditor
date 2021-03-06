// The MIT License (MIT)
//
// Copyright (c) 2015, 2019 Arian Fornaris
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions: The above copyright notice and this permission
// notice shall be included in all copies or substantial portions of the
// Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
package phasereditor.scene.ui.editor.undo;

import org.eclipse.core.commands.ExecutionException;
import org.eclipse.core.commands.operations.AbstractOperation;
import org.eclipse.core.runtime.IAdaptable;
import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;

import phasereditor.scene.ui.editor.SceneEditor;
import phasereditor.scene.ui.editor.messages.ReloadPageMessage;

/**
 * @author arian
 *
 */
public abstract class SceneEditorOperation extends AbstractOperation {

	private boolean _needsFullReload;

	public SceneEditorOperation(String label) {
		this(label, false);
	}

	public SceneEditorOperation(String label, boolean needsFullReload) {
		super(label);
		_needsFullReload = needsFullReload;
	}

	public boolean isNeedsFullReload() {
		return _needsFullReload;
	}

	@Override
	public final IStatus undo(IProgressMonitor monitor, IAdaptable info) throws ExecutionException {
		var status = undo2(monitor, info);
		reloadIfNeeded(info);
		return status;
	}

	private void reloadIfNeeded(IAdaptable info) {
		if (_needsFullReload) {
			var editor = info.getAdapter(SceneEditor.class);
			editor.getBroker().sendAll(new ReloadPageMessage());
		}
	}

	@Override
	public final IStatus redo(IProgressMonitor monitor, IAdaptable info) throws ExecutionException {
		var status = redo2(monitor, info);
		reloadIfNeeded(info);
		return status;
	}

	protected abstract IStatus undo2(IProgressMonitor monitor, IAdaptable info) throws ExecutionException;

	protected abstract IStatus redo2(IProgressMonitor monitor, IAdaptable info) throws ExecutionException;

}
