//Modified https://github.com/jeromeetienne/threex.loop

Loop	= function(){
	this._fcts	= []
}

Loop.prototype.add	= function(fct){
	this._fcts.push(fct)
	return fct
}

Loop.prototype.remove	= function(fct){
	var index	= this._fcts.indexOf(fct)
	if( index === -1 )	return
	this._fcts.splice(index,1)
}

Loop.prototype.update	= function(delta){
	this._fcts.forEach(function(fct){
		fct(delta)
	})
}


//////////////////////////////////////////////////////////////////////////////////
//		RenderingLoop						//
//////////////////////////////////////////////////////////////////////////////////
RenderingLoop	= function(){
	Loop.call(this)

	this.maxDelta	= 0.2
	var requestId	= null
	var lastTimeMsec= null
	var onRequestAnimationFrame	= function(nowMsec){
		// keep looping
		requestId	= requestAnimationFrame( onRequestAnimationFrame );

		// measure time - never notify more than this.maxDelta
		lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
		var deltaMsec	= Math.min(this.maxDelta*1000, nowMsec - lastTimeMsec)
		lastTimeMsec	= nowMsec
		// call each update function
		this.update(deltaMsec/1000)
	}.bind(this)


	//////////////////////////////////////////////////////////////////////////////////
	//		start/stop/isRunning functions					//
	//////////////////////////////////////////////////////////////////////////////////
	this.start	= function(){
		console.assert(this.isRunning() === false)
		requestId	= requestAnimationFrame(onRequestAnimationFrame)
	}
	this.isRunning	= function(){
		return requestId ? true : false
	}
	this.stop	= function(){
		if( requestId === null )	return
		cancelAnimationFrame(requestId)
		requestId	= null
	}
}

RenderingLoop.prototype = Object.create( Loop.prototype );



//////////////////////////////////////////////////////////////////////////////////
//		PhysicsLoop						//
//////////////////////////////////////////////////////////////////////////////////
PhysicsLoop	= function(rate){
	Loop.call(this)

	this.rate	= rate !== undefined ? rate : 60
	var timerId	= null
	var onInterval	= function(){
		var delta	= 1/this.rate
		// relaunch the setTimeout
		timerId	= setTimeout(onInterval, delta*1000)
		// call each update function
		this.update(delta)
	}.bind(this)


	//////////////////////////////////////////////////////////////////////////////////
	//		start/stop/isRunning functions					//
	//////////////////////////////////////////////////////////////////////////////////
	this.start	= function(){
		console.assert(this.isRunning() === false)
		timerId	= setTimeout(onInterval, 0)
	}
	this.isRunning	= function(){
		return timerId ? true : false
	}
	this.stop	= function(){
		if( timerId === null )	return
		clearInterval(timerId)
		timerId	= null
	}
}

PhysicsLoop.prototype = Object.create( Loop.prototype );
