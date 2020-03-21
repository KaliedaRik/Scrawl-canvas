if (!Uint8Array.prototype.slice) {
Object.defineProperty(Uint8Array.prototype, 'slice', {
value: function (begin, end) {
return new Uint8Array(Array.prototype.slice.call(this, begin, end));
}
});
}
let packet;
let image;
let iWidth;
let data;
let cache;
let tiles;
let localX;
let localY;
let localWidth;
let localHeight;
let filters;
let filter;
let action;
onmessage = function (e) {
let i, iz;
packet = e.data;
image = packet.image;
iWidth = image.width * 4;
data = image.data;
filters = packet.filters;
getCache();
getLocal();
for (i = 0, iz = filters.length; i < iz; i++) {
filter = filters[i];
if (filter.method === 'userDefined' && filter.userDefined) actions.userDefined = new Function(filter.userDefined);
action = actions[filter.method];
if (action) action();
}
postMessage(packet);
};
onerror = function (e) {
console.log('error' + e.message);
postMessage(packet);
};
const getCache = function () {
let i, iz;
if (Array.isArray(cache)) cache.length = 0;
else cache = [];
for (i = 0, iz = data.length; i < iz; i += 4) {
if (data[i + 3]) cache.push(i);
}
};
const getLocal = function () {
let i, iz, w, h, minX, minY, maxX, maxY, x, y, val,
floor = Math.floor;
w = image.width;
h = image.height;
minX = w;
minY = h;
maxX = 0;
maxY = 0;
for (i = 0, iz = cache.length; i < iz; i++) {
val = cache[i] / 4;
y = floor(val / w);
x = val % w;
minX = (x < minX) ? x : minX;
minY = (y < minY) ? y : minY;
maxX = (x > maxX) ? x : maxX;
maxY = (y > maxY) ? y : maxY;
}
localX = minX;
localY = minY;
localWidth = maxX - minX;
localHeight = maxY - minY;
};
const getTiles = function () {
let i, iz, j, jz, x, xz, y, yz, startX, startY, pos,
hold = [],
tileWidth = filter.tileWidth || 1,
tileHeight = filter.tileHeight || 1,
offsetX = filter.offsetX,
offsetY = filter.offsetY,
w = image.width,
h = image.height;
if (Array.isArray(tiles)) tiles.length = 0;
else tiles = [];
offsetX = (offsetX >= tileWidth) ? tileWidth - 1 : offsetX;
offsetY = (offsetY >= tileHeight) ? tileHeight - 1 : offsetY;
startX = (offsetX) ? offsetX - tileWidth : 0;
startY = (offsetY) ? offsetY - tileHeight : 0;
for (j = startY, jz = h + tileHeight; j < jz; j += tileHeight) {
for (i = startX, iz = w + tileWidth; i < iz; i += tileWidth) {
hold.length = 0;
for (y = j, yz = j + tileHeight; y < yz; y++) {
if (y >= 0 && y < h) {
for (x = i, xz = i + tileWidth; x < xz; x++) {
if (x >= 0 && x < w) {
pos = (y * iWidth) + (x * 4);
if (data[pos + 3]) hold.push(pos);
}
}
}
}
if (hold.length) tiles.push([].concat(hold));
}
}
};
const average = function (c) {
let a = 0,
k, kz,
l = c.length;
if (l) {
for (k = 0, kz = l; k < kz; k++) {
a +=c[k];
}
return a / l;
}
return 0;
};
const checkBounds = function (p) {
let len = data.length;
if (p < 0) p += len;
if (p >= len) p -= len;
return p;
};
const actions = {
userDefined: function () {},
grayscale: function () {
let i, iz, pos, gray;
for (i = 0, iz = cache.length; i < iz; i++) {
pos = cache[i];
gray = (0.2126 * data[pos]) + (0.7152 * data[pos + 1]) + (0.0722 * data[pos + 2]);
data[pos] = data[pos + 1] = data[pos + 2] = gray;
}
},
sepia: function () {
let i, iz, pos, r, g, b;
for (i = 0, iz = cache.length; i < iz; i++) {
pos = cache[i];
r = data[pos];
g = data[pos + 1];
b = data[pos + 2];
data[pos] = (r * 0.393) + (g * 0.769) + (b * 0.189);
data[pos + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
data[pos + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
}
},
invert: function () {
let i, iz, pos;
for (i = 0, iz = cache.length; i < iz; i++) {
pos = cache[i];
data[pos] = 255 - data[pos];
pos++;
data[pos] = 255 - data[pos];
pos++;
data[pos] = 255 - data[pos];
}
},
red: function () {
let i, iz, pos;
for (i = 0, iz = cache.length; i < iz; i++) {
pos = cache[i];
data[pos + 1] = 0;
data[pos + 2] = 0;
}
},
green: function () {
let i, iz, pos;
for (i = 0, iz = cache.length; i < iz; i++) {
pos = cache[i];
data[pos] = 0;
data[pos + 2] = 0;
}
},
blue: function () {
let i, iz, pos;
for (i = 0, iz = cache.length; i < iz; i++) {
pos = cache[i];
data[pos] = 0;
data[pos + 1] = 0;
}
},
notred: function() {
let i, iz, pos;
for (i = 0, iz = cache.length; i < iz; i++) {
pos = cache[i];
data[pos] = 0;
}
},
notgreen: function () {
let i, iz, pos;
for (i = 0, iz = cache.length; i < iz; i++) {
pos = cache[i];
data[pos + 1] = 0;
}
},
notblue: function () {
let i, iz, pos;
for (i = 0, iz = cache.length; i < iz; i++) {
pos = cache[i];
data[pos + 2] = 0;
}
},
cyan: function () {
let i, iz, pos, gray;
for (i = 0, iz = cache.length; i < iz; i++) {
pos = cache[i];
gray = (data[pos + 1] + data[pos + 2]) / 2;
data[pos] = 0;
data[pos + 1] = gray;
data[pos + 2] = gray;
}
},
magenta: function () {
let i, iz, pos, gray;
for (i = 0, iz = cache.length; i < iz; i++) {
pos = cache[i];
gray = (data[pos] + data[pos + 2]) / 2;
data[pos] = gray;
data[pos + 1] = 0;
data[pos + 2] = gray;
}
},
yellow: function () {
let i, iz, pos, gray;
for (i = 0, iz = cache.length; i < iz; i++) {
pos = cache[i];
gray = (data[pos] + data[pos + 1]) / 2;
data[pos] = gray;
data[pos + 1] = gray;
data[pos + 2] = 0;
}
},
brightness: function () {
let i, iz, pos,
level = filter.level || 0;
for (i = 0, iz = cache.length; i < iz; i++) {
pos = cache[i];
data[pos] *= level;
pos++;
data[pos] *= level;
pos++;
data[pos] *= level;
}
},
saturation: function () {
let i, iz, pos,
level = filter.level || 0;
for (i = 0, iz = cache.length; i < iz; i++) {
pos = cache[i];
data[pos] = 127 + ((data[pos] - 127) * level);
pos++;
data[pos] = 127 + ((data[pos] - 127) * level);
pos++;
data[pos] = 127 + ((data[pos] - 127) * level);
}
},
threshold: function () {
let i, iz, pos, gray, test,
level = filter.level || 0,
lowRed = filter.lowRed,
lowGreen = filter.lowGreen,
lowBlue = filter.lowBlue,
highRed = filter.highRed,
highGreen = filter.highGreen,
highBlue = filter.highBlue;
for (i = 0, iz = cache.length; i < iz; i++) {
pos = cache[i];
gray = (0.2126 * data[pos]) + (0.7152 * data[pos + 1]) + (0.0722 * data[pos + 2]);
test = (gray > level) ? true : false;
if (test) {
data[pos] = highRed;
data[pos + 1] = highGreen;
data[pos + 2] = highBlue;
}
else {
data[pos] = lowRed;
data[pos + 1] = lowGreen;
data[pos + 2] = lowBlue;
}
}
},
channels: function () {
let i, iz, pos,
red = filter.red || 0,
green = filter.green || 0,
blue = filter.blue || 0;
for (i = 0, iz = cache.length; i < iz; i++) {
pos = cache[i];
data[pos] *= red;
data[pos + 1] *= green;
data[pos + 2] *= blue;
}
},
channelstep: function () {
let i, iz, pos,
red = filter.red || 1,
green = filter.green || 1,
blue = filter.blue || 1,
floor = Math.floor;
for (i = 0, iz = cache.length; i < iz; i++) {
pos = cache[i];
data[pos] = floor(data[pos] / red) * red;
pos++;
data[pos] = floor(data[pos] / green) * green;
pos++;
data[pos] = floor(data[pos] / blue) * blue;
}
},
tint: function () {
let i, iz, pos, r, g, b,
redInRed = filter.redInRed || 0,
redInGreen = filter.redInGreen || 0,
redInBlue = filter.redInBlue || 0,
greenInRed = filter.greenInRed || 0,
greenInGreen = filter.greenInGreen || 0,
greenInBlue = filter.greenInBlue || 0,
blueInRed = filter.blueInRed || 0,
blueInGreen = filter.blueInGreen || 0,
blueInBlue = filter.blueInBlue || 0;
for (i = 0, iz = cache.length; i < iz; i++) {
pos = cache[i];
r = data[pos];
g = data[pos + 1];
b = data[pos + 2];
data[pos] = (r * redInRed) + (g * greenInRed) + (b * blueInRed);
data[pos + 1] = (r * redInGreen) + (g * greenInGreen) + (b * blueInGreen);
data[pos + 2] = (r * redInBlue) + (g * greenInBlue) + (b * blueInBlue);
}
},
chroma: function () {
let pos, posA,
ranges = filter.ranges,
range, min, max, val,
i, iz, j, jz, flag;
for (j = 0, jz = cache.length; j < jz; j++) {
flag = false;
for (i = 0, iz = ranges.length; i < iz; i++) {
posA = cache[j] + 3;
range = ranges[i];
min = range[2];
pos = posA - 1;
val = data[pos];
if (val >= min) {
max = range[5];
if (val <= max) {
min = range[1];
pos--;
val = data[pos];
if (val >= min) {
max = range[4];
if (val <= max) {
min = range[0];
pos--;
val = data[pos];
if (val >= min) {
max = range[3];
if (val <= max) {
flag = true;
break;
}
}
}
}
}
}
}
if (flag) data[posA] = 0;
}
},
pixelate: function () {
let i, iz, j, jz, pos, r, g, b, a, tile, len;
getTiles();
for (i = 0, iz = tiles.length; i < iz; i++) {
tile = tiles[i];
r = g = b = a = 0;
len = tile.length;
if (len) {
for (j = 0, jz = len; j < jz; j++) {
pos = tile[j];
r += data[pos];
g += data[pos + 1];
b += data[pos + 2];
a += data[pos + 3];
}
r /= len;
g /= len;
b /= len;
a /= len;
for (j = 0, jz = len; j < jz; j++) {
pos = tile[j];
data[pos] = r;
data[pos + 1] = g;
data[pos + 2] = b;
data[pos + 3] = a;
}
}
}
},
blur: function () {
if (data.slice) {
let radius = filter.radius || 1,
alpha = filter.includeAlpha || false,
shrink = filter.shrinkingRadius || false,
passes = filter.passes || 1,
len = data.length,
imageWidth = image.width,
imageHeight = image.height,
tempDataTo, tempDataFrom,
i, iz, index;
let processPass = function () {
let j, jz;
tempDataFrom = tempDataTo.slice();
for (j = localX * 4, jz = (localX + localWidth) * 4; j < jz; j++) {
if (alpha) processColumn(j);
else {
if (j % 4 !== 3) processColumn(j);
}
}
tempDataFrom = tempDataTo.slice();
for (j = localY, jz = localY + localHeight; j < jz; j++) {
if (alpha) processRowWithAlpha(j);
else processRowNoAlpha(j);
}
};
let processColumn = function (col) {
let pos, avg, val, cagePointer, y, yz, q, dataPointer,
vLead = radius * iWidth,
cage = [],
cageLen;
for (y = -radius, yz = radius; y < yz; y++) {
pos = col + (y * iWidth);
pos = checkBounds(pos, len);
cage.push(tempDataFrom[pos]);
}
tempDataTo[col] = avg = average(cage);
cageLen = cage.length;
for (q = 0; q < cageLen; q++) {
cage[q] /= cageLen;
}
cagePointer = 0;
for (y = 1; y < imageHeight; y++) {
avg -= cage[cagePointer];
dataPointer = col + (y * iWidth);
pos = dataPointer + vLead;
pos = checkBounds(pos, len);
val = tempDataFrom[pos] / cageLen;
avg += val;
cage[cagePointer] = val;
tempDataTo[dataPointer] = avg;
cagePointer++;
if (cagePointer === cageLen) cagePointer = 0;
}
};
let processRowWithAlpha = function (row) {
let pos, val, x, xz, q, avgQ, cageQ, rowPosX,
avg = [],
cage = [[], [], [], []],
rowPos = row * iWidth,
hLead = radius * 4,
dataPointer, cagePointer, cageLen;
q = 0;
for (x = -radius * 4, xz = radius * 4; x < xz; x++) {
pos = rowPos + x;
pos = checkBounds(pos, len);
cage[q].push(tempDataFrom[pos]);
q++;
if (q === 4) q = 0;
}
tempDataTo[rowPos] = avg[0] = average(cage[0]);
tempDataTo[rowPos + 1] = avg[1] = average(cage[1]);
tempDataTo[rowPos + 2] = avg[2] = average(cage[2]);
tempDataTo[rowPos + 3] = avg[3] = average(cage[3]);
cageLen = cage[0].length;
for (q = 0; q < 4; q++) {
for (x = 0; x < cageLen; x++) {
cage[q][x] /= cageLen;
}
}
cagePointer = 0;
for (x = 1; x < imageHeight; x++) {
rowPosX = rowPos + (x * 4);
for (q = 0; q < 4; q++) {
avgQ = avg[q];
cageQ = cage[q];
avgQ -= cageQ[cagePointer];
dataPointer = rowPosX + q;
pos = dataPointer + hLead;
pos = checkBounds(pos, len);
val = tempDataFrom[pos] / cageLen;
avgQ += val;
tempDataTo[dataPointer] = avgQ;
avg[q] = avgQ;
cageQ[cagePointer] = val;
}
cagePointer++;
if (cagePointer === cageLen) cagePointer = 0;
}
};
let processRowNoAlpha = function (row) {
let pos, val, x, xz, q, avgQ, cageQ, rowPosX,
avg = [],
hLead = radius * 4,
cage = [[], [], []],
rowPos = row * iWidth,
dataPointer, cagePointer, cageLen;
q = 0;
for (x = -radius * 4, xz = radius * 4; x < xz; x++) {
if (q < 3) {
pos = rowPos + x;
pos = checkBounds(pos, len);
cage[q].push(tempDataFrom[pos]);
q++;
}
else q = 0;
}
tempDataTo[rowPos] = avg[0] = average(cage[0]);
tempDataTo[rowPos + 1] = avg[1] = average(cage[1]);
tempDataTo[rowPos + 2] = avg[2] = average(cage[2]);
cageLen = cage[0].length;
for (q = 0; q < 3; q++) {
cageQ = cage[q];
for (x = 0; x < cageLen; x++) {
cageQ[x] /= cageLen;
}
}
cagePointer = 0;
for (x = 1; x < imageHeight; x++) {
rowPosX = rowPos + (x * 4);
for (q = 0; q < 3; q++) {
avgQ = avg[q];
cageQ = cage[q];
avgQ -= cageQ[cagePointer];
dataPointer = rowPosX + q;
pos = dataPointer + hLead;
pos = checkBounds(pos, len);
val = tempDataFrom[pos] / cageLen;
avgQ += val;
tempDataTo[dataPointer] = avgQ;
avg[q] = avgQ;
cageQ[cagePointer] = val;
}
cagePointer++;
if (cagePointer === cageLen) cagePointer = 0;
}
};
tempDataTo = data.slice();
for (i = 0; i < passes; i++) {
processPass();
if (shrink) {
radius = Math.ceil(radius * 0.3);
radius = (radius < 1) ? 1 : radius;
}
}
for (i = 0, iz = cache.length; i < iz; i++) {
index = cache[i];
data[index] = tempDataTo[index];
index++;
data[index] = tempDataTo[index];
index++;
data[index] = tempDataTo[index];
if (alpha) {
index++;
data[index] = tempDataTo[index];
}
}
}
},
matrix: function () {
let i, iz, j, jz, pos, weight, sumR, sumG, sumB, sumA, homePos,
len = data.length,
alpha = filter.includeAlpha || false,
offset = [],
weights = filter.weights || [0, 0, 0, 0, 1, 0, 0, 0, 0],
tempCache = [],
cursor = 0;
offset[0] = -iWidth - 4;
offset[1] = -iWidth;
offset[2] = -iWidth + 4;
offset[3] = -4;
offset[4] = 0;
offset[5] = 4;
offset[6] = iWidth - 4;
offset[7] = iWidth;
offset[8] = iWidth + 4;
for (i = 0, iz = cache.length; i < iz; i++) {
homePos = cache[i];
sumR = sumG = sumB = sumA = 0;
for (j = 0, jz = offset.length; j < jz; j++) {
pos = homePos + offset[j];
if (pos >= 0 && pos < len) {
weight = weights[j];
sumR += data[pos] * weight;
pos++;
sumG += data[pos] * weight;
pos++;
sumB += data[pos] * weight;
if (alpha) {
pos++;
sumA += data[pos] * weight;
}
}
}
tempCache[cursor] = sumR;
cursor++;
tempCache[cursor] = sumG;
cursor++;
tempCache[cursor] = sumB;
cursor++;
if (alpha) {
tempCache[cursor] = sumA;
cursor++;
}
}
cursor = 0;
for (i = 0, iz = cache.length; i < iz; i++) {
homePos = cache[i];
data[homePos] = tempCache[cursor];
cursor++;
homePos++;
data[homePos] = tempCache[cursor];
cursor++;
homePos++;
data[homePos] = tempCache[cursor];
cursor++;
if (alpha) {
homePos++;
data[homePos] = tempCache[cursor];
cursor++;
}
}
},
matrix5: function () {
let i, iz, j, jz, pos, weight, sumR, sumG, sumB, sumA, homePos,
len = data.length,
alpha = filter.includeAlpha || false,
offset = [],
weights = filter.weights || [0, 0, 0, 0, 0,  0, 0, 0, 0, 0,  0, 0, 1, 0, 0,  0, 0, 0, 0, 0,  0, 0, 0, 0, 0],
tempCache = [],
iWidth2 = iWidth * 2,
cursor = 0;
offset[0] = -iWidth2 - 8;
offset[1] = -iWidth2 - 4;
offset[2] = -iWidth2;
offset[3] = -iWidth2 + 4;
offset[4] = -iWidth2 + 8;
offset[5] = -iWidth - 8;
offset[6] = -iWidth - 4;
offset[7] = -iWidth;
offset[8] = -iWidth + 4;
offset[9] = -iWidth + 8;
offset[10] = -8;
offset[11] = -4;
offset[12] = 0;
offset[13] = 4;
offset[14] = 8;
offset[15] = iWidth - 8;
offset[16] = iWidth - 4;
offset[17] = iWidth;
offset[18] = iWidth + 4;
offset[19] = iWidth + 8;
offset[20] = iWidth2 - 8;
offset[21] = iWidth2 - 4;
offset[22] = iWidth2;
offset[23] = iWidth2 + 4;
offset[24] = iWidth2 + 8;
for (i = 0, iz = cache.length; i < iz; i++) {
homePos = cache[i];
sumR = sumG = sumB = sumA = 0;
for (j = 0, jz = offset.length; j < jz; j++) {
pos = homePos + offset[j];
if (pos >= 0 && pos < len) {
weight = weights[j];
sumR += data[pos] * weight;
pos++;
sumG += data[pos] * weight;
pos++;
sumB += data[pos] * weight;
if (alpha) {
pos++;
sumA += data[pos] * weight;
}
}
}
tempCache[cursor] = sumR;
cursor++;
tempCache[cursor] = sumG;
cursor++;
tempCache[cursor] = sumB;
cursor++;
if (alpha) {
tempCache[cursor] = sumA;
cursor++;
}
}
cursor = 0;
for (i = 0, iz = cache.length; i < iz; i++) {
homePos = cache[i];
data[homePos] = tempCache[cursor];
cursor++;
homePos++;
data[homePos] = tempCache[cursor];
cursor++;
homePos++;
data[homePos] = tempCache[cursor];
cursor++;
if (alpha) {
homePos++;
data[homePos] = tempCache[cursor];
cursor++;
}
}
},
};
