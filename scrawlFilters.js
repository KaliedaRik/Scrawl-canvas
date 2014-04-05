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

	my.filternames = ['grayscale', 'sharpen', 'mergeImages', 'invert', 'brightness', 'saturation', 'threshold', 'channels', 'channelStep', 'sepia', 'tint', 'blur', 'getBrush', 'pixelate', 'matrix', 'doMatrix'];
	my.filter = {
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
		grayscale: function(items, image){
			items = my.safeObject(items);
			var value = (my.xt(items.value)) ? items.value : 1,
				useSourceData = (my.xt(items.useSourceData)) ? items.useSourceData : false,
				imgData = items.use || image.getImageData(useSourceData),
				data = imgData.data,
				gray,
				save = (my.xt(items.save)) ? items.save : true,
				result;
			value = (my.isa(value, 'str')) ? parseFloat(value)/100 : value;
			value = (my.isBetween(value, 0, 1, true)) ? value : ((value > 0.5) ? 1 : 0);
			for(var i=0, z=data.length; i<z; i += 4){
				gray = Math.floor((0.2126 * data[i]) + (0.7152 * data[i+1]) + (0.0722 * data[i+2]));
				data[i] = data[i] + ((gray - data[i]) * value);
				data[i+1] = data[i+1] + ((gray - data[i+1]) * value);
				data[i+2] = data[i+2] + ((gray - data[i+2]) * value);
				}
			if(save){
				result = image.getImageDataUrl(imgData, true);
				my.img[image.name] = image.makeImage(result);
				}
			return imgData;
			},
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
		sharpen: function(items, image){
			items = my.safeObject(items);
			var value = (my.xt(items.value)) ? items.value : 1,
				useSourceData = (my.xt(items.useSourceData)) ? items.useSourceData : false,
				imgData = items.use || image.getImageData(useSourceData),
				save = (my.xt(items.save)) ? items.save : true,
				mask,
				merge,
				result;
			value = (my.isa(value, 'str')) ? parseFloat(value)/100 : value;
			mask = my.filter.matrix({
				useSourceData: useSourceData,
				data: [0, -1, 0, -1, 5, -1, 0, -1, 0],
				save: false,
				}, image);
			merge = my.filter.mergeImages({
				image1: imgData,
				image2: mask,
				value: value,
				});
			if(save){
				result = image.getImageDataUrl(merge, true);
				my.img[image.name] = image.makeImage(result);
				}
			return merge;
			},
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
		mergeImages: function(items){
			if(my.isa(items,'obj') && my.xta([items.image1, items.image2, items.value])){
				var img1 = items.image1,
					dat1 = img1.data,
					img2 = items.image2,
					dat2 = img2.data,
					val = items.value;
				if(val === 0){
					return img1;
					}
				else if(val === 1){
					return img2;
					}
				else{
					for(var i=0, z=dat1.length; i<z; i += 4){
						dat1[i] = (dat1[i] * (1 - val)) + ((dat2[i]) * val);
						dat1[i+1] = (dat1[i+1] * (1 - val)) + ((dat2[i+1]) * val);
						dat1[i+2] = (dat1[i+2] * (1 - val)) + ((dat2[i+2]) * val);
						}
					return img1;
					}
				}
			return false;
			},
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
		invert: function(items, image){
			items = my.safeObject(items);
			var value = (my.xt(items.value)) ? items.value : 1,
				useSourceData = (my.xt(items.useSourceData)) ? items.useSourceData : false,
				imgData = items.use || image.getImageData(useSourceData),
				data = imgData.data,
				save = (my.xt(items.save)) ? items.save : true,
				result;
			value = (my.isa(value, 'str')) ? parseFloat(value)/100 : value;
			value = (my.isBetween(value, 0, 1, true)) ? value : ((value > 0.5) ? 1 : 0);
			for(var i=0, z=data.length; i<z; i += 4){
				data[i] = (data[i] * (1 - value)) + ((255 - data[i]) * value);
				data[i+1] = (data[i+1] * (1 - value)) + ((255 - data[i+1]) * value);
				data[i+2] = (data[i+2] * (1 - value)) + ((255 - data[i+2]) * value);
				}
			if(save){
				result = image.getImageDataUrl(imgData, true);
				my.img[image.name] = image.makeImage(result);
				}
			return imgData;
			},
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
		brightness: function(items, image){
			items = my.safeObject(items);
			var value = (my.xt(items.value)) ? items.value : 1,
				useSourceData = items.use || (my.xt(items.useSourceData)) ? items.useSourceData : false,
				imgData = image.getImageData(useSourceData),
				data = imgData.data,
				save = (my.xt(items.save)) ? items.save : true,
				result;
			value = (my.isa(value, 'str')) ? parseFloat(value)/100 : value;
			value = (value < 0) ? 0 : value;
			for(var i=0, z=data.length; i<z; i += 4){
				data[i] = data[i] * value;
				data[i+1] = data[i+1] * value;
				data[i+2] = data[i+2] * value;
				}
			if(save){
				result = image.getImageDataUrl(imgData, true);
				my.img[image.name] = image.makeImage(result);
				}
			return imgData;
			},
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
		saturation: function(items, image){
			items = my.safeObject(items);
			var value = (my.xt(items.value)) ? items.value : 1,
				useSourceData = items.use || (my.xt(items.useSourceData)) ? items.useSourceData : false,
				imgData = image.getImageData(useSourceData),
				data = imgData.data,
				save = (my.xt(items.save)) ? items.save : true,
				result;
			value = (my.isa(value, 'str')) ? parseFloat(value)/100 : value;
			value = (value < 0) ? 0 : value;
			for(var i=0, z=data.length; i<z; i += 4){
				data[i] = 127 + (data[i] - 127) * value;
				data[i+1] = 127 + (data[i+1] - 127) * value;
				data[i+2] = 127 + (data[i+2] - 127) * value;
				}
			if(save){
				result = image.getImageDataUrl(imgData, true);
				my.img[image.name] = image.makeImage(result);
				}
			return imgData;
			},
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
		threshold: function(items, image){
			items = my.safeObject(items);
			var value = (my.xt(items.value)) ? items.value : 0.5,
				imgData,
				data,
				save = (my.xt(items.save)) ? items.save : true,
				result;
			value = (my.isa(value, 'str')) ? parseFloat(value)/100 : value;
			value = (my.isBetween(value, 0, 1, true)) ? value : ((value > 0.5) ? 1 : 0);
			value *= 255;
			result = my.filter.grayscale({
				useSourceData: items.useSourceData,
				use: items.use,
				save: false,
				}, image);
			imgData = image.getImageData(result),
			data = imgData.data;
			for(var i=0, z=data.length; i<z; i += 4){
				data[i] = (data[i] > value) ? 255 : 0;
				data[i+1] = (data[i+1] > value) ? 255 : 0;
				data[i+2] = (data[i+2] > value) ? 255 : 0;
				}
			if(save){
				result = image.getImageDataUrl(imgData, true);
				my.img[image.name] = image.makeImage(result);
				}
			return imgData;
			},
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
		channels: function(items, image){
			items = my.safeObject(items);
			var red = (my.xt(items.red)) ? items.red : 1,
				green = (my.xt(items.green)) ? items.green : 1,
				blue = (my.xt(items.blue)) ? items.blue : 1,
				alpha = (my.xt(items.alpha)) ? items.alpha : 1,
				useSourceData = items.use || (my.xt(items.useSourceData)) ? items.useSourceData : false,
				imgData = image.getImageData(useSourceData),
				data = imgData.data,
				save = (my.xt(items.save)) ? items.save : true,
				result;
			red = (my.isa(red, 'str')) ? parseFloat(red)/100 : red;
			green = (my.isa(green, 'str')) ? parseFloat(green)/100 : green;
			blue = (my.isa(blue, 'str')) ? parseFloat(blue)/100 : blue;
			alpha = (my.isa(alpha, 'str')) ? parseFloat(alpha)/100 : alpha;
			for(var i=0, z=data.length; i<z; i += 4){
				data[i] = data[i] * red;
				data[i+1] = data[i+1] * green;
				data[i+2] = data[i+2] * blue;
				data[i+3] = data[i+3] * alpha;
				}
			if(save){
				result = image.getImageDataUrl(imgData, true);
				my.img[image.name] = image.makeImage(result);
				}
			return imgData;
			},
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
		channelStep: function(items, image){
			items = my.safeObject(items);
			var red = (my.xt(items.red)) ? items.red : 1,
				green = (my.xt(items.green)) ? items.green : 1,
				blue = (my.xt(items.blue)) ? items.blue : 1,
				alpha = (my.xt(items.alpha)) ? items.alpha : 1,
				useSourceData = items.use || (my.xt(items.useSourceData)) ? items.useSourceData : false,
				imgData = image.getImageData(useSourceData),
				data = imgData.data,
				save = (my.xt(items.save)) ? items.save : true,
				result;
			for(var i=0, z=data.length; i<z; i += 4){
				data[i] = Math.floor(data[i] / red) * red;
				data[i+1] = Math.floor(data[i+1] / green) * green;
				data[i+2] = Math.floor(data[i+2] / blue) * blue;
				data[i+3] = Math.floor(data[i+3] / alpha) * alpha;
				}
			if(save){
				result = image.getImageDataUrl(imgData, true);
				my.img[image.name] = image.makeImage(result);
				}
			return imgData;
			},
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
		sepia: function(items, image){
			items = my.safeObject(items);
			items.rr = 0.393;
			items.rg = 0.349;
			items.rb = 0.272;
			items.gr = 0.769;
			items.gg = 0.686;
			items.gb = 0.534;
			items.br = 0.189;
			items.bg = 0.168;
			items.bb = 0.131;
			return my.filter.tint(items, image);
			},
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
		tint: function(items, image){
			items = my.safeObject(items);
			var value = (my.xt(items.value)) ? items.value : 1,
				useSourceData = items.use || (my.xt(items.useSourceData)) ? items.useSourceData : false,
				rr = items.rr || items.redInRed || 0.393,
				rg = items.rg || items.redInGreen || 0.349,
				rb = items.rb || items.redInBlue || 0.272,
				gr = items.gr || items.greenInRed || 0.769,
				gg = items.gg || items.greenInGreen || 0.686,
				gb = items.gb || items.greenInBlue || 0.534,
				br = items.br || items.blueInRed || 0.189,
				bg = items.bg || items.blueInGreen || 0.168,
				bb = items.bb || items.blueInBlue || 0.131,
				imgData = image.getImageData(useSourceData),
				data = imgData.data,
				red,
				grn,
				blu,
				save = (my.xt(items.save)) ? items.save : true,
				result;
			value = (my.isa(value, 'str')) ? parseFloat(value)/100 : value;
			value = (my.isBetween(value, 0, 1, true)) ? value : ((value > 0.5) ? 1 : 0);
			for(var i=0, z=data.length; i<z; i += 4){
				red = (data[i] * rr) + (data[i+1] * gr) + (data[i+2] * br)
				grn = (data[i] * rg) + (data[i+1] * gg) + (data[i+2] * bg)
				blu = (data[i] * rb) + (data[i+1] * gb) + (data[i+2] * bb)
				data[i] = ((data[i] * (1 - value)) + (red * value));
				data[i+1] = ((data[i+1] * (1 - value)) + (grn * value));
				data[i+2] = ((data[i+2] * (1 - value)) + (blu * value));
				}
			if(save){
				result = image.getImageDataUrl(imgData, true);
				my.img[image.name] = image.makeImage(result);
				}
			return imgData;
			},
/**
Blur filter (added to the core by the scrawlFilters module)

Attributes in the argument object:

* __radius__ - Number. Blur brush x and y radius (default: 0)
* __radiusX__ - Number. Blur brush x radius (default: 2)
* __radiusY__ - Number. Blur brush y radius (default: 2)
* __roll__ - Number. Blur brush roll value (default: 0)
* __includeAlpha__ - Boolean. When true, alpha values are included in the calculation (default: false)
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method blur
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
		blur: function(items, image){
			items = my.safeObject(items);
			var radius = (my.xt(items.radius)) ? Math.abs(items.radius) : 0,
				radiusX = (my.xt(items.radiusX)) ? Math.abs(items.radiusX) : 2,
				radiusY = (my.xt(items.radiusY)) ? Math.abs(items.radiusY) : 2,
				roll = (my.xt(items.roll)) ? items.roll : 0,
				rx = radius || radiusX || 2,
				ry = radius || radiusY || 2,
				useSourceData = items.use || (my.xt(items.useSourceData)) ? items.useSourceData : false,
				addAlpha = (my.xt(items.includeAlpha)) ? items.includeAlpha : false,
				brush = my.filter.getBrush(rx, ry, roll),
				save = (my.xt(items.save)) ? items.save : true,
				imgData = my.filter.doMatrix(brush, useSourceData, addAlpha, false, image),
				result;
			if(save){
				result = image.getImageDataUrl(imgData, true);
				my.img[image.name] = image.makeImage(result);
				}
			return imgData;
			},
/**
Blur helper function

@method getBrush
@param x {Number} brush x radius
@param y {Number} brush y radius
@param r {Number} brush roll (in degrees)
@return Array of objects used for the blur brush
**/
		getBrush: function(x, y, r){
			var dim = (x > y) ? x+2 : y+2,
				hDim = Math.floor(dim/2),
				cos = Math.cos(r * my.radian),
				sin = Math.sin(r * my.radian),
				brush = [];
			my.cv.width = dim;
			my.cv.height = dim;
			my.cvx.setTransform(cos, sin, -sin, cos, hDim, hDim);
			my.cvx.beginPath();
			my.cvx.moveTo(0,-y);
			my.cvx.bezierCurveTo(x*0.55, -y, x, -y*0.55, x, 0);
			my.cvx.bezierCurveTo(x, y*0.55, x*0.55, y, 0, y);
			my.cvx.bezierCurveTo(-x*0.55, y, -x, y*0.55, -x, 0);
			my.cvx.bezierCurveTo(-x, -y*0.55, -x*0.55, -y, 0, -y);
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
			},
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
		pixelate: function(items, image){
			items = my.safeObject(items);
			var width = (my.xt(items.width)) ? Math.ceil(items.width) : 5,
				height = (my.xt(items.height)) ? Math.ceil(items.height) : 5,
				useSourceData = items.use || (my.xt(items.useSourceData)) ? items.useSourceData : false,
				addAlpha = (my.xt(items.includeAlpha)) ? items.includeAlpha : false,
				imgData = image.getImageData(useSourceData),
				red,
				grn,
				blu,
				alp,
				block,
				count,
				tW,
				tH,
				vol,
				save = (my.xt(items.save)) ? items.save : true,
				result;
			my.cv.width = imgData.width;
			my.cv.height = imgData.height;
			my.cvx.putImageData(imgData, 0, 0);
			for(var i = 0; i < imgData.height; i += height){ //rows (y)
				for(var j = 0; j < imgData.width; j += width){ //cols (x)
					red = grn = blu = alp = count = 0;
					tW = (j + width > imgData.width) ? imgData.width - j : width;
					tH = (i + height > imgData.height) ? imgData.height - i : height;
					vol = tW * tH * 4;
					block = my.cvx.getImageData(j, i, tW, tH);
					for(var k = 0; k < vol; k += 4){
						if(block.data[k+3] > 0){
							red += block.data[k];
							grn += block.data[k+1];
							blu += block.data[k+2];
							alp += block.data[k+3];
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
			block = my.cvx.getImageData(0, 0, imgData.width, imgData.height);
			if(save){
				result = image.getImageDataUrl(block, true);
				my.img[image.name] = image.makeImage(result);
				}
			return block;
			},
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
		matrix: function(items, image){
			items = my.safeObject(items);
			var useSourceData = (my.xt(items.useSourceData)) ? items.useSourceData : false,
				addAlpha = (my.xt(items.includeAlpha)) ? items.includeAlpha : false,
				wrap = (my.isa(items.wrap, 'bool')) ? items.wrap : false,
				myArray = (my.isa(items.data,'arr')) ? items.data : [1],
				matrix = [],
				reqLen,
				matrixMid,
				matrixDim,
				matrixCenter,
				counter = 0,
				save = (my.xt(items.save)) ? items.save : true,
				imgData,
				result;
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
			imgData = my.filter.doMatrix(matrix, useSourceData, addAlpha, wrap, image);
			if(save){
				result = image.getImageDataUrl(imgData, true);
				my.img[image.name] = image.makeImage(result);
				}
			return imgData;
			},
/**
Helper function

The matrix array consists of objects with the following attributes:

* __ox__ horizontal offset from the current pixel
* __oy__ vertical offset from the current pixel
* __wt__ weighting to be used when adding the color values of the offset pixel to the resulting color for current pixel

Function used by matrix() and blur() filter functions

@method doMatrix
@param {Array} matrix Array of matrix objects
@param {Boolean} urlData image URL data
@param {Boolean} addAlpha When true, alpha values are included in the calculation
@param {Boolean} wrap When true, offset pixels that fall outside the boundaries of the image will be wrapped to the opposite end of the image row or column; when false, the offset pixels are ignored and their weightings excluded from the calculation
@return True on success; false otherwise
**/
		doMatrix: function(matrix, urlData, addAlpha, wrap, image){
			wrap = (my.isa(wrap,'bool')) ? wrap : false;
			var imgData = image.getImageData(urlData),
				data = imgData.data,
				copyData = image.getImageData(urlData),
				copy = copyData.data,
				weight = 0,
				red,
				grn,
				blu,
				alp,
				here,
				there,
				addPix;
			if(matrix.length > 0){
				for(var i = 0; i < imgData.height; i++){ //rows (y)
					for(var j = 0; j < imgData.width; j++){ //cols (x)
						red = blu = grn = alp = weight = 0;
						here = 4 * ((i * imgData.width) + j);
						for(var k = 0, z = matrix.length; k < z; k++){
							addPix = true;
							if(!my.isBetween(j + matrix[k].ox, 0, imgData.width - 1, true) || !my.isBetween(i + matrix[k].oy, 0, imgData.height - 1, true)){
								if(wrap){
									if(!my.isBetween(j + matrix[k].ox, 0, imgData.width - 1, true)){
										matrix[k].ox += (matrix[k].ox > 0) ? -imgData.width : imgData.width;
										}
									if(!my.isBetween(i + matrix[k].oy, 0, imgData.height - 1, true)){
										matrix[k].oy += (matrix[k].oy > 0) ? -imgData.height : imgData.height;
										}
									}
								else{
									addPix = false;
									}
								}
							if(addPix){
								there = here + (4 * ((matrix[k].oy * imgData.width) + matrix[k].ox));
								red += data[there] * matrix[k].wt;
								grn += data[there + 1] * matrix[k].wt;
								blu += data[there + 2] * matrix[k].wt;
								weight += matrix[k].wt;
								if(addAlpha){
									alp += data[there + 3] * matrix[k].wt;
									}
								}
							}
						copy[here] = (weight !== 0) ? red/weight : red;
						copy[here + 1] = (weight !== 0) ? grn/weight : grn;
						copy[here + 2] = (weight !== 0) ? blu/weight : blu;
						if(addAlpha){
							copy[here + 3] = (weight !== 0) ? alp/weight : alp;
							}
						}
					}
				return copyData;
				}
			return false;
			},
		};

	return my;
	}(scrawl));
