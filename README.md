ko-Timer
========

A Javascript Timer that you can bind to any DOM object.

# Introduction
Need to display a timer on your page? I'd say it's a pretty common necessity. And it's certainly easy to implement your own timer; plus there are many ways to accomplish this! There's only one constant: you will have to refresh it every second, which means changing/updating the DOM. So I thought why not do it with KnockoutJS: an observable will take care of updating the DOM for me.

Here it is then, a really simple Timer implemented with KnockoutJS (which means you WILL NEED to include KnockoutJS to your project in order for the timer to work).

NOTE: Further versions will also provide a chrono mode -whereas, as of now, the timer only provides a countdown mode-.


# How does it work?
It's extremely easy! You instantiate a timer object like this.

```javascript
var timer = new koTimer(300); 
```

Just like that, and your timer is already running! The first parameter  is the time limit in seconds (so, in this example, 300 seconds = 5 minutes). If you don't provide it the default time limit is 60 seconds. You can also provide any of the following options.

## Options

### __wait__
The timer will start running upon instantiation unless you tell it otherwise. If you send `wait: true` the timer will not start running until you call its `start` method. False by default.

### __keepGoing__
This should be a Knockout observable, a Knockout computed observable or a delegate function that will be used to check whether the timer must keep going or stop after each tick.

### __callback__
Optional callback function that will be executed when the countdown reaches zero.

### __notifyTimeMarks__
Optional array of integer time marks (in seconds) that must trigger a `timeMarkHit` event from the timer when hit.


# Methods
As of now, the timer only has two methods.

### __start__
Starts the timer. If the timer had been stopped, the countdown will pick up from where it left off.

### __stop__
Stops the timer.

### __toggle__
Starts the timer if it's stopped, or stops it if it's running.

### __reset__
Resets the timer. You can optionally provide a parameter with the new time limit; otherwise the time limit provided on instatiation will be used. The timer will stop running when reset, if you want it to automatically start running again pass `true` as the second parameter. I.e.:

```javascript
var newTimeLimit = 240;

//timer is reset with new time limit and starts running right away
timer.reset(newTimeLimit, true); 
```


# Events
The `koTimer` notifies some events that you can bind to. 

### __TimeIsUp__
This event is triggered when the countdown reaches zero.

### __TimerStopped__
This event is triggered when the timer is stopped because the `keepGoing` condition wasn't met. If you stop the timer by calling the `stop` method this event is not triggered.

### __TimeMarkHit__
Whenever a time mark provided in the `notifyTimeMarks` array is hit, this event is triggered. The event data includes a property called `timeElapsed`, the name of which speaks for itself. What could this be useful for? Keep reading and find out.


# Properties
The `koTimer` has the following properties exposed for you.

### __TimeElapsed__
A computed observable which tells you how much time has already gone by, in seconds.

### __TimeElapsedStr__
A computed observable which returns a nicely formatted string representing the time that's already gone by.

### __TimeLeftStr__
A computed observable which returns a nicely formatted string representing the time that's left.

### __IsRunning__
A computed observable which returns `true` if the timer is running, and `false` otherwise.

### __Events__
You don't need to memorize the names of the events you want to bind to, you can access the timer's events dictionary.
* TimeIsUp
* TimerStopped
* TimeMarkHit


# But really, how do I use it?
Yeah, I guess by now you're asking yourself just that. The idea is that you bind your DOM to the timer's exposed properties, and the magic of KnockoutJS will deal with updating the DOM as the countdown goes on. Have a look.

```html
<div class="main">    
    <div id="timer">
        <span data-bind="text: TimeLeftStr"></span>
    </div>
</div>
```

And here's the code that accompanies that html.

```javascript
var continueCondition = ko.observable(true); //the timer will stop when this is false

var timer = new koTimer(300, {
	wait: true,
	keepGoing: continueCondition, 
	callback: function () {
		console.log('Timer reached zero.');
	},
	notifyTimeMarks: [150] //notify event when second 150 is reached
});

$(document).on(timer.Events.TimeMarkHit, function (ev) {
	if (ev.timeElapsed === 150) {
		console.log('Halfway there');
	}
});

//apply ko binding
ko.applyBindings(timer, $('#timer')[0]);

//start timer
timer.start();

```

Get it? Piece of cake, right?

# Demo 
If you want to see it in action you can __go play with my example jsfiddles [here](http://jsfiddle.net/pchiwan/S8FLf/) and [here](http://jsfiddle.net/pchiwan/25zAY/)__. 
