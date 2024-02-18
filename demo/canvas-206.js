// # Demo Canvas 206
// EnhancedLabel entity - multiline text

// [Run code](../../demo/canvas-206.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.library.canvas.mycanvas;


// Namespacing boilerplate
const namespace = 'demo';
const name = (n) => `${namespace}-${n}`;


const displayText = document.querySelector('.demo-explanation-styles');

const westernText = '<span class="underline">Lorem</span> ipsum <b>dolor sit</b> amet, con&shy;sectetur 😀 adi&shy;piscing &eacute;lit, sed <s>do eius-mod</s> <u>tempor in&shy;cididunt</u> ut labore et dolore magna aliqua. Ut enim ad <span class="bold">minim veniam,</span> quis <span class="letter-spaced">nostrud</span> exercit-ation <span class="strike">ullamco laboris</span> nisi ut aliquip ex ea <span class="make-monospace">"commodo"</span> consequat. Duis <em>(aute irure d&ouml;lor)</em> in reprehenderit 🤖&icirc;n <i>voluptate</i> velit &copy;2024 <i>esse &lt;cillum&gt; <b>dolore</b> eu fug🎻iat nulla</i> pariatur. <span class="red">Excepteur sint</span> occaecat &iexcl;cupidatat! <strong>non proident,</strong> <span class="word-spaced">sunt in culpa qui</span> offici&thorn;a deserunt <span class="make-bigger">mollit anim</span> id est laborum.';


const blockEngine = scrawl.makeBlock({

    name: name('block-layout-engine'),
    start: ['center', 'center'],
    handle: ['center', 'center'],
    dimensions: ['60%', '80%'],
    fillStyle: 'transparent',
});

const wheelEngine = scrawl.makeWheel({

    name: name('wheel-layout-engine'),
    width: '60%',
    start: ['center', 'center'],
    handle: ['center', 'center'],
    fillStyle: 'transparent',
    visibility: false,
});

const crescentEngine = scrawl.makeCrescent({

    name: name('crescent-layout-engine'),
    start: ['center', 'center'],
    handle: ['center', 'center'],
    outerRadius: 200,
    innerRadius: 150,
    displacement: 150,
    fillStyle: 'transparent',
    visibility: false,
});



const engineGroup = scrawl.makeGroup({

    name: name('layout-engines'),

}).addArtefacts(blockEngine, wheelEngine, crescentEngine);


