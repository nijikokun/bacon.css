// NiCSS ((/nis/, /nayhs/) Nice)
// Developed by Nijikokun
// Super Elegant CSS Output
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
var nice = {};

nice.regex = nice.r = {
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

nice.util = nice.u = {
    lineEnding: function (data) {
        return data.replace('\r\n', '\n');
    },

    spaceBefore: function (str) {
        return str.replace(/[^\s](.*)/g, '').length;
    },

    trim: function (str) {
        return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    },

    number: function (n) {
        if (n instanceof node.Dimension) {
            return parseFloat(n.unit == '%' ? n.value / 100 : n.value);
        } else if (typeof(n) === 'number') {
            return n;
        } else {
            throw {
                error: "RuntimeError",
                message: "invalid number!"
            };
        }
    },

    clamp: function (val) {
        return Math.min(1, Math.max(0, val));
    },

    operate: function (op, a, b) {
        switch (op) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            case '/': return a / b;
        }
    },

    is: {
        em: function (u) {
            return (u instanceof node.Dimension) ? (u.unit === 'em') : (u === 'em');
        },

        px: function (u) {
            return (u instanceof node.Dimension) ? (u.unit === 'px') : (u === 'px');
        },

        percentage: function (u) {
            return (u instanceof node.Dimension) ? (u.unit === '%') : (u === '%');
        }
    }
};

// Idea taken from less.js (Cleaner)
var node = {
    Comment: function (value, silent) {
        this.value = value;
        this.silent = !!silent;

        this.eval = function () {
            return this;
        }

        this.toCSS = function(env) {
            return env.compress ? '' : '/* ' + this.value + ' */';
        }
    },

    Color: function (rgb, a) {
        if (Array.isArray(rgb))
            this.rgb = rgb;
        else if (rgb.length == 6)
            this.rgb = rgb.match(/.{2}/g).map(function(c) {
                return parseInt(c, 16);
            });
        else
            this.rgb = rgb.split('').map(function(c) {
                return parseInt(c + c, 16);
            });

        this.alpha = typeof(a) === 'number' ? a : 1;

        this.eval = function () {
            return this;
        };

        this.operate = function (op, o) {
            var result = [];

            if (!(o instanceof node.Color))
                o = o.toColor();

            for (var c = 0; c < 3; c++)
                result[c] = nice.u.operate(op, this.rgb[c], o.rgb[c]);

            return new (node.Color)(result, this.alpha + o.alpha);
        }

        this.toCSS = function () {
            if(this.alpha < 1.0)
                return "rgba(" + this.rgb.map(function (c) { return Math.round(c); }).
                    concat(this.alpha).join(', ') + ")";
            else 
                return "#" + this.rgb.map(function (c) {
                    i = Math.round(c);
                    i = (i > 255 ? 255 : (i < 0 ? 0 : i)).toString(16);
                    return i.length === 1 ? '0' + i : i;
                }).join('');
        };


    },

    Dimension: function (value, unit) {
        this.value = value;
        this.unit = unit;

        this.compare = function (o) {
            if (!(o instanceof node.Dimension))
                return -1;

            if (o.value > this.value) return -1;
            else if (o.value < this.value) return 1;
            
            return 0;
        };

        this.eval = function () {
            return this;
        };

        this.operate = function (op, o) {
            return new (node.Dimension)(nice.u.operate(op, this.value, o.value), this.unit || o.unit);
        };

        this.toColor = function () {
            return new (node.Color)([this.value, this.value, this.value]);
        };

        this.toCSS = function () {
            return this.value + this.unit;
        };
    },

    Selector: function () {

    },

    Operation: function (op, operands) {
        this.op = nice.u.trim(op);
        this.operands = operands;

        this.eval = function (env) {
            var a = this.operands[0].eval(env);
            var b = this.operands[1].eval(env);

            if (!(a instanceof node.Dimension) || !(b instanceof node.Dimension)) 
                throw { name: 'OperationError', message: 'Cannot operate outside dimension.' };

            return a.operate(this.op, b);
        };
    }
}
};

// Parsers
nicss.parser.raw = function(data) {
    input = nicss.util.lineEnding(data).split('\n'), line = '', nested = 0, prevS = prevR = diff = 0;
    variables = {}, output = {}, inside = [], source = '';

    for(i = 0; i < input.length; i++, line = input[i]) {
        if(line && line.length > 0) {
            nested = nicss.util.spaceBefore(line);
            line = nicss.util.trim(line);
            
            if(nicss.is.commented(line) || line.length < 1)
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
                else if(prevS == nested)
                    inside.pop();
                else if(prevS && ((prevS/nested) % 2) == 0) 
                    for(var x = 0; x < (prevS/nested); x++)
                        inside.pop();
                
                prevS = nested;
                inside.push('#' + m[1]);
            } else if(nicss.is.class(line)) {
                m = nicss.is.class(line);

                if(!nested) inside = [];
                else if(prevS == nested)
                    inside.pop();
                else if(prevS && ((prevS/nested) % 2) == 0) 
                    for(var x = 0; x < (prevS/nested); x++)
                        inside.pop();
                prevS = nested;
                
                inside.push('.' + m[1]);
            } else if(nicss.is.entity(line)) {
                m = nicss.is.entity(line);

                if(!nested) inside = [];
                else if(prevS == nested)
                    inside.pop();
                else if(prevS && ((prevS/nested) % 2) == 0) 
                    for(var x = 0; x < (prevS/nested); x++)
                        inside.pop();
                diff = prevS-nested;
                prevS = nested;

                inside.push(m[1]);
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