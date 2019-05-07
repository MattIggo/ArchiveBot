// Generated by Haxe 3.4.2
(function ($global) { "use strict";
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var LogLine = function() {
};
LogLine.__name__ = true;
LogLine.prototype = {
	__class__: LogLine
};
var Job = function(ident) {
	this.pendingLogLines = 0;
	var _g = [];
	var _g1 = 0;
	while(_g1 < 62) {
		var dummy = _g1++;
		_g.push(0);
	}
	this.downloadCountBucket = _g;
	this.logLines = [];
	this.ident = ident;
};
Job.__name__ = true;
Job.parseInt = function(thing) {
	if(thing != null) {
		try {
			return Std.parseInt(thing);
		} catch( error ) {
			return thing;
		}
	} else {
		return null;
	}
};
Job.prototype = {
	fillDownloadCountBucket: function() {
		var newDownloads = this.itemsDownloaded - this.lastDownloadCount;
		this.lastDownloadCount = this.itemsDownloaded;
		var currentSecond = new Date().getSeconds();
		this.downloadCountBucket[currentSecond] = newDownloads;
	}
	,computeSpeed: function() {
		var sum = 0;
		var _g = 0;
		var _g1 = this.downloadCountBucket;
		while(_g < _g1.length) {
			var count = _g1[_g];
			++_g;
			sum += count;
		}
		return sum / 60.0;
	}
	,consumeLogEvent: function(logEvent,maxScrollback) {
		var jobData = logEvent.job_data;
		this.aborted = jobData.aborted;
		this.bytesDownloaded = Job.parseInt(jobData.bytes_downloaded);
		this.concurrency = Job.parseInt(jobData.concurrency);
		this.delayMax = Job.parseInt(jobData.delay_max);
		this.delayMin = Job.parseInt(jobData.delay_min);
		this.depth = jobData.depth;
		this.errorCount = Job.parseInt(jobData.error_count);
		this.finished = jobData.finished;
		this.finishedAt = Job.parseInt(jobData.finished_at);
		this.itemsDownloaded = Job.parseInt(jobData.items_downloaded);
		this.itemsQueued = Job.parseInt(jobData.items_queued);
		this.note = jobData.note;
		this.pipelineId = jobData.pipeline_id;
		this.queuedAt = Job.parseInt(jobData.queued_at);
		this.r1xx = Job.parseInt(jobData.r1xx);
		this.r2xx = Job.parseInt(jobData.r2xx);
		this.r3xx = Job.parseInt(jobData.r3xx);
		this.r4xx = Job.parseInt(jobData.r4xx);
		this.r5xx = Job.parseInt(jobData.r5xx);
		this.rUnknown = Job.parseInt(jobData.runk);
		this.startedAt = Job.parseInt(jobData.started_at);
		this.startedBy = jobData.started_by;
		this.startedIn = jobData.started_in;
		this.suppressIgnoreReports = jobData.suppress_ignore_reports;
		this.timestamp = Job.parseInt(logEvent.ts);
		this.url = jobData.url;
		this.warcSize = jobData.warc_size;
		var logLine = new LogLine();
		logLine.type = logEvent.type;
		logLine.url = logEvent.url;
		logLine.timestamp = Job.parseInt(logEvent.ts);
		logLine.isError = logEvent.is_error;
		logLine.isWarning = logEvent.is_warning;
		logLine.responseCode = logEvent.response_code;
		logLine.message = logEvent.message;
		logLine.pattern = logEvent.pattern;
		logLine.wgetCode = logEvent.wget_code;
		this.totalResponses = this.r1xx + this.r2xx + this.r3xx + this.r4xx + this.r5xx + this.errorCount;
		this.queueRemaining = this.itemsQueued - this.itemsDownloaded;
		if(this.logLines.length >= maxScrollback) {
			this.logLines.shift();
		}
		this.fillDownloadCountBucket();
		this.responsePerSecond = this.computeSpeed();
		this.logLines.push(logLine);
		this.pendingLogLines += 1;
	}
	,drawPendingLogLines: function() {
		if(this.pendingLogLines <= 0) {
			return;
		}
		var logElement = window.document.getElementById("job-log-" + this.ident);
		if(logElement == null) {
			return;
		}
		var _g = 0;
		var _g1 = this.logLines.slice(-this.pendingLogLines);
		while(_g < _g1.length) {
			var logLine = _g1[_g];
			++_g;
			var logLineDiv = window.document.createElement("div");
			logLineDiv.className = "job-log-line";
			if(logLine.responseCode == 200) {
				logLineDiv.classList.add("text-success");
			} else if(logLine.isWarning) {
				logLineDiv.classList.add("bg-warning");
			} else if(logLine.isError) {
				logLineDiv.classList.add("bg-danger");
			} else if(logLine.message != null || logLine.pattern != null) {
				logLineDiv.classList.add("text-muted");
			}
			if(logLine.responseCode > 0 || logLine.wgetCode != null) {
				var text;
				if(logLine.responseCode > 0) {
					text = "" + logLine.responseCode + " ";
				} else {
					text = "" + logLine.wgetCode + " ";
				}
				logLineDiv.appendChild(window.document.createTextNode(text));
			}
			if(logLine.url != null) {
				var element = window.document.createElement("a");
				element.href = logLine.url;
				element.textContent = logLine.url;
				element.className = "job-log-line-url";
				logLineDiv.appendChild(element);
				if(logLine.pattern != null) {
					var element1 = window.document.createElement("span");
					element1.textContent = logLine.pattern;
					element1.className = "text-warning";
					logLineDiv.appendChild(window.document.createTextNode(" "));
					logLineDiv.appendChild(element1);
				}
			} else if(logLine.message != null) {
				logLineDiv.textContent = logLine.message;
				logLineDiv.classList.add("job-log-line-message");
			}
			logElement.appendChild(logLineDiv);
		}
		var numToTrim = logElement.childElementCount - this.logLines.length;
		if(numToTrim > 0) {
			var _g11 = 0;
			var _g2 = numToTrim;
			while(_g11 < _g2) {
				var dummy = _g11++;
				var child = logElement.firstChild;
				if(child != null) {
					logElement.removeChild(child);
				}
			}
		}
		logElement.setAttribute("data-autoscroll-dirty","true");
		this.pendingLogLines = 0;
	}
	,attachAntiScroll: function() {
		var logWindow = window.document.getElementById("job-log-" + this.ident);
		if(logWindow == null) {
			return;
		}
		if(logWindow.getAttribute("data-anti-scroll") == "attached") {
			return;
		}
		logWindow.setAttribute("data-anti-scroll","attached");
		logWindow["onwheel"] = function(ev) {
			if(ev.deltaY < 0 && logWindow.scrollTop == 0) {
				ev.preventDefault();
			} else if(ev.deltaY > 0 && logWindow.scrollTop >= logWindow.scrollHeight - logWindow.offsetHeight) {
				ev.preventDefault();
			}
		};
	}
	,__class__: Job
};
var Dashboard = function(hostname,maxScrollback,showNicks,drawInterval) {
	if(drawInterval == null) {
		drawInterval = 1000;
	}
	if(showNicks == null) {
		showNicks = false;
	}
	if(maxScrollback == null) {
		maxScrollback = 500;
	}
	this.jobMap = new haxe_ds_StringMap();
	this.jobs = [];
	this.angular = angular;
	var _gthis = this;
	this.hostname = hostname;
	this.maxScrollback = maxScrollback;
	this.showNicks = showNicks;
	this.drawInterval = drawInterval;
	this.app = this.angular.module("dashboardApp",[]);
	var appConfig = ["$compileProvider",function(compileProvider) {
		compileProvider.debugInfoEnabled(false);
	}];
	this.app.config(appConfig);
	this.app.filter("bytes",function() {
		return function(num) {
			var _g = 0;
			var _g1 = ["B","KiB","MiB","GiB"];
			while(_g < _g1.length) {
				var unit = _g1[_g];
				++_g;
				if(num < 1024 && num > -1024) {
					num = Math.round(num * 10) / 10;
					return "" + num + " " + unit;
				}
				num /= 1024.0;
			}
			num = Math.round(num * 10) / 10;
			return "" + num + " TiB";
		};
	});
	var controllerArgs = ["$scope",function(scope) {
		scope.jobs = _gthis.jobs;
		scope.filterQuery = "";
		scope.hideDetails = false;
		scope.paused = false;
		scope.sortParam = "startedAt";
		scope.showNicks = showNicks;
		scope.drawInterval = drawInterval;
		_gthis.dashboardControllerScopeApply = Reflect.field(scope,"$apply").bind(scope);
		scope.filterOperator = function(job) {
			var query = scope.filterQuery;
			if(scope.showNicks) {
				if(!(StringTools.startsWith(job.ident,query) || job.url.indexOf(query) != -1)) {
					return job.startedBy.toLowerCase().indexOf(query.toLowerCase()) != -1;
				} else {
					return true;
				}
			} else if(!StringTools.startsWith(job.ident,query)) {
				return job.url.indexOf(query) != -1;
			} else {
				return true;
			}
		};
		_gthis.dashboardControllerScope = scope;
		scope.applyFilterQuery = function(query1) {
			scope.filterQuery = query1;
		};
	}];
	this.app.controller("DashboardController",controllerArgs);
};
Dashboard.__name__ = true;
Dashboard.getQueryArgs = function() {
	var query = window.location.search;
	var items = StringTools.replace(query,"?","").split("&");
	var args = new haxe_ds_StringMap();
	var _g = 0;
	while(_g < items.length) {
		var item = items[_g];
		++_g;
		var pairs = item.split("=");
		var key = pairs[0];
		var value = pairs[1];
		if(__map_reserved[key] != null) {
			args.setReserved(key,value);
		} else {
			args.h[key] = value;
		}
	}
	return args;
};
Dashboard.main = function() {
	var args = Dashboard.getQueryArgs();
	var hostname;
	var maxScrollback = 20;
	var showNicks = __map_reserved["showNicks"] != null ? args.existsReserved("showNicks") : args.h.hasOwnProperty("showNicks");
	if(__map_reserved["host"] != null ? args.existsReserved("host") : args.h.hasOwnProperty("host")) {
		hostname = __map_reserved["host"] != null ? args.getReserved("host") : args.h["host"];
	} else {
		hostname = window.location.host;
	}
	if(window.navigator.userAgent.indexOf("Mobi") == -1) {
		maxScrollback = 500;
	}
	var dashboard = new Dashboard(hostname,maxScrollback,showNicks);
	dashboard.run();
};
Dashboard.prototype = {
	run: function() {
		this.loadRecentLogs();
	}
	,loadRecentLogs: function() {
		var _gthis = this;
		var request = new XMLHttpRequest();
		request.onerror = function(event) {
			_gthis.showError("Unable to load dashboard. Reload the page?");
		};
		request.onload = function(event1) {
			if(request.status != 200) {
				_gthis.showError("The server didn't respond correctly: " + request.status + " " + request.statusText);
				return;
			}
			_gthis.showError(null);
			var doc = JSON.parse(request.responseText);
			var _g = 0;
			while(_g < doc.length) {
				var logEvent = doc[_g];
				++_g;
				_gthis.processLogEvent(logEvent);
			}
			_gthis.scheduleDraw();
			_gthis.openWebSocket();
		};
		var cacheBustValue = new Date().getTime();
		request.open("GET","//" + this.hostname + "/logs/recent?cb=" + cacheBustValue);
		request.setRequestHeader("Accept","application/json");
		request.send("");
	}
	,openWebSocket: function() {
		var _gthis = this;
		if(this.websocket != null) {
			return;
		}
		var wsProto = window.location.protocol == "https:" ? "wss:" : "ws:";
		this.websocket = new WebSocket("" + wsProto + "//" + this.hostname + ":4568/stream");
		this.websocket.onmessage = function(message) {
			_gthis.showError(null);
			var doc = JSON.parse(message.data);
			_gthis.processLogEvent(doc);
		};
		this.websocket.onclose = function(message1) {
			if(_gthis.websocket == null) {
				return;
			}
			_gthis.websocket = null;
			_gthis.showError("Lost connection. Reconnecting...");
			setTimeout(function() {
				_gthis.openWebSocket();
			},60000);
		};
		this.websocket.onerror = this.websocket.onclose;
	}
	,scheduleDraw: function(delayMS) {
		if(delayMS == null) {
			delayMS = 1000;
		}
		var _gthis = this;
		this.drawTimerHandle = setTimeout(function() {
			var delay = _gthis.dashboardControllerScope.drawInterval;
			if(!window.document.hidden && !_gthis.dashboardControllerScope.paused) {
				var beforeDate = new Date();
				_gthis.redraw();
				var afterDate = new Date();
				var difference = afterDate.getTime() - beforeDate.getTime();
				if(difference > 10) {
					delay += difference * 2;
					delay = Math.min(delay,10000);
				}
			}
			_gthis.scheduleDraw(delay);
		},delayMS);
	}
	,processLogEvent: function(logEvent) {
		var job;
		var ident = logEvent.job_data.ident;
		var _this = this.jobMap;
		if(!(__map_reserved[ident] != null ? _this.existsReserved(ident) : _this.h.hasOwnProperty(ident))) {
			job = new Job(ident);
			var _this1 = this.jobMap;
			if(__map_reserved[ident] != null) {
				_this1.setReserved(ident,job);
			} else {
				_this1.h[ident] = job;
			}
			this.jobs.push(job);
			console.log("Load job " + ident);
		} else {
			var _this2 = this.jobMap;
			if(__map_reserved[ident] != null) {
				job = _this2.getReserved(ident);
			} else {
				job = _this2.h[ident];
			}
		}
		job.consumeLogEvent(logEvent,this.maxScrollback);
	}
	,showError: function(message) {
		var element = window.document.getElementById("message_box");
		if(message != null) {
			element.style.display = "block";
			element.innerText = message;
		} else {
			element.style.display = "none";
		}
	}
	,redraw: function() {
		this.dashboardControllerScopeApply();
		var _g = 0;
		var _g1 = this.jobs;
		while(_g < _g1.length) {
			var job = _g1[_g];
			++_g;
			if(!job.logPaused) {
				job.drawPendingLogLines();
			}
		}
		this.scrollLogsToBottom();
	}
	,scrollLogsToBottom: function() {
		var nodes = window.document.querySelectorAll("[data-autoscroll-dirty].autoscroll");
		var pending = [];
		var _g = 0;
		while(_g < nodes.length) {
			var node = nodes[_g];
			++_g;
			var element = js_Boot.__cast(node , HTMLElement);
			element.removeAttribute("data-autoscroll-dirty");
			pending.push(element);
		}
		var _g1 = 0;
		while(_g1 < pending.length) {
			var element1 = pending[_g1];
			++_g1;
			element1.scrollTop = 99999;
		}
	}
	,__class__: Dashboard
};
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) {
		return undefined;
	}
	return x;
};
HxOverrides.substr = function(s,pos,len) {
	if(len == null) {
		len = s.length;
	} else if(len < 0) {
		if(pos == 0) {
			len = s.length + len;
		} else {
			return "";
		}
	}
	return s.substr(pos,len);
};
Math.__name__ = true;
var Reflect = function() { };
Reflect.__name__ = true;
Reflect.field = function(o,field) {
	try {
		return o[field];
	} catch( e ) {
		return null;
	}
};
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) {
		v = parseInt(x);
	}
	if(isNaN(v)) {
		return null;
	}
	return v;
};
var StringTools = function() { };
StringTools.__name__ = true;
StringTools.startsWith = function(s,start) {
	if(s.length >= start.length) {
		return HxOverrides.substr(s,0,start.length) == start;
	} else {
		return false;
	}
};
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
};
var haxe_IMap = function() { };
haxe_IMap.__name__ = true;
var haxe_ds_StringMap = function() {
	this.h = { };
};
haxe_ds_StringMap.__name__ = true;
haxe_ds_StringMap.__interfaces__ = [haxe_IMap];
haxe_ds_StringMap.prototype = {
	setReserved: function(key,value) {
		if(this.rh == null) {
			this.rh = { };
		}
		this.rh["$" + key] = value;
	}
	,getReserved: function(key) {
		if(this.rh == null) {
			return null;
		} else {
			return this.rh["$" + key];
		}
	}
	,existsReserved: function(key) {
		if(this.rh == null) {
			return false;
		}
		return this.rh.hasOwnProperty("$" + key);
	}
	,__class__: haxe_ds_StringMap
};
var js__$Boot_HaxeError = function(val) {
	Error.call(this);
	this.val = val;
	this.message = String(val);
	if(Error.captureStackTrace) {
		Error.captureStackTrace(this,js__$Boot_HaxeError);
	}
};
js__$Boot_HaxeError.__name__ = true;
js__$Boot_HaxeError.wrap = function(val) {
	if((val instanceof Error)) {
		return val;
	} else {
		return new js__$Boot_HaxeError(val);
	}
};
js__$Boot_HaxeError.__super__ = Error;
js__$Boot_HaxeError.prototype = $extend(Error.prototype,{
	__class__: js__$Boot_HaxeError
});
var js_Boot = function() { };
js_Boot.__name__ = true;
js_Boot.getClass = function(o) {
	if((o instanceof Array) && o.__enum__ == null) {
		return Array;
	} else {
		var cl = o.__class__;
		if(cl != null) {
			return cl;
		}
		var name = js_Boot.__nativeClassName(o);
		if(name != null) {
			return js_Boot.__resolveNativeClass(name);
		}
		return null;
	}
};
js_Boot.__string_rec = function(o,s) {
	if(o == null) {
		return "null";
	}
	if(s.length >= 5) {
		return "<...>";
	}
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) {
		t = "object";
	}
	switch(t) {
	case "function":
		return "<function>";
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) {
					return o[0];
				}
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) {
						str += "," + js_Boot.__string_rec(o[i],s);
					} else {
						str += js_Boot.__string_rec(o[i],s);
					}
				}
				return str + ")";
			}
			var l = o.length;
			var i1;
			var str1 = "[";
			s += "\t";
			var _g11 = 0;
			var _g2 = l;
			while(_g11 < _g2) {
				var i2 = _g11++;
				str1 += (i2 > 0 ? "," : "") + js_Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
			var s2 = o.toString();
			if(s2 != "[object Object]") {
				return s2;
			}
		}
		var k = null;
		var str2 = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str2.length != 2) {
			str2 += ", \n";
		}
		str2 += s + k + " : " + js_Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str2 += "\n" + s + "}";
		return str2;
	case "string":
		return o;
	default:
		return String(o);
	}
};
js_Boot.__interfLoop = function(cc,cl) {
	if(cc == null) {
		return false;
	}
	if(cc == cl) {
		return true;
	}
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0;
		var _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js_Boot.__interfLoop(i1,cl)) {
				return true;
			}
		}
	}
	return js_Boot.__interfLoop(cc.__super__,cl);
};
js_Boot.__instanceof = function(o,cl) {
	if(cl == null) {
		return false;
	}
	switch(cl) {
	case Array:
		if((o instanceof Array)) {
			return o.__enum__ == null;
		} else {
			return false;
		}
		break;
	case Bool:
		return typeof(o) == "boolean";
	case Dynamic:
		return true;
	case Float:
		return typeof(o) == "number";
	case Int:
		if(typeof(o) == "number") {
			return (o|0) === o;
		} else {
			return false;
		}
		break;
	case String:
		return typeof(o) == "string";
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) {
					return true;
				}
				if(js_Boot.__interfLoop(js_Boot.getClass(o),cl)) {
					return true;
				}
			} else if(typeof(cl) == "object" && js_Boot.__isNativeObj(cl)) {
				if(o instanceof cl) {
					return true;
				}
			}
		} else {
			return false;
		}
		if(cl == Class ? o.__name__ != null : false) {
			return true;
		}
		if(cl == Enum ? o.__ename__ != null : false) {
			return true;
		}
		return o.__enum__ == cl;
	}
};
js_Boot.__cast = function(o,t) {
	if(js_Boot.__instanceof(o,t)) {
		return o;
	} else {
		throw new js__$Boot_HaxeError("Cannot cast " + Std.string(o) + " to " + Std.string(t));
	}
};
js_Boot.__nativeClassName = function(o) {
	var name = js_Boot.__toStr.call(o).slice(8,-1);
	if(name == "Object" || name == "Function" || name == "Math" || name == "JSON") {
		return null;
	}
	return name;
};
js_Boot.__isNativeObj = function(o) {
	return js_Boot.__nativeClassName(o) != null;
};
js_Boot.__resolveNativeClass = function(name) {
	return $global[name];
};
String.prototype.__class__ = String;
String.__name__ = true;
Array.__name__ = true;
Date.prototype.__class__ = Date;
Date.__name__ = ["Date"];
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
var __map_reserved = {}
Job.isSafari = window.navigator.userAgent.indexOf("Safari") != -1;
js_Boot.__toStr = ({ }).toString;
Dashboard.main();
})(typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : this);
