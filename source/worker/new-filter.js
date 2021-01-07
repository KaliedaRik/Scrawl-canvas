// # Filter worker
// A long-running web worker which, when not in use, gets stored in the filter pool defined in the [filter factory](../factory/filter.html)
//
// TODO: documentation


// #### Demos:
// + TODO: list demos with links


// #### Imports
// None used


let packet, packetImageObject, imageData, packetFiltersArray;

let source,
    work,
    interim,
    actions;

const createResultObject = function (len) {

    return {
        r: new Uint8ClampedArray(len),
        g: new Uint8ClampedArray(len),
        b: new Uint8ClampedArray(len),
        a: new Uint8ClampedArray(len),
    };
};

const unknit = function() {

    imageData = packetImageObject.data;

    let len = Math.floor(imageData.length / 4);


    source = createResultObject(len);

    let sourceRed = source.r,
        sourceGreen = source.g,
        sourceBlue = source.b,
        sourceAlpha = source.a;

    work = createResultObject(len);

    let workRed = work.r,
        workGreen = work.g,
        workBlue = work.b,
        workAlpha = work.a;

    let counter = 0;

    for (let i = 0, iz = imageData.length; i < iz; i += 4) {

        sourceRed[counter] = imageData[i];
        sourceGreen[counter] = imageData[i + 1];
        sourceBlue[counter] = imageData[i + 2];
        sourceAlpha[counter] = imageData[i + 3];

        workRed[counter] = imageData[i];
        workGreen[counter] = imageData[i + 1];
        workBlue[counter] = imageData[i + 2];
        workAlpha[counter] = imageData[i + 3];

        counter++;
    }
};

const knit = function () {

    let workRed = work.r,
        workGreen = work.g,
        workBlue = work.b,
        workAlpha = work.a;

    let counter = 0;

    for (let i = 0, iz = imageData.length; i < iz; i += 4) {

        imageData[i] = workRed[counter];
        imageData[i + 1] = workGreen[counter];
        imageData[i + 2] = workBlue[counter];
        imageData[i + 3] = workAlpha[counter];

        counter++;
    }
};


// #### Messaging and error handling
onmessage = function (msg) {

/*
msg contains a data attribute, representing the message packet, with the following structure:

{
    image: {
        width: Number
        height: Number
        data: []
    },
    filters: [] - Array
}

We need to amend the msg.img.data Array in line with the requirements set out in the filters Array and return the entire packet.

We need to respect existing filter requests, while converting them to use the new ways

*/

    packet = msg.data;
    packetImageObject = packet.image;
    packetFiltersArray = packet.filters;

    // console.log(packet.image.data[0], packet.image.data[1], packet.image.data[2], packet.image.data[3])

    if (packetImageObject) {

        interim = {};
        actions = [];

        packetFiltersArray.forEach(f => {

            if (!f.actions.length && thePreprocessObject[f.method]) thePreprocessObject[f.method](f);
            actions.push(...f.actions);
        });

        if (actions.length) {

            unknit();

            actions.forEach(a => {

                if (theBigActionsObject[a.action]) theBigActionsObject[a.action](a);
            });

            knit();
        }
    }

    postMessage(packet);
};

onerror = function (e) {

    console.log('error' + e.message);
    postMessage(packet);
};

const getInputAndOutputObjects = function (requirements) {

    // we default the input to the work channel
    let input = work;

    if (requirements.in) {

        // the requirements can ask us to use the original source as the input
        if (requirements.in == 'source') input = source;

        // or it may need to act on the results of a previous action
        else if (interim[requirements.in]) input = interim[requirements.in];
    }

    // store the results in a temporary object - because we're now including opacity which means the end result will need to merge with the existing work object
    let output = createResultObject(input.r.length);

// console.log('getInputAndOutputObjects', requirements.in, work.r[0], source.r[0], input.r[0]);

    return [input, output];
};

const cacheOutput = function (name, obj, caller) {
    if (interim[name]) throw new Error('Duplicate name encountered when trying to cache output from', caller);
    interim[name] = obj;
};

