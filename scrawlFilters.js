'use strict';
/**
# scrawlFilters

## Purpose and features

The Filters module adds a set of filter algorithms to the Scrawl library

@module scrawlFilters
**/

var scrawl = (function(my){
/**
# window.scrawl

scrawlFilters module adaptions to the Scrawl library object

## New library sections

* scrawl.filter - for image filter algorithms

@class window.scrawl_Filters
**/

	my.prepareFilterSection();
	
	my.filterSetup = function(items, image){
		items = my.safeObject(items);
		var myUse = (my.xt(items.useSourceData)) ? items.useSourceData : false,
			result = {};
		result.items = items;
		result.image = image || false;
		result.useSourceData = myUse;
		result.imgData = items.use || image.getImageData(myUse);
		result.save = (my.xt(items.save)) ? items.save : true;
		return result;
		};
	my.filterSave = function(args){
		var result;
		if(args.save && args.image){
			result = args.image.getImageDataUrl(args.imgData, true);
			my.img[args.image.name] = args.image.makeImage(result, args.image.name+'_current', args.image.width, args.image.height);
			}
		};

/**
Grayscale filter (added to the core by the scrawlFilters module)

Attributes in the argument object:

* __value__ - Number or String. Percentage value of grayscaling effect: as a Number, between 0 (no effect) and 1 (full grayscale effect); as a String, between '0%' and '100%' (default: 1)
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method grayscale
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.filter.grayscale = function(items, image){
		var args = my.filterSetup(items, image),
			value = (my.xt(args.items.value)) ? args.items.value : 1,
			data = args.imgData.data,
			gray,
			here;
		value = (my.isa(value, 'str')) ? parseFloat(value)/100 : value;
		value = (my.isBetween(value, 0, 1, true)) ? value : ((value > 0.5) ? 1 : 0);
		for(var i=0, z=data.length; i<z; i += 4){
			here = i;
			gray = Math.floor((0.2126 * data[here]) + (0.7152 * data[++here]) + (0.0722 * data[++here]));
			for(var j = 0; j < 3; j++){
				here = i + j; 
				data[here] = data[here] + ((gray - data[here]) * value);
				}
			}
		my.filterSave(args);
		return args.imgData;
		};
	my.pushUnique(my.filternames, 'grayscale');
/**
Sharpen filter (added to the core by the scrawlFilters module)

Attributes in the argument object:

* __value__ - Number or String. Percentage value of sharpen effect: as a Number, between 0 (no effect) and 1 (full sharpen effect); as a String, between '0%' and '100%' (default: 1)
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method sharpen
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.filter.sharpen = function(items, image){
		var args = my.filterSetup(items, image),
			value = (my.xt(args.items.value)) ? args.items.value : 1,
			mask;
		value = (my.isa(value, 'str')) ? parseFloat(value)/100 : value;
		mask = my.filter.matrix({
			use: args.imgData,
			data: [0, -1, 0, -1, 5, -1, 0, -1, 0],
			save: false,
			}, args.image);
		args.imgData = my.filter.mergeImages({
			image1: args.imgData,
			image2: mask,
			value: value,
			});
		my.filterSave(args);
		return args.imgData;
		};
	my.pushUnique(my.filternames, 'sharpen');
/**
Filter helper function - merge one image data object into another

Attributes in the argument object:

* __value__ - Number. Percentage value of merge, between 0 (image1 returned) and 1 (image2 returned)
* __image1__ - First image data object - fully displayed when _value_ is 0
* __image2__ - Second image data object - fully displayed when _value_ is 1
@method mergeImages
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.filter.mergeImages = function(items){
		if(my.isa(items,'obj') && my.xta([items.image1, items.image2, items.value])){
			var img1 = items.image1,
				dat1 = img1.data,
				img2 = items.image2,
				dat2 = img2.data,
				val = items.value,
				iVal = 1 - val,
				here;
			if(val === 0){
				return img1;
				}
			else if(val === 1){
				return img2;
				}
			else{
				for(var i = 0, z = dat1.length; i < z; i += 4){
					for(var j = 0; j < 3; j++){
						here = i + j; 
						dat1[here] = (dat1[here] * iVal) + (dat2[here] * val);
						}
					}
				return img1;
				}
			}
		return false;
		};
	my.pushUnique(my.filternames, 'mergeImages');
/**
Invert filter (added to the core by the scrawlFilters module)

Attributes in the argument object:

* __value__ - Number or String. Percentage value of invert effect: as a Number, between 0 (no effect) and 1 (full invert effect); as a String, between '0%' and '100%' (default: 1)
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method invert
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.filter.invert = function(items, image){
		var args = my.filterSetup(items, image),
			value = (my.xt(args.items.value)) ? args.items.value : 1,
			data = args.imgData.data,
			iVal, here;
		value = (my.isa(value, 'str')) ? parseFloat(value)/100 : value;
		value = (my.isBetween(value, 0, 1, true)) ? value : (value > 0.5) ? 1 : 0;
		iVal = 1 - value;
		for(var i = 0, iz = data.length; i < iz; i += 4){
			for(var j = 0; j < 3; j++){
				here = i + j;
				data[here] = (data[here] * iVal) + ((255 - data[here]) * value);
				}
			}
		my.filterSave(args);
		return args.imgData;
		};
	my.pushUnique(my.filternames, 'invert');
/**
Brightness filter (added to the core by the scrawlFilters module)

Attributes in the argument object:

* __value__ - Number or String. Percentage value of brightness effect: as a Number, between 0 (black) and 1 (no effect); as a String, between '0%' and '100%' (default: 1). Values can go above 1.
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method brightness
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.filter.brightness = function(items, image){
		var args = my.filterSetup(items, image),
			value = (my.xt(args.items.value)) ? args.items.value : 1,
			data = args.imgData.data,
			here;
		value = (my.isa(value, 'str')) ? parseFloat(value)/100 : value;
		value = (value < 0) ? 0 : value;
		for(var i = 0, iz = data.length; i < iz; i += 4){
			for(var j = 0; j < 3; j++){
				here = i + j;
				data[here] = data[here] * value;
				}
			}
		my.filterSave(args);
		return args.imgData;
		};
	my.pushUnique(my.filternames, 'brightness');
/**
Saturation filter (added to the core by the scrawlFilters module)

Attributes in the argument object:

* __value__ - Number or String. Percentage value of saturation effect: as a Number, between 0 (gray) and 1 (no effect); as a String, between '0%' and '100%' (default: 1). Values can go above 1.
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method saturation
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.filter.saturation = function(items, image){
		var args = my.filterSetup(items, image),
			value = (my.xt(args.items.value)) ? args.items.value : 1,
			data = args.imgData.data,
			here;
		value = (my.isa(value, 'str')) ? parseFloat(value)/100 : value;
		value = (value < 0) ? 0 : value;
		for(var i = 0, iz = data.length; i < iz; i += 4){
			for(var j = 0; j < 3; j++){
				here = i + j;
				data[here] = 127 + ((data[here] - 127) * value);
				}
			}
		my.filterSave(args);
		return args.imgData;
		};
	my.pushUnique(my.filternames, 'saturation');
/**
Threshold filter (added to the core by the scrawlFilters module)

Attributes in the argument object:

* __value__ - Number or String. Percentage value of threshold border: as a Number, between 0 (black) and 1 (white); as a String, between '0%' and '100%' (default: 0.5)
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method threshold
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.filter.threshold = function(items, image){
		var args = my.filterSetup(items, image),
			value = (my.xt(items.value)) ? items.value : 0.5,
			data,
			here;
		value = (my.isa(value, 'str')) ? parseFloat(value)/100 : value;
		value = (my.isBetween(value, 0, 1, true)) ? value : ((value > 0.5) ? 1 : 0);
		value *= 255;
		args.imgData = my.filter.grayscale({
			useSourceData: args.useSourceData,
			use: args.imgData,
			save: false,
			}, args.image);
		data = args.imgData.data;
		for(var i = 0, iz = data.length; i < iz; i += 4){
			for(var j = 0; j < 3; j++){
				here = i + j;
				data[here] = (data[here] > value) ? 255 : 0;
				}
			}
		my.filterSave(args);
		return args.imgData;
		};
	my.pushUnique(my.filternames, 'threshold');
/**
Channels filter (added to the core by the scrawlFilters module)

Alter the relative channel levels for an image

Attributes in the argument object:

* __red__ - Number or String. Percentage value of red channel effect on the pixel: as a Number, between 0 (set red channel to zero) and 1 (no effect); as a String, between '0%' and '100%' (default: 1). Can go above 1.
* __green__ - Number or String. Percentage value of green channel effect on the pixel: as a Number, between 0 (set green channel to zero) and 1 (no effect); as a String, between '0%' and '100%' (default: 1). Can go above 1.
* __blue__ - Number or String. Percentage value of blue channel effect on the pixel: as a Number, between 0 (set blue channel to zero) and 1 (no effect); as a String, between '0%' and '100%' (default: 1). Can go above 1.
* __alpha__ - Number or String. Percentage value of alpha channel effect on the pixel: as a Number, between 0 (set alpha channel to zero) and 1 (no effect); as a String, between '0%' and '100%' (default: 1). Can go above 1.
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method channels
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.filter.channels = function(items, image){
		var args = my.filterSetup(items, image),
			red = (my.xt(args.items.red)) ? args.items.red : 1,
			green = (my.xt(args.items.green)) ? args.items.green : 1,
			blue = (my.xt(args.items.blue)) ? args.items.blue : 1,
			alpha = (my.xt(args.items.alpha)) ? args.items.alpha : 1,
			data = args.imgData.data,
			here;
		red = (my.isa(red, 'str')) ? parseFloat(red)/100 : red;
		green = (my.isa(green, 'str')) ? parseFloat(green)/100 : green;
		blue = (my.isa(blue, 'str')) ? parseFloat(blue)/100 : blue;
		alpha = (my.isa(alpha, 'str')) ? parseFloat(alpha)/100 : alpha;
		for(var i=0, z=data.length; i<z; i += 4){
			here = i; data[here] = data[here] * red;
			here++; data[here] = data[here] * green;
			here++; data[here] = data[here] * blue;
			here++; data[here] = data[here] * alpha;
			}
		my.filterSave(args);
		return args.imgData;
		};
	my.pushUnique(my.filternames, 'channels');
/**
ChannelStep filter (added to the core by the scrawlFilters module)

Limit the number of values used in each channel

Attributes in the argument object:

* __red__ - Number. Channel step size, between 1 (256 steps) and 128 (2 steps) - default: 1
* __green__ - Number. Channel step size, between 1 (256 steps) and 128 (2 steps) - default: 1
* __blue__ - Number. Channel step size, between 1 (256 steps) and 128 (2 steps) - default: 1
* __alpha__ - Number. Channel step size, between 1 (256 steps) and 128 (2 steps) - default: 1
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method channelStep
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.filter.channelStep = function(items, image){
		var args = my.filterSetup(items, image),
			red = (my.xt(args.items.red)) ? args.items.red : 1,
			green = (my.xt(args.items.green)) ? args.items.green : 1,
			blue = (my.xt(args.items.blue)) ? args.items.blue : 1,
			alpha = (my.xt(args.items.alpha)) ? args.items.alpha : 1,
			data = args.imgData.data,
			here;
		for(var i=0, z=data.length; i<z; i += 4){
			here = i; data[here] = Math.floor(data[here] / red) * red;
			here++; data[here] = Math.floor(data[here] / green) * green;
			here++; data[here] = Math.floor(data[here] / blue) * blue;
			here++; data[here] = Math.floor(data[here] / alpha) * alpha;
			}
		my.filterSave(args);
		return args.imgData;
		};
	my.pushUnique(my.filternames, 'channelStep');
/**
Sepia filter (added to the core by the scrawlFilters module)

Attributes in the argument object:

* __value__ - Number or String. Percentage value of sepia effect: as a Number, between 0 (no effect) and 1 (full sepia tint); as a String, between '0%' and '100%' (default: 1).
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method sepia
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.filter.sepia = function(items, image){
		return my.filter.tint(items, image);
		};
	my.pushUnique(my.filternames, 'sepia');
/**
Tint filter (added to the core by the scrawlFilters module)

Attributes in the argument object:

* __value__ - Number or String. Percentage value of tint effect: as a Number, between 0 (no effect) and 1 (full tint); as a String, between '0%' and '100%' (default: 1).
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 

The argument object can take up to nine additional attributes, used to set the tinting effect. Default values for these attributes will generate a sepia tint. All values are Numbers between 0 and 1:

* __redInRed__ or __rr__ - default 0.393
* __redInGreen__ or __rg__ - default 0.349
* __redInBlue__ or __rb__ - default 0.272
* __greenInRed__ or __gr__ - default 0.769
* __greenInGreen__ or __gg__ - default 0.686
* __greenInBlue__ or __gb__ - default 0.534
* __blueInRed__ or __br__ - default 0.189
* __blueInGreen__ or __bg__ - default 0.168
* __blueInBlue__ or __bb__ - default 0.131
@method tint
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.filter.tint = function(items, image){
		var args = my.filterSetup(items, image),
			value = (my.xt(args.items.value)) ? args.items.value : 1,
			iVal,
			rr = args.items.rr || args.items.redInRed || 0.393,
			rg = args.items.rg || args.items.redInGreen || 0.349,
			rb = args.items.rb || args.items.redInBlue || 0.272,
			gr = args.items.gr || args.items.greenInRed || 0.769,
			gg = args.items.gg || args.items.greenInGreen || 0.686,
			gb = args.items.gb || args.items.greenInBlue || 0.534,
			br = args.items.br || args.items.blueInRed || 0.189,
			bg = args.items.bg || args.items.blueInGreen || 0.168,
			bb = args.items.bb || args.items.blueInBlue || 0.131,
			data = args.imgData.data,
			r, red,
			g, grn,
			b, blu;
		value = (my.isa(value, 'str')) ? parseFloat(value)/100 : value;
		value = (my.isBetween(value, 0, 1, true)) ? value : ((value > 0.5) ? 1 : 0);
		iVal = 1 - value;
		for(var i = 0, iz = data.length; i < iz; i += 4){
			r = data[i];
			g = data[i+1];
			b = data[i+2];
			red = (r * rr) + (g * gr) + (b * br)
			grn = (r * rg) + (g * gg) + (b * bg)
			blu = (r * rb) + (g * gb) + (b * bb)
			data[i] = (r * iVal) + (red * value);
			data[i+1] = (g * iVal) + (grn * value);
			data[i+2] = (b * iVal) + (blu * value);
			}
		my.filterSave(args);
		return args.imgData;
		};
	my.pushUnique(my.filternames, 'tint');
/**
Blur filter (added to the core by the scrawlFilters module)

Attributes in the argument object:

* __brush__ - Array. A pre-compiled filter.getBrush() array to be used with the blur filter; alternatively, define the brush dynamically using the radius/radiusX/radiusY/roll attributes below
* __radiusX__ - Number. Blur brush x radius (default: 2)
* __radiusY__ - Number. Blur brush y radius (default: 2)
* __roll__ - Number. Blur brush roll value (default: 0)
* __radius__ - Number. Blur brush x and y radius (default: 0)
* __includeAlpha__ - Boolean. When true, alpha values are included in the calculation (default: false)
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method blur
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.filter.blur = function(items, image){
		var args = my.filterSetup(items, image);
		args.items.includeAlpha = (my.isa(args.items.includeAlpha, 'bool')) ? args.items.includeAlpha : false;
		args.items.wrap = false;
		if(!my.xt(args.items.brush)){
			var radius = (my.xt(args.items.radius)) ? Math.abs(args.items.radius) : 0,
				radiusX = (my.xt(args.items.radiusX)) ? Math.abs(args.items.radiusX) : 2,
				radiusY = (my.xt(args.items.radiusY)) ? Math.abs(args.items.radiusY) : 2,
				roll = (my.xt(args.items.roll)) ? args.items.roll : 0,
				rx = radius || radiusX || 2,
				ry = radius || radiusY || 2;
			args.items.brush = my.filter.getBrush(rx, ry, roll);
			}
		args.imgData = my.filter.doMatrix(args.items.brush, args);
		my.filterSave(args);
		return args.imgData;
		};
	my.pushUnique(my.filternames, 'blur');
/**
Blur helper function

@method getBrush
@param x {Number} brush x radius
@param y {Number} brush y radius
@param r {Number} brush roll (in degrees)
@return Array of objects used for the blur brush
**/
	my.filter.getBrush = function(x, y, r){
		var dim = (x > y) ? x+2 : y+2,
			hDim = Math.floor(dim/2),
			cos = Math.cos(r * my.radian),
			sin = Math.sin(r * my.radian),
			brush = [];
		my.cv.width = dim;
		my.cv.height = dim;
		my.cvx.setTransform(cos, sin, -sin, cos, hDim, hDim);
		my.cvx.beginPath();
		my.cvx.moveTo(-x, 0);
		my.cvx.lineTo(-1, -1);
		my.cvx.lineTo(0, -y);
		my.cvx.lineTo(1, -1);
		my.cvx.lineTo(x, 0);
		my.cvx.lineTo(1, 1);
		my.cvx.lineTo(0, y);
		my.cvx.lineTo(-1, 1);
		my.cvx.lineTo(-x, 0);
		my.cvx.closePath();
		for(var i=0; i<dim; i++){ //rows (y)
			for(var j=0; j<dim; j++){ //cols (x)
				if(my.cvx.isPointInPath(j, i)){
					brush.push({ox: j - hDim, oy: i - hDim, wt: 1});
					}
				}
			}
		my.cvx.setTransform(1, 0, 0, 1, 0, 0);
		return brush;
		};
	my.pushUnique(my.filternames, 'getBrush');
/**
Pixelate filter (added to the core by the scrawlFilters module)

Attributes in the argument object:

* __width__ - Number. Block width (default: 5)
* __height__ - Number. Block height (default: 5)
* __includeAlpha__ - Boolean. When true, alpha values are included in the calculation (default: false)
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method pixelate
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.filter.pixelate = function(items, image){
		var args = my.filterSetup(items, image),
			width = (my.xt(args.items.width)) ? Math.ceil(args.items.width) : 5,
			height = (my.xt(args.items.height)) ? Math.ceil(args.items.height) : 5,
			addAlpha = (my.xt(args.items.includeAlpha)) ? args.items.includeAlpha : false,
			iWidth = args.imgData.width,
			iHeight = args.imgData.height,
			red,
			grn,
			blu,
			alp,
			block,
			count,
			tW,
			tH,
			vol,
			here;
		my.cv.width = iWidth;
		my.cv.height = iHeight;
		my.cvx.putImageData(args.imgData, 0, 0);
		for(var i = 0; i < iHeight; i += height){ //rows (y)
			for(var j = 0; j < iWidth; j += width){ //cols (x)
				red = grn = blu = alp = count = 0;
				tW = (j + width > iWidth) ? iWidth - j : width;
				tH = (i + height > iHeight) ? iHeight - i : height;
				vol = tW * tH * 4;
				block = my.cvx.getImageData(j, i, tW, tH);
				for(var k = 0; k < vol; k += 4){
					if(block.data[k+3] > 0){
						here = k;
						red += block.data[here];
						grn += block.data[++here];
						blu += block.data[++here];
						alp += block.data[++here];
						count++;
						}
					}
				red = Math.floor(red/count);
				grn = Math.floor(grn/count);
				blu = Math.floor(blu/count);
				alp = Math.floor(alp/count);
				my.cvx.fillStyle = (addAlpha) ? 'rgba('+red+','+grn+','+blu+','+alp+')' : 'rgb('+red+','+grn+','+blu+')';
				my.cvx.fillRect(j, i, tW, tH);
				}
			}
		args.imgData = my.cvx.getImageData(0, 0, args.imgData.width, args.imgData.height);
		my.filterSave(args);
		return args.imgData;
		};
	my.pushUnique(my.filternames, 'pixelate');
/**
Glass Tile filter (added to the core by the scrawlFilters module)

Attributes in the argument object:

* __width__ - Number. Block width (default: 5)
* __height__ - Number. Block height (default: 5)
* __outerWidth__ - Number. Block width (default: 8)
* __outerHeight__ - Number. Block height (default: 8)
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method glassTile
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.filter.glassTile = function(items, image){
		var args = my.filterSetup(items, image),
			width = (my.xt(args.items.width)) ? Math.ceil(args.items.width) : 5,
			height = (my.xt(args.items.height)) ? Math.ceil(args.items.height) : 5,
			outerWidth = (my.xt(args.items.outerWidth)) ? Math.ceil(args.items.outerWidth) : 8,
			outerHeight = (my.xt(args.items.outerHeight)) ? Math.ceil(args.items.outerHeight) : 8,
			tW,
			tH,
			block;
		my.cv.width = args.imgData.width;
		my.cv.height = args.imgData.height;
		my.cvx.putImageData(args.imgData, 0, 0);
		for(var i = 0; i < args.imgData.height; i += height){ //rows (y)
			for(var j = 0; j < args.imgData.width; j += width){ //cols (x)
				tW = (j + outerWidth > args.imgData.width) ? args.imgData.width - j : outerWidth;
				tH = (i + outerHeight > args.imgData.height) ? args.imgData.height - i : outerHeight;
				my.cvx.drawImage(my.cv, j, i, tW, tH, j, i, width, height);
				}
			}
		args.imgData = my.cvx.getImageData(0, 0, args.imgData.width, args.imgData.height);
		my.filterSave(args);
		return args.imgData;
		};
	my.pushUnique(my.filternames, 'glassTile');
/**
Matrix filter (added to the core by the scrawlFilters module)

Transforms an image using a weighted matrix

Matrix is composed of an array of weightings to be applied to the colors of surrounding pixels. The function expects the weightings data to equate to a square matrix with an odd number of colums/rows - thusthe data array should consist of 9, 25, 49, etc elements. if the data array is missing the requisite number of elements, the function will add zeros to it to pad it out.

Attributes in the argument object:

* __data__ - Array of Numbers. (default: [1])
* __includeAlpha__ - Boolean. When true, alpha values are included in the calculation (default: false)
* __wrap__ - Boolean. When true, offset pixels that fall outside the boundaries of the image will be wrapped to the opposite end of the image row or column; when false, the offset pixels are ignored and their weightings excluded from the calculation (default: false)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method matrix
@param {Object} [items] Key:value Object argument for setting attributes
@return amended data image object
**/
	my.filter.matrix = function(items, image){
		var args = my.filterSetup(items, image),
			myArray = (my.isa(args.items.data,'arr')) ? args.items.data : [1],
			matrix = [],
			reqLen,
			matrixMid,
			matrixDim,
			matrixCenter,
			counter = 0,
			imgData;
		args.items.includeAlpha = (my.isa(args.items.includeAlpha, 'bool')) ? args.items.includeAlpha : false;
		args.items.wrap = (my.isa(args.items.wrap, 'bool')) ? args.items.wrap : false;
		reqLen = Math.ceil(Math.sqrt(myArray.length));
		reqLen = (reqLen % 2 === 1) ? Math.pow(reqLen, 2) : Math.pow(reqLen + 1, 2);
		for(var i = 0; i < reqLen; i++){
			myArray[i] = (my.xt(myArray[i])) ? parseFloat(myArray[i]) : 0;
			myArray[i] = (isNaN(myArray[i])) ? 0 : myArray[i];
			}
		matrixMid = Math.floor(myArray.length/2);
		matrixDim = Math.sqrt(myArray.length);
		matrixCenter = Math.floor(matrixDim/2);
		for(var i = 0; i < matrixDim; i++){ //col (y)
			for(var j = 0; j < matrixDim; j++){ //row (x)
				if(myArray[counter] !== 0){
					matrix.push({
						ox: j - matrixCenter,
						oy: i - matrixCenter,
						wt: myArray[counter],
						});
					}
				counter++;
				}
			}
		args.imgData = my.filter.doMatrix(matrix, args);
		my.filterSave(args);
		return args.imgData;
		};
	my.pushUnique(my.filternames, 'matrix');
/**
Helper function

The matrix array consists of objects with the following attributes:

* __ox__ horizontal offset from the current pixel
* __oy__ vertical offset from the current pixel
* __wt__ weighting to be used when adding the color values of the offset pixel to the resulting color for current pixel

Function used by matrix() and blur() filter functions

@method doMatrix
@param {Array} matrix Array of matrix objects
@param {Object} args Arguments object supplied by filter
@return Updated ImageData data on success; false otherwise
**/
	my.filter.doMatrix = function(matrix, args){
		var width = args.imgData.width,
			height = args.imgData.height,
			source = args.imgData.data,
			result = my.cvx.createImageData(args.imgData),
			destination = result.data,
			addAlpha = args.items.includeAlpha,
			wrap = args.items.wrap,
			w, r, g, b, a, x, y, wt,
			here, there, addPix, boundX, boundY,
			length = matrix.length;
		if(length > 0){
			for(var i = 0; i < height; i++){ //rows (y)
				for(var j = 0; j < width; j++){ //cols (x)
					r = b = g = a = w = 0;
					here = 4 * ((i * width) + j);
					for(var k = 0, z = length; k < z; k++){
						addPix = true;
						x = matrix[k].ox;
						y = matrix[k].oy;
						wt = matrix[k].wt;
						boundX = my.isBetween(j + x, 0, width - 1, true);
						boundY = my.isBetween(i + y, 0, height - 1, true);
						if(!boundX || !boundY){
							if(wrap){
								if(!boundX){x += (x > 0) ? -width : width;}
								if(!boundY){y += (y > 0) ? -height : height;}
								}
							else{
								addPix = false;
								}
							}
						if(addPix){
							there = here + (4 * ((y * width) + x));
							r += source[there] * wt;
							g += source[++there] * wt;
							b += source[++there] * wt;
							w += wt;
							if(addAlpha){
								a += source[++there] * wt;
								}
							}
						}
					destination[here] = (w !== 0) ? r/w : r;
					destination[++here] = (w !== 0) ? g/w : g;
					destination[++here] = (w !== 0) ? b/w : b;
					destination[++here] = (addAlpha) ? ((w !== 0) ? a/w : a) : source[here];
					}
				}
			return result;
			}
		return false;
		};
	my.pushUnique(my.filternames, 'doMatrix');

	return my;
	}(scrawl));
