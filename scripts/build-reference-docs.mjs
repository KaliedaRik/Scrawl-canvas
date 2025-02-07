import fs from 'node:fs/promises';
import showdown from 'showdown';

const pages = [
    {
        id: 'repo-structure',
        tabTitle: 'SC reference docs',
        label: 'Repository structure, and release protocol',
        description: '',
        indexOrder: 0,
    },{
        id: 'repo-testing-regime',
        tabTitle: 'SC reference docs',
        label: 'Repository testing regime',
        description: '',
        indexOrder: 2,
    },{
        id: 'sc-display-cycle',
        tabTitle: 'SC reference docs',
        label: 'Scrawl-canvas Display cycle',
        description: '',
        indexOrder: 6,
    },{
        id: 'sc-initialization',
        tabTitle: 'SC reference docs',
        label: 'Scrawl-canvas page load initialization',
        description: '',
        indexOrder: 3,
    },{
        id: 'sc-objects-overview',
        tabTitle: 'SC reference docs',
        label: 'Scrawl-canvas objects overview',
        description: '',
        indexOrder: 4,
    },{
        id: 'sc-path-based-entitys',
        tabTitle: 'SC reference docs',
        label: 'Scrawl-canvas path-based entitys',
        description: '',
        indexOrder: 6,
    },{
        id: 'sc-positioning',
        tabTitle: 'SC reference docs',
        label: 'The Scrawl-canvas positioning system',
        description: '',
        indexOrder: 5,
    },{
        id: 'source-code-structure',
        tabTitle: 'SC reference docs',
        label: 'Scrawl-canvas source code structure',
        description: '',
        indexOrder: 1,
    },
];

const generateFile = async (data, index) => {

    let previous = '../index.html',
        next = '../index.html';

    if (index > 0) previous = `${pages[index - 1].id}.html`;
    if (index < pages.length - 2) next = `${pages[index + 1].id}.html`;

    const source = `./docs/reference/${data.id}.md`,
        destination = `./docs/reference/${data.id}.html`;

    try {

        const mdText = await fs.readFile(source, { encoding: 'utf8' });
        const body = converter.makeHtml(mdText);

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
    <nav>
        <a href=${previous}>Previous</a>
        <a href="../index.html#general-reference">Index</a>
        <a href=${next}>Next</a>
    </nav>
    <main>
        ${body}
    </main>
</body>
</html>`;

        await fs.writeFile(destination, htmlText);

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
