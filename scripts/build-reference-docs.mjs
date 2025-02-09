import fs from 'node:fs/promises';
import showdown from 'showdown';

const pages = [
    {
        id: 'repo-structure',
        tabTitle: 'Runbook: structure',
        label: 'Repository structure, and release protocol',
        description: '',
        indexOrder: 0,
    },
    {
        id: 'source-code-structure',
        tabTitle: 'Runbook: source code',
        label: 'Scrawl-canvas source code structure',
        description: '',
        indexOrder: 1,
    },
    {
        id: 'sc-initialization',
        tabTitle: 'Runbook: initialization',
        label: 'Scrawl-canvas page load initialization',
        description: '',
        indexOrder: 2,
    },
    {
        id: 'sc-objects-overview',
        tabTitle: 'Runbook: SC objects',
        label: 'Scrawl-canvas objects overview',
        description: '',
        indexOrder: 3,
    },
    {
        id: 'sc-canvas-artefact',
        tabTitle: 'Runbook: canvases',
        label: 'Scrawl-canvas Canvas artefacts',
        description: '',
        indexOrder: 4,
    },
    {
        id: 'sc-stack-artefact',
        tabTitle: 'Runbook: DOM stacks',
        label: 'Scrawl-canvas Stack artefacts',
        description: '',
        indexOrder: 5,
    },
    {
        id: 'sc-responsiveness',
        tabTitle: 'Runbook: responsiveness',
        label: 'Scrawl-canvas responsive behaviour',
        description: '',
        indexOrder: 6,
    },
    {
        id: 'sc-accessibility',
        tabTitle: 'Runbook: accessibility',
        label: 'Scrawl-canvas and accessibility',
        description: '',
        indexOrder: 7,
    },
    {
        id: 'sc-assets',
        tabTitle: 'Runbook: assets',
        label: 'Scrawl-canvas asset management and use',
        description: '',
        indexOrder: 8,
    },
    {
        id: 'sc-styles',
        tabTitle: 'Runbook: styles',
        label: 'Scrawl-canvas styles management and use',
        description: '',
        indexOrder: 9,
    },
    {
        id: 'sc-groups',
        tabTitle: 'Runbook: groups',
        label: 'Scrawl-canvas groups',
        description: '',
        indexOrder: 10,
    },
    {
        id: 'sc-positioning',
        tabTitle: 'Runbook: positioning',
        label: 'The Scrawl-canvas positioning system',
        description: '',
        indexOrder: 11,
    },
    {
        id: 'sc-animation-system',
        tabTitle: 'Runbook: animation',
        label: 'The Scrawl-canvas animation system',
        description: '',
        indexOrder: 12,
    },
    {
        id: 'sc-delta-animation',
        tabTitle: 'Runbook: delta animation',
        label: 'Scrawl-canvas delta animation',
        description: '',
        indexOrder: 13,
    },
    {
        id: 'sc-tween-animation',
        tabTitle: 'Runbook: tween animation',
        label: 'Scrawl-canvas tween animation, and timelines',
        description: '',
        indexOrder: 14,
    },
    {
        id: 'sc-filter-engine',
        tabTitle: 'Runbook: filter engine',
        label: 'The Scrawl-canvas filter engine',
        description: '',
        indexOrder: 15,
    },
    {
        id: 'sc-particle-engine',
        tabTitle: 'Runbook: particle engine',
        label: 'The Scrawl-canvas particle engine',
        description: '',
        indexOrder: 16,
    },
    {
        id: 'sc-text-layout-engine',
        tabTitle: 'Runbook: text engine',
        label: 'The Scrawl-canvas text-layout engine',
        description: '',
        indexOrder: 17,
    },
    {
        id: 'sc-display-cycle',
        tabTitle: 'Runbook: display cycle',
        label: 'The Scrawl-canvas Display cycle',
        description: '',
        indexOrder: 18,
    },
    {
        id: 'sc-simple-entitys',
        tabTitle: 'Runbook: simple entitys',
        label: 'Scrawl-canvas simple entitys',
        description: '',
        indexOrder: 19,
    },
    {
        id: 'sc-path-based-entitys',
        tabTitle: 'Runbook: path entitys',
        label: 'Scrawl-canvas path-based entitys',
        description: '',
        indexOrder: 20,
    },
    {
        id: 'sc-image-based-entitys',
        tabTitle: 'Runbook: image entitys',
        label: 'Scrawl-canvas image-based entitys',
        description: '',
        indexOrder: 21,
    },
    {
        id: 'sc-text-based-entitys',
        tabTitle: 'Runbook: text entitys',
        label: 'Scrawl-canvas text-based entitys',
        description: '',
        indexOrder: 22,
    },
    {
        id: 'sc-particle-based-entitys',
        tabTitle: 'Runbook: particle entitys',
        label: 'Scrawl-canvas particle-based entitys',
        description: '',
        indexOrder: 23,
    },
    {
        id: 'sc-snippets',
        tabTitle: 'Runbook: snippets',
        label: 'Scrawl-canvas snippets',
        description: '',
        indexOrder: 24,
    },
    {
        id: 'sc-packets',
        tabTitle: 'Runbook: packets',
        label: 'Scrawl-canvas packets and serialization',
        description: '',
        indexOrder: 25,
    },
];

const generateFile = async (data, index) => {

    let previous = 'index.html',
        next = 'index.html';

    if (index > 0) previous = `${pages[index - 1].id}.html`;
    if (index < pages.length - 1) next = `${pages[index + 1].id}.html`;

    const source = `./docs/reference/${data.id}.md`,
        destination = `./docs/reference/${data.id}.html`;

    try {

        const mdText = await fs.readFile(source, { encoding: 'utf8' });
        const body = converter.makeHtml(mdText);

        const nav = `
    <nav>
        <a href=${previous}>Previous</a>
        <a href="index.html">Contents</a>
        <a href=${next}>Next</a>
    </nav>
`;

        const htmlText = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>${data.tabTitle}</title>
    <link rel='icon' type='image/png' href='/favicon.png'>
    <link href="../css/normalize.css" rel="stylesheet" />
    <link href="../css/general-reference.css" rel="stylesheet" />

    <!-- general page metadata -->
    <meta name="author" content="Rik Roots">
    <meta name="description" content="${data.title} - ${data.description}">
</head>
<body>
    ${nav}
    <main>
        ${body}
    </main>
    ${nav}
</body>
</html>`;

        await fs.writeFile(destination, htmlText);
        console.log(`Runbook file written: ${data.label} -> ${destination}`);

    } catch (err) {

        console.error(err);
    }
};

const converter = new showdown.Converter({});

pages.sort((a, b) => {

    if (a.indexOrder > b.indexOrder) return 1;
    if (a.indexOrder < b.indexOrder) return -1;
    return 0;

}).forEach((page, index) => generateFile(page, index));
