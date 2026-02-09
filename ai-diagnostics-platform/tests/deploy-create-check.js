const puppeteer = require('puppeteer');

(async () => {
    const base = process.env.BASE_URL || 'https://ceoaitransform.web.app';
    const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: true });
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);
    try {
        await page.goto(base, { waitUntil: 'networkidle2' });
    } catch (e) {
        console.error('nav failed', e.message);
        await browser.close();
        process.exit(1);
    }

    // sign in via UI
    try {
        await page.waitForSelector('#loginEmail');
        await page.type('#loginEmail', 'vincentapowell@msn.com');
        await page.type('#loginPassword', 'Testing01&');
        await page.click('#loginBtn');
        await page.waitForSelector('#mainApp', { visible: true, timeout: 30000 });
    } catch (e) {
        console.error('signin failed', e.message);
        await browser.close();
        process.exit(1);
    }

    // Attempt to create a project directly via the client DB to capture errors
    const result = await page.evaluate(async () => {
        const out = {};
        try {
            const uid =
                (window.appState &&
                    window.appState.currentUser &&
                    window.appState.currentUser.uid) ||
                (window.firebaseServices &&
                    window.firebaseServices.auth &&
                    window.firebaseServices.auth.currentUser &&
                    window.firebaseServices.auth.currentUser.uid) ||
                null;
            out.uid = uid;
            const db =
                (window.firebaseServices && window.firebaseServices.db) ||
                (window.firebase && window.firebase.firestore && window.firebase.firestore());
            if (!db) throw new Error('no-db');
            const projectData = {
                clientName: 'Probe Project',
                suites: ['strategic'],
                createdBy: uid || 'unknown',
                createdAt:
                    window.firebase &&
                    window.firebase.firestore &&
                    window.firebase.firestore.FieldValue
                        ? window.firebase.firestore.FieldValue.serverTimestamp()
                        : new Date(),
            };
            const doc = await db
                .collection('projects')
                .add(projectData)
                .catch((e) => {
                    throw e;
                });
            out.ok = true;
            out.id = doc.id;
        } catch (e) {
            out.ok = false;
            out.error = (e && e.message) || String(e);
            out.stack = e && e.stack;
        }
        return out;
    });

    console.log('Create-check result:', result);
    await browser.close();
})();
