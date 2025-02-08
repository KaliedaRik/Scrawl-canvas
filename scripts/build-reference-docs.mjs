import fs from 'node:fs/promises';
import showdown from 'showdown';

const pages = [
    {
        id: 'repo-structure',
        tabTitle: 'Runbook: structure',
        label: 'Repository structure, and release protocol',
        description: '',
        indexOrder: 0,
    },{
        id: 'sc-display-cycle',
        tabTitle: 'Runbook: display cycle',
        label: 'Scrawl-canvas Display cycle',
        description: '',
        indexOrder: 5,
    },{
        id: 'sc-initialization',
        tabTitle: 'Runbook: initialization',
        label: 'Scrawl-canvas page load initialization',
        description: '',
        indexOrder: 2,
    },{
        id: 'sc-objects-overview',
        tabTitle: 'Runbook: objects',
        label: 'Scrawl-canvas objects overview',
        description: '',
        indexOrder: 3,
    },{
        id: 'sc-positioning',
        tabTitle: 'Runbook: positioning',
        label: 'The Scrawl-canvas positioning system',
        description: '',
        indexOrder: 4,
    },{
        id: 'source-code-structure',
        tabTitle: 'Runbook: source code',
        label: 'Scrawl-canvas source code structure',
        description: '',
        indexOrder: 1,
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
