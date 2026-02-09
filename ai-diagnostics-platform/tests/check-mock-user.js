const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: true });
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:8082', { waitUntil: 'networkidle2', timeout: 20000 });
    const pass = await page.evaluate(() => {
        try {
            return window.firebaseServices &&
                window.firebaseServices.db &&
                window.firebaseServices.db._store &&
                window.firebaseServices.db._store.users &&
                window.firebaseServices.db._store.users['vincentp']
                ? window.firebaseServices.db._store.users['vincentp'].password
                : null;
        } catch (e) {
            return 'EVAL_ERROR:' + e.message;
        }
    });
    console.log('mock-password:', pass);
    await browser.close();
})();
