// # Demo Modules 001
// Scrawl-canvas modularized code - London crime charts
//
// Related files:
// + [London crime charts - main module](../modules-001.html)
// + [London crime graphic module](./london-crime-graphic.html)
// + [London crime lines module](./london-crime-lines.html)
// + [London crime stacked bar module](./london-crime-stacked-bars.html)
// + [Simple chart frame module](./simple-chart-frame.html)
// + [Simple chart frame tests module](./simple-chart-frame-tests.html)
// + [Simple graph lines module](./simple-graph-lines.html)
// + [Simple graph stacked bars module](./simple-graph-stacked-bars.html)

import scrawl from './source/scrawl.js';

import * as frame from './simple-chart-frame.js';

let testParent, testButton, testListeners, buttonListener, 
    frameNamespace, frameBackground;

const activateButton = function (frameName, canvas, host, button, background) {

    frameNamespace = frameName;
    testButton = button;
    testParent = host;
    frameBackground = background;

    buttonListener = scrawl.addListener('up', function (e) {

        if (e) {

            e.preventDefault();
            e.stopPropagation();

            let val = parseInt(testButton.value, 10);

            if (val) {

                killTests();

                testButton.value = '0';
                testButton.textContent = 'Show tests';
            }
            else {

                buildTests(canvas, host);

                testButton.value = '1';
                testButton.textContent = 'Hide tests';
            }
        }

    }, testButton);
};

const removeButton = function () {

    buttonListener();

    if (parseInt(testButton.value, 10)) killTests();

    testButton.remove();
    testParent.remove();
};

