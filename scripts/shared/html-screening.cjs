'use strict';

const { transformOutsideMarkdownCode } = require('./markdown-preprocessor.cjs');

function screenExecutableHtml(markdown, markdownMode = true) {
    const chunks = [];
    if (markdownMode) {
        transformOutsideMarkdownCode(markdown, prose => { chunks.push(prose); return prose; }, { inlineCode: false });
    } else chunks.push(markdown);
    // Complete HTML tags take precedence over inline backticks.
    const text = chunks.join('\n\n');
    const tokens = /<!--[\s\S]*?-->|<\/?[a-z][a-z0-9:-]*(?:\s+(?:"[^"]*"|'[^']*'|[^'">])*)?\s*\/?>|`+/gi;
    let token;
    while ((token = tokens.exec(text))) {
        if (token[0].startsWith('<!--')) continue;
        if (token[0][0] === '`') {
            if (!markdownMode) continue;
            const escapes = text.slice(0, token.index).match(/\\+$/)?.[0].length || 0;
            if (escapes % 2) continue;
            const closers = /`+/g;
            closers.lastIndex = tokens.lastIndex;
            let closer;
            while ((closer = closers.exec(text))) {
                if (closer[0].length === token[0].length) break;
            }
            if (closer && !/\n[ \t]*\n/.test(text.slice(tokens.lastIndex, closer.index))) {
                tokens.lastIndex = closers.lastIndex;
            }
            continue;
        }
        if (markdownMode && (text.slice(0, token.index).match(/\\+$/)?.[0].length || 0) % 2) continue;
        const tag = token[0];
        let unsafe = /^<(?:script|iframe|object|embed|svg|math|meta|base|link)\b/i.test(tag);
        const attributes = tag.replace(/^<\/?[a-z][a-z0-9:-]*/i, '').matchAll(
            /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g);
        for (const match of attributes) {
            const name = match[1].toLowerCase();
            if (/^(?:on[a-z]+|srcdoc)$/.test(name)) unsafe = true;
            if (!/^(?:href|src|action|formaction|xlink:href|poster|background|data)$/.test(name)) continue;
            const decoded = (match[2] ?? match[3] ?? match[4] ?? '')
                .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
                .replace(/&#([0-9]+);?/g, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)))
                .replace(/&(colon|tab|newline);/gi, (_, entity) => ({ colon: ':', tab: '\t', newline: '\n' })[entity.toLowerCase()])
                .replace(/[\u0000-\u0020\u007f-\u009f]/g, '');
            if (/^(?:javascript:|vbscript:|data:text\/html)/i.test(decoded)) unsafe = true;
        }
        if (unsafe) throw new Error('Unsafe executable HTML found in Markdown; sanitize external content before conversion');
    }
}

module.exports = { screenExecutableHtml };
