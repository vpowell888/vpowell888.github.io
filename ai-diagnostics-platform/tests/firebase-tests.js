const puppeteer = require('puppeteer');

(async () => {
    const base = process.env.BASE_URL || 'http://127.0.0.1:8082';
    const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: true });
    const page = await browser.newPage();
    page.setDefaultTimeout(20000);
    console.log('Opening', base);
    try {
        await page.goto(base, { waitUntil: 'networkidle2' });
    } catch (e) {
        console.error('Could not open app:', e.message);
        await browser.close();
        process.exit(1);
    }

    // Ensure mock auth currentUser exists so the page-level mock is considered signed-in
    await page.evaluate(() => {
        try {
            window.firebaseServices = window.firebaseServices || {};
            window.firebaseServices.auth = window.firebaseServices.auth || {};
            if (!window.firebaseServices.auth.currentUser) {
                window.firebaseServices.auth.currentUser = {
                    uid: 'vincentp',
                    email: 'vincentapowell@msn.com',
                };
            }
        } catch (e) {
            // ignore injection errors in case page environment differs
        }
    });

    // If the page mock didn't expose a `db`, provide a minimal fallback that reads
    // any in-memory store the page may have, or returns an empty projects list.
    await page.evaluate(() => {
        try {
            window.firebaseServices = window.firebaseServices || {};
            if (!window.firebaseServices.db) {
                const store = window.firebaseServices._store ||
                    (window.firebaseServices.db && window.firebaseServices.db._store) ||
                    window.__IN_MEMORY_STORE__ || { projects: {} };

                const makeCollection = (name) => ({
                    async get() {
                        const all = Object.entries(store[name] || {}).map(([id, data]) => ({
                            id,
                            data: () => data,
                        }));
                        return { docs: all };
                    },
                    doc(id) {
                        return {
                            async get() {
                                const d = (store[name] || {})[id];
                                return { exists: !!d, id, data: () => d };
                            },
                            async update(obj) {
                                store[name] = store[name] || {};
                                store[name][id] = Object.assign(store[name][id] || {}, obj);
                            },
                        };
                    },
                    async add(obj) {
                        const id = Math.random().toString(36).slice(2, 10);
                        store[name] = store[name] || {};
                        store[name][id] = obj;
                        return { id };
                    },
                    where() {
                        return {
                            async get() {
                                return { docs: [] };
                            },
                            orderBy() {
                                return this;
                            },
                        };
                    },
                });

                window.firebaseServices.db = { collection: makeCollection, _store: store };
            }
        } catch (e) {
            // ignore
        }
    });

    const result = await page.evaluate(async () => {
        const out = { timestamp: new Date().toISOString() };
        try {
            out.windowFirebaseConfig =
                window.__FIREBASE_CONFIG__ ||
                (window.firebase &&
                    window.firebase.apps &&
                    window.firebase.apps[0] &&
                    window.firebase.apps[0].options) ||
                null;
        } catch (e) {
            out.configError = e.message;
        }

        try {
            const services = window.firebaseServices;
            out.hasFirebaseServices = !!services;
            out.hasAuth = !!(services && services.auth);
            out.hasDb = !!(services && services.db);

            // get current user if available
            try {
                if (services && services.auth && typeof services.auth.currentUser !== 'undefined') {
                    out.currentUser = services.auth.currentUser || null;
                } else if (window.firebase && window.firebase.auth) {
                    out.currentUser = window.firebase.auth().currentUser || null;
                } else {
                    out.currentUser = null;
                }
            } catch (e) {
                out.currentUserError = e.message;
            }

            // attempt to fetch projects (catch permission errors)
            try {
                if (services && services.db) {
                    const snapshot = await services.db
                        .collection('projects')
                        .get()
                        .catch((e) => {
                            throw e;
                        });
                    out.projects = snapshot.docs
                        ? snapshot.docs.map((d) => ({ id: d.id, data: d.data ? d.data() : null }))
                        : [];
                } else if (window.firebase && window.firebase.firestore) {
                    const snap = await window.firebase
                        .firestore()
                        .collection('projects')
                        .get()
                        .catch((e) => {
                            throw e;
                        });
                    out.projects = snap.docs.map((d) => ({ id: d.id, data: d.data() }));
                } else {
                    out.projects = null;
                }
            } catch (e) {
                out.projectsError = { message: e.message, stack: e.stack };
            }
        } catch (e) {
            out.error = e.message;
        }
        return out;
    });

    console.log('Test result:', JSON.stringify(result, null, 2));
    await browser.close();
})();
