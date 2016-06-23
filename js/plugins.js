
// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  if(this.console) {
    arguments.callee = arguments.callee.caller;
    var newarr = [].slice.call(arguments);
    (typeof console.log === 'object' ? log.apply.call(console.log, console, newarr) : console.log.apply(console, newarr));
  }
};

// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,timeStamp,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();){b[a]=b[a]||c}})((function(){try
{console.log();return window.console;}catch(err){return window.console={};}})());


// place any jQuery/helper plugins in here, instead of separate, slower script files.

(function( $ ){

	var $scrollTo = $.scrollTo = function( target, duration, settings ){
		$scrollTo.window().scrollTo( target, duration, settings );
	};

	$scrollTo.defaults = {
		axis:'y',
		duration:1
	};

	//returns the element that needs to be animated to scroll the window
	$scrollTo.window = function(){
		return $( $.browser.safari ? 'body' : 'html' );
	};

	$.fn.scrollTo = function( target, duration, settings ){
		if( typeof duration == 'object' ){
			settings = duration;
			duration = 0;
		}
		settings = $.extend( {}, $scrollTo.defaults, settings );
		duration = duration || settings.speed || settings.duration;//speed is still recognized for backwards compatibility
		settings.queue = settings.queue && settings.axis.length > 1;//make sure the settings are given right
		if( settings.queue )
			duration /= 2;//let's keep the overall speed, the same.
		settings.offset = both( settings.offset );
		settings.over = both( settings.over );

		return this.each(function(){
			var elem = this, $elem = $(elem),
				t = target, toff, attr = {},
				win = $elem.is('html,body');
			switch( typeof t ){
				case 'number'://will pass the regex
				case 'string':
					if( /^([+-]=)?\d+(px)?$/.test(t) ){
						t = both( t );
						break;//we are done
					}
					t = $(t,this);// relative selector, no break!
				case 'object':
					if( t.is || t.style )//DOM/jQuery
						toff = (t = $(t)).offset();//get the real position of the target 
			}
			$.each( settings.axis.split(''), function( i, axis ){
				var Pos	= axis == 'x' ? 'Left' : 'Top',
					pos = Pos.toLowerCase(),
					key = 'scroll' + Pos,
					act = elem[key],
					Dim = axis == 'x' ? 'Width' : 'Height',
					dim = Dim.toLowerCase();

				if( toff ){//jQuery/DOM
					attr[key] = toff[pos] + ( win ? 0 : act - $elem.offset()[pos] );

					if( settings.margin ){//if it's a dom element, reduce the margin
						attr[key] -= parseInt(t.css('margin'+Pos)) || 0;
						attr[key] -= parseInt(t.css('border'+Pos+'Width')) || 0;
					}
					
					attr[key] += settings.offset[pos] || 0;//add/deduct the offset
					
					if( settings.over[pos] )//scroll to a fraction of its width/height
						attr[key] += t[dim]() * settings.over[pos];
				}else
					attr[key] = t[pos];//remove the unnecesary 'px'

				if( /^\d+$/.test(attr[key]) )//number or 'number'
					attr[key] = attr[key] <= 0 ? 0 : Math.min( attr[key], max(Dim) );//check the limits

				if( !i && settings.queue ){//queueing each axis is required					
					if( act != attr[key] )//don't waste time animating, if there's no need.
						animate( settings.onAfterFirst );//intermediate animation
					delete attr[key];//don't animate this axis again in the next iteration.
				}
			});			
			animate( settings.onAfter );			

			function animate( callback ){
				$elem.animate( attr, duration, settings.easing, callback && function(){
					callback.call(this, target);
				});
			};
			function max( Dim ){
				var el = win ? $.browser.opera ? document.body : document.documentElement : elem;
				return el['scroll'+Dim] - el['client'+Dim];
			};
		});
	};

	function both( val ){
		return typeof val == 'object' ? val : { top:val, left:val };
	};

})( jQuery );
(function( $ ){
	var URI = location.href.replace(/#.*/,'');//local url without hash

	var $localScroll = $.localScroll = function( settings ){
		$('body').localScroll( settings );
	};

	//Many of these defaults, belong to jQuery.ScrollTo, check it's demo for an example of each option.
	//@see http://www.freewebs.com/flesler/jQuery.ScrollTo/
	$localScroll.defaults = {//the defaults are public and can be overriden.
		duration:1000, //how long to animate.
		axis:'y',//which of top and left should be modified.
		event:'click',//on which event to react.
		stop:true//avoid queuing animations 
		/*
		lock:false,//ignore events if already animating
		lazy:false,//if true, links can be added later, and will still work.
		target:null, //what to scroll (selector or element). Keep it null if want to scroll the whole window.
		filter:null, //filter some anchors out of the matched elements.
		hash: false//if true, the hash of the selected link, will appear on the address bar.
		*/
	};

	//if the URL contains a hash, it will scroll to the pointed element
	$localScroll.hash = function( settings ){
		settings = $.extend( {}, $localScroll.defaults, settings );
		settings.hash = false;//can't be true
		if( location.hash )
			setTimeout(function(){ scroll( 0, location, settings ); }, 0 );//better wrapped with a setTimeout
	};

	$.fn.localScroll = function( settings ){
		settings = $.extend( {}, $localScroll.defaults, settings );

		return ( settings.persistent || settings.lazy ) 
				? this.bind( settings.event, function( e ){//use event delegation, more links can be added later.
					var a = $([e.target, e.target.parentNode]).filter(filter)[0];//if a valid link was clicked.
					a && scroll( e, a, settings );//do scroll.
				})
				: this.find('a')//bind concretely, to each matching link
						.filter( filter ).bind( settings.event, function(e){
							scroll( e, this, settings );
						}).end()
					.end();

		function filter(){//is this a link that points to an anchor and passes a possible filter ? href is checked to avoid a bug in FF.
			return !!this.href && !!this.hash && this.href.replace(this.hash,'') == URI && (!settings.filter || $(this).is( settings.filter ));
		};
	};

	function scroll( e, link, settings ){
		var id = link.hash.slice(1),
			elem = document.getElementById(id) || document.getElementsByName(id)[0];
		if ( elem ){
			e && e.preventDefault();
			var $target = $( settings.target || $.scrollTo.window() );//if none specified, then the window.

			if( settings.lock && $target.is(':animated') ||
			settings.onBefore && settings.onBefore.call(link, e, elem, $target) === false ) return;

			if( settings.stop )
				$target.queue('fx',[]).stop();//remove all its animations
			$target
				.scrollTo( elem, settings )//do scroll
				.trigger('notify.serialScroll',[elem]);//notify serialScroll about this change
			if( settings.hash )
				$target.queue(function(){
					location = link.hash;
				});
		}
	};

})( jQuery );
(function( $ ){

	var $serialScroll = $.serialScroll = function( settings ){
		$.scrollTo.window().serialScroll( settings );
	};

	//Many of these defaults, belong to jQuery.ScrollTo, check it's demo for an example of each option.
	//@see http://flesler.webs/jQuery.ScrollTo/
	$serialScroll.defaults = {//the defaults are public and can be overriden.
		duration:1000, //how long to animate.
		axis:'x', //which of top and left should be scrolled
		event:'click', //on which event to react.
		start:0, //first element (zero-based index)
		step:1, //how many elements to scroll on each action
		lock:true,//ignore events if already animating
		cycle:true, //cycle endlessly ( constant velocity )
		constant:true //use contant speed ?
		/*
		navigation:null,//if specified, it's a selector a collection of items to navigate the container
		target:null, //if specified, it's a selector to the element to be scrolled.
		interval:0, //it's the number of milliseconds to automatically go to the next
		lazy:false,//go find the elements each time (allows AJAX or JS content, or reordering)
		stop:false, //stop any previous animations to avoid queueing
		force:false,//force the scroll to the first element on start ?
		jump: false,//if true, when the event is triggered on an element, the pane scrolls to it
		items:null, //selector to the items (relative to the matched elements)
		prev:null, //selector to the 'prev' button
		next:null, //selector to the 'next' button
		onBefore: function(){}, //function called before scrolling, if it returns false, the event is ignored
		exclude:0 //exclude the last x elements, so we cannot scroll past the end
		*/
	};

	$.fn.serialScroll = function( settings ){
		settings = $.extend( {}, $serialScroll.defaults, settings );
		var event = settings.event, //this one is just to get shorter code when compressed
			step = settings.step, // idem
			lazy = settings.lazy;//idem

		return this.each(function(){
			var 
				context = settings.target ? this : document, //if a target is specified, then everything's relative to 'this'.
				$pane = $(settings.target || this, context),//the element to be scrolled (will carry all the events)
				pane = $pane[0], //will be reused, save it into a variable
				items = settings.items, //will hold a lazy list of elements
				active = settings.start, //active index
				auto = settings.interval, //boolean, do auto or not
				nav = settings.navigation, //save it now to make the code shorter
				timer; //holds the interval id

			if( !lazy )//if not lazy, go get the items now
				items = getItems();

			if( settings.force )
				jump( {}, active );//generate an initial call

			// Button binding, optionall
			$(settings.prev||[], context).bind( event, -step, move );
			$(settings.next||[], context).bind( event, step, move );

			// Custom events bound to the container
			if( !pane.ssbound )//don't bind more than once
				$pane
					.bind('prev.serialScroll', -step, move ) //you can trigger with just 'prev'
					.bind('next.serialScroll', step, move ) //for example: $(container).trigger('next');
					.bind('goto.serialScroll', jump ); //for example: $(container).trigger('goto', [4] );
			if( auto )
				$pane
					.bind('start.serialScroll', function(e){
						if( !auto ){
							clear();
							auto = true;
							next();
						}
					 })
					.bind('stop.serialScroll', function(){//stop a current animation
						clear();
						auto = false;
					});
			$pane.bind('notify.serialScroll', function(e, elem){//let serialScroll know that the index changed externally
				var i = index(elem);
				if( i > -1 )
					active = i;
			});
			pane.ssbound = true;//avoid many bindings

			if( settings.jump )//can't use jump if using lazy items and a non-bubbling event
				(lazy ? $pane : getItems()).bind( event, function( e ){
					jump( e, index(e.target) );
				});

			if( nav )
				nav = $(nav, context).bind(event, function( e ){
					e.data = Math.round(getItems().length / nav.length) * nav.index(this);
					jump( e, this );
				});

			function move( e ){
				e.data += active;
				jump( e, this );
			};
			function jump( e, button ){
				if( !isNaN(button) ){//initial or special call from the outside $(container).trigger('goto',[index]);
					e.data = button;
					button = pane;
				}

				var
					pos = e.data, n,
					real = e.type, //is a real event triggering ?
					$items = settings.exclude ? getItems().slice(0,-settings.exclude) : getItems(),//handle a possible exclude
					limit = $items.length,
					elem = $items[pos],
					duration = settings.duration;

				if( real )//real event object
					e.preventDefault();

				if( auto ){
					clear();//clear any possible automatic scrolling.
					timer = setTimeout( next, settings.interval ); 
				}

				if( !elem ){ //exceeded the limits
					n = pos < 0 ? 0 : limit - 1;
					if( active != n )//we exceeded for the first time
						pos = n;
					else if( !settings.cycle )//this is a bad case
						return;
					else
						pos = limit - n - 1;//invert, go to the other side
					elem = $items[pos];
				}

				if( !elem || real && active == pos || //could happen, save some CPU cycles in vain
					settings.lock && $pane.is(':animated') || //no animations while busy
					real && settings.onBefore && //callback returns false ?
					settings.onBefore.call(button, e, elem, $pane, getItems(), pos) === false ) return;

				if( settings.stop )
					$pane.queue('fx',[]).stop();//remove all its animations

				if( settings.constant )
					duration = Math.abs(duration/step * (active - pos ));//keep constant velocity

				$pane
					.scrollTo( elem, duration, settings )//do scroll
					.trigger('notify.serialScroll',[pos]);//in case serialScroll was called on this elem more than once.
			};
			function next(){//I'll use the namespace to avoid conflicts
				$pane.trigger('next.serialScroll');
			};
			function clear(){
				clearTimeout(timer);
			};
			function getItems(){
				return $( items, pane );
			};
			function index( elem ){
				if( !isNaN(elem) ) return elem;//number
				var $items = getItems(), i;
				while(( i = $items.index(elem)) == -1 && elem != pane )//see if it matches or one of its ancestors
					elem = elem.parentNode;
				return i;
			};
		});
	};

})( jQuery );