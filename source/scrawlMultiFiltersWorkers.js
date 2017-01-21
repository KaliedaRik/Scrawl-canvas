//---------------------------------------------------------------------------------
// The MIT License (MIT)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//---------------------------------------------------------------------------------


// NOTE - for use as the workers script

var Filter = function Filter(items) {
	items = (Object.prototype.toString.call(items) === '[object Object]') ? items : {};
	this.id = this.get(items.id, '');
	this.name = get(items.name, 'generic');
	this.species = this.get(items.species, 'undefined');
	this.level = this.get(items.level, 0);
	this.red = this.get(items.red, 0);
	this.green = this.get(items.green, 0);
	this.blue = this.get(items.blue, 0);
	this.redInRed = this.get(items.redInRed, 0);
	this.redInGreen = this.get(items.redInGreen, 0);
	this.redInBlue = this.get(items.redInBlue, 0);
	this.greenInRed = this.get(items.greenInRed, 0);
	this.greenInGreen = this.get(items.greenInGreen, 0);
	this.greenInBlue = this.get(items.greenInBlue, 0);
	this.blueInRed = this.get(items.blueInRed, 0);
	this.blueInGreen = this.get(items.blueInGreen, 0);
	this.blueInBlue = this.get(items.blueInBlue, 0);
	this.offsetX = this.get(items.offsetX, 0);
	this.offsetY = this.get(items.offsetY, 0);
	this.blockWidth = this.get(items.blockWidth, 0);
	this.blockHeight = this.get(items.blockHeight, 0);
	this.weights = this.get(items.weights, []);
	this.normalize = this.get(items.normalize, false);
	this.radius = this.get(items.radius, 0);
	this.wrap = this.get(items.wrap, false);
	this.currentWidth = this.get(items.currentWidth, 0);
	this.currentHeight = this.get(items.currentHeight, 0);
	this.currentGrid = this.get(items.currentGrid, 0);
	return this;
};
Filter.prototype = Object.create(Object.prototype);
Filter.prototype.set = function(items){
	items = (Object.prototype.toString.call(items) === '[object Object]') ? items : {};
	for (var i in items) {
		if (typeof this[i] != 'undefined') {
			this[i] = items[i];
		}
	}
	return this;
};
Filter.prototype.checkCache = {
	pixelate: function(){
		var cache = this.cache,
			rows, h, cols, w, ceil,
			x, y,
			multi, get, c,
			i, j, x1, x2, y1, y2;

		if(!cache){
		// 	multi = my.multifilter[this.multiFilter];
		// 	if(multi){
				w = this.blockWidth || 1;
				h = this.blockHeight || 1;
				ceil = Math.ceil;
				cols = ceil(this.currentWidth / w);
				rows = ceil(this.currentHeight / h);

				x = this.offsetX || 0;
				x = (x > w) ? 0 : x;
				y = this.offsetY || 0;
				y = (y > h) ? 0 : y;

				cache = [];
				c = 0;
				get = this.getIndexes;

				for(i = -1; i < rows; i++){
					for(j = -1; j < cols; j++){
						y1 = (i * h) + y;
						x1 = (j * w) + x;
						y2 = y1 + h;
						x2 = x1 + w;
						// cache[c] = get.call(multi, x1, y1, x2, y2);
						cache[c] = get(x1, y1, x2, y2);
						c++;
					}
				}
				this.cache = cache;
		// 	}
		}
	},
	matrix: function(){
		var cache = this.cache,
			multi, get, c, wrap,
			w, cw, h, ch, x, y,
			i, j, x1, x2, y1, y2;

		if(!cache){
		// 	multi = my.multifilter[this.multiFilter];
		// 	if(multi){
				w = this.blockWidth || 1;
				h = this.blockHeight || 1;
				x = this.offsetX || 0;
				y = this.offsetY || 0;
				wrap = this.wrap || false;
				cw = this.currentWidth;
				ch = this.currentHeight;

				cache = [];
				c = 0;
				get = (wrap) ? this.getWrappedIndexes : this.getIndexes;

				for(i = 0; i < ch; i++){
					for(j = 0; j < cw; j++){
						y1 = i + y;
						x1 = j + x;
						y2 = y1 + h;
						x2 = x1 + w;
						// cache[c] = get.call(multi, x1, y1, x2, y2);
						cache[c] = get(x1, y1, x2, y2);
						c++;
					}
				}
				this.cache = cache;
		// 	}
		// }
	},
	blur: function(){
		var cache = this.cache,
			multi, get, c, wrap,
			w, cw, h, ch, x, y, r,
			i, j, x1, x2, y1, y2, 
			wt, weights;

		if(!cache){
		// 	multi = my.multifilter[this.multiFilter];
		// 	if(multi){
				r = this.radius || 0;
				wrap = this.wrap || false;
				cw = this.currentWidth;
				ch = this.currentHeight;

				cache = [];
				cache[0] = [];
				cache[1] = [];
				get = (wrap) ? this.getWrappedIndexes : this.getIndexes;

				// horizontal sweep
				c = 0;
				w = (r * 2) + 1;
				h = 1;
				x = -r;
				y = 0;
				for(i = 0; i < ch; i++){
					for(j = 0; j < cw; j++){
						y1 = i + y;
						x1 = j + x;
						y2 = y1 + h;
						x2 = x1 + w;
						cache[0][c] = get(x1, y1, x2, y2);
						c++;
					}
				}

				// vertical sweep
				c = 0;
				w = 1;
				h = (r * 2) + 1;
				x = 0;
				y = -r;
				for(i = 0; i < ch; i++){
					for(j = 0; j < cw; j++){
						y1 = i + y;
						x1 = j + x;
						y2 = y1 + h;
						x2 = x1 + w;
						cache[1][c] = get(x1, y1, x2, y2);
						c++;
					}
				}
				this.cache = cache;

				wt = 1 / h;
				weights = [];
				for(i = 0; i < h; i++){
					weights.push(wt);
				}
				this.weights = weights;
		// 	}
		}
	},
};
Filter.prototype.defs = {
	default: function(data){},
	grayscale: function(data){
		var len, posR, posG, posB, posA, gray;

		for(posA = 3, len = data.length; posA < len; posA +=4){
			if(data[posA]){
				posR = posA - 3;
				posG = posA - 2;
				posB = posA - 1;
				gray = (0.2126 * data[posR]) + (0.7152 * data[posG]) + (0.0722 * data[posB]);
				data[posR] = gray;
				data[posG] = gray;
				data[posB] = gray;
			}
		}
	},
	sepia: function(data){
		var len, posR, posG, posB, posA,
			r, g, b, red, green, blue;

		for(posA = 3, len = data.length; posA < len; posA +=4){
			if(data[posA]){
				posR = posA - 3;
				posG = posA - 2;
				posB = posA - 1;
				r = data[posR];
				g = data[posG];
				b = data[posB];
				red = (r * 0.393) + (g * 0.769) + (b * 0.189);
				green = (r * 0.349) + (g * 0.686) + (b * 0.168);
				blue = (r * 0.272) + (g * 0.534) + (b * 0.131);
				data[posR] = red;
				data[posG] = green;
				data[posB] = blue;
			}
		}
	},
	invert: function(data){
		var len, posR, posG, posB, posA;

		for(posA = 3, len = data.length; posA < len; posA +=4){
			if(data[posA]){
				posR = posA - 3;
				posG = posA - 2;
				posB = posA - 1;
				data[posR] = 256 - data[posR];
				data[posG] = 256 - data[posG];
				data[posB] = 256 - data[posB];
			}
		}
	},
	red: function(data){
		var len, posG, posB, posA;

		for(posA = 3, len = data.length; posA < len; posA +=4){
			if(data[posA]){
				posG = posA - 2;
				posB = posA - 1;
				data[posG] = 0;
				data[posB] = 0;
			}
		}
	},
	green: function(data){
		var len, posR, posB, posA;

		for(posA = 3, len = data.length; posA < len; posA +=4){
			if(data[posA]){
				posR = posA - 3;
				posB = posA - 1;
				data[posR] = 0;
				data[posB] = 0;
			}
		}
	},
	blue: function(data){
		var len, posR, posG, posA;

		for(posA = 3, len = data.length; posA < len; posA +=4){
			if(data[posA]){
				posR = posA - 3;
				posG = posA - 2;
				data[posR] = 0;
				data[posG] = 0;
			}
		}
	},
	notred: function(data){
		var len, posR;

		for(posR = 0, len = data.length; posR < len; posR +=4){
			data[posR] = 0;
		}
	},
	notgreen: function(data){
		var len, posG;

		for(posG = 1, len = data.length; posG < len; posG +=4){
			data[posG] = 0;
		}
	},
	notblue: function(data){
		var len, posB;

		for(posB = 2, len = data.length; posB < len; posB +=4){
			data[posB] = 0;
		}
	},
	cyan: function(data){
		var len, posR, posG, posB, posA, gray;

		for(posA = 3, len = data.length; posA < len; posA +=4){
			if(data[posA]){
				posR = posA - 3;
				posG = posA - 2;
				posB = posA - 1;
				gray = (data[posG] + data[posB]) / 2;
				data[posR] = 0;
				data[posG] = gray;
				data[posB] = gray;
			}
		}
	},
	magenta: function(data){
		var len, posR, posG, posB, posA, gray;

		for(posA = 3, len = data.length; posA < len; posA +=4){
			if(data[posA]){
				posR = posA - 3;
				posG = posA - 2;
				posB = posA - 1;
				gray = (data[posR] + data[posB]) / 2;
				data[posR] = gray;
				data[posG] = 0;
				data[posB] = gray;
			}
		}
	},
	yellow: function(data){
		var len, posR, posG, posB, posA, gray;

		for(posA = 3, len = data.length; posA < len; posA +=4){
			if(data[posA]){
				posR = posA - 3;
				posG = posA - 2;
				posB = posA - 1;
				gray = (data[posG] + data[posR]) / 2;
				data[posR] = gray;
				data[posG] = gray;
				data[posB] = 0;
			}
		}
	},
	brightness: function(data){
		var len, posR, posG, posB, posA,
			level = this.level || 0;

		for(posA = 3, len = data.length; posA < len; posA +=4){
			if(data[posA]){
				posR = posA - 3;
				posG = posA - 2;
				posB = posA - 1;
				data[posR] *= level;
				data[posG] *= level;
				data[posB] *= level;
			}
		}
	},
	saturation: function(data){
		var len, posR, posG, posB, posA,
			level = this.level || 0;

		for(posA = 3, len = data.length; posA < len; posA +=4){
			if(data[posA]){
				posR = posA - 3;
				posG = posA - 2;
				posB = posA - 1;
				data[posR] = 127 + ((data[posR] - 127) * level);
				data[posG] = 127 + ((data[posG] - 127) * level);
				data[posB] = 127 + ((data[posB] - 127) * level);
			}
		}
	},
	threshold: function(data){
		var len, posR, posG, posB, posA, gray,
			level = this.level || 0;

		for(posA = 3, len = data.length; posA < len; posA +=4){
			if(data[posA]){
				posR = posA - 3;
				posG = posA - 2;
				posB = posA - 1;
				gray = (0.2126 * data[posR]) + (0.7152 * data[posG]) + (0.0722 * data[posB]);
				gray = (gray > level) ? 255 : 0;
				data[posR] = gray;
				data[posG] = gray;
				data[posB] = gray;
			}
		}
	},
	channels: function(data){
		var len, posR, posG, posB, posA,
			red = this.red || 0,
			green = this.green || 0,
			blue = this.blue || 0;

		for(posA = 3, len = data.length; posA < len; posA +=4){
			if(data[posA]){
				posR = posA - 3;
				posG = posA - 2;
				posB = posA - 1;
				data[posR] *= red;
				data[posG] *= green;
				data[posB] *= blue;
			}
		}
	},
	channelstep: function(data){
		var len, posR, posG, posB, posA,
			red = this.red || 1,
			green = this.green || 1,
			blue = this.blue || 1,
			floor = Math.floor;

		for(posA = 3, len = data.length; posA < len; posA +=4){
			if(data[posA]){
				posR = posA - 3;
				posG = posA - 2;
				posB = posA - 1;
				data[posR] = floor(data[posR] / red) * red;
				data[posG] = floor(data[posG] / green) * green;
				data[posB] = floor(data[posB] / blue) * blue;
			}
		}
	},
	tint: function(data){
		var len, posR, posG, posB, posA, r, g, b,
			redInRed = this.redInRed || 0,
			redInGreen = this.redInGreen || 0,
			redInBlue = this.redInBlue || 0,
			greenInRed = this.greenInRed || 0,
			greenInGreen = this.greenInGreen || 0,
			greenInBlue = this.greenInBlue || 0,
			blueInRed = this.blueInRed || 0,
			blueInGreen = this.blueInGreen || 0,
			blueInBlue = this.blueInBlue || 0;

		for(posA = 3, len = data.length; posA < len; posA += 4){
			if(data[posA]){
				posR = posA - 3;
				posG = posA - 2;
				posB = posA - 1;
				r = data[posR];
				g = data[posG];
				b = data[posB];
				data[posR] = (r * redInRed) + (g * greenInRed) + (b * blueInRed);
				data[posG] = (r *redInGreen) + (g * greenInGreen) + (b * blueInGreen);
				data[posB] = (r * redInBlue) + (g * greenInBlue) + (b * blueInBlue);
			}
		}
	},
	pixelate: function(data){
		var cache = this.cache,
			cachelen = cache.length,
			red, green, blue, 
			posR, posG, posB, posA,
			alphas, counter, len,
			k, c;

		for(c = 0; c < cachelen; c++){
			alphas = cache[c];
			len = alphas.length;
			red = green = blue = counter = 0;

			for(k = 0; k < len; k++){
				posA = alphas[k];
				if(data[posA]){
					counter++;
					posR = posA - 3;
					posG = posA - 2;
					posB = posA - 1;
					red += data[posR];
					green += data[posG];
					blue += data[posB];
				}
			}
			if(counter > 0){
				red /= counter;
				green /= counter;
				blue /= counter;
				for(k = 0; k < len; k++){
					posA = alphas[k];
					if(data[posA]){
						posR = posA - 3;
						posG = posA - 2;
						posB = posA - 1;
						data[posR] = red;
						data[posG] = green;
						data[posB] = blue;
					}
				}
			}
		}
	},
	matrix: function(data){
		var cache = this.cache,
			datalen = data.length,
			red, green, blue, 
			posR, posG, posB, posA, localA,
			alphas, len,
			weights = this.weights,
			norm = this.normalize || false,
			wt, k, c, total, temp;

		if(weights.length){
			temp = data.slice();
			for(posA = 3, c = 0; posA < datalen; posA +=4, c++){
				if(data[posA]){
					alphas = cache[c];
					len = alphas.length;
					red = green = blue = total = 0;

					for(k = 0; k < len; k++){
						localA = alphas[k];
						if(weights[k] && temp[localA]){
							wt = weights[k]
							posR = localA - 3;
							posG = localA - 2;
							posB = localA - 1;
							red += temp[posR] * wt;
							green += temp[posG] * wt;
							blue += temp[posB] * wt;
							total += wt;
						}
					}
					if(norm && total){
						red /= total;
						green /= total;
						blue /= total;
					}
					posR = posA - 3;
					posG = posA - 2;
					posB = posA - 1;
					data[posR] = red;
					data[posG] = green;
					data[posB] = blue;
				}
			}
		}
	},
	blur: function(data){
		var cache,
			datalen = data.length,
			red, green, blue, 
			posR, posG, posB, posA, localA,
			alphas, len,
			weights = this.weights,
			norm = this.normalize || false,
			wt, k, c, total, temp;

		if(weights.length){
			cache = this.cache[0],
			temp = data.slice();
			for(posA = 3, c = 0; posA < datalen; posA +=4, c++){
				if(data[posA]){
					alphas = cache[c];
					len = alphas.length;
					red = green = blue = total = 0;

					for(k = 0; k < len; k++){
						localA = alphas[k];
						if(weights[k] && temp[localA]){
							wt = weights[k]
							posR = localA - 3;
							posG = localA - 2;
							posB = localA - 1;
							red += temp[posR] * wt;
							green += temp[posG] * wt;
							blue += temp[posB] * wt;
							total += wt;
						}
					}
					if(norm && total){
						red /= total;
						green /= total;
						blue /= total;
					}
					posR = posA - 3;
					posG = posA - 2;
					posB = posA - 1;
					data[posR] = red;
					data[posG] = green;
					data[posB] = blue;
				}
			}

			cache = this.cache[1],
			temp = data.slice();
			for(posA = 3, c = 0; posA < datalen; posA +=4, c++){
				if(data[posA]){
					alphas = cache[c];
					len = alphas.length;
					red = green = blue = total = 0;

					for(k = 0; k < len; k++){
						localA = alphas[k];
						if(weights[k] && temp[localA]){
							wt = weights[k]
							posR = localA - 3;
							posG = localA - 2;
							posB = localA - 1;
							red += temp[posR] * wt;
							green += temp[posG] * wt;
							blue += temp[posB] * wt;
							total += wt;
						}
					}
					if(norm && total){
						red /= total;
						green /= total;
						blue /= total;
					}
					posR = posA - 3;
					posG = posA - 2;
					posB = posA - 1;
					data[posR] = red;
					data[posG] = green;
					data[posB] = blue;
				}
			}
		}
	},
};
Filter.prototype.getIndexes = function(col1, row1, col2, row2) {
	var result,
		w = this.currentWidth,
		h = this.currentHeight,
		grid = this.currentGrid,
		i, j, temp, lw, lh, r, c;

	if(row1 > row2){
		temp = row1;
		row1 = row2;
		row2 = temp;
	}
	if(col1 > col2){
		temp = col1;
		col1 = col2;
		col2 = temp;
	}
	row1 = (row1 < 0) ? 0 : row1;
	col1 = (col1 < 0) ? 0 : col1;
	row2 = (row2 >= h) ? h - 1 : row2;
	col2 = (col2 >= w) ? w - 1 : col2;

	if(row2 < 0 || col2 < 0 || row1 >= h || col1 >= w){
		return [];
	}

	lw = col2 - col1;
	lh = row2 - row1;
	result = [];

	for(i = 0; i < lh; i++){
		for(j = 0; j < lw; j++){
			r = row1 + i;
			c = col1 + j;
			temp = (i * lw) + j;
			result[temp] = grid[r][c];
		}
	}

	return result;
};
Filter.prototype.getWrappedIndexes = function(col1, row1, col2, row2) {
	var result,
		w = this.currentWidth,
		h = this.currentHeight,
		grid = this.currentGrid,
		i, j, temp, lw, lh, r, c;

	if(row1 > row2){
		temp = row1;
		row1 = row2;
		row2 = temp;
	}
	if(col1 > col2){
		temp = col1;
		col1 = col2;
		col2 = temp;
	}

	if(row2 < 0 || col2 < 0 || row1 >= h || col1 >= w){
		return [];
	}

	lw = col2 - col1;
	lh = row2 - row1;
	result = [];

	for(i = 0; i < lh; i++){
		for(j = 0; j < lw; j++){
			r = row1 + i;
			c = col1 + j;
			if(r < 0 || r >= h){
				r = (r < 0) ? r + h : r - h;
			}
			if(c < 0 || c >= w){
				c = (c < 0) ? c + w : c - w;
			}
			temp = (i * lw) + j;
			result[temp] = grid[r][c];
		}
	}

	return result;
};
Filter.prototype.get = function() {
	var slice,
		i,
		iz;
	if (arguments.length > 0) {
		for (i = 0, iz = arguments.length; i < iz; i++) {
			if (typeof arguments[i] !== 'undefined') {
				return arguments[i];
			}
		}
	}
	return null;
};
