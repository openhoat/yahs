## What's yahs?

  YAHS is a html5 slideshow engine.

## Features

- Easy to code with simple tags
- Easy to customize with specific styles
- Syntax highlighting for code display
- Browsable on tablets and phones
- Printable in landscape and portrait orientation
- Distribuable as a 'ready-to-use' single HTML page

## Installation

## Create slides

- To begin your slides, create a simple index.html page in your slide directory (/myslides for example) :

```html
      <!DOCTYPE html>
      <html>
      <head>
       <meta charset="utf-8">
       <title>My Slides</title>
       <meta name="viewport" content="width=1100,height=750">
       <meta name="apple-mobile-web-app-capable" content="yes">
       <link rel="shortcut icon" href="images/favicon.ico"/>
       <link rel="stylesheet/less" type="text/css" href="../../src/styles/yahs.less"/>
       <!-- This is where you put your custom styles -->
       <link rel="stylesheet/less" type="text/css" media="screen" href="styles/mystyles.less"/>
       <!-- -->
       <script src="../../lib/less.js"></script>
       <script src="../../lib/prettify.js"></script>
       <script src="../../lib/jquery.js"></script>
       <script src="../../src/js/yahs-engine.js"></script>
      </head>
      <body>
      <section class="slides">
        <article>
          <h3>My Slides</h3>
          <p>Any slide content</p>
        </article>
      </section>
      </body>
      </html>
```

- Each slide is implemented with a &lt;article/&gt; tag.
- To browse your page simply open it in a browser (you must disable security of your browser to allow javascript like less to make local requests).
- Example of security disabling for Chrome :

      $ google-chrome --disable-web-security --allow-access-from-files mypage.html

Alternative : browse the dist page, it does not make any request

## Build the dist page

Pre requisite :

- Install [node.js](http://nodejs.org/)
- Install [grunt](http://gruntjs.com/)
- Install dependencies with [npm](https://npmjs.org/) :

        $ cd /root-of-yahs-project
        $ npm install

- Change the Gruntfile.js to match your settings :

          ...
          srcFile: 'myslides/index.html',
          distFile: 'dist/myslides/index.html'
          ...

- Build the dist page with grunt :

        $ cd /root-of-yahs-project
        $ grunt

- Test the resulting page : double-clic /dist/myslides/index.html

## Compatibility

- Chrome
- Firefox
- IE9

## Live demos

  Short introduction of [YAHS](http://openhoat.github.com/yahs/presentation/index.html).

  [Another presentation](http://openhoat.github.com/yahs/nodejs-presentation/index.html) based on YAHS (seminar slides in french)

Enjoy !
