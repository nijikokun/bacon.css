NiCSS 
======
Pronounced, `nīs` ("nice"). NiCSS is a Nice CSS Syntax that takes a pythonic approach to CSS. 
Built to work in the browser *or* client side. Currently in mega-alpha-stage, but gaining traction 
towards being alpha or even beta.

## Usage
Currently you can only convert a raw source of nicss to css, eventually it will parse files, and more.

``` js
var output = nicss.parser.raw(... source ..);
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
    width: 60%
    
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
```

The `;` at the end of rules and variables are *optional* (yay!)

### Variables
These allow you to store data in a key-value object:

``` css
$blue: #5B83AD;

header
  color: $blue;
```

## Todo
- Calculations using `$variables`
- Better RegExp support for Elements
- Support Server-Side files & Dynamic `.ncss` parsing
- Backward-Compatability with CSS
- Better Nesting method *update* this is now in testing phase.
- Methods with optional parameters

## License
Author: Nijiko Yonskai <http://resume.nexua.org> <nijikokun@gmail.com>

Licensed under AOL <http://aol.nexua.org>