const buildTests = function (canvas, host) {

    testParent.innerHTML = `
    <div>
        <button id="build-button" class="controls">Build graph</button>
        <button id="kill-button" class="controls">Kill graph</button>
        <button id="show-button" class="controls">Show graph</button>
        <button id="hide-button" class="controls">Hide graph</button>
    </div>

    <p>
        Title: <input type="text" value="" id="title-input" class="controls"/> 
        Subtitle: <input type="text" value="" id="subtitle-input" class="controls"/>
    </p>

    <p>
        Y-axis - top: <input type="number" value="" id="y-top-input" class="controls"/>
        bottom: <input type="number" value="" id="y-bottom-input" class="controls"/>
    </p>

    <p>
        X-axis - left: <input type="text" value="" id="x-left-input" class="controls"/>
        right: <input type="text" value="" id="x-right-input" class="controls"/>
    </p>

    <p>Background:
        <select class="controls" id="crime-types">
            <option value="Burglary">Burglary</option>
            <option value="Criminal Damage">Criminal Damage</option>
            <option value="Drugs">Drugs</option>
            <option value="Fraud or Forgery">Fraud or Forgery</option>
            <option value="Other Notifiable Offences">Other Notifiable Offences</option>
            <option value="Robbery">Robbery</option>
            <option value="Sexual Offences">Sexual Offences</option>
            <option value="Theft and Handling">Theft and Handling</option>
            <option value="Violence Against the Person">Violence Against the Person</option>
        </select>
    </p>

    <p>
        <button id="kill-tests" class="controls">Remove tests</button>
    </p>`;

    let buildButton = testParent.querySelector('#build-button'),
        killButton = testParent.querySelector('#kill-button'),
        showButton = testParent.querySelector('#show-button'),
        hideButton = testParent.querySelector('#hide-button'),
        titleInput = testParent.querySelector('#title-input'),
        subtitleInput = testParent.querySelector('#subtitle-input'),
        yTop = testParent.querySelector('#y-top-input'),
        yBottom = testParent.querySelector('#y-bottom-input'),
        xLeft = testParent.querySelector('#x-left-input'),
        xRight = testParent.querySelector('#x-right-input'),
        crimeTypes = testParent.querySelector('#crime-types'),
        killTests = testParent.querySelector('#kill-tests');

    let currentBackground, currentTitle, currentSubtitle, 
        currentYTop, currentYBottom, currentXLeft, currentXRight;

    let setControlsToDefaults = () => {

        crimeTypes.value = currentBackground = frameBackground;
        titleInput.value = currentTitle = 'No title';
        subtitleInput.value = currentSubtitle = 'No data selected';
        yTop.value = currentYTop = '0';
        yBottom.value = currentYBottom = '0';
        xLeft.value = currentXLeft = '0';
        xRight.value = currentXRight = '0';

        buildButton.setAttribute('disabled', '');
        showButton.setAttribute('disabled', '');

        hideButton.removeAttribute('disabled');
        titleInput.removeAttribute('disabled');
        subtitleInput.removeAttribute('disabled');
        crimeTypes.removeAttribute('disabled');
        killButton.removeAttribute('disabled');
        yTop.removeAttribute('disabled');
        yBottom.removeAttribute('disabled');
        xLeft.removeAttribute('disabled');
        xRight.removeAttribute('disabled');
    };
    setControlsToDefaults();

    let setNumbersHelper = (val, current, fn) => {

        val = (val) ? val : 0;

        if (current !== val) {

            current = val;
            fn(parseFloat(val).toLocaleString());
        }
    };

    testListeners = scrawl.addNativeListener(['click', 'input', 'change'], function (e) {

        if (e) {

            e.stopPropagation();
            e.preventDefault();

            if (e.target) {

                let target = e.target.id,
                    val = e.target.value;

                switch (target) {

                    case 'build-button' :

                        frame.build(frameNamespace, canvas, frameBackground);
                        frame.show();

                        setControlsToDefaults();

                        break;

                    case 'kill-button' :

                        frame.kill();

                        killButton.setAttribute('disabled', '');
                        showButton.setAttribute('disabled', '');
                        hideButton.setAttribute('disabled', '');
                        titleInput.setAttribute('disabled', '');
                        subtitleInput.setAttribute('disabled', '');
                        crimeTypes.setAttribute('disabled', '');
                        yTop.setAttribute('disabled', '');
                        yBottom.setAttribute('disabled', '');
                        xLeft.setAttribute('disabled', '');
                        xRight.setAttribute('disabled', '');

                        buildButton.removeAttribute('disabled');
                        break;

                    case 'show-button' :

                        frame.show();

                        showButton.setAttribute('disabled', '');
                        hideButton.removeAttribute('disabled');
                        break;

                    case 'hide-button' :

                        frame.hide();

                        hideButton.setAttribute('disabled', '');
                        showButton.removeAttribute('disabled');
                        break;

                    case 'title-input' :

                        if (currentTitle !== val) {

                            currentTitle = val;
                            frame.updateTitle(val);
                        }
                        break;

                    case 'subtitle-input' :

                        if (currentSubtitle !== val) {

                            currentSubtitle = val;
                            frame.updateSubtitle(val);
                        }
                        break;

                    case 'y-top-input' :

                        setNumbersHelper(val, currentYTop, frame.updateYTop);
                        break;

                    case 'y-bottom-input' :

                        setNumbersHelper(val, currentYBottom, frame.updateYBottom);
                        break;

                    case 'x-left-input' :

                        if (currentXLeft !== val) {

                            currentXLeft = val;
                            frame.updateXLeft(val);
                        }
                        break;

                    case 'x-right-input' :

                        if (currentXRight !== val) {

                            currentXRight = val;
                            frame.updateXRight(val);
                        }
                        break;

                    case 'crime-types' :

                        if (currentBackground !== val) {

                            currentBackground = val;
                            frame.updateBackground(val);
                        }
                        break;

                    case 'kill-tests' :

                        removeButton();
                        break;
                }
            }
        }
    }, '.controls');

};

const killTests = function () {

    testListeners();

    [...testParent.childNodes].forEach(el => el.remove());
};


export {
    activateButton,
    removeButton,
};
