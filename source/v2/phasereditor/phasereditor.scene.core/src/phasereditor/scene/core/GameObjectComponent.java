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
package phasereditor.scene.core;

import org.json.JSONObject;

/**
 * @author arian
 *
 */
@SuppressWarnings("boxing")
public interface GameObjectComponent {

	// active

	static String active_name = "active";

	static boolean active_default = true;

	static boolean get_active(ObjectModel obj) {
		return (boolean) obj.get("active");
	}

	static void set_active(ObjectModel obj, boolean active) {
		obj.put("active", active);
	}

	
	// data

	static String data_name = "data";

	static JSONObject data_default = null;

	static JSONObject get_data(ObjectModel obj) {
		return (JSONObject) obj.get("data");
	}

	static void set_data(ObjectModel obj, JSONObject data) {
		obj.put("data", data);
	}
	
	// objectFactory

	static String objectFactory_name = "objectFactory";

	static String objectFactory_default = "";

	static String get_objectFactory(ObjectModel obj) {
		return (String) obj.get("objectFactory");
	}
	
	static void set_objectFactory(ObjectModel obj, String objectFactory) {
		obj.put("objectFactory", objectFactory);
	}
	
	// objectFactoryType

	static String objectFactoryType_name = "objectFactoryType";

	static String objectFactoryType_default = "";

	static String get_objectFactoryType(ObjectModel obj) {
		return (String) obj.get("objectFactoryType");
	}

	static void set_objectFactoryType(ObjectModel obj, String objectFactoryType) {
		obj.put("objectFactoryType", objectFactoryType);
	}

	// objectBuild

	static String objectBuild_name = "objectBuild";

	static boolean objectBuild_default = false;

	static boolean get_objectBuild(ObjectModel obj) {
		return (boolean) obj.get("objectBuild");
	}

	static void set_objectBuild(ObjectModel obj, boolean objectBuild) {
		obj.put("objectBuild", objectBuild);
	}
	
	// useName

	static String useName_name = "useName";

	static boolean useName_default = false;

	static boolean get_useName(ObjectModel obj) {
		return (boolean) obj.get("useName");
	}

	static void set_useName(ObjectModel obj, boolean useName) {
		obj.put("useName", useName);
	}

	// utils
	
	static boolean is(ObjectModel model) {
		return model instanceof GameObjectComponent;
	}

	static void init(ObjectModel model) {
		set_active(model, active_default);
		set_data(model, data_default);
		set_objectFactory(model, objectFactory_default);
		set_objectFactoryType(model, objectFactoryType_default);
		set_objectBuild(model, objectBuild_default);
		set_useName(model, useName_default);
	}

}