const processResults = function (store, incoming, ratio) {

    let sR = store.r,
        sG = store.g,
        sB = store.b,
        sA = store.a;

    let iR = incoming.r,
        iG = incoming.g,
        iB = incoming.b,
        iA = incoming.a;

    if (ratio === 1) {

        for (let i = 0, iz = sR.length; i < iz; i++) {

            sR[i] = iR[i];
            sG[i] = iG[i];
            sB[i] = iB[i];
            sA[i] = iA[i];
        }
    }
    else if (ratio > 0) {

        antiRatio = 1 - ratio;

        for (let i = 0, iz = sR.length; i < iz; i++) {

            sR[i] = Math.floor((sR[i] * antiRatio) + (iR[i] * ratio));
            sG[i] = Math.floor((sG[i] * antiRatio) + (iG[i] * ratio));
            sB[i] = Math.floor((sB[i] * antiRatio) + (iB[i] * ratio));
            sA[i] = Math.floor((sA[i] * antiRatio) + (iA[i] * ratio));
        }
    }
};


const theBigActionsObject = {

    'average-channels': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, includeRed, includeGreen, includeBlue, excludeRed, excludeGreen, excludeBlue, out} = requirements;

        let divisor = 0;
        if (includeRed) divisor++;
        if (includeGreen) divisor++;
        if (includeBlue) divisor++;

        let inR = input.r,
            inG = input.g,
            inB = input.b,
            inA = input.a;

        let outR = output.r,
            outG = output.g,
            outB = output.b,
            outA = output.a;

        for (let i = 0; i < len; i++) {

            if (inA[i]) {

                if (divisor) {

                    let avg = 0;

                    if (includeRed) avg += inR[i];
                    if (includeGreen) avg += inG[i];
                    if (includeBlue) avg += inB[i];

                    avg = Math.floor(avg / divisor);

                    outR[i] = (excludeRed) ? 0 : avg;
                    outG[i] = (excludeGreen) ? 0 : avg;
                    outB[i] = (excludeBlue) ? 0 : avg;
                    outA[i] = inA[i];
                }
                else {
    
                    outR[i] = (excludeRed) ? 0 : inR[i];
                    outG[i] = (excludeGreen) ? 0 : inG[i];
                    outB[i] = (excludeBlue) ? 0 : inB[i];
                    outA[i] = inA[i];
                }
            }
            else {

                outR[i] = inR[i];
                outG[i] = inG[i];
                outB[i] = inB[i];
                outA[i] = inA[i];
            }
        }
        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'channels-to-alpha': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, includeRed, includeGreen, includeBlue, out} = requirements;

        let divisor = 0;
        if (includeRed) divisor++;
        if (includeGreen) divisor++;
        if (includeBlue) divisor++;

        let inR = input.r,
            inG = input.g,
            inB = input.b,
            inA = input.a;

        let outR = output.r,
            outG = output.g,
            outB = output.b,
            outA = output.a;

        for (let i = 0; i < len; i++) {

            outR[i] = inR[i];
            outG[i] = inG[i];
            outB[i] = inB[i];

            if (divisor) {

                let avg = 0;

                if (includeRed) avg += inR[i];
                if (includeGreen) avg += inG[i];
                if (includeBlue) avg += inB[i];

                avg = Math.floor(avg / divisor);

                outA[i] = avg;
            }
            else outA[i] = inA[i];
        }
        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'alpha-to-channels': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, includeRed, includeGreen, includeBlue, excludeRed, excludeGreen, excludeBlue, out} = requirements;

        let inR = input.r,
            inG = input.g,
            inB = input.b,
            inA = input.a;

        let outR = output.r,
            outG = output.g,
            outB = output.b,
            outA = output.a;

        for (let i = 0; i < len; i++) {

            outR[i] = (includeRed) ? inA[i] : ((excludeRed) ? 0 : inR[i]);
            outR[i] = (includeGreen) ? inA[i] : ((excludeGreen) ? 0 : inG[i]);
            outR[i] = (includeBlue) ? inA[i] : ((excludeBlue) ? 0 : inB[i]);
            outA[i] = 255;
        }
        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'invert-channels': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, includeRed, includeGreen, includeBlue, includeAlpha, out} = requirements;

        let inR = input.r,
            inG = input.g,
            inB = input.b,
            inA = input.a;

        let outR = output.r,
            outG = output.g,
            outB = output.b,
            outA = output.a;

        for (let i = 0; i < len; i++) {

            outR[i] = (includeRed) ? 255 - inR[i] : inR[i];
            outG[i] = (includeGreen) ? 255 - inG[i] : inG[i];
            outB[i] = (includeBlue) ? 255 - inB[i] : inB[i];
            outA[i] = (includeAlpha) ? 255 - inA[i] : inA[i];
        }
        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'brightness': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, includeRed, includeGreen, includeBlue, level, out} = requirements;

        let inR = input.r,
            inG = input.g,
            inB = input.b,
            inA = input.a;

        let outR = output.r,
            outG = output.g,
            outB = output.b,
            outA = output.a;

        for (let i = 0; i < len; i++) {

            outR[i] = (includeRed) ? inR[i] *= level : inR[i];
            outG[i] = (includeGreen) ? inG[i] *= level : inG[i];
            outB[i] = (includeBlue) ? inB[i] *= level : inB[i];
            outA[i] = inA[i];
        }
        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'saturation': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, includeRed, includeGreen, includeBlue, level, out} = requirements;

        let inR = input.r,
            inG = input.g,
            inB = input.b,
            inA = input.a;

        let outR = output.r,
            outG = output.g,
            outB = output.b,
            outA = output.a;

        for (let i = 0; i < len; i++) {
            outR[i] = (includeRed) ? 127 + ((inR[i] - 127) * level) : inR[i];
            outG[i] = (includeGreen) ? 127 + ((inG[i] - 127) * level) : inG[i];
            outB[i] = (includeBlue) ? 127 + ((inB[i] - 127) * level) : inB[i];
            outA[i] = inA[i];
        }
        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'modulate-channels': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, red, green, blue, alpha, level, out} = requirements;

        if (red == null) red = 1;
        if (green == null) green = 1;
        if (blue == null) blue = 1;
        if (alpha == null) alpha = 1;

        let inR = input.r,
            inG = input.g,
            inB = input.b,
            inA = input.a;

        let outR = output.r,
            outG = output.g,
            outB = output.b,
            outA = output.a;

        for (let i = 0; i < len; i++) {
            outR[i] = inR[i] * red;
            outG[i] = inG[i] * green;
            outB[i] = inB[i] * blue;
            outA[i] = inA[i] * alpha;
        }
        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'step-channels': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length,
            floor = Math.floor;

        const {opacity, red, green, blue, level, out} = requirements;

        if (red == null) red = 1;
        if (green == null) green = 1;
        if (blue == null) blue = 1;

        let inR = input.r,
            inG = input.g,
            inB = input.b,
            inA = input.a;

        let outR = output.r,
            outG = output.g,
            outB = output.b,
            outA = output.a;

        for (let i = 0; i < len; i++) {
            outR[i] = floor(inR[i] / red) * red;
            outG[i] = floor(inG[i] / green) * green;
            outB[i] = floor(inB[i] / blue) * blue;
            outA[i] = inA[i];
        }
        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'lock-channels-to-levels': function (requirements) {

        const getValue = function (val, levels) {

            if (!levels.length) return val;

            for (let i = 0, iz = levels.length; i < iz; i++) {

                let [start, end, level] = levels[i];
                if (val >= start && val <= end) return level;
            }
        };

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, red, green, blue, alpha, out} = requirements;

        let inR = input.r,
            inG = input.g,
            inB = input.b,
            inA = input.a;

        let outR = output.r,
            outG = output.g,
            outB = output.b,
            outA = output.a;

        for (let i = 0; i < len; i++) {
            outR[i] = getValue(inR[i], red);
            outG[i] = getValue(inG[i], green);
            outB[i] = getValue(inB[i], blue);
            outA[i] = getValue(inA[i], alpha);
        }

        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'colors-to-alpha': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, red, green, blue, opaqueAt, transparentAt, out} = requirements;

        const maxDiff = Math.max(((red + green + blue) / 3), (((255 - red) + (255 - green) + (255 - blue)) / 3)),
            transparent = transparentAt * maxDiff,
            opaque = opaqueAt * maxDiff,
            range = opaque - transparent;

        const getValue = function (r, g, b) {

            let diff = (Math.abs(red - r) + Math.abs(green - g) + Math.abs(blue - b)) / 3;

            if (diff < transparent) return 0;
            if (diff > opaque) return 255;
            return ((diff - transparent) / range) * 255;
        };

        let inR = input.r,
            inG = input.g,
            inB = input.b,
            inA = input.a;

        let outR = output.r,
            outG = output.g,
            outB = output.b,
            outA = output.a;

        for (let i = 0; i < len; i++) {
            outR[i] = inR[i];
            outG[i] = inG[i];
            outB[i] = inB[i];
            outA[i] = getValue(inR[i], inG[i], inB[i]);
        }

        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'flood': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length,
            floor = Math.floor;

        const {opacity, red, green, blue, alpha, out} = requirements;

        if (red == null) red = 0;
        if (green == null) green = 0;
        if (blue == null) blue = 0;
        if (alpha == null) alpha = 255;

        let outR = output.r,
            outG = output.g,
            outB = output.b,
            outA = output.a;

        for (let i = 0; i < len; i++) {
            outR[i] = red;
            outG[i] = green;
            outB[i] = blue;
            outA[i] = alpha;
        }
        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'tint-channels': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, redInRed, redInGreen, redInBlue, greenInRed, greenInGreen, greenInBlue, blueInRed, blueInGreen, blueInBlue, out} = requirements;

        if (redInRed == null) redInRed = 1;
        if (redInGreen == null) redInGreen = 0;
        if (redInBlue == null) redInBlue = 0;
        if (greenInRed == null) greenInRed = 0;
        if (greenInGreen == null) greenInGreen = 1;
        if (greenInBlue == null) greenInBlue = 0;
        if (blueInRed == null) blueInRed = 0;
        if (blueInGreen == null) blueInGreen = 0;
        if (blueInBlue == null) blueInBlue = 1;

        let inR = input.r,
            inG = input.g,
            inB = input.b,
            inA = input.a;

        let outR = output.r,
            outG = output.g,
            outB = output.b,
            outA = output.a;

        for (let i = 0; i < len; i++) {

            let r = inR[i],
                g = inG[i],
                b = inB[i];

            outR[i] = Math.floor((r * redInRed) + (g * greenInRed) + (b * blueInRed));
            outG[i] = Math.floor((r * redInGreen) + (g * greenInGreen) + (b * blueInGreen));
            outB[i] = Math.floor((r * redInBlue) + (g * greenInBlue) + (b * blueInBlue));
            outA[i] = inA[i];
        }
        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'grayscale': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, out} = requirements;

        let inR = input.r,
            inG = input.g,
            inB = input.b,
            inA = input.a;

        let outR = output.r,
            outG = output.g,
            outB = output.b,
            outA = output.a;

        for (let i = 0; i < len; i++) {

            let gray = Math.floor((0.2126 * inR[i]) + (0.7152 * inG[i]) + (0.0722 * inB[i]));

            outR[i] = gray;
            outG[i] = gray;
            outB[i] = gray;
            outA[i] = inA[i];
        }
        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'chroma': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, ranges, out} = requirements;

        let inR = input.r,
            inG = input.g,
            inB = input.b,
            inA = input.a;

        let outR = output.r,
            outG = output.g,
            outB = output.b,
            outA = output.a;

        for (let j = 0; j < len; j++) {

            let flag = false;

            let r = inR[j],
                g = inG[j],
                b = inB[j];

            for (i = 0, iz = ranges.length; i < iz; i++) {

                let range = ranges[i];

                let [minR, minG, minB, maxR, maxG, maxB] = ranges[i];

                if (r >= minR && r <= maxR && g >= minG && g <= maxG && b >= minB && b <= maxB) {
                    flag = true;
                    break;
                }

            }
            outR[j] = inR[j];
            outG[j] = inG[j];
            outB[j] = inB[j];
            outA[j] = (flag) ? 0 : inA[j];
        }
        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'blur': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, out} = requirements;

        let inR = input.r,
            inG = input.g,
            inB = input.b,
            inA = input.a;

        let outR = output.r,
            outG = output.g,
            outB = output.b,
            outA = output.a;

        for (let i = 0; i < len; i++) {

            outR[i] = inR[i];
            outG[i] = inG[i];
            outB[i] = inB[i];
            outA[i] = inA[i];
        }
        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'threshold': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length;

        const {opacity, low, high, level, out} = requirements;

        let inR = input.r,
            inG = input.g,
            inB = input.b,
            inA = input.a;

        let outR = output.r,
            outG = output.g,
            outB = output.b,
            outA = output.a;

        let [lowR, lowG, lowB] = low;
        let [highR, highG, highB] = high;

        for (let i = 0; i < len; i++) {

            let gray = Math.floor((0.2126 * inR[i]) + (0.7152 * inG[i]) + (0.0722 * inB[i]));

            if (gray < level) {

                outR[i] = lowR;
                outG[i] = lowG;
                outB[i] = lowB;
            }
            else {

                outR[i] = highR;
                outG[i] = highG;
                outB[i] = highB;
            }

            outA[i] = inA[i];
        }
        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },

    'set-channel-to-value': function (requirements) {

        let [input, output] = getInputAndOutputObjects(requirements);

        let len = input.r.length,
            isRed = false,
            isGreen = false,
            isBlue = false,
            isAlpha = false;

        const {opacity, channel, value, out} = requirements;

        switch (channel) {

            case 'red' :
                isRed = true;
                break;

            case 'green' :
                isGreen = true;
                break;

            case 'blue' :
                isBlue = true;
                break;

            default :
                isAlpha = true;
        }

        let inR = input.r,
            inG = input.g,
            inB = input.b,
            inA = input.a;

        let outR = output.r,
            outG = output.g,
            outB = output.b,
            outA = output.a;

        for (let i = 0; i < len; i++) {

            outR[i] = (isRed) ? value : inR[i];
            outG[i] = (isGreen) ? value : inG[i];
            outB[i] = (isBlue) ? value : inB[i];
            outA[i] = (isAlpha) ? value : inA[i];
        }
        if (out) processResults(output, work, 1 - opacity);
        else processResults(work, output, opacity);
    },
};