const mylabel = scrawl.makeEnhancedLabel({

    name: name('my-label'),
    fontString: '16px serif',
    text: westernText,

    showBoundingBox: true,

    layoutEngine: name('block-layout-engine'),

    breakWordsOnHyphens: true,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    let fontReadout = `
`;
    document.fonts.forEach(k => {
        if (k.status == 'loaded') fontReadout +=(`    ${k.family} ${k.weight} ${k.style}\n`)
    })

    return `
Loaded fonts:${fontReadout}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
const updateDisplayText = () => {

    const dims = blockEngine.get('dimensions');

    let justify = mylabel.get('justifyLine');
    if (justify === 'full') justify = 'justify';

    setTimeout(() => {

        displayText.innerHTML = mylabel.get('rawText');
// @ts-expect-error
        displayText.style.direction = mylabel.get('direction');
// @ts-expect-error
        displayText.style.font = mylabel.get('fontString');
// @ts-expect-error
        displayText.style.lineHeight = mylabel.get('lineSpacing');
// @ts-expect-error
        if (dims[0]) displayText.style.width = `${dims[0]}px`;
// @ts-expect-error
        if (dims[1]) displayText.style.height = `${dims[1]}px`;
// @ts-expect-error
        displayText.style.textAlign = justify;

    }, 50);
};

updateDisplayText();


scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: mylabel,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        layoutEngineLineOffset: ['layoutEngineLineOffset', 'float'],
        alignment: ['alignment', 'float'],
        justifyLine: ['justifyLine', 'raw'],
    },

    callback: updateDisplayText,
});

scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: engineGroup,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        startX: ['startX', '%'],
        startY: ['startY', '%'],
        handleX: ['handleX', '%'],
        handleY: ['handleY', '%'],
        offsetX: ['offsetX', 'px'],
        offsetY: ['offsetY', 'px'],
        width: ['width', '%'],
        height: ['height', '%'],
        scale: ['scale', 'float'],
        roll: ['roll', 'float'],
    },

    callback: updateDisplayText,
});


const layoutEngineSelector = document.querySelector('#layoutEngine');
const updateLayoutEngine = (event) => {

    const engine = event.target.value;

    if (engine) {

        engineGroup.setArtefacts({ visibility: false });

        switch (engine) {

            case 'wheel-engine' :

                mylabel.set({ layoutEngine: wheelEngine });
                wheelEngine.set({ visibility: true });
                break;

            case 'crescent-engine' :

                mylabel.set({ layoutEngine: crescentEngine });
                crescentEngine.set({ visibility: true });
                break;

            default :

                mylabel.set({ layoutEngine: blockEngine });
                blockEngine.set({ visibility: true });
            }
    }
};
scrawl.addNativeListener('change', (e) => updateLayoutEngine(e), layoutEngineSelector);


const fontSelector = document.querySelector('#font');
const updateFont = (event) => {

    const font = event.target.value;

    if (font) {

        switch (font) {

            case 'serif' :
                mylabel.set({
                    fontString: '16px serif',
                    text: westernText,
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.5,
                });
                break;

            // <option value="serif-normal">serif (lh: normal)</option>
            case 'serif-normal' :
                mylabel.set({
                    fontString: '16px / normal serif',
                    text: westernText,
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                });
                break;

            // <option value="serif-ratio">serif (lh: ratio)</option>
            case 'serif-ratio' :
                mylabel.set({
                    fontString: '16px / 2.5 serif',
                    text: westernText,
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                });
                break;

            // <option value="serif-length">serif (lh: length)</option>
            case 'serif-length' :
                mylabel.set({
                    fontString: '16px / 3em serif',
                    text: westernText,
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                });
                break;

            // <option value="serif-percent">serif (lh: percent)</option>
            case 'serif-percent' :
                mylabel.set({
                    fontString: '16px / 180% serif',
                    text: westernText,
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                });
                break;

            // <option value="serif-px">serif (lh: px)</option>
            case 'serif-px' :
                mylabel.set({
                    fontString: '16px / 30px serif',
                    text: westernText,
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                });
                break;


            case 'sans-serif' :
                mylabel.set({
                    fontString: '16px sans-serif',
                    text: westernText,
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.5,
                });
                break;

            case 'monospace' :
                mylabel.set({
                    fontString: '16px monospace',
                    text: westernText,
                    direction: 'ltr',
                    lineSpacing: 1.5,
                    breakTextOnSpaces: true,
                });
                break;

            case 'cursive' :
                mylabel.set({
                    fontString: '16px cursive',
                    text: westernText,
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.5,
                });
                break;

            case 'fantasy' :
                mylabel.set({
                    fontString: '16px fantasy',
                    text: westernText,
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.5,
                });
                break;

            case 'garamond' :
                mylabel.set({
                    fontString: '16px Garamond',
                    text: westernText,
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.5,
                });
                break;

            case 'roboto' :
                mylabel.set({
                    fontString: '16px "Roboto Sans"',
                    text: westernText,
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.5,
                });
                break;

            case 'roboto-serif' :
                mylabel.set({
                    fontString: '16px "Roboto Serif"',
                    text: westernText,
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.5,
                });
                break;

            case 'roboto-mono' :
                mylabel.set({
                    fontString: '16px "Roboto Mono"',
                    text: westernText,
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.5,
                });
                break;

            case 'noto-arabic-sans' :
                mylabel.set({
                    fontString: '16px "Noto Arabic Sans"',
                    text: 'لا يعرض أحد لتدخل تعسفي في حياته الخاصة أو أسرته أو مسكنه أو مراسلاته أو لحملات على شرفه وسمعته. ولكل شخص الحق في حماية القانون من مثل هذا التدخل أو تلك الحملات. لكل شخص الحق في حرية التفكير والضمير والدين. ويشمل هذا الحق حرية تغيير ديانته أو عقيدته، وحرية الإعراب عنهما بالتعليم والممارسة وإقامة الشعائر ومراعاتها سواء أكان ذلك سرا أم مع الجماعة. لكل شخص الحق في حرية الرأي والتعبير.',
                    direction: 'rtl',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.5,
                });
                break;

            case 'noto-arabic-naskh' :
                mylabel.set({
                    fontString: '16px "Noto Arabic Naskh"',
                    text: 'لا يعرض أحد لتدخل تعسفي في حياته الخاصة أو أسرته أو مسكنه أو مراسلاته أو لحملات على شرفه وسمعته. ولكل شخص الحق في حماية القانون من مثل هذا التدخل أو تلك الحملات. لكل شخص الحق في حرية التفكير والضمير والدين. ويشمل هذا الحق حرية تغيير ديانته أو عقيدته، وحرية الإعراب عنهما بالتعليم والممارسة وإقامة الشعائر ومراعاتها سواء أكان ذلك سرا أم مع الجماعة. لكل شخص الحق في حرية الرأي والتعبير.',
                    direction: 'rtl',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.5,
                });
                break;

            case 'noto-urdu-nastaliq' :
                mylabel.set({
                    fontString: '16px "Noto Urdu Nastaliq"',
                    text: 'لا يعرض أحد لتدخل تعسفي في حياته الخاصة أو أسرته أو مسكنه أو مراسلاته أو لحملات على شرفه وسمعته. ولكل شخص الحق في حماية القانون من مثل هذا التدخل أو تلك الحملات. لكل شخص الحق في حرية التفكير والضمير والدين. ويشمل هذا الحق حرية تغيير ديانته أو عقيدته، وحرية الإعراب عنهما بالتعليم والممارسة وإقامة الشعائر ومراعاتها سواء أكان ذلك سرا أم مع الجماعة. لكل شخص الحق في حرية الرأي والتعبير.',
                    direction: 'rtl',
                    breakTextOnSpaces: true,
                    lineSpacing: 2,
                });
                break;

            case 'noto-chinese-simple-sans' :
                mylabel.set({
                    fontString: '16px "Noto Chinese Simple Sans"',
                    text: '鉴于对人类家庭所有成员的固有尊严及其平等的和不移的权利的承认,乃是世界自由&#x2060;、正义与和平的基础, 鉴于对人权的无视和侮蔑已发展为野蛮暴行,这些暴行玷污了人类的良心,而一个人人享有言论和信仰自由并免予恐惧和匮乏的世界的来临,已被宣布为普通人民的最高愿望, 鉴于为使人类不致迫不得已铤而走险对暴政和压迫进行反叛,有必要使人权受法治的保护, 鉴于有必要促进各国间友好关系的发展&#x2060;。',
                    direction: 'ltr',
                    breakTextOnSpaces: false,
                    lineSpacing: 1.5,
                });
                break;

            case 'noto-chinese-simple-serif' :
                mylabel.set({
                    fontString: '16px "Noto Chinese Simple Serif"',
                    text: '鉴于对人类家庭所有成员的固有尊严及其平等的和不移的权利的承认,乃是世界自由&#x2060;、正义与和平的基础, 鉴于对人权的无视和侮蔑已发展为野蛮暴行,这些暴行玷污了人类的良心,而一个人人享有言论和信仰自由并免予恐惧和匮乏的世界的来临,已被宣布为普通人民的最高愿望, 鉴于为使人类不致迫不得已铤而走险对暴政和压迫进行反叛,有必要使人权受法治的保护, 鉴于有必要促进各国间友好关系的发展&#x2060;。',
                    direction: 'ltr',
                    breakTextOnSpaces: false,
                    lineSpacing: 1.5,
                });
                break;

            case 'noto-devangari-sans' :
                mylabel.set({
                    fontString: '16px "Noto Devangari Sans"',
                    text: 'प्रत्येक व्यक्ति को विचार और उसकी अभिव्यक्ति की स्वतन्त्रता का अधिकार है । इसके अन्तर्गत बिना हस्तक्षेप के कोई राय रखना और किसी भी माध्यम के ज़रिए से तथा सीमाओं की परवाह न कर के किसी की मूचना और धारणा का अन्वेषण, प्रहण तथा प्रदान सम्मिलित है । समाज के एक सदस्य के रूप में प्रत्येक व्यक्ति को सामाजिक सुरक्षा का अधिकार है और प्रत्येक व्यक्ति को अपने व्यक्तित्व के उस स्वतन्त्र विकास तथा गोरव के लिए—जो राष्ट्रीय प्रयत्न या अन्तर्राष्ट्रीय सहयोग तथा प्रत्येक राज्य के संगठन एवं साधनों के अनुकूल हो ।',
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.5,
                });
                break;

            case 'noto-devangari-serif' :
                mylabel.set({
                    fontString: '16px "Noto Devangari Serif"',
                    text: 'प्रत्येक व्यक्ति को विचार और उसकी अभिव्यक्ति की स्वतन्त्रता का अधिकार है । इसके अन्तर्गत बिना हस्तक्षेप के कोई राय रखना और किसी भी माध्यम के ज़रिए से तथा सीमाओं की परवाह न कर के किसी की मूचना और धारणा का अन्वेषण, प्रहण तथा प्रदान सम्मिलित है । समाज के एक सदस्य के रूप में प्रत्येक व्यक्ति को सामाजिक सुरक्षा का अधिकार है और प्रत्येक व्यक्ति को अपने व्यक्तित्व के उस स्वतन्त्र विकास तथा गोरव के लिए—जो राष्ट्रीय प्रयत्न या अन्तर्राष्ट्रीय सहयोग तथा प्रत्येक राज्य के संगठन एवं साधनों के अनुकूल हो ।',
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.5,
                });
                break;

            case 'noto-hebrew-sans' :
                mylabel.set({
                    fontString: '16px "Noto Hebrew Sans"',
                    text: 'כל אדם זכאי לחירות הדעה והבטוי, לרבות החירות להחיק בדעות ללא כל הפרעה, ולבקש ידיעות ודעות, ולקבלן ולמסרן בכל הדרכים וללא סייגי גבולות כל אדם, כחבר החברה, זכאי לבטחון סוציאלי וזכאי לתבוע שהזכויות הכלכליות הסוציאליות והתרבותיות, שהן חיוניות לכבודו כאדם ולהתפתחות החופשית של אישיותו, יובטחו במשמץ לאומי ובשיתוף פעולה בינלאומי בהתאם לארגונה ולאוצרותיה של המדינה כל אדם זכאי למנוחה ולפנאי',
                    direction: 'rtl',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.5,
                });
                break;

            case 'noto-hebrew-serif' :
                mylabel.set({
                    fontString: '16px "Noto Hebrew Serif"',
                    text: 'כל אדם זכאי לחירות הדעה והבטוי, לרבות החירות להחיק בדעות ללא כל הפרעה, ולבקש ידיעות ודעות, ולקבלן ולמסרן בכל הדרכים וללא סייגי גבולות כל אדם, כחבר החברה, זכאי לבטחון סוציאלי וזכאי לתבוע שהזכויות הכלכליות הסוציאליות והתרבותיות, שהן חיוניות לכבודו כאדם ולהתפתחות החופשית של אישיותו, יובטחו במשמץ לאומי ובשיתוף פעולה בינלאומי בהתאם לארגונה ולאוצרותיה של המדינה כל אדם זכאי למנוחה ולפנאי',
                    direction: 'rtl',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.5,
                });
                break;

            case 'noto-japanese-sans' :
                mylabel.set({
                    fontString: '16px "Noto Japanese Sans"',
                    text: '人類社会のすべての構成員の固有の尊厳と平等で譲ることのできない権利とを承認することは&#x2060;、世界における自由&#x2060;、正義及び平和の基礎であるので&#x2060;、 人権の無視及び軽侮が&#x2060;、人類の良心を踏みにじった野蛮行為をもたらし&#x2060;、言論及び信仰の自由が受けられ&#x2060;、恐怖及び欠乏のない世界の到来が&#x2060;、一般の人々の最高の願望として宣言されたので&#x2060;、 人間が専制と圧迫とに対する最後の手段として反逆に訴えることがないようにするためには&#x2060;、法の支配によって人権を保護することが肝要であるので&#x2060;、 諸国間の友好関係の発展を促進することが肝要であるので&#x2060;、',
                    direction: 'ltr',
                    breakTextOnSpaces: false,
                    lineSpacing: 1.5,
                });
                break;

            case 'noto-japanese-serif' :
                mylabel.set({
                    fontString: '16px "Noto Japanese Serif"',
                    text: '人類社会のすべての構成員の固有の尊厳と平等で譲ることのできない権利とを承認することは&#x2060;、世界における自由&#x2060;、正義及び平和の基礎であるので&#x2060;、 人権の無視及び軽侮が&#x2060;、人類の良心を踏みにじった野蛮行為をもたらし&#x2060;、言論及び信仰の自由が受けられ&#x2060;、恐怖及び欠乏のない世界の到来が&#x2060;、一般の人々の最高の願望として宣言されたので&#x2060;、 人間が専制と圧迫とに対する最後の手段として反逆に訴えることがないようにするためには&#x2060;、法の支配によって人権を保護することが肝要であるので&#x2060;、 諸国間の友好関係の発展を促進することが肝要であるので&#x2060;、',
                    direction: 'ltr',
                    breakTextOnSpaces: false,
                    lineSpacing: 1.5,
                });
                break;

            case 'noto-korean-sans' :
                mylabel.set({
                    fontString: '16px "Noto Korean Sans"',
                    text: '모든 사람은 의견의 자유와 표현의 자유에 대한 권리를 가진다. 이러한 권리는 간섭없이 의견을 가질 자유와 국경에 관계없이 어떠한 매체를 통해서도 정보와 사상을 추구하고, 얻으며, 전달하는 자유를 포함한다. 모든 사람은 사회의 일원으로서 사회보장을 받을 권리를 가지며, 국가적 노력과 국제적 협력을 통하여, 그리고 각 국가의 조직과 자원에 따라서 자신의 존엄과 인격의 자유로운 발전에 불가결한 경제적, 사회적 및 문화적 권리들을 실현할 권리를 가진다. 모든 사람은 노동시간의 합리적 제한과 정기적인 유급휴가를 포함하여 휴식과 여가의 권리를 가진다',
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.5,
                });
                break;

            case 'noto-korean-serif' :
                mylabel.set({
                    fontString: '16px "Noto Korean Serif"',
                    text: '모든 사람은 의견의 자유와 표현의 자유에 대한 권리를 가진다. 이러한 권리는 간섭없이 의견을 가질 자유와 국경에 관계없이 어떠한 매체를 통해서도 정보와 사상을 추구하고, 얻으며, 전달하는 자유를 포함한다. 모든 사람은 사회의 일원으로서 사회보장을 받을 권리를 가지며, 국가적 노력과 국제적 협력을 통하여, 그리고 각 국가의 조직과 자원에 따라서 자신의 존엄과 인격의 자유로운 발전에 불가결한 경제적, 사회적 및 문화적 권리들을 실현할 권리를 가진다. 모든 사람은 노동시간의 합리적 제한과 정기적인 유급휴가를 포함하여 휴식과 여가의 권리를 가진다',
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.5,
                });
                break;

            case 'noto-mongolian-sans' :
                mylabel.set({
                    fontString: '16px "Noto Mongolian Sans"',
                    text: 'ᠬᠦᠮᠦᠨ ᠪᠦᠷ ᠲᠥᠷᠥᠵᠦ ᠮᠡᠨᠳᠡᠯᠡᠬᠦ ᠡᠷᠬᠡ ᠴᠢᠯᠥᠭᠡ ᠲᠡᠢ᠂ ᠠᠳᠠᠯᠢᠬᠠᠨ ᠨᠡᠷ᠎ᠡ ᠲᠥᠷᠥ ᠲᠡᠢ᠂ ᠢᠵᠢᠯ ᠡᠷᠬᠡ ᠲᠡᠢ ᠪᠠᠢᠠᠭ᠃ ᠣᠶᠤᠨ ᠤᠬᠠᠭᠠᠨ᠂ ᠨᠠᠨᠳᠢᠨ ᠴᠢᠨᠠᠷ ᠵᠠᠶᠠᠭᠠᠰᠠᠨ ᠬᠦᠮᠦᠨ ᠬᠡᠭᠴᠢ ᠥᠭᠡᠷ᠎ᠡ ᠬᠣᠭᠣᠷᠣᠨᠳᠣ᠎ᠨ ᠠᠬᠠᠨ ᠳᠡᠭᠦᠦ ᠢᠨ ᠦᠵᠢᠯ ᠰᠠᠨᠠᠭᠠ ᠥᠠᠷ ᠬᠠᠷᠢᠴᠠᠬᠥ ᠤᠴᠢᠷ ᠲᠠᠢ᠃ ᠬᠦᠮᠦᠨ ᠪᠦᠷ ᠲᠥᠷᠥᠵᠦ ᠮᠡᠨᠳᠡᠯᠡᠬᠦ ᠡᠷᠬᠡ ᠴᠢᠯᠥᠭᠡ ᠲᠡᠢ᠂ ᠠᠳᠠᠯᠢᠬᠠᠨ ᠨᠡᠷ᠎ᠡ ᠲᠥᠷᠥ ᠲᠡᠢ᠂ ᠢᠵᠢᠯ ᠡᠷᠬᠡ ᠲᠡᠢ ᠪᠠᠢᠠᠭ᠃',
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.5,
                });
                break;

            case 'noto-tai-le-sans' :
                mylabel.set({
                    fontString: '16px "Noto Tai Le Sans"',
                    text: 'ᥓᥣᥳ ᥞᥨᥛ ᥑᥤᥴ, ᥘᥤ ᥞᥨᥛ ᥓᥨᥛᥰ. ᥓᥣᥳ ᥙᥣᥰ ᥘᥤ, ᥑᥤᥴ ᥙᥣᥰ ᥓᥨᥛᥰ. ᥓᥣᥳ ᥛᥥᥰ ᥞᥭᥱ ᥛᥨᥝᥲ ᥘᥦᥝᥴ, ᥓᥣᥳ ᥛᥦᥝᥴ ᥟᥝ ᥟᥤᥰ ᥔᥣᥖᥱ. ᥓᥬ ᥐᥨᥢᥰ ᥟᥛᥱ ᥞᥨᥛ ᥗᥨᥭᥲ, ᥐᥤᥢ ᥐᥨᥭᥲ ᥐᥙᥴ ᥐᥫ ᥕᥒ ᥛᥤᥰ. ᥓᥬ ᥘᥛ ᥘᥩᥢᥰ ᥟᥛᥱ ᥘᥙᥴ, ᥓᥬ ᥓᥙᥴ ᥘᥩᥢᥰ ᥟᥛᥱ ᥘᥭᥲ. ᥓᥬ ᥙᥥᥝᥱ ᥓᥒᥱ ᥙᥤᥰ, ᥛᥤᥰ ᥒᥫᥢᥰ ᥓᥒᥱ ᥐᥭᥳ. ᥓᥬᥳ ᥙᥫᥢ ᥟᥛᥱ ᥓᥬᥳ ᥘᥣᥭ, ᥝᥣᥭᥰ ᥘᥒᥴ ᥓᥒᥱ ᥛᥣᥰ ᥗᥦᥒᥲ. ᥓᥝᥲ ᥐᥤᥢ ᥝᥣ ᥓᥝᥲ ᥛᥐ, ᥑᥣᥲ ᥐᥤᥢ ᥝᥣ ᥑᥣᥲ ᥞᥤᥖ. ᥓᥝᥲ ᥘᥣᥰ ᥛᥩᥒᥰ ᥜᥨᥢᥴ, ᥓᥝᥲ ᥐᥤᥰ ᥛᥩᥒᥰ ᥙᥩᥭᥰ. ᥓᥝᥲ ᥟᥛᥱ ᥕᥩᥒᥲ ᥑᥩᥒᥴ ᥟᥛᥱ ᥐᥣ, ᥓᥝᥲ ᥟᥛᥱ ᥔᥣ ᥑᥩᥒᥴ ᥟᥛᥱ ᥙᥨᥝᥰ.',
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.5,
                });
                break;

            case 'noto-tai-tham-sans' :
                mylabel.set({
                    fontString: '16px "Noto Tai Tham Sans"',
                    text: 'ᨾᨶᩩᩔ᩼ᨴ᩠ᨦᩢᩉᩖᩣ᩠ᨿᨠᩮ᩠ᨯᩨᨾᩣᨾᩦᨻ᩠ᨦᩈᩁᩓᩢᨹ᩠ᨿ᩵ᨦᨻ᩠ᨿᨦᨠ᩠ᨶᩢ ᨶᩱᨠᩥᨲ᩠ᨲᩥᩈ᩠ᨠᩢ ᩓᩢᩈᩥᨴ᩠ᨵᩥ ᨲ᩵ᩣ᩠ᨦᨣᩳ᩶ᨣᩢᨾᩦᨾᨶᩮᩣᨵᨾ᩠ᨾ᩼ᩓᩢ ᨣ | ᩋᨶᩥᩁᩮᩣᨵᨾ᩺ ᩋᨶᩩᨲ᩠ᨸᩣᨴᨾ᩺ ᩋᨶᩩᨧ᩠ᨨᩮᨴᨾ᩺ ᩋᩆᩣᩆ᩠ᩅᨲᨾ᩺ ᩋᨶᩮᨠᩣᩁ᩠ᨳᨾ᩺ ᩋᨶᩣᨶᩣᩁ᩠ᨳᨾ᩺ ᩋᨶᩣᨣᨾᨾ᩺ ᩋᨶᩥᩁ᩠ᨣᨾᨾ᩺ ᨿᩡ ᨸᩕᨲᩦᨲ᩠ᨿᩈᨾᩩᨲ᩠ᨸᩣᨴᩴ ᨸᩕᨸᨬ᩠ᨧᩮᩣᨸᩆᨾᩴ ᩆᩥᩅᨾ᩺ ᨴᩮᩆᨿᩣᨾᩣᩈ ᩈᩴᨻᩩᨴ᩠ᨵᩈ᩠ᨲᩴ ᩅᨶ᩠ᨴᩮ ᩅᨴᨲᩣᩴ ᩅᩁᨾ᩺ | ᨿᩮ ᨵᨾ᩠ᨾᩣ ᩉᩮᨲᩩᨸ᩠ᨸᨽᩅᩤ ᨲᩮᩈᩴ ᩉᩮᨲᩩᩴ ᨲᨳᩣᨣᨲᩮᩣ ᩋᩣᩉ ᨲᩮᩈᨬ᩠ᨧ ᨿᩮᩣ ᨶᩥᩁᩮᩣᨵᩮᩤ ᩑᩅᩴ ᩅᩤᨴᩦ ᨾᩉᩣᩈᨾᨱᩮᩣ',
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.8,
                });
                break;

            case 'noto-thai-looped-sans' :
                mylabel.set({
                    fontString: '16px "Noto Thai Looped Sans"',
                    text: 'ใน&#x200Bแผน&#x200Bเดิม&#x200Bรถไฟฟ้า&#x200Bแอร์&#x200Bพอร์ต เรล ลิงก์ สถานี&#x200Bมักกะสัน&#x200Bจะ&#x200Bเชื่อม&#x200Bต่อ&#x200Bกับ&#x200Bสถานี&#x200Bเพชรบุรี&#x200Bของ&#x200Bรถไฟฟ้า&#x200Bมหานคร&#x200Bที่&#x200Bชั้น ของ&#x200Bตัว&#x200Bอาคาร แต่&#x200Bเนื่องจาก&#x200Bเมื่อ&#x200Bสำรวจ&#x200Bเส้น&#x200Bทาง&#x200Bแล้ว พบ&#x200Bว่า&#x200Bเส้น&#x200Bทาง&#x200Bดัง&#x200Bกล่าว มี&#x200Bท่อ&#x200Bส่ง&#x200Bน้ำ&#x200Bมัน&#x200Bของ&#x200Bปตท. ตาม&#x200Bแนวทาง&#x200Bรถไฟ&#x200Bสาย&#x200Bตะวัน&#x200Bออก ท่อ&#x200Bน้ำ&#x200Bประปา&#x200Bของ&#x200Bการ&#x200Bประปา&#x200Bนครหลวง และ&#x200Bท่อ&#x200Bน้ำ&#x200Bทิ้ง&#x200Bลง&#x200Bคลอง&#x200Bแสน&#x200Bแสบ&#x200Bของ&#x200Bกรุงเทพมหานคร ที่&#x200Bการ&#x200Bรถไฟฟ้า&#x200Bขนส่ง&#x200Bมวลชน&#x200Bแห่ง&#x200Bประเทศไทย&#x200Bรื้อ&#x200Bย้าย&#x200Bจาก&#x200Bจุด&#x200Bเดิม&#x200Bเพื่อ&#x200Bก่อสร้าง&#x200Bสถานี&#x200Bเพชรบุรี ขวาง&#x200Bอยู่&#x200Bจึง&#x200Bทำให้&#x200Bการ&#x200Bขุด&#x200Bเจาะ&#x200Bทาง&#x200Bเชื่อม&#x200Bเข้า&#x200Bตัว&#x200Bสถานี&#x200Bรถไฟฟ้า&#x200Bมหานคร&#x200Bไม่&#x200Bสามารถ&#x200Bทำได้',
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.5,
                });
                break;

            case 'noto-thai-serif' :
                mylabel.set({
                    fontString: '16px "Noto Thai Serif"',
                    text: 'ใน&#x200Bแผน&#x200Bเดิม&#x200Bรถไฟฟ้า&#x200Bแอร์&#x200Bพอร์ต เรล ลิงก์ สถานี&#x200Bมักกะสัน&#x200Bจะ&#x200Bเชื่อม&#x200Bต่อ&#x200Bกับ&#x200Bสถานี&#x200Bเพชรบุรี&#x200Bของ&#x200Bรถไฟฟ้า&#x200Bมหานคร&#x200Bที่&#x200Bชั้น ของ&#x200Bตัว&#x200Bอาคาร แต่&#x200Bเนื่องจาก&#x200Bเมื่อ&#x200Bสำรวจ&#x200Bเส้น&#x200Bทาง&#x200Bแล้ว พบ&#x200Bว่า&#x200Bเส้น&#x200Bทาง&#x200Bดัง&#x200Bกล่าว มี&#x200Bท่อ&#x200Bส่ง&#x200Bน้ำ&#x200Bมัน&#x200Bของ&#x200Bปตท. ตาม&#x200Bแนวทาง&#x200Bรถไฟ&#x200Bสาย&#x200Bตะวัน&#x200Bออก ท่อ&#x200Bน้ำ&#x200Bประปา&#x200Bของ&#x200Bการ&#x200Bประปา&#x200Bนครหลวง และ&#x200Bท่อ&#x200Bน้ำ&#x200Bทิ้ง&#x200Bลง&#x200Bคลอง&#x200Bแสน&#x200Bแสบ&#x200Bของ&#x200Bกรุงเทพมหานคร ที่&#x200Bการ&#x200Bรถไฟฟ้า&#x200Bขนส่ง&#x200Bมวลชน&#x200Bแห่ง&#x200Bประเทศไทย&#x200Bรื้อ&#x200Bย้าย&#x200Bจาก&#x200Bจุด&#x200Bเดิม&#x200Bเพื่อ&#x200Bก่อสร้าง&#x200Bสถานี&#x200Bเพชรบุรี ขวาง&#x200Bอยู่&#x200Bจึง&#x200Bทำให้&#x200Bการ&#x200Bขุด&#x200Bเจาะ&#x200Bทาง&#x200Bเชื่อม&#x200Bเข้า&#x200Bตัว&#x200Bสถานี&#x200Bรถไฟฟ้า&#x200Bมหานคร&#x200Bไม่&#x200Bสามารถ&#x200Bทำได้',
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.5,
                });
                break;

            case 'noto-tirhuta-sans' :
                mylabel.set({
                    fontString: '16px "Noto Tirhuta Sans"',
                    text: '𑒮𑒩𑓂𑒫𑒹 𑒧𑒰𑒢𑒫𑒰𑓁 𑒮𑓂𑒫𑒞𑒢𑓂𑒞𑓂𑒩𑒰𑓁 𑒮𑒧𑒳𑒞𑓂𑒣𑒢𑓂𑒢𑒰𑓁 𑒫𑒩𑓂𑒞𑒢𑓂𑒞𑒹 𑒁𑒣𑒱 𑒔, 𑒑𑒾𑒩𑒫𑒠𑒵𑒬𑒰 𑒁𑒡𑒱𑒏𑒰𑒩𑒠𑒵𑒬𑒰 𑒔 𑒮𑒧𑒰𑒢𑒰𑓁 𑒋𑒫 𑒫𑒩𑓂𑒞𑒢𑓂𑒞𑒹। 𑒋𑒞𑒹 𑒮𑒩𑓂𑒫𑒹 𑒔𑒹𑒞𑒢𑒰𑒞𑒩𑓂𑒏𑒬𑒏𑓂𑒞𑒱𑒦𑓂𑒨𑒰𑓀 𑒮𑒳𑒮𑒧𑓂𑒣𑒢𑓂𑒢𑒰𑓁 𑒮𑒢𑓂𑒞𑒱। 𑒁𑒣𑒱 𑒔, 𑒮𑒩𑓂𑒫𑒹𑓄𑒣𑒱 𑒥𑒢𑓂𑒡𑒳𑒞𑓂𑒫𑒦𑒰𑒫𑒢𑒨𑒰 𑒣𑒩𑒮𑓂𑒣𑒩𑓀 𑒫𑓂𑒨𑒫𑒯𑒩𑒢𑓂𑒞𑒳। 𑒁𑒮𑓂𑒨𑒰𑓀 𑒁𑒦𑒱𑒒𑒼𑒭𑒝𑒰𑒨𑒰𑓀 𑒢𑒱𑒩𑓂𑒠𑒱𑒭𑓂𑒙𑒰𑓁 𑒮𑒩𑓂𑒫𑒹𑓄𑒣𑒱 𑒁𑒡𑒱𑒏𑒰𑒩𑒰𑓁 𑒮𑒩𑓂𑒫𑒰𑒝𑓂𑒨𑒣𑒱 𑒔 𑒮𑓂𑒫𑒰𑒞𑒢𑓂𑒞𑓂𑒩𑓂𑒨𑒰𑒝𑒱, 𑒫𑒱𑒢𑒻𑒫 𑒖𑒰𑒞𑒱𑒫𑒩𑓂𑒝𑒪𑒱𑓀𑒑𑒦𑒰𑒭𑒰𑒡𑒩𑓂𑒧𑒩𑒰𑒖𑒢𑒲𑒞𑒱𑒏𑒞𑒠𑒱𑒞𑒩𑒧𑒢𑓂𑒞𑒫𑓂𑒨𑒰𑒠𑒱𑒦𑒹𑒠𑒧𑓂, 𑒩𑒰𑒭𑓂𑒙𑓂𑒩𑒱𑒨𑓀 𑒮𑒰𑒧𑒰𑒖𑒱𑒏𑒰𑒡𑒰𑒩𑓀 𑒮𑒧𑓂𑒣𑒖𑓂𑒖𑒢𑓂𑒧𑒞𑒠𑒱𑒞𑒩 𑒮𑓂𑒞𑒩𑒘𑓂𑒔 𑒁𑒫𑒱𑒑𑒝𑒨𑓂𑒨, 𑒁𑒡𑒱𑒑𑒢𑓂𑒞𑒳𑓀 𑒮𑒩𑓂𑒫𑒼𑓄𑒣𑒱 𑒖𑒢𑓁 𑒣𑓂𑒩𑒦𑒫𑒞𑒱। 𑒋𑒞𑒠𑒞𑒱𑒩𑒱𑒏𑓂𑒞𑒧𑓂, 𑒏𑒮𑓂𑒨𑒰𑒬𑓂𑒔𑒱𑒠𑒣𑒱 𑒣𑓂𑒩𑒦𑒳𑒮𑒞𑓂𑒞𑒰𑒨𑒰𑓁 𑒢𑒱𑒨𑒧𑒢𑒰𑒢𑓂𑒞𑒩𑓂𑒑𑒞𑒧𑓂, 𑒮𑓂𑒫𑒰𑒡𑒲𑒢𑒮𑓂𑒨 𑒂𑒞𑓂𑒧𑒣𑓂𑒩𑒬𑒰𑒮𑒢𑒹𑒞𑒩𑒞𑒢𑓂𑒞𑓂𑒩𑒮𑓂𑒨',
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.5,
                });
                break;

            case 'bungee' :
                mylabel.set({
                    fontString: '16px "Bungee"',
                    text: westernText,
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.5,
                });
                break;

            case 'carter-one' :
                mylabel.set({
                    fontString: '16px "Carter One"',
                    text: westernText,
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.5,
                });
                break;

            case 'mountains-of-christmas' :
                mylabel.set({
                    fontString: '16px "Mountains Of Christmas"',
                    text: westernText,
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.5,
                });
                break;

            default:
                mylabel.set({
                    fontString: '16px serif',
                    text: westernText,
                    direction: 'ltr',
                    breakTextOnSpaces: true,
                    lineSpacing: 1.5,
                });
        }

        updateDisplayText();
    }
};
scrawl.addNativeListener('change', (e) => updateFont(e), fontSelector);


// Setup form
// @ts-expect-error
fontSelector.options.selectedIndex = 0;
// @ts-expect-error
layoutEngineSelector.options.selectedIndex = 0;

// @ts-expect-error
document.querySelector('#startX').value = 50;
// @ts-expect-error
document.querySelector('#startY').value = 50;
// @ts-expect-error
document.querySelector('#handleX').value = 50;
// @ts-expect-error
document.querySelector('#handleY').value = 50;
// @ts-expect-error
document.querySelector('#offsetX').value = 0;
// @ts-expect-error
document.querySelector('#offsetY').value = 0;
// @ts-expect-error
document.querySelector('#width').value = 60;
// @ts-expect-error
document.querySelector('#height').value = 80;
// @ts-expect-error
document.querySelector('#scale').value = 1;
// @ts-expect-error
document.querySelector('#roll').value = 0;
// @ts-expect-error
document.querySelector('#layoutEngineLineOffset').value = 0;
// @ts-expect-error
document.querySelector('#justifyLine').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#alignment').value = 0;

// #### Development and testing
console.log(scrawl.library);
