# For Developers who want to make Scrawl.js even better

I'm assuming that you have 'node' already installed on your local machine, alongside 'git', 'grunt' and 'git flow'. These instructions are as much for my benefit as for yours.

I'm also assuming that you know how to drive a GitHub repository thingy ...

## Cloning the repository

From your local github or projects directory

    $ git clone https://github.com/KaliedaRik/Scrawl-canvas.git

cd into the scrawl directory

    $ cd Scrawl-canvas

Run npm

    $ npm install

Wherever possible, use the 'git flow' methodology. Start git flow ...

    $ git flow init

and accept all the default parameters. When completed, you will be in the 'develop' branch.

### Manual changes to the downloaded repository

I haven't yet worked out how to customize the yuidocs templates.

For now, you will need to copy the file ...

    'logo.png' 

into the ...

    node_modules/grunt-contrib-yuidoc/node_modules/yuidocjs/themes/default/assets/css/ 

directory. Documents should only be regenerated when a new release candidate is being finalised.

## Coding

All development work should take place on the 'develop' branch - specifically in a new 'git flow feature' branch (unless the changes are trivial).

Changes to the source files need to be checked against relevant demos to make sure new, or amended, code doesn't break the library.

When developing a new feature, write a new demo to test the feature. Demos can be pretty broad-brush - they're not designed for unit testing. Remember to describe what the demo is testing (and why), and the expected outcome of the demo. Testing animation features is largely visual, and subjective; static features with know end results can be tested more objectively.

A default demo template can be found at demos/demo000.html - if in doubt about which number to give the demo, ask. Remember to add a link to the demo from the demo/index.html page.

All code needs to pass the linting test, and be beautified. Run these grunt tasks before finishing your git flow feature:

    $ grunt beautify
    $ grunt lint

These two tasks comprise the default task, and can be run together by typing

    $ grunt

## Testing

(being developed)

(starting the testing rig)

(lint/beautifier automated when using the testing rig)

(demos are expected to pass tests in modern versions of Chrome/Opera, Firefox, IE (11 definitely, 10 if possible), and Safari. Testing on key mobile browsers/environment is welcome, but not mandatory)

(Test failures are allowed for known issues with specific browsers)

## New releases

Scrawl uses an x.y.z approach to tagging releases, where

    x = major release - will probably break backwards compatibility
    y = minor release - adds new functionality to the library
    z = bug fixes

Current version (at the time of writing this document) is 3.1.7

Start a release branch via git flow

    $ git flow release start [next.version.tag]

After any final bug fixes have been committed to the release branch, the following operations need to be performed:

1. change the version number in the following files:
    package.json
    bower.json
    source/scrawlCore.js (in 2 places)

2. lint and beautify

    $ grunt beautify
    $ grunt lint

3. minify the source files by running uglify:

    $ grunt minify

4. generate the documentation

    $ grunt docs

Note that these four grunt tasks can be run using a single command:

    $ grunt release

5. commit the changes

    $ git add -A
    $ git commit -m "new release: [next.version.tag] - [brief details of the changes]"

6. finish the release

    $ git flow release finish [next.version.tag]

7. and push everything to GitHub

    $ git push
    $ git push --tags