// Bacon
// Developed by Nijikokun
// It's motherfucking bacon. Stick your fork in it.
// Still in the pan sizzlin' not for production yet. Help us by forking it

// Example:
//
// $blue: #3bbfce;
// $margin: 5px;
//
// .output
//   color: $blue !
//   margin: $margin
//
// header
//   padding: $margin
//   background: $blue
//   color: white;

// Setup
var bacon = {};
    bacon.is = 
    bacon.has =
    bacon.parser = 
    bacon.regex =  
    bacon.util = {};

// Language Expressions
bacon.regex = {
    line: {
        id: /^\#([_A-Za-z-][a-zA-Z0-9_\>\.\#\s]*)$/,
        class: /^\.([_A-Za-z-][a-zA-Z0-9_\>\#\.\s]*)$/,
        entity: /^([_A-Za-z-\*][a-zA-Z0-9_\>\#\.\s\[\]\=]*)$/,
        rule: /^([_A-Za-z-][_A-Za-z0-9-]*)(\:|\=)?\s?(.*)/,
        variable: /^\$([a-zA-Z0-9_]+)(\:|\=)?\s?(.*)/,
        comment: /\/\/(.*)|\#(.*)/,
        commented: /^((\/\/(.*))|(\#(.*))|(\/\*(.*)\*\/))$/
    },
    
    variable: /\$([a-zA-Z0-9_]+)/g
};

// Common
bacon.util.lineEnding = function (data) {
    return data.replace('\r\n', '\n');
}
    
bacon.util.spaceBefore = function (str) {
    return str.replace(/[^\s](.*)/g, '').length;
}
    
bacon.util.trim = function (str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

/**
 * Let's throw that bacon in the pan, raw source of bacon to straight up fully cooked bacon.
 * @param {String} data Raw bacon source, newlines and all.
 */
bacon.raw = bacon.parser.raw = function(data) {
    input = bacon.util.lineEnding(data).split('\n'), line = '', nested = 0, prevS = prevR = diff = 0;
    variables = {}, output = {}, inside = [], source = '';

    for(i = 0; i < input.length; i++, line = input[i]) {
        if(line && line.length > 0) {
            nested = bacon.util.spaceBefore(line);
            line = bacon.util.trim(line);
            
            if(bacon.is.commented(line) || line.length < 1)
                continue;

            if(bacon.is.variable(line)) {
                m = bacon.is.variable(line); 
                v = bacon.util.trim(m[3]);
                
                if(v[v.length-1] == ';')
                    v = v.substr(0, v.length-1);
                
                variables[m[1]] = v;
            } else if(bacon.is.id(line)) {
                m = bacon.is.id(line); 
                
                if(!nested) inside = [];
                else if(prevS == nested)
                    inside.pop();
                else if(prevS && ((prevS/nested) % 2) == 0) 
                    for(var x = 0; x < (prevS/nested); x++)
                        inside.pop();
                
                prevS = nested;
                inside.push('#' + m[1]);
            } else if(bacon.is.class(line)) {
                m = bacon.is.class(line);

                if(!nested) inside = [];
                else if(prevS == nested)
                    inside.pop();
                else if(prevS && ((prevS/nested) % 2) == 0) 
                    for(var x = 0; x < (prevS/nested); x++)
                        inside.pop();
                prevS = nested;
                
                inside.push('.' + m[1]);
            } else if(bacon.is.entity(line)) {
                m = bacon.is.entity(line);

                if(!nested) inside = [];
                else if(prevS == nested)
                    inside.pop();
                else if(prevS && ((prevS/nested) % 2) == 0) 
                    for(var x = 0; x < (prevS/nested); x++)
                        inside.pop();
                diff = prevS-nested;
                prevS = nested;

                inside.push(m[1]);
            } else if(bacon.is.rule(line) && inside && nested) {
                m = bacon.is.rule(line);
                k = m[1];
                v = bacon.util.trim(m[m.length-1]);

                if(bacon.has.variables(v)) {
                    mv = bacon.has.variables(v);
                    for(var j in mv) {
                        or = mv[j];
                        va = or.substr(1, or.length);
                        v = v.replace(or, variables[va] ? variables[va] : '');
                    }
                }
                
                if(v[v.length-1] == '!' || v[v.length-2] == '!;')
                    v = v.substr(0, v.length-(v[v.length-3] == ' !;' ? 3: v[v.length-3] == '!;' ? 2: v[v.length-2] == ' !' ? 2:1)) + ' !important';
                
                if(v[v.length-1] == ';')
                    v = v.substr(0, v.length-1);
                
                if(nested == prevS && prevR != nested) {
                    inside.pop(); prevS+=diff; console.log(diff);
                }

                s = inside.join(' ');
                if (!output[s]) output[s] = [];
                output[s][k] = v;
                
                prevR = nested;
            } else if(inside && !nested) {
                inside = [];
                prev = 0;
            } else console.log('not matched:', line);
        } else if(inside) {
            inside = [];
            prev = 0;
        }
    }

    for(var x in output) {
        if(!output.hasOwnProperty(x)) continue;
        
        source += x + ' {' + "\n";
        
        for(var y in output[x])
            source += '  ' + y + ': ' + output[x][y] + ';' + "\n";
        
        source += '}' + "\n\n";
    }

    return source.substr(0, source.length - 2);
}

// Matches
bacon.is.commented = function (line) {
    return line.match(bacon.regex.line.commented);
}

bacon.is.id = function (line) {
    return line.match(bacon.regex.line.id);
}
    
bacon.is.class = function (line) {
    return line.match(bacon.regex.line.class);
}
    
bacon.is.entity = function (line) {
    return line.match(bacon.regex.line.entity);
}
    
bacon.is.rule = function (line) {
    return line.match(bacon.regex.line.rule);
}
    
bacon.is.variable = function (line) {
    return line.match(bacon.regex.line.variable);
}
    
// Can Haz?
bacon.has.variables = function (string) {
    return string.match(bacon.regex.variable);
}
