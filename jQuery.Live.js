/*
--------------------------------------------------
Author  : LooseLive@gmail.com
Version : 1.0
Create  : 2012/5/28
--------------------------------------------------
*/
(function($){
	var queues = [],
		plugin = ['append', 'prepend', 'after', 'before', 'wrap', 'html', 'empty', 'remove'],
		die = false;
	$.fn.Live = function(type, fn){
		var self = this,
			event = undefined,
			inQueues = false;
		if(typeof type == 'string')
		{
			this.Live(function(){
				if(die)$(this).unbind(type);
				$(this).bind(type, fn);
			}, type);
			die = false;
			return this;
		}
		else
		{
			if(fn !== undefined)event = fn;
			fn = type;
		}
		if(event !== undefined)
		{
			for(var i = 0; i < queues.length; i++)
			{
				var q = queues[i];
				if(q.selector == self.selector && q.context == self.context && q.fn.equals(fn) && q.event !== undefined)
				{
					inQueues = true;
					break;
				}
			}
		}
		if(!inQueues)
		{
			var query = new $.Live(this, fn, event);
			queues.push(query);
			fn.apply(this);
		}
		return this;
	};
	$.fn.Die = function(type){
		del = [];
		die = true;
		if(type)this.unbind(type);
		for(var i = 0; i < queues.length; i++)
		{
			if(type === queues[i].event)
			{
				if(queues[i].selector == this.selector && queues[i].context == this.context)
				{
					del.push(queues[i]);
				}
				else if(queues[i].selector.indexOf(',') >= 1)
				{
					var selectorsOld = queues[i].selector.split(','),
						selectorsNew = this.selector.split(',');
					for(var x = 0; x < selectorsOld.length; x++)
					{
						for(var y = 0; y < selectorsNew.length; y++)
						{
							if(selectorsNew[y] == selectorsOld[x] && queues[i].context == this.context)
							{
								queues[i].filter.push(selectorsNew[y]);
							}
						}
					}
				}
			}
		}
		for(var i = 0; i < del.length; i++)
		{
			var index = $.inArray(del[i], queues);
			if(index >= 0)
			{
				queues.splice(index, 1);
			}
		}
		return this;
	};
	$.Live = function(e, fn, event) {
		this.query = e;
		this.selector = e.selector;
		this.context = e.context;
		this.filter = [];
		this.fn = fn;
		this.event = event;
	};
	$.Live.RegisterPlugin = function(plugins){
		$.each(plugins, function(i, n){
			var old = $.fn[n];
			if (!old)
			{
				return;
			}
			$.fn[n] = function() {
				var e = old.apply(this, arguments);
				$.Live.Active();
				return e;
			};
		});
	};
	$.Live.Active = function(){
		for(var i = 0; i < queues.length; i++)
		{
			var q = queues[i],
				e = $(q.selector, q.context).not(q.filter.join(',')),
				n = e.not(q.query);
			if(n.size() > 0)
			{
				q.query = e;
				q.fn.apply(n);
			}
		}
	};
	$.Live.RegisterPlugin(plugin);
})($);
Function.prototype.equals = function(fn){return this.toString().replace(/\s*/g,'') == fn.toString().replace(/\s*/g,'')};