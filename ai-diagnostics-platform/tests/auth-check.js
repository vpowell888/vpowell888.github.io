// Simple script to call Firebase Auth REST signInWithPassword and print response
(async () => {
    const apiKey = process.env.API_KEY || 'AIzaSyCmxLoEPu50jTHNInFaixiwkxWdqyKnsig';
    const email = process.env.TEST_EMAIL || 'vincentapowell@msn.com';
    const password = process.env.TEST_PASSWORD || 'Testing01&';
    try {
        const fetch = globalThis.fetch || (await import('node-fetch')).default;
        const res = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, returnSecureToken: true }),
            }
        );
        const body = await res.text();
        console.log('STATUS', res.status);
        console.log('BODY', body);
    } catch (e) {
        console.error('ERROR', e);
        process.exit(1);
    }
})();
