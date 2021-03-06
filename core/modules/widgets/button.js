/*\
title: $:/core/modules/widgets/button.js
type: application/javascript
module-type: widget

Button widget

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var ButtonWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
ButtonWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
ButtonWidget.prototype.render = function(parent,nextSibling) {
	var self = this;
	// Remember parent
	this.parentDomNode = parent;
	// Compute attributes and execute state
	this.computeAttributes();
	this.execute();
	// Create element
	var tag = "button";
	if(this.buttonTag && $tw.config.htmlUnsafeElements.indexOf(this.buttonTag) === -1) {
		tag = this.buttonTag;
	}
	var domNode = this.document.createElement(tag);
	// Assign classes
	var classes = this["class"].split(" ") || [],
		isPoppedUp = this.popup && this.isPoppedUp();
	if(this.selectedClass) {
		if(this.set && this.setTo && this.isSelected()) {
			$tw.utils.pushTop(classes,this.selectedClass.split(" "));
		}
		if(isPoppedUp) {
			$tw.utils.pushTop(classes,this.selectedClass.split(" "));
		}
	}
	if(isPoppedUp) {
		$tw.utils.pushTop(classes,"tc-popup-handle");
	}
	domNode.className = classes.join(" ");
	// Assign other attributes
	if(this.style) {
		domNode.setAttribute("style",this.style);
	}
	if(this.tooltip) {
		domNode.setAttribute("title",this.tooltip);
	}
	if(this["aria-label"]) {
		domNode.setAttribute("aria-label",this["aria-label"]);
	}
	// Add a click event handler
	domNode.addEventListener("click",function (event) {
		var handled = false;
		if(self.invokeActions(this,event)) {
			handled = true;
		}
		if(self.to) {
			self.navigateTo(event);
			handled = true;
		}
		if(self.message) {
			self.dispatchMessage(event);
			handled = true;
		}
		if(self.popup) {
			self.triggerPopup(event);
			handled = true;
		}
		if(self.set) {
			self.setTiddler();
			handled = true;
		}
		if(self.actions) {
			self.invokeActionString(self.actions,self,event);
		}
		if(handled) {
			event.preventDefault();
			event.stopPropagation();
		}
		return handled;
	},false);
	// Insert element
	parent.insertBefore(domNode,nextSibling);
	this.renderChildren(domNode,null);
	this.domNodes.push(domNode);
};

/*
We don't allow actions to propagate because we trigger actions ourselves
*/
ButtonWidget.prototype.allowActionPropagation = function() {
	return false;
};

ButtonWidget.prototype.getBoundingClientRect = function() {
	return this.domNodes[0].getBoundingClientRect();
};

ButtonWidget.prototype.isSelected = function() {
    return this.wiki.getTextReference(this.set,this.defaultSetValue,this.getVariable("currentTiddler")) === this.setTo;
};

ButtonWidget.prototype.isPoppedUp = function() {
	var tiddler = this.wiki.getTiddler(this.popup);
	var result = tiddler && tiddler.fields.text ? $tw.popup.readPopupState(tiddler.fields.text) : false;
	return result;
};

ButtonWidget.prototype.navigateTo = function(event) {
	var bounds = this.getBoundingClientRect();
	this.dispatchEvent({
		type: "tm-navigate",
		navigateTo: this.to,
		navigateFromTitle: this.getVariable("storyTiddler"),
		navigateFromNode: this,
		navigateFromClientRect: { top: bounds.top, left: bounds.left, width: bounds.width, right: bounds.right, bottom: bounds.bottom, height: bounds.height
		},
		navigateSuppressNavigation: event.metaKey || event.ctrlKey || (event.button === 1)
	});
};

ButtonWidget.prototype.dispatchMessage = function(event) {
	this.dispatchEvent({type: this.message, param: this.param, tiddlerTitle: this.getVariable("currentTiddler")});
};

ButtonWidget.prototype.triggerPopup = function(event) {
	$tw.popup.triggerPopup({
		domNode: this.domNodes[0],
		title: this.popup,
		wiki: this.wiki
	});
};

ButtonWidget.prototype.setTiddler = function() {
	this.wiki.setTextReference(this.set,this.setTo,this.getVariable("currentTiddler"));
};

/*
Compute the internal state of the widget
*/
ButtonWidget.prototype.execute = function() {
	// Get attributes
	this.actions = this.getAttribute("actions");
	this.to = this.getAttribute("to");
	this.message = this.getAttribute("message");
	this.param = this.getAttribute("param");
	this.set = this.getAttribute("set");
	this.setTo = this.getAttribute("setTo");
	this.popup = this.getAttribute("popup");
	this.hover = this.getAttribute("hover");
	this["class"] = this.getAttribute("class","");
	this["aria-label"] = this.getAttribute("aria-label");
	this.tooltip = this.getAttribute("tooltip");
	this.style = this.getAttribute("style");
	this.selectedClass = this.getAttribute("selectedClass");
	this.defaultSetValue = this.getAttribute("default","");
	this.buttonTag = this.getAttribute("tag");
	// Make child widgets
	this.makeChildWidgets();
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
ButtonWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes.to || changedAttributes.message || changedAttributes.param || changedAttributes.set || changedAttributes.setTo || changedAttributes.popup || changedAttributes.hover || changedAttributes["class"] || changedAttributes.selectedClass || changedAttributes.style || (this.set && changedTiddlers[this.set]) || (this.popup && changedTiddlers[this.popup])) {
		this.refreshSelf();
		return true;
	}
	return this.refreshChildren(changedTiddlers);
};

exports.button = ButtonWidget;

})();