const thePreprocessObject = {

    red: function (f) {
        f.actions = [{
            action: 'average-channels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            excludeGreen: true,
            excludeBlue: true,
        }];
    },

    green: function (f) {
        f.actions = [{
            action: 'average-channels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            excludeRed: true,
            excludeBlue: true,
        }];
    },

    blue: function (f) {
        f.actions = [{
            action: 'average-channels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            excludeRed: true,
            excludeGreen: true,
        }];
    },

    notred: function (f) {
        f.actions = [{
            action: 'set-channel-to-value',
            opacity: (f.opacity != null) ? f.opacity : 1,
            channel: 'red',
            value: 0,
        }];
    },

    notgreen: function (f) {
        f.actions = [{
            action: 'set-channel-to-value',
            opacity: (f.opacity != null) ? f.opacity : 1,
            channel: 'green',
            value: 0,
        }];
    },

    notblue: function (f) {
        f.actions = [{
            action: 'set-channel-to-value',
            opacity: (f.opacity != null) ? f.opacity : 1,
            channel: 'blue',
            value: 0,
        }];
    },

    cyan: function (f) {
        f.actions = [{
            action: 'average-channels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeGreen: true,
            includeBlue: true,
            excludeRed: true,
        }];
    },

    magenta: function (f) {
        f.actions = [{
            action: 'average-channels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: true,
            includeBlue: true,
            excludeGreen: true,
        }];
    },

    yellow: function (f) {
        f.actions = [{
            action: 'average-channels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: true,
            includeGreen: true,
            excludeBlue: true,
        }];
    },

    gray: function (f) {
        f.actions = [{
            action: 'average-channels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: true,
            includeGreen: true,
            includeBlue: true,
        }];
    },

    channels: function (f) {
        f.actions = [{
            action: 'modulate-channels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            red: (f.red != null) ? f.red : 1,
            green: (f.green != null) ? f.green : 1,
            blue: (f.blue != null) ? f.blue : 1,
            alpha: (f.alpha != null) ? f.alpha : 1,
        }];
    },

    channelstep: function (f) {
        f.actions = [{
            action: 'step-channels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            red: (f.red != null) ? f.red : 1,
            green: (f.green != null) ? f.green : 1,
            blue: (f.blue != null) ? f.blue : 1,
        }];
    },

    flood: function (f) {
        f.actions = [{
            action: 'flood',
            opacity: (f.opacity != null) ? f.opacity : 1,
            red: (f.red != null) ? f.red : 0,
            green: (f.green != null) ? f.green : 0,
            blue: (f.blue != null) ? f.blue : 0,
            alpha: (f.alpha != null) ? f.alpha : 255,
        }];
    },

    brightness: function (f) {
        f.actions = [{
            action: 'brightness',
            opacity: (f.opacity != null) ? f.opacity : 1,
            level: (f.level != null) ? f.level : 1,
            includeRed: true,
            includeGreen: true,
            includeBlue: true,
        }];
    },

    saturation: function (f) {
        f.actions = [{
            action: 'saturation',
            opacity: (f.opacity != null) ? f.opacity : 1,
            level: (f.level != null) ? f.level : 1,
            includeRed: true,
            includeGreen: true,
            includeBlue: true,
        }];
    },

    invert: function (f) {
        f.actions = [{
            action: 'invert-channels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: true,
            includeGreen: true,
            includeBlue: true,
        }];
    },

    grayscale: function (f) {
        f.actions = [{
            action: 'grayscale',
            opacity: (f.opacity != null) ? f.opacity : 1,
        }];
    },

    sepia: function (f) {
        f.actions = [{
            action: 'tint-channels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            redInRed: 0.393,
            redInGreen: 0.349,
            redInBlue: 0.272,
            greenInRed: 0.769,
            greenInGreen: 0.686,
            greenInBlue: 0.534,
            blueInRed: 0.189,
            blueInGreen: 0.168,
            blueInBlue: 0.131,
        }];
    },

    tint: function (f) {
        f.actions = [{
            action: 'tint-channels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            redInRed: (f.redInRed != null) ? f.redInRed : 1,
            redInGreen: (f.redInGreen != null) ? f.redInGreen : 0,
            redInBlue: (f.redInBlue != null) ? f.redInBlue : 0,
            greenInRed: (f.greenInRed != null) ? f.greenInRed : 0,
            greenInGreen: (f.greenInGreen != null) ? f.greenInGreen : 1,
            greenInBlue: (f.greenInBlue != null) ? f.greenInBlue : 0,
            blueInRed: (f.blueInRed != null) ? f.blueInRed : 0,
            blueInGreen: (f.blueInGreen != null) ? f.blueInGreen : 0,
            blueInBlue: (f.blueInBlue != null) ? f.blueInBlue : 1,
        }];
    },

    channelLevels: function (f) {

        let redValues = (f.red != null) ? f.red : [],
            greenValues = (f.green != null) ? f.green : [],
            blueValues = (f.blue != null) ? f.blue : [],
            alphaValues = (f.alpha != null) ? f.alpha : [];

        redValues = redValues.map(v => parseInt(v, 10));
        greenValues = greenValues.map(v => parseInt(v, 10));
        blueValues = blueValues.map(v => parseInt(v, 10));
        alphaValues = alphaValues.map(v => parseInt(v, 10));

        redValues.sort((a, b) => a - b);
        greenValues.sort((a, b) => a - b);
        blueValues.sort((a, b) => a - b);
        alphaValues.sort((a, b) => a - b);

        let redArray = [],
            greenArray = [],
            blueArray = [],
            alphaArray = [];

        if (redValues.length) {

            if (redValues.length === 1) redArray.push([0, 255, redValues[0]]);
            else {

                for (let i = 0, iz = redValues.length; i < iz; i++) {

                    let starts = (i == 0) ? 0 : Math.ceil(redValues[i - 1] + ((redValues[i] - redValues[i - 1]) / 2));

                    let ends = (i == iz - 1) ? 255 : Math.floor(redValues[i] + ((redValues[i + 1] - redValues[i]) / 2));

                    redArray.push([starts, ends, redValues[i]]);
                }
            }
        }

        if (greenValues.length) {

            if (greenValues.length === 1) greenArray.push([0, 255, greenValues[0]]);
            else {

                for (let i = 0, iz = greenValues.length; i < iz; i++) {

                    let starts = (i == 0) ? 0 : Math.ceil(greenValues[i - 1] + ((greenValues[i] - greenValues[i - 1]) / 2));

                    let ends = (i == iz - 1) ? 255 : Math.floor(greenValues[i] + ((greenValues[i + 1] - greenValues[i]) / 2));

                    greenArray.push([starts, ends, greenValues[i]]);
                }
            }
        }

        if (blueValues.length) {

            if (blueValues.length === 1) blueArray.push([0, 255, blueValues[0]]);
            else {

                for (let i = 0, iz = blueValues.length; i < iz; i++) {

                    let starts = (i == 0) ? 0 : Math.ceil(blueValues[i - 1] + ((blueValues[i] - blueValues[i - 1]) / 2));

                    let ends = (i == iz - 1) ? 255 : Math.floor(blueValues[i] + ((blueValues[i + 1] - blueValues[i]) / 2));

                    blueArray.push([starts, ends, blueValues[i]]);
                }
            }
        }

        if (alphaValues.length) {

            if (alphaValues.length === 1) alphaArray.push([0, 255, alphaValues[0]]);
            else {

                for (let i = 0, iz = alphaValues.length; i < iz; i++) {

                    let starts = (i == 0) ? 0 : Math.ceil(alphaValues[i - 1] + ((alphaValues[i] - alphaValues[i - 1]) / 2));

                    let ends = (i == iz - 1) ? 255 : Math.floor(alphaValues[i] + ((alphaValues[i + 1] - alphaValues[i]) / 2));

                    alphaArray.push([starts, ends, alphaValues[i]]);
                }
            }
        }

        f.actions = [{
            action: 'lock-channels-to-levels',
            opacity: (f.opacity != null) ? f.opacity : 1,
            red: redArray,
            green: greenArray,
            blue: blueArray,
            alpha: alphaArray,
        }];
    },

    threshold: function (f) {

        let lowRed = (f.lowRed != null) ? f.lowRed : 0,
            lowGreen = (f.lowGreen != null) ? f.lowGreen : 0,
            lowBlue = (f.lowBlue != null) ? f.lowBlue : 0,
            highRed = (f.highRed != null) ? f.highRed : 255,
            highGreen = (f.highGreen != null) ? f.highGreen : 255,
            highBlue = (f.highBlue != null) ? f.highBlue : 255;

        f.actions = [{
            action: 'threshold',
            opacity: (f.opacity != null) ? f.opacity : 1,
            level: (f.level != null) ? f.level : 128,
            low: [lowRed, lowGreen, lowBlue],
            high: [highRed, highGreen, highBlue],
        }];
    },

    chromakey: function (f) {

        f.actions = [{
            action: 'colors-to-alpha',
            opacity: (f.opacity != null) ? f.opacity : 1,
            red: (f.red != null) ? f.red : 0,
            green: (f.green != null) ? f.green : 255,
            blue: (f.blue != null) ? f.blue : 0,
            transparentAt: (f.transparentAt != null) ? f.transparentAt : 0,
            opaqueAt: (f.opaqueAt != null) ? f.opaqueAt : 1,
        }];
    },

    chroma: function (f) {

        f.actions = [{
            action: 'chroma',
            opacity: (f.opacity != null) ? f.opacity : 1,
            ranges: (f.ranges != null) ? f.ranges : [],
        }];
    },

    blur: function (f) {

        f.actions = [{
            action: 'blur',
            opacity: (f.opacity != null) ? f.opacity : 1,
        }];
    },
}
