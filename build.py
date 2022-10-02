import os

source = os.listdir('source');

needaspace = { "class", "function", "var", "let", "const", "else", "return", "typeof", "throw" }
def needsaspace(token):
    for nps in needaspace:
        if token[max(0, len(token) - len(nps)):] == nps:
            return True
    return False

def splitq(ss):
    sp = []
    quoted = False
    qchar = ''
    curss = ''
    for i in range(len(ss) + 1):

        if i != len(ss):
            if not quoted and (ss[i] == "'" or ss[i] == '"' or ss[i] == '`'):
                quoted = True
                qchar = ss[i]
            else:
                if quoted and ss[i] == qchar:
                    quoted = False
        
        if not quoted and (i == len(ss) or ss[i] == ' ' or ss[i] == '\n' or ss[i] == '\t') and len(curss):
            sp.append(curss)
            curss = ''
        else:
            if not (i == len(ss) or ss[i] == ' ' or ss[i] == '\n' or ss[i] == '\t') or quoted:
                curss += ss[i]
            
    return sp

def minify(fname):
    raw_code = ''
    with open(fname, 'r') as file:
        raw_code = file.read()
    nocom = ''
    cmnted = False
    endcmnt = ''
    quoted = False
    qchar = ''
    cz = 0
    for i in range(len(raw_code)):
        if cmnted:
            if i + len(endcmnt) - 1 < len(raw_code) and raw_code[i:i+len(endcmnt)] == endcmnt:
                cmnted = False
                cz = len(endcmnt) - 1
        elif cz:
            cz -= 1
            if cz == 0:
                nocom += ' '
        else:
            if not quoted and (raw_code[i] == '"' or raw_code[i] == "'" or raw_code[i] == '`'):
                quoted = True
                qchar = raw_code[i]
            elif quoted and raw_code[i] == qchar:
                quoted = False
                
            if not quoted and i + 1 < len(raw_code) and raw_code[i:i+2] == '//':
                cmnted = True
                endcmnt = '\n'
            elif not quoted and i + 1 < len(raw_code) and raw_code[i:i+2] == '/*':
                cmnted = True
                endcmnt = '*/'
            else:
                nocom += raw_code[i]
    tokens = splitq(nocom)
    lasttoken = ''
    minified = ''
    for token in tokens:
        if needsaspace(lasttoken):
            minified += ' '
        minified += token
        lasttoken = token
    return minified
    

with open('bin/ctx3d.js', 'w') as out:
    strout = ''
    jsexports = ''
    for src in source:
        if src == 'exports.js':
            jsexports = minify('source/' + src)
        else:
            strout += minify("source/" + src)
    out.write(jsexports + '=(function(){' + strout + 'return ' + jsexports + ';})()')
