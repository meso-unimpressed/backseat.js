/**
 * Backseat JS v0.1
 * ==================
 * Written By Claudius Coenen / MESO Web Scapes <coenen@meso.net>
 * 
 * Did you ever wonder whether your website's Tab is currenlty visible or not?
 * This JavaScript will broadcast events when it detects that a tab
 * gets choked by a browser.
 * 
 * Licensed under LGPL or MIT License, whatever suits your needs best.
 * (see MIT-LICENSE.txt or GPL-LICENSE.txt for full license)
 * Get in touch with me for other licensing options.
 * 
 * Tested to work in
 * * Firefox 5 (background tab only, will occasionally think it's in the foreground)
 * * Chrome 14 (minimized or background tab)
 * 
 */
/*jslint browser: true, plusplus: false */
/*global window */
var backseat = {
	//////////////
	// SETTINGS //
	//////////////
	/** how often would you like to check this? (time in ms) */
	checkInterval: 500,

	/** after this time, we'll issue a "background"-event */
	maxGap: 600,

	/**
	 * some browsers fire an animationFrame every few seconds, so we'll only 
	 * switch if we have this many events in a row.
	 * This will also be useful, in case the computer is under a lot of stress
	 * and animationFrames are not dealt ot so quickly. 
	 */
	eventSmoothing: 2,

	///////////////////
	// INTERNAL VARS //
	///////////////////
	/** last timestamp in ms, wehere we saw the requestAnimationFrame-handler run */
	lastAnimationFrame: 0,

	/** last timestamp in ms, wehere we saw the interval fire */
	lastIntervalFire: 0,

	/** counter used for eventSmoothing */
	smoothingCounter: 0,

	/** were we visible or not? possible states are 'preInit', 'tabVisible', 'tabInvisible' */
	lastKnownState: 'preInit',

	/** cross-browser normalisation */
	requestAnimationFrame: window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame,

	/** handles the requestAnimationFrame-call, will actually just set a variable and re-queue itself. */
	frameHandler: function (time) {
		backseat.lastAnimationFrame = (+new Date());
		setTimeout(function ()  {
			backseat.requestAnimationFrame.call(window, backseat.frameHandler, document.body); // without call(), the scope is wrong.
		}, backseat.checkInterval);
	},

	/** handles the interval, will also check for the last time, an animationframe was seen and trigger events accordingly */
	intervalFire: function () {
		backseat.lastIntervalFire = (+new Date());
		var newState, e;

		if (backseat.lastAnimationFrame + backseat.maxGap < backseat.lastIntervalFire) {
			newState = 'tabInvisible';
		} else {
			newState = 'tabVisible';
		}

		if (newState !== backseat.lastKnownState) {
			if (backseat.smoothingCounter >= backseat.eventSmoothing) {
				backseat.smoothingCounter = 0;
				backseat.lastKnownState = newState;
				e = document.createEvent('Events');
				e.initEvent(backseat.lastKnownState, true, true);
				document.body.dispatchEvent(e);
			} else {
				backseat.smoothingCounter++;
			}
		}
	},

	/** start handing out events based on activity */
	activate: function () {
		if (backseat.requestAnimationFrame) {
			backseat.frameHandler(0);
			setInterval(backseat.intervalFire, backseat.checkInterval);
		}
	},

	/**
	 * stop handing out events
	 * TODO implement
	 */
	deactivate: function () {
		
	}
};
backseat.activate();
