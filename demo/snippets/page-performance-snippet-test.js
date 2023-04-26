export default function (scrawl, el) {

    let report = function () {

        let testTicker = Date.now(),
            testTime, testNow,
            testMessage = document.querySelector(`#${el.id}`);

        return function () {

            testNow = Date.now();
            testTime = testNow - testTicker;
            testTicker = testNow;

            testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;

            console.log('report animation is running')
        };
    }();

    let snippet = scrawl.makeSnippet({
        domElement: el,
        animationHooks: {
            afterShow: report,
        },
        includeCanvas: false,
    })

    return (snippet) ? true : false;
}
