// The MIT License (MIT)
//
// Copyright (c) 2015, 2018 Arian Fornaris
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
package phasereditor.animation.ui.editor.properties;

import java.util.List;
import java.util.function.Consumer;

import phasereditor.animation.ui.editor.AnimationOperation;
import phasereditor.animation.ui.editor.AnimationsEditor;
import phasereditor.assetpack.core.animations.AnimationModel;
import phasereditor.inspect.core.InspectCore;
import phasereditor.ui.properties.FormPropertySection;

/**
 * @author arian
 *
 */
public abstract class BaseAnimationSection<T> extends FormPropertySection<T> {

	private AnimationsPropertyPage _page;

	public BaseAnimationSection(AnimationsPropertyPage page, String name) {
		super(name);
		_page = page;
	}

	@Override
	protected String getHelp(String helpHint) {
		return helpHint.startsWith("*") ? helpHint : InspectCore.getPhaserHelp().getMemberHelp(helpHint);
	}

	@Override
	public boolean supportThisNumberOfModels(int number) {
		return number > 0;
	}

	public AnimationsEditor getEditor() {
		return _page.getEditor();
	}

	protected void restartPlayback() {
		getEditor().resetPlayback();
	}

	protected void wrapOperation(List<AnimationModel> animations, Consumer<AnimationModel> change) {
		wrapOperation(animations, () -> {
			animations.forEach(change);
		});
	}

	protected void wrapOperation(List<AnimationModel> animations, Runnable action) {
		var before = AnimationOperation.readState(animations);
		action.run();
		var after = AnimationOperation.readState(animations);
		getEditor().executeOperation(new AnimationOperation("Change Animation", before, after, true));
	}

}
