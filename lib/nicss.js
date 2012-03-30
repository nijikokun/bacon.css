// NiCSS
// Developed by Nijikokun
// Effing Elegant CSS Output
// Super Alpha, Not even production ready.

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
var nicss = {};
    nicss.is = 
    nicss.has =
    nicss.parser = 
    nicss.regex =  
    nicss.util = {};

// Language Expressions
nicss.regex = {
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
nicss.util.lineEnding = function (data) {
    return data.replace('\r\n', '\n');
}
    
nicss.util.spaceBefore = function (str) {
    return str.replace(/[^\s](.*)/g, '').length;
}
    
nicss.util.trim = function (str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

// Parsers
nicss.parser.raw = function(data) {
    input = nicss.util.lineEnding(data).split('\n'), line = '', nested = 0, prev = 0;
    variables = {}, output = {}, inside = [], source = '';

    for(i = 0; i < input.length; i++, line = input[i]) {
        if(line && line.length > 0) {
            nested = nicss.util.spaceBefore(line);
            line = nicss.util.trim(line);
            
            if(nicss.is.commented(line))
                continue;

            if(nicss.is.variable(line)) {
                m = nicss.is.variable(line); 
                v = nicss.util.trim(m[3]);
                
                if(v[v.length-1] == ';')
                    v = v.substr(0, v.length-1);
                
                variables[m[1]] = v;
            } else if(nicss.is.id(line)) {
                m = nicss.is.id(line); 
                
                if(!nested) inside = [];
                else if(prev == nested)
                    inside.pop();
                else if(prev && ((prev/nested) % 2) == 0) 
                    for(var x = 0; x < (prev/nested); x++)
                        inside.pop();

                inside.push('#' + m[1]);
                prev = nested;
            } else if(nicss.is.class(line)) {
                m = nicss.is.class(line);

                if(!nested) inside = [];
                else if(prev == nested)
                    inside.pop();
                else if(prev && ((prev/nested) % 2) == 0) 
                    for(var x = 0; x < (prev/nested); x++)
                        inside.pop();

                inside.push('.' + m[1]);
                prev = nested;
            } else if(nicss.is.entity(line)) {
                m = nicss.is.entity(line);

                if(!nested) inside = [];
                else if(prev == nested)
                    inside.pop();
                else if(prev && ((prev/nested) % 2) == 0) 
                    for(var x = 0; x < (prev/nested); x++)
                        inside.pop();

                inside.push(m[1]);
                prev = nested;
            } else if(nicss.is.rule(line) && inside && nested) {
                m = nicss.is.rule(line);
                k = m[1];
                v = nicss.util.trim(m[m.length-1]);

                if(nicss.has.variables(v)) {
                    mv = nicss.has.variables(v);
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

                s = inside.join(' ');
                if (!output[s]) output[s] = [];
                output[s][k] = v;
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
nicss.is.commented = function (line) {
    return line.match(nicss.regex.line.commented);
}

nicss.is.id = function (line) {
    return line.match(nicss.regex.line.id);
}
    
nicss.is.class = function (line) {
    return line.match(nicss.regex.line.class);
}
    
nicss.is.entity = function (line) {
    return line.match(nicss.regex.line.entity);
}
    
nicss.is.rule = function (line) {
    return line.match(nicss.regex.line.rule);
}
    
nicss.is.variable = function (line) {
    return line.match(nicss.regex.line.variable);
}
    
// Can Haz?
nicss.has.variables = function (string) {
    return string.match(nicss.regex.variable);
}