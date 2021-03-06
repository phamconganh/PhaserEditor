// The MIT License (MIT)
//
// Copyright (c) 2015, 2016 Arian Fornaris
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
package phasereditor.canvas.ui.editors.edithandlers;

import javafx.geometry.Point2D;
import javafx.scene.Cursor;
import javafx.scene.input.MouseEvent;
import javafx.scene.paint.Color;
import phasereditor.canvas.ui.editors.operations.ChangePropertyOperation;
import phasereditor.canvas.ui.editors.operations.CompositeOperation;
import phasereditor.canvas.ui.shapes.IObjectNode;

/**
 * @author arian
 *
 */
public class AngleHandlerNode extends CircleHandlerNode {

	private double _initAngle;
	private double _initX;
	private double _initY;
	private int _order;
	private Point2D _center;
	private static Color[] COLORS = { null, Color.RED, Color.GREEN, Color.BLUE };
	private static double TRANSP_FACTOR = 0.5;

	public AngleHandlerNode(IObjectNode object, int order) {
		super(object);

		_order = order;

		setFill(Color.TRANSPARENT);
		setStroke(COLORS[order]);
		setCursor(Cursor.MOVE);

		setOpacity(TRANSP_FACTOR);

		setOnMouseEntered(e -> setOpacity(1));

		setOnMouseExited(e -> {
			if (!e.isPrimaryButtonDown()) {
				setOpacity(TRANSP_FACTOR);
			}
		});

		setOnMouseReleased(e -> setOpacity(1));
	}

	@Override
	public boolean contains(double localX, double localY) {
		Point2D p = new Point2D(localX, localY);

		double d = p.distance(new Point2D(getCenterX(), getCenterY()));

		double diff = Math.abs(d - getRadius());

		return diff < 10;
	}

	public static double angleBetweenTwoPointsWithFixedPoint(double point1X, double point1Y, double point2X,
			double point2Y, double fixedX, double fixedY) {

		double angle1 = Math.atan2(point1Y - fixedY, point1X - fixedX);
		double angle2 = Math.atan2(point2Y - fixedY, point2X - fixedX);

		return angle1 - angle2;
	}

	@Override
	public void handleSceneStart(double x, double y, MouseEvent e) {
		_initAngle = _object.getModel().getAngle();
		_initX = x;
		_initY = y;

		_center = computeObjectCenter_global();
	}

	@Override
	public void handleSceneDrag(double dx, double dy, MouseEvent e) {
		if (Math.abs(dx) < 1 || Math.abs(dy) < 1) {
			return;
		}

		double x = _initX + dx;
		double y = _initY + dy;

		double a = angleBetweenTwoPointsWithFixedPoint(x, y, _initX, _initY, _center.getX(), _center.getY());

		double d = Math.toDegrees(a);

		_model.setAngle(_initAngle + d);
	}

	@Override
	public void handleDone() {
		double a = _model.getAngle();

		_model.setAngle(_initAngle);

		String id = _model.getId();

		_canvas.getUpdateBehavior().executeOperations(

				new CompositeOperation(

						new ChangePropertyOperation<Number>(id, "angle", Double.valueOf(a))

				));
	}

	@Override
	public void updateHandler() {
		_center = computeObjectCenter_global();

		setCenterX(_center.getX());
		setCenterY(_center.getY());
		setRadius(_order * 50);
	}
}
