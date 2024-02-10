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


const westernText = 'Lorem ipsum dolor sit amet, consectetur 😀 adipiscing &eacute;lit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure d&ouml;lor in reprehenderit 🤖&icirc;n voluptate velit &copy;2024 esse cillum dolore eu fug🎻iat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui offici&thorn;a deserunt mollit anim id est laborum.';


const blockEngine = scrawl.makeBlock({

    name: name('block-layout-engine'),
    start: ['center', 'center'],
    handle: ['center', 'center'],
    dimensions: ['60%', '80%'],
    fillStyle: 'beige',
});

const wheelEngine = scrawl.makeWheel({

    name: name('wheel-layout-engine'),
    width: '60%',
    start: ['center', 'center'],
    handle: ['center', 'center'],
    fillStyle: 'beige',
    visibility: false,
});

const engineGroup = scrawl.makeGroup({

    name: name('layout-engines'),

}).addArtefacts(blockEngine, wheelEngine);


const mylabel = scrawl.makeEnhancedLabel({

    name: name('my-label'),
    fontString: '16px serif',
    text: westernText,

    showBoundingBox: true,

    // method: 'draw',

    layoutEngine: name('block-layout-engine'),
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
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: mylabel,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        wordSpacing: ['wordSpacing', 'px'],
        letterSpacing: ['letterSpacing', 'px'],
        layoutEngineLineOffset: ['layoutEngineLineOffset', 'float'],
        layoutEngineVerticalText: ['layoutEngineVerticalText', 'boolean'],
        localRoll: ['roll', 'float'],
    },
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
                });
                break;

            // <option value="serif-normal">serif (lh: normal)</option>
            case 'serif-normal' :
                mylabel.set({
                    fontString: '16px / normal serif',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            // <option value="serif-ratio">serif (lh: ratio)</option>
            case 'serif-ratio' :
                mylabel.set({
                    fontString: '16px / 2.5 serif',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            // <option value="serif-length">serif (lh: length)</option>
            case 'serif-length' :
                mylabel.set({
                    fontString: '16px / 3em serif',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            // <option value="serif-percent">serif (lh: percent)</option>
            case 'serif-percent' :
                mylabel.set({
                    fontString: '16px / 180% serif',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            // <option value="serif-px">serif (lh: px)</option>
            case 'serif-px' :
                mylabel.set({
                    fontString: '16px / 30px serif',
                    text: westernText,
                    direction: 'ltr',
                });
                break;


            case 'sans-serif' :
                mylabel.set({
                    fontString: '16px sans-serif',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            case 'monospace' :
                mylabel.set({
                    fontString: '16px monospace',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            case 'cursive' :
                mylabel.set({
                    fontString: '16px cursive',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            case 'fantasy' :
                mylabel.set({
                    fontString: '16px fantasy',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            case 'garamond' :
                mylabel.set({
                    fontString: '16px Garamond',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            case 'garamond-bold' :
                mylabel.set({
                    fontString: 'bold 16px Garamond',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            case 'garamond-italic' :
                mylabel.set({
                    fontString: 'italic 16px Garamond',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            case 'garamond-bolditalic' :
                mylabel.set({
                    fontString: 'bold italic 16px Garamond',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            case 'roboto' :
                mylabel.set({
                    fontString: '16px "Roboto Sans"',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            case 'roboto-bold' :
                mylabel.set({
                    fontString: 'bold 16px "Roboto Sans"',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            case 'roboto-italic' :
                mylabel.set({
                    fontString: 'italic 16px "Roboto Sans"',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            case 'roboto-bolditalic' :
                mylabel.set({
                    fontString: 'bold italic 16px "Roboto Sans"',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            case 'roboto-serif' :
                mylabel.set({
                    fontString: '16px "Roboto Serif"',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            case 'roboto-serif-bold' :
                mylabel.set({
                    fontString: 'bold 16px "Roboto Serif"',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            case 'roboto-serif-italic' :
                mylabel.set({
                    fontString: 'italic 16px "Roboto Serif"',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            case 'roboto-serif-bolditalic' :
                mylabel.set({
                    fontString: 'bold italic 16px "Roboto Serif"',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            case 'roboto-mono' :
                mylabel.set({
                    fontString: '16px "Roboto Mono"',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            case 'roboto-mono-bold' :
                mylabel.set({
                    fontString: 'bold 16px "Roboto Mono"',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            case 'roboto-mono-italic' :
                mylabel.set({
                    fontString: 'italic 16px "Roboto Mono"',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            case 'roboto-mono-bolditalic' :
                mylabel.set({
                    fontString: 'bold italic 16px "Roboto Mono"',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            case 'noto-arabic-sans' :
                mylabel.set({
                    fontString: '16px "Noto Arabic Sans"',
                    text: 'لا يعرض أحد لتدخل تعسفي في حياته الخاصة أو أسرته أو مسكنه أو مراسلاته أو لحملات على شرفه وسمعته. ولكل شخص الحق في حماية القانون من مثل هذا التدخل أو تلك الحملات. لكل شخص الحق في حرية التفكير والضمير والدين. ويشمل هذا الحق حرية تغيير ديانته أو عقيدته، وحرية الإعراب عنهما بالتعليم والممارسة وإقامة الشعائر ومراعاتها سواء أكان ذلك سرا أم مع الجماعة. لكل شخص الحق في حرية الرأي والتعبير.',
                    direction: 'rtl',
                });
                break;

            case 'noto-arabic-naskh' :
                mylabel.set({
                    fontString: '16px "Noto Arabic Naskh"',
                    text: 'لا يعرض أحد لتدخل تعسفي في حياته الخاصة أو أسرته أو مسكنه أو مراسلاته أو لحملات على شرفه وسمعته. ولكل شخص الحق في حماية القانون من مثل هذا التدخل أو تلك الحملات. لكل شخص الحق في حرية التفكير والضمير والدين. ويشمل هذا الحق حرية تغيير ديانته أو عقيدته، وحرية الإعراب عنهما بالتعليم والممارسة وإقامة الشعائر ومراعاتها سواء أكان ذلك سرا أم مع الجماعة. لكل شخص الحق في حرية الرأي والتعبير.',
                    direction: 'rtl',
                });
                break;

            case 'noto-urdu-nastaliq' :
                mylabel.set({
                    fontString: '16px "Noto Urdu Nastaliq"',
                    text: 'لا يعرض أحد لتدخل تعسفي في حياته الخاصة أو أسرته أو مسكنه أو مراسلاته أو لحملات على شرفه وسمعته. ولكل شخص الحق في حماية القانون من مثل هذا التدخل أو تلك الحملات. لكل شخص الحق في حرية التفكير والضمير والدين. ويشمل هذا الحق حرية تغيير ديانته أو عقيدته، وحرية الإعراب عنهما بالتعليم والممارسة وإقامة الشعائر ومراعاتها سواء أكان ذلك سرا أم مع الجماعة. لكل شخص الحق في حرية الرأي والتعبير.',
                    direction: 'rtl',
                });
                break;

            case 'noto-chinese-simple-sans' :
                mylabel.set({
                    fontString: '16px "Noto Chinese Simple Sans"',
                    text: '鉴于对人类家庭所有成员的固有尊严及其平等的和不移的权利的承认,乃是世界自由、正义与和平的基础, 鉴于对人权的无视和侮蔑已发展为野蛮暴行,这些暴行玷污了人类的良心,而一个人人享有言论和信仰自由并免予恐惧和匮乏的世界的来临,已被宣布为普通人民的最高愿望, 鉴于为使人类不致迫不得已铤而走险对暴政和压迫进行反叛,有必要使人权受法治的保护, 鉴于有必要促进各国间友好关系的发展。',
                    direction: 'ltr',
                });
                break;

            case 'noto-chinese-simple-serif' :
                mylabel.set({
                    fontString: '16px "Noto Chinese Simple Serif"',
                    text: '鉴于对人类家庭所有成员的固有尊严及其平等的和不移的权利的承认,乃是世界自由、正义与和平的基础, 鉴于对人权的无视和侮蔑已发展为野蛮暴行,这些暴行玷污了人类的良心,而一个人人享有言论和信仰自由并免予恐惧和匮乏的世界的来临,已被宣布为普通人民的最高愿望, 鉴于为使人类不致迫不得已铤而走险对暴政和压迫进行反叛,有必要使人权受法治的保护, 鉴于有必要促进各国间友好关系的发展。',
                    direction: 'ltr',
                });
                break;

            case 'noto-devangari-sans' :
                mylabel.set({
                    fontString: '16px "Noto Devangari Sans"',
                    text: 'प्रत्येक व्यक्ति को विचार और उसकी अभिव्यक्ति की स्वतन्त्रता का अधिकार है । इसके अन्तर्गत बिना हस्तक्षेप के कोई राय रखना और किसी भी माध्यम के ज़रिए से तथा सीमाओं की परवाह न कर के किसी की मूचना और धारणा का अन्वेषण, प्रहण तथा प्रदान सम्मिलित है । समाज के एक सदस्य के रूप में प्रत्येक व्यक्ति को सामाजिक सुरक्षा का अधिकार है और प्रत्येक व्यक्ति को अपने व्यक्तित्व के उस स्वतन्त्र विकास तथा गोरव के लिए—जो राष्ट्रीय प्रयत्न या अन्तर्राष्ट्रीय सहयोग तथा प्रत्येक राज्य के संगठन एवं साधनों के अनुकूल हो ।',
                    direction: 'ltr',
                });
                break;

            case 'noto-devangari-serif' :
                mylabel.set({
                    fontString: '16px "Noto Devangari Serif"',
                    text: 'प्रत्येक व्यक्ति को विचार और उसकी अभिव्यक्ति की स्वतन्त्रता का अधिकार है । इसके अन्तर्गत बिना हस्तक्षेप के कोई राय रखना और किसी भी माध्यम के ज़रिए से तथा सीमाओं की परवाह न कर के किसी की मूचना और धारणा का अन्वेषण, प्रहण तथा प्रदान सम्मिलित है । समाज के एक सदस्य के रूप में प्रत्येक व्यक्ति को सामाजिक सुरक्षा का अधिकार है और प्रत्येक व्यक्ति को अपने व्यक्तित्व के उस स्वतन्त्र विकास तथा गोरव के लिए—जो राष्ट्रीय प्रयत्न या अन्तर्राष्ट्रीय सहयोग तथा प्रत्येक राज्य के संगठन एवं साधनों के अनुकूल हो ।',
                    direction: 'ltr',
                });
                break;

            case 'noto-hebrew-sans' :
                mylabel.set({
                    fontString: '16px "Noto Hebrew Sans"',
                    text: 'כל אדם זכאי לחירות הדעה והבטוי, לרבות החירות להחיק בדעות ללא כל הפרעה, ולבקש ידיעות ודעות, ולקבלן ולמסרן בכל הדרכים וללא סייגי גבולות כל אדם, כחבר החברה, זכאי לבטחון סוציאלי וזכאי לתבוע שהזכויות הכלכליות הסוציאליות והתרבותיות, שהן חיוניות לכבודו כאדם ולהתפתחות החופשית של אישיותו, יובטחו במשמץ לאומי ובשיתוף פעולה בינלאומי בהתאם לארגונה ולאוצרותיה של המדינה כל אדם זכאי למנוחה ולפנאי',
                    direction: 'rtl',
                });
                break;

            case 'noto-hebrew-serif' :
                mylabel.set({
                    fontString: '16px "Noto Hebrew Serif"',
                    text: 'כל אדם זכאי לחירות הדעה והבטוי, לרבות החירות להחיק בדעות ללא כל הפרעה, ולבקש ידיעות ודעות, ולקבלן ולמסרן בכל הדרכים וללא סייגי גבולות כל אדם, כחבר החברה, זכאי לבטחון סוציאלי וזכאי לתבוע שהזכויות הכלכליות הסוציאליות והתרבותיות, שהן חיוניות לכבודו כאדם ולהתפתחות החופשית של אישיותו, יובטחו במשמץ לאומי ובשיתוף פעולה בינלאומי בהתאם לארגונה ולאוצרותיה של המדינה כל אדם זכאי למנוחה ולפנאי',
                    direction: 'rtl',
                });
                break;

            case 'noto-japanese-sans' :
                mylabel.set({
                    fontString: '16px "Noto Japanese Sans"',
                    text: '人類社会のすべての構成員の固有の尊厳と平等で譲ることのできない権利とを承認することは、世界における自由、正義及び平和の基礎であるので、 人権の無視及び軽侮が、人類の良心を踏みにじった野蛮行為をもたらし、言論及び信仰の自由が受けられ、恐怖及び欠乏のない世界の到来が、一般の人々の最高の願望として宣言されたので、 人間が専制と圧迫とに対する最後の手段として反逆に訴えることがないようにするためには、法の支配によって人権を保護することが肝要であるので、 諸国間の友好関係の発展を促進することが肝要であるので、',
                    direction: 'ltr',
                });
                break;

            case 'noto-japanese-serif' :
                mylabel.set({
                    fontString: '16px "Noto Japanese Serif"',
                    text: '人類社会のすべての構成員の固有の尊厳と平等で譲ることのできない権利とを承認することは、世界における自由、正義及び平和の基礎であるので、 人権の無視及び軽侮が、人類の良心を踏みにじった野蛮行為をもたらし、言論及び信仰の自由が受けられ、恐怖及び欠乏のない世界の到来が、一般の人々の最高の願望として宣言されたので、 人間が専制と圧迫とに対する最後の手段として反逆に訴えることがないようにするためには、法の支配によって人権を保護することが肝要であるので、 諸国間の友好関係の発展を促進することが肝要であるので、',
                    direction: 'ltr',
                });
                break;

            case 'noto-korean-sans' :
                mylabel.set({
                    fontString: '16px "Noto Korean Sans"',
                    text: '모든 사람은 의견의 자유와 표현의 자유에 대한 권리를 가진다. 이러한 권리는 간섭없이 의견을 가질 자유와 국경에 관계없이 어떠한 매체를 통해서도 정보와 사상을 추구하고, 얻으며, 전달하는 자유를 포함한다. 모든 사람은 사회의 일원으로서 사회보장을 받을 권리를 가지며, 국가적 노력과 국제적 협력을 통하여, 그리고 각 국가의 조직과 자원에 따라서 자신의 존엄과 인격의 자유로운 발전에 불가결한 경제적, 사회적 및 문화적 권리들을 실현할 권리를 가진다. 모든 사람은 노동시간의 합리적 제한과 정기적인 유급휴가를 포함하여 휴식과 여가의 권리를 가진다',
                    direction: 'ltr',
                });
                break;

            case 'noto-korean-serif' :
                mylabel.set({
                    fontString: '16px "Noto Korean Serif"',
                    text: '모든 사람은 의견의 자유와 표현의 자유에 대한 권리를 가진다. 이러한 권리는 간섭없이 의견을 가질 자유와 국경에 관계없이 어떠한 매체를 통해서도 정보와 사상을 추구하고, 얻으며, 전달하는 자유를 포함한다. 모든 사람은 사회의 일원으로서 사회보장을 받을 권리를 가지며, 국가적 노력과 국제적 협력을 통하여, 그리고 각 국가의 조직과 자원에 따라서 자신의 존엄과 인격의 자유로운 발전에 불가결한 경제적, 사회적 및 문화적 권리들을 실현할 권리를 가진다. 모든 사람은 노동시간의 합리적 제한과 정기적인 유급휴가를 포함하여 휴식과 여가의 권리를 가진다',
                    direction: 'ltr',
                });
                break;

            case 'noto-mongolian-sans' :
                mylabel.set({
                    fontString: '16px "Noto Mongolian Sans"',
                    text: 'ᠬᠦᠮᠦᠨ ᠪᠦᠷ ᠲᠥᠷᠥᠵᠦ ᠮᠡᠨᠳᠡᠯᠡᠬᠦ ᠡᠷᠬᠡ ᠴᠢᠯᠥᠭᠡ ᠲᠡᠢ᠂ ᠠᠳᠠᠯᠢᠬᠠᠨ ᠨᠡᠷ᠎ᠡ ᠲᠥᠷᠥ ᠲᠡᠢ᠂ ᠢᠵᠢᠯ ᠡᠷᠬᠡ ᠲᠡᠢ ᠪᠠᠢᠠᠭ᠃ ᠣᠶᠤᠨ ᠤᠬᠠᠭᠠᠨ᠂ ᠨᠠᠨᠳᠢᠨ ᠴᠢᠨᠠᠷ ᠵᠠᠶᠠᠭᠠᠰᠠᠨ ᠬᠦᠮᠦᠨ ᠬᠡᠭᠴᠢ ᠥᠭᠡᠷ᠎ᠡ ᠬᠣᠭᠣᠷᠣᠨᠳᠣ᠎ᠨ ᠠᠬᠠᠨ ᠳᠡᠭᠦᠦ ᠢᠨ ᠦᠵᠢᠯ ᠰᠠᠨᠠᠭᠠ ᠥᠠᠷ ᠬᠠᠷᠢᠴᠠᠬᠥ ᠤᠴᠢᠷ ᠲᠠᠢ᠃ ᠬᠦᠮᠦᠨ ᠪᠦᠷ ᠲᠥᠷᠥᠵᠦ ᠮᠡᠨᠳᠡᠯᠡᠬᠦ ᠡᠷᠬᠡ ᠴᠢᠯᠥᠭᠡ ᠲᠡᠢ᠂ ᠠᠳᠠᠯᠢᠬᠠᠨ ᠨᠡᠷ᠎ᠡ ᠲᠥᠷᠥ ᠲᠡᠢ᠂ ᠢᠵᠢᠯ ᠡᠷᠬᠡ ᠲᠡᠢ ᠪᠠᠢᠠᠭ᠃',
                    direction: 'ltr',
                });
                break;

            case 'noto-tai-le-sans' :
                mylabel.set({
                    fontString: '16px "Noto Tai Le Sans"',
                    text: 'ᥓᥣᥳ ᥞᥨᥛ ᥑᥤᥴ, ᥘᥤ ᥞᥨᥛ ᥓᥨᥛᥰ. ᥓᥣᥳ ᥙᥣᥰ ᥘᥤ, ᥑᥤᥴ ᥙᥣᥰ ᥓᥨᥛᥰ. ᥓᥣᥳ ᥛᥥᥰ ᥞᥭᥱ ᥛᥨᥝᥲ ᥘᥦᥝᥴ, ᥓᥣᥳ ᥛᥦᥝᥴ ᥟᥝ ᥟᥤᥰ ᥔᥣᥖᥱ. ᥓᥬ ᥐᥨᥢᥰ ᥟᥛᥱ ᥞᥨᥛ ᥗᥨᥭᥲ, ᥐᥤᥢ ᥐᥨᥭᥲ ᥐᥙᥴ ᥐᥫ ᥕᥒ ᥛᥤᥰ. ᥓᥬ ᥘᥛ ᥘᥩᥢᥰ ᥟᥛᥱ ᥘᥙᥴ, ᥓᥬ ᥓᥙᥴ ᥘᥩᥢᥰ ᥟᥛᥱ ᥘᥭᥲ. ᥓᥬ ᥙᥥᥝᥱ ᥓᥒᥱ ᥙᥤᥰ, ᥛᥤᥰ ᥒᥫᥢᥰ ᥓᥒᥱ ᥐᥭᥳ. ᥓᥬᥳ ᥙᥫᥢ ᥟᥛᥱ ᥓᥬᥳ ᥘᥣᥭ, ᥝᥣᥭᥰ ᥘᥒᥴ ᥓᥒᥱ ᥛᥣᥰ ᥗᥦᥒᥲ. ᥓᥝᥲ ᥐᥤᥢ ᥝᥣ ᥓᥝᥲ ᥛᥐ, ᥑᥣᥲ ᥐᥤᥢ ᥝᥣ ᥑᥣᥲ ᥞᥤᥖ. ᥓᥝᥲ ᥘᥣᥰ ᥛᥩᥒᥰ ᥜᥨᥢᥴ, ᥓᥝᥲ ᥐᥤᥰ ᥛᥩᥒᥰ ᥙᥩᥭᥰ. ᥓᥝᥲ ᥟᥛᥱ ᥕᥩᥒᥲ ᥑᥩᥒᥴ ᥟᥛᥱ ᥐᥣ, ᥓᥝᥲ ᥟᥛᥱ ᥔᥣ ᥑᥩᥒᥴ ᥟᥛᥱ ᥙᥨᥝᥰ.',
                    direction: 'ltr',
                });
                break;

            case 'noto-tai-tham-sans' :
                mylabel.set({
                    fontString: '16px "Noto Tai Tham Sans"',
                    text: 'ᨾᨶᩩᩔ᩼ᨴ᩠ᨦᩢᩉᩖᩣ᩠ᨿᨠᩮ᩠ᨯᩨᨾᩣᨾᩦᨻ᩠ᨦᩈᩁᩓᩢᨹ᩠ᨿ᩵ᨦᨻ᩠ᨿᨦᨠ᩠ᨶᩢ ᨶᩱᨠᩥᨲ᩠ᨲᩥᩈ᩠ᨠᩢ ᩓᩢᩈᩥᨴ᩠ᨵᩥ ᨲ᩵ᩣ᩠ᨦᨣᩳ᩶ᨣᩢᨾᩦᨾᨶᩮᩣᨵᨾ᩠ᨾ᩼ᩓᩢ ᨣ',
                    direction: 'ltr',
                });
                break;

            case 'noto-thai-looped-sans' :
                mylabel.set({
                    fontString: '16px "Noto Thai Looped Sans"',
                    text: 'โดยที่การยอมรับศักดิ์ศรีแต่กำเนิด และสิทธิที่เท่าเทียมกันและที่ไม่อาจเพิกถอนได้ของสมาชิกทั้งมวลแห่งครอบครัวมนุษยชาติ เป็นพื้นฐานแห่งอิสรภาพ ความยุติธรรม และสันติภาพในโลก การไม่นำพาและการหมิ่นในคุณค่าของสิทธิมนุษยชน ยังผลให้มีการกระทำอันป่าเถื่อน ซึ่งเป็นการขัดอย่างร้ายแรงต่อมโนธรรมของมนุษยชาติ และการมาถึงของโลกที่ได้มีการประกาศให้ความมีอิสรภาพในการพูดและความเชื่อ และอิสรภาพจากความหวาดกลัวและความต้องการของมนุษย์ เป็นความปรารถนาสูงสุดของประชาชนทั่วไป',
                    direction: 'ltr',
                });
                break;

            case 'noto-thai-serif' :
                mylabel.set({
                    fontString: '16px "Noto Thai Serif"',
                    text: 'โดยที่การยอมรับศักดิ์ศรีแต่กำเนิด และสิทธิที่เท่าเทียมกันและที่ไม่อาจเพิกถอนได้ของสมาชิกทั้งมวลแห่งครอบครัวมนุษยชาติ เป็นพื้นฐานแห่งอิสรภาพ ความยุติธรรม และสันติภาพในโลก การไม่นำพาและการหมิ่นในคุณค่าของสิทธิมนุษยชน ยังผลให้มีการกระทำอันป่าเถื่อน ซึ่งเป็นการขัดอย่างร้ายแรงต่อมโนธรรมของมนุษยชาติ และการมาถึงของโลกที่ได้มีการประกาศให้ความมีอิสรภาพในการพูดและความเชื่อ และอิสรภาพจากความหวาดกลัวและความต้องการของมนุษย์ เป็นความปรารถนาสูงสุดของประชาชนทั่วไป',
                    direction: 'ltr',
                });
                break;

            case 'noto-tirhuta-sans' :
                mylabel.set({
                    fontString: '16px "Noto Tirhuta Sans"',
                    text: '𑒮𑒩𑓂𑒫𑒹 𑒧𑒰𑒢𑒫𑒰𑓁 𑒮𑓂𑒫𑒞𑒢𑓂𑒞𑓂𑒩𑒰𑓁 𑒮𑒧𑒳𑒞𑓂𑒣𑒢𑓂𑒢𑒰𑓁 𑒫𑒩𑓂𑒞𑒢𑓂𑒞𑒹 𑒁𑒣𑒱 𑒔, 𑒑𑒾𑒩𑒫𑒠𑒵𑒬𑒰 𑒁𑒡𑒱𑒏𑒰𑒩𑒠𑒵𑒬𑒰 𑒔 𑒮𑒧𑒰𑒢𑒰𑓁 𑒋𑒫 𑒫𑒩𑓂𑒞𑒢𑓂𑒞𑒹। 𑒋𑒞𑒹 𑒮𑒩𑓂𑒫𑒹 𑒔𑒹𑒞𑒢𑒰𑒞𑒩𑓂𑒏𑒬𑒏𑓂𑒞𑒱𑒦𑓂𑒨𑒰𑓀 𑒮𑒳𑒮𑒧𑓂𑒣𑒢𑓂𑒢𑒰𑓁 𑒮𑒢𑓂𑒞𑒱। 𑒁𑒣𑒱 𑒔, 𑒮𑒩𑓂𑒫𑒹𑓄𑒣𑒱 𑒥𑒢𑓂𑒡𑒳𑒞𑓂𑒫𑒦𑒰𑒫𑒢𑒨𑒰 𑒣𑒩𑒮𑓂𑒣𑒩𑓀 𑒫𑓂𑒨𑒫𑒯𑒩𑒢𑓂𑒞𑒳। 𑒁𑒮𑓂𑒨𑒰𑓀 𑒁𑒦𑒱𑒒𑒼𑒭𑒝𑒰𑒨𑒰𑓀 𑒢𑒱𑒩𑓂𑒠𑒱𑒭𑓂𑒙𑒰𑓁 𑒮𑒩𑓂𑒫𑒹𑓄𑒣𑒱 𑒁𑒡𑒱𑒏𑒰𑒩𑒰𑓁 𑒮𑒩𑓂𑒫𑒰𑒝𑓂𑒨𑒣𑒱 𑒔 𑒮𑓂𑒫𑒰𑒞𑒢𑓂𑒞𑓂𑒩𑓂𑒨𑒰𑒝𑒱, 𑒫𑒱𑒢𑒻𑒫 𑒖𑒰𑒞𑒱𑒫𑒩𑓂𑒝𑒪𑒱𑓀𑒑𑒦𑒰𑒭𑒰𑒡𑒩𑓂𑒧𑒩𑒰𑒖𑒢𑒲𑒞𑒱𑒏𑒞𑒠𑒱𑒞𑒩𑒧𑒢𑓂𑒞𑒫𑓂𑒨𑒰𑒠𑒱𑒦𑒹𑒠𑒧𑓂, 𑒩𑒰𑒭𑓂𑒙𑓂𑒩𑒱𑒨𑓀 𑒮𑒰𑒧𑒰𑒖𑒱𑒏𑒰𑒡𑒰𑒩𑓀 𑒮𑒧𑓂𑒣𑒖𑓂𑒖𑒢𑓂𑒧𑒞𑒠𑒱𑒞𑒩 𑒮𑓂𑒞𑒩𑒘𑓂𑒔 𑒁𑒫𑒱𑒑𑒝𑒨𑓂𑒨, 𑒁𑒡𑒱𑒑𑒢𑓂𑒞𑒳𑓀 𑒮𑒩𑓂𑒫𑒼𑓄𑒣𑒱 𑒖𑒢𑓁 𑒣𑓂𑒩𑒦𑒫𑒞𑒱। 𑒋𑒞𑒠𑒞𑒱𑒩𑒱𑒏𑓂𑒞𑒧𑓂, 𑒏𑒮𑓂𑒨𑒰𑒬𑓂𑒔𑒱𑒠𑒣𑒱 𑒣𑓂𑒩𑒦𑒳𑒮𑒞𑓂𑒞𑒰𑒨𑒰𑓁 𑒢𑒱𑒨𑒧𑒢𑒰𑒢𑓂𑒞𑒩𑓂𑒑𑒞𑒧𑓂, 𑒮𑓂𑒫𑒰𑒡𑒲𑒢𑒮𑓂𑒨 𑒂𑒞𑓂𑒧𑒣𑓂𑒩𑒬𑒰𑒮𑒢𑒹𑒞𑒩𑒞𑒢𑓂𑒞𑓂𑒩𑒮𑓂𑒨',
                    direction: 'ltr',
                });
                break;

            case 'bungee' :
                mylabel.set({
                    fontString: '16px "Bungee"',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            case 'bungee-spice' :
                mylabel.set({
                    fontString: '16px "Bungee Spice"',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            case 'carter-one' :
                mylabel.set({
                    fontString: '16px "Carter One"',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            case 'mountains-of-christmas' :
                mylabel.set({
                    fontString: '16px "Mountains Of Christmas"',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            default:
                mylabel.set({
                    fontString: '16px serif',
                    text: westernText,
                    direction: 'ltr',
                });
        }
    }
};
scrawl.addNativeListener('change', (e) => updateFont(e), fontSelector);


// Setup form
// @ts-expect-error
fontSelector.options.selectedIndex = 0;
// @ts-expect-error
layoutEngineSelector.options.selectedIndex = 0;

// @ts-expect-error
document.querySelector('#letterSpacing').value = 0;
// @ts-expect-error
document.querySelector('#wordSpacing').value = 0;

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
document.querySelector('#layoutEngineVerticalText').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#localRoll').value = 0;

// #### Development and testing
console.log(scrawl.library);
