//3.14159265358979323846264338327950288419716939937510 ish...
//3.141592653589793 <- Math.PI
//3.1415926525880504 <- await calcPi(1)
//3.141592653488346  <- await calcPi(10)
const calcPi = (iterationMillions, preventThrottling, report) => {
	let pi = 1,
		r = 1,
		f = 3,
		start = Date.now(),
		duration;
	const limit = Math.pow(10,6) * (iterationMillions || 1),
		refinePiVal = ()=> {
			if (r%2) pi -= (1/f);
			else pi += (1/f);
			r += 1;
			f += 2;
		},
		resolutionAchieved = ()=> r >= limit,
		speedManager = new SpeedManager(preventThrottling? limit : 1000000, false),
		debouncedLog = speedManager.everyXframes(60, 
			report? (frameCount)=> report(pi*4, r, f, frameCount)
			: (frameCount)=> console.log('iteration: ',r, 'pi: ',pi*4));
	
	return speedManager.runTask(refinePiVal, resolutionAchieved, debouncedLog)
		.then(()=> {
			pi = pi*4;
			duration = Date.now() - start;
			console.log(`Done...`,`pi =`,pi, ` time = ${duration / 1000}s`);
			return {pi: pi, time: duration};
		});
}
