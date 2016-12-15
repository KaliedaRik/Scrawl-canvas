# For Developers who want to make Scrawl.js even better

I'm assuming that you have 'node' already installed on your local machine, alongside 'git', 'grunt' and 'git flow'. These instructions are as much for my benefit as for yours.

I'm also assuming that you know how to drive a GitHub repository thingy ...

## Cloning the repository

From your local github or projects directory

    $ git clone https://github.com/KaliedaRik/Scrawl-canvas.git

cd into the scrawl directory

    $ cd Scrawl-canvas

Feel free to use the 'git flow' methodology. Start git flow ...

    $ git flow init

... and accept all the default parameters. When completed, you will be in the 'develop' branch.

If you choose not to use git flow, all development work should be done in feature branches, branched off the develop branch. Merges will only be accepted back into the develop branch.

Let the local repository know the remote repository exists:

    $ git branch -a

Run npm to install the development environment

    $ npm install

#### Manual changes to the downloaded repository

I haven't yet worked out how to customize the yuidocs templates.

For now, you will need to copy the file ...

    'logo.png' 

into the ...

    node_modules/grunt-contrib-yuidoc/node_modules/yuidocjs/themes/default/assets/css/ 

directory. Documents should only be regenerated when a new release candidate is being finalised.

## Coding

All development work should take place in feature branches branched from the 'develop' branch. Changes to the source files need to be checked against relevant demos to make sure new, or amended, code doesn't break the library.

All code needs to pass the linting test, and be beautified. Run these grunt tasks before finishing your git flow feature:

    $ grunt beautify
    $ grunt lint

These two tasks comprise the default task, and can be run together by typing

    $ grunt

## Testing

When developing a new feature, write a new demo to test the feature. Demos can be pretty broad-brush - they're not designed for unit testing. Remember to describe what the demo is testing (and why), and the expected outcome of the demo. Testing animation features is largely visual, and subjective; static features with known end results can be tested more objectively.

A default demo template can be found at demos/demo000.html - if in doubt about which number to give the demo, ask. Remember to (manually) add a link to the demo from the demo/index.html page.

The development environment includes the express server (grunt-express) and a watch listener (grunt-contrib-watch) to allow real-time testing of code in a browser. Demo pages are served to localhost:8080. Any changes in a demo file, or a Scrawl.js source file, should be reflected in the browser as soon as the file is saved.

To start the server:

    $ grunt server 

Be aware that the server will often take its own sweet time to stir itself into action and display the index page. The page will display on your default browser, but can also be (simultaneously) tested in other browsers by copy-pasting the page address over to them. 

## New releases

Scrawl uses an x.y.z approach to tagging releases, where

    x = major release - will probably break backwards compatibility
    y = minor release - adds new functionality to the library
    z = bug fixes

Current version (at the time of writing this document) is 5.0.5

Start a release branch via git flow

    $ git flow release start [next.version.tag]

After any final bug fixes have been committed to the release branch, the following operations need to be performed:

> change the version number in the following files:

    package.json
    bower.json
    source/scrawlCore.js (in 3 places)

> lint and beautify

    $ grunt beautify
    $ grunt lint

> minify the source files by running uglify:

    $ grunt minify

> generate the documentation

    $ grunt docs

Note that these four grunt tasks can be run using a single command:

    $ grunt release

> commit the changes

    $ git add -A
    $ git commit -m "new release: [next.version.tag] - [brief details of the changes]"

> finish the release

    $ git flow release finish [next.version.tag]

> and push everything to GitHub

    $ git push
    $ git push --tags

I'm still working out how releases are published on the GitHub website. At the moment I'm doing releases manually on the website in addition to the above steps. This is probably a Bad Approach, and anyone willing to offer me A Clue on how to do it properly will have my deepest gratitude.