<img src="https://a248.e.akamai.net/camo.github.com/4aa62afaa0449ae91e4cb975202b45146bff4292/687474703a2f2f696d61676573332e77696b69612e6e6f636f6f6b69652e6e65742f5f5f636232303130303830323133323035372f72657374617572616e74636974792f696d616765732f617263686976652f662f66362f3230313130353137313531333438214261636f6e2e706e67" align="right" style="margin: 0 10px" />
<h1>Bacon.CSS</h1>
`Bacon.css`, It's motherfucking bacon. Takes the best pythonic approach to CSS. 
Built to work in the browser *or* client side. Currently sizzlin' in the pan, so let your mouth water as you're served.

Why stop there? Why not stick your fork or spork directly into this pan. Fork us. Do it.

## Usage
Currently you can only convert a raw source of bacon to css, eventually it will parse files, and more.

``` js
var output = bacon.cook(... source ...); // Give us that raw bacon, we'll serve it up nice, and hot.
```

## Language
Essentially it is an entire re-write of CSS, in the future it will have backwards-compatability with CSS.

### Basics
Coming from CSS is easy you simply drop un-needed syntax:

``` css
header
  color: #5B83AD;
  padding: 5px;
  margin: 0;

// Lines without ";" at the end work too!
.container
  margin: 0 auto
  width: 760px
  /* You can also use "=" instead of ":". */
  .main
    font-family=Helvetica,Arial,Sans-Serif
    font-size=10px
    width=60%
    
    // Nesting & Spacing Between Selectors / Comments
    a
      color: red
    
    // Returning back to .container .main
    font-size: 10px;
  
  /* Back to .container. */
  .sidebar
    background: #eee
    float: right
    width: 35%
    
  /* Overriding? Need Importance, easy. */
  .sidebar
    background: #ccc !
```

The `;` at the end of rules and variables are *optional* (yay!).

### Variables
These allow you to store data in a key-value object:

``` css
$blue: #5B83AD;

header
  color: $blue;
```

### Importance
For overriding or utilizing `!important` you simply just need to append a `!` to your clause like so:

``` css
header
  color: #666 !
```

### None
For quick typing or just plain sugar, `!!` maps to `none`. Seen as a double negative.

``` css
a
  text-decoration: !!
```

## Extras

### jQuery Usage

Put this at the bottom of your body and it will parse all script tags with `bacon/css` or `<bacon>` tags into pure css.

``` html
  <script type="text/javascript">
    $('script[type="bacon/css"],bacon').each(function () {
      $('head').append(($('<style>').text(bacon.cook($(this).text()))));
      $(this).remove(); // For Bacon Tags
    });
  </script>
```

## Todo
- Calculations using `$variables`
- Better RegExp support for Elements
- Support Server-Side files & Dynamic `.ncss` parsing
- Backward-Compatability with CSS
- Better Nesting method *update* this is now in testing phase.
- Methods with optional parameters
- Built in CSS3 methods with support for all browser prefixes.
- Media Queries and Keyframes support *in-progress*

## License
Author: Nijiko Yonskai <http://resume.nexua.org> <nijikokun@gmail.com>

Licensed under AOL <http://aol.nexua.org>