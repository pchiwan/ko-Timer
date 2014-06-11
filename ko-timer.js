/********************
 * ko-Timer: a Javascript Timer you can bind to any DOM object 
 * by Sílvia Mur Blanch aka PchiwaN
 * https://github.com/pchiwan/ko-Timer
 *
 * NOTE: KnockoutJS, jQuery, and a real browser are required (so no IE below 9, please)
 ********************/

function koTimer (timeLimit, options) {
    /// <summary>
    /// Instantiates a Timer object that you can bind to any DOM object. 
    /// When the countdown reaches zero, event 'timeIsUp' is triggered, so you'll need to bind to it.
    /// Alternatively you can provide a callback function that will be executed when the countdown reaches zero.
    /// </summary>
    /// <param name="timeLimit" type="integer">Time limit of the timer's countdown (in seconds). Default value is 60.</param>
    /// <param name="options" type="Object">
    /// <para> ---------------------------------------------- </para>
    /// <para> wait:Boolean -> Wait for "start" method to be called or start countdown on Timer's instantiation? False by default. </para>
    /// <para> ---------------------------------------------- </para>            
    /// <para> keepGoing:ko.observable/ko.computed/function -> Delegate that's used to check whether the timer must keep going or stop after each tick. </para>
    /// <para> ---------------------------------------------- </para>
    /// <para> callback:function -> Optional function that will be executed when the countdown reaches zero. </para>
    /// <para> ---------------------------------------------- </para>
    /// <para> notifyTimeMarks:Array -> Optional array of integer time marks (in seconds) that must trigger a 'timeMarkHit' event from the timer. </para>
    /// <para> ---------------------------------------------- </para>
    /// </param>
    /// <returns type="Object">A Timer object instance.</returns>

    var self = this;

    var defaultOptions = {
        wait: false,
        keepGoing: ko.observable(true),
        callback: null,
        notifyTimeMarks: null
    };   

    //timer events
    this.Events = {
    	TimeIsUp: 'timeIsUp',
    	TimerStopped: 'timerStopped',
    	TimeMarkHit: 'timeMarkHit'
    };

    if (!timeLimit) {
        timeLimit = 60; //default value: 60 seconds/1 minute
    }                                    

    //flag to keep the timer from being started more than once
    var started = ko.observable(false);
    var stopped = ko.observable(false);
    var finished = ko.observable(false);
    var timeout;

    //time left in seconds
    var timeLeft = ko.observable(timeLimit); 

    var dateLeft = new Date(timeLeft() * 1000);
    var dateElapsed = new Date(0);

    //time elapsed in seconds
    this.TimeElapsed = ko.computed(function () {
        return timeLimit - timeLeft();
    });

    //formatted time elapsed string (mm:ss)
    this.TimeElapsedStr = ko.computed(function () {
        dateElapsed.setTime(self.TimeElapsed() * 1000);
        return toMinutesSeconds(dateElapsed); //instantiate Date in milliseconds
    });

    //formatted time left string (mm:ss)
    this.TimeLeftStr = ko.computed(function () {
        dateLeft.setTime(timeLeft() * 1000);
        return toMinutesSeconds(dateLeft); //instantiate Date in milliseconds
    });

    //timer defaults
    options = $.extend({}, defaultOptions, options);

    ////// private methods
    function padLeft (number, length) {
	    var str = number.toString();
	    var clen = str.length;
	    while (length > 0 && length > clen) {
	        str = '0' + str;
	        length--;
	    }
	    return str;
	}

    function toMinutesSeconds (date) {
    	return padLeft(date.getMinutes(), 2) + ':' + padLeft(date.getSeconds(), 2);
    }
    
    function finish () {
        started(false);
        stopped(true);
        finished(true);
    }

    function tick () {
        if (!stopped()) {
            timeLeft(timeLeft() - 1);
            if (timeLeft() <= 0) {
                //countdown reached zero, execute callback if there's any
                if (!!options.callback) {
                    options.callback();
                }
                //now tell everyone that the time's up!
                $.event.trigger({
                	type: self.Events.TimeIsUp
                })
                finish();
            }
            else {
                if (options.keepGoing()) {
                    //if a time mark has been hit, notify it
                    if (!!options.notifyTimeMarks && options.notifyTimeMarks.length && options.notifyTimeMarks.indexOf(self.TimeElapsed()) >= 0) {
                        $.event.trigger({
                        	type: self.Events.TimeMarkHit,
                        	timeElapsed: self.TimeElapsed() 
                        });
                    }
                    //keep going!
                    timeout = setTimeout(tick, 1000);
                } else {                    
                    $.event.trigger({
                    	type: self.Events.TimerStopped
                	});
                    self.stop();
                }
            }            
        }
    };

    ////// public methods and properties
    this.isRunning = ko.computed(function () {
        return started();
    });

    this.start = function () {
        /// <summary>Starts the timer.</summary>

        if (!started()) {            
            started(true);
            stopped(false);
            tick();
        }
    };

    this.stop = function () {
        /// <summary>Stops the timer.</summary>

        if (started()) {
            clearTimeout(timeout);
            started(false);
            stopped(true);
        }
    };

    this.toggle = function () {
        /// <summary>Starts the timer if it's stopped, stops it if it's started.</summary>

        if (started()) {
            self.stop();
        }
        else if (finished()) {
            self.reset(null, true);
        }
        else
            self.start();
    };

    this.reset = function (newTimeLimit, startTimer) {
        /// <summary>Resets the timer.</summary>
        /// <param name="newTimeLimit" type="Integer">Optional. Provide a new time limit for the timer, otherwise the one provided on instatiation will be used.</param>
        /// <param name="startTimer" type="Boolean">Optional. Send true if you want the timer to start running right after reseting it. False by default.</param>

        self.stop();        
        timeLimit = isNaN(newTimeLimit) ? timeLimit : newTimeLimit;
        timeLeft(timeLimit);
        dateLeft = new Date(timeLeft() * 1000);
        dateElapsed = new Date(0);
        finished(false);
        if (startTimer instanceof Boolean && startTimer) {
            self.start();
        }
    };

    //init
    if (!options.wait) {
        started(true);
        tick();
    }
}
