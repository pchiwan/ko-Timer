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
    var started = false;
    var stopped = false;

    //time left in seconds
    var timeLeft = ko.observable(timeLimit); 

    //time elapsed in seconds
    this.TimeElapsed = ko.computed(function () {
        return timeLimit - timeLeft();
    });

    //formatted time elapsed string (mm:ss)
    this.TimeElapsedStr = ko.computed(function () {
        return toMinutesSeconds(new Date(self.TimeElapsed() * 1000)); //instantiate Date in milliseconds
    });

    //formatted time left string (mm:ss)
    this.TimeLeftStr = ko.computed(function () {
        return toMinutesSeconds(new Date(timeLeft() * 1000)); //instantiate Date in milliseconds
    });

    //timer defaults
    options = $.extend({}, defaultOptions, options);

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

    //private method
    function tick () {
        if (!stopped) {
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
                    setTimeout(tick, 1000);
                } else {
                    $.event.trigger({
                    	type: self.Events.TimerStopped
                	});
                }
            }
        }
    };

    //public methods
    this.start = function () {
        if (!started) {
            //recalculate remaining time just in case
            timeLeft(timeLimit);
            started = true;
            stopped = false;
            tick();
        }
    };

    this.stop = function () {
        if (started) {
            stopped = true;
            started = false;
        }
    };

    //init
    if (!options.wait) {
        started = true;
        tick();
    }
}