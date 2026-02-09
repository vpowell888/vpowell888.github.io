const puppeteer = require('puppeteer');

(async () => {
    const base = process.env.BASE_URL || 'https://ceoaitransform.web.app';
    const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: true });
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);

    page.on('response', async (res) => {
        try {
            const url = res.url();
            if (url.includes('identitytoolkit.googleapis.com/v1/accounts:signInWithPassword')) {
                const status = res.status();
                const text = await res.text();
                console.log('SIGNIN RESPONSE', status, url);
                console.log('BODY', text);
            }
        } catch (e) {
            console.warn('response log failed', e);
        }
    });

    page.on('console', async (msg) => {
        try {
            const args = await Promise.all(
                msg.args().map((a) => a.jsonValue().catch(() => a.toString()))
            );
            console.log('PAGE LOG', msg.type(), args);
        } catch (e) {}
    });

    console.log('Opening', base);
    await page.goto(base, { waitUntil: 'networkidle2' });

    // attempt sign in with invalid password to provoke 400
    await page.waitForSelector('#loginEmail');
    await page.type('#loginEmail', 'vincentapowell@msn.com');
    await page.type('#loginPassword', 'WrongPassword!');
    await page.click('#loginBtn');

    // wait a bit for network calls
    await new Promise((r) => setTimeout(r, 3000));
    await browser.close();
})();
