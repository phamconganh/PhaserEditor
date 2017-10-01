// The MIT License (MIT)
//
// Copyright (c) 2015, 2017 Arian Fornaris
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
package phasereditor.canvas.ui.shapes;

import javafx.scene.Node;
import javafx.scene.layout.Pane;
import javafx.scene.text.Text;
import phasereditor.canvas.core.TextModel;

/**
 * @author arian
 *
 */
public class TextNode extends Pane implements ISpriteNode {

	private TextControl _control;
	private Text _textNode;

	public TextNode(TextControl control) {
		_control = control;
		_textNode = new Text();
		_textNode.relocate(0, 0);
		getChildren().add(_textNode);
		setPickOnBounds(true);
	}
	
	public Text getTextNode() {
		return _textNode;
	}

	@Override
	public TextModel getModel() {
		return _control.getModel();
	}

	@Override
	public BaseSpriteControl<?> getControl() {
		return _control;
	}

	@Override
	public Node getNode() {
		return this;
	}

}
