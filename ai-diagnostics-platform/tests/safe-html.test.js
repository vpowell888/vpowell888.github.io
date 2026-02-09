test('escapeHtml converts special chars', () => {
    const fs = require('fs');
    const path = require('path');
    const code = fs.readFileSync(path.join(__dirname, '..', 'public', 'safe-html.js'), 'utf8');
    // Evaluate legacy safe-html.js in the test JSDOM environment to populate window.safeHtml
    eval(code);
    const escapeHtml =
        (global.window && global.window.safeHtml && global.window.safeHtml.escapeHtml) ||
        ((s) => String(s));
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
});
