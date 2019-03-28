import { animation } from "./library.js";

/*

*/
let animate = [],
	doAnimation = false,
	resortBatchAnimations = true,
	animate_buckets = [];

/*

*/
const resortAnimations = function () {
	resortBatchAnimations = true;
};

/*

*/
const animationLoop = function () {

	let i, iz, a, order,
		floor = Math.floor,
		buckets;

	if (resortBatchAnimations) {

		resortBatchAnimations = false;
		buckets = [];

		for (i = 0, iz = animate.length; i < iz; i++){

			a = animation[animate[i]];
			order = floor(a.order) || 0;

			if (!buckets[order]) buckets[order] = [];

			buckets[order].push(a);
		}

		animate_buckets.length = 0;

		for (i = 0, iz = buckets.length; i < iz; i++){

			if (buckets[i] && buckets[i].length) animate_buckets.push(buckets[i]);
		}
	}

/*

*/
	animationBatchPromise(0)
	.then((res) => {

		if (res) throw 'animationLoop completed'; 
		else throw 'animationLoop error'; 
	})
	.catch((err) => {

		if (doAnimation) {
			window.requestAnimationFrame(function() {
				animationLoop();
			});
		}
	});
};

/*

*/
const animationBatchPromise = function (counter) {

	return new Promise((resolve, reject) => {

		let i, iz, item, check,
			promiseArray,
			items = animate_buckets[counter];

		if (items){

			let promiseArray = [Promise.resolve(true)];

			for (i = 0, iz = items.length; i < iz; i++){

				item = items[i];
				// item.fn MUST be a function returning a promise!
				if (item.fn) promiseArray.push(item.fn());
			}

			Promise.all(promiseArray)
			.then((res) => {

				check = animate_buckets[counter + 1];

				if (check){

					animationBatchPromise(counter + 1)
					.then((res) => resolve(true))
					.catch((err) => resolve(false));
				}
				else resolve(true);
			})
			.catch((err) => resolve(false));
		}
		else resolve(true);
	});
};

/*

*/
const startCoreAnimationLoop = function () {
	doAnimation = true;
	animationLoop();
};

/*

*/
const stopCoreAnimationLoop = function () {
	doAnimation = false;
};


export {
	animate,
	resortAnimations,
	startCoreAnimationLoop,
	stopCoreAnimationLoop,
};
