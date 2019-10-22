class SpeedManager {

	isActive = false;
	hasThrottled = 0;
	retryIncrease = 0;
	lastFrameTime = Date.now();
	framesPerSecond = 60;
	iterationsPerFrame = 1000000;
	showLog = false;

	constructor (ipf, useTimeout) {
		if (ipf) this.iterationsPerFrame = ipf;
		if (!useTimeout) this.requestFrameInterval = (f)=> window.requestAnimationFrame(f);
		
		const debouncedTicker = this.everyXframes(this.framesPerSecond, this.update);
		const ticker = ()=> {
			this.isActive && debouncedTicker();
			this.requestFrameInterval(ticker);
		};
		this.requestFrameInterval(ticker);
	}
	
	start = ()=> {
		this.lastFrameTime = window.performance.now();
		this.isActive = true;
	}
	stop = ()=> this.isActive = false;
	decreaseSpeed = ()=> this.iterationsPerFrame = this.iterationsPerFrame*0.9;
	increaseSpeed = ()=> this.iterationsPerFrame = this.iterationsPerFrame*1.1;
	requestFrameInterval = (callback)=> window.setTimeout(callback, 1000/this.framesPerSecond);
	
	hasTakenMoreThan1000ms = ()=> {
		let currentFrameTime = window.performance.now();
		let wasLate = currentFrameTime - this.lastFrameTime - 1024;
		
		if (this.showLog) console
			.log('framesTookMoreThan1000ms:',wasLate,
				`last${this.framesPerSecond}Frames(ms):`,currentFrameTime - this.lastFrameTime, 
				'iterationsPerFrame:',this.iterationsPerFrame);
		this.lastFrameTime = currentFrameTime;
		return wasLate > 0;
	};
	
	update = ()=> {
		if(this.hasTakenMoreThan1000ms()) {
			this.decreaseSpeed();
			this.hasThrottled++;
		} else if (!this.hasThrottled || (this.hasThrottled && this.retryIncrease)) { 
			this.increaseSpeed();
		}
	};
	
	everyXframes = (gap, cb)=> ((frameCount)=> ()=> {
		frameCount++;
		if (frameCount >= gap) {
			cb(frameCount);
			frameCount = 0;
		}
	})(0);
	
	runTask = (intensiveTask, completionTest, task)=> new Promise((resolve, reject)=> {
		const ticker = ()=> {
			if (completionTest()) {
				this.stop();
				resolve();
			} else if (this.isActive) {
				for (let i = 0; intensiveTask && i < this.iterationsPerFrame && !completionTest(); i++) 
					intensiveTask();
				task && task();
				this.requestFrameInterval(ticker);
			} else {
				reject();
			}
		}
		this.start();
		this.requestFrameInterval(ticker);
	});
}
