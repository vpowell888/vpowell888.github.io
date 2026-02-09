// Firebase Configuration
// IMPORTANT: Replace these with your actual Firebase project credentials
// Get these from: Firebase Console > Project Settings > General > Your apps

// The file can be overridden at deploy time by injecting a `window.__FIREBASE_CONFIG__`
// object (for example, during an automated deploy step). Otherwise edit the
// `firebaseConfig` below with your project's values.
const firebaseConfig = window.__FIREBASE_CONFIG__ || {
    apiKey: 'AIzaSyCmxLoEPu50jTHNInFaixiwkxWdqyKnsig',
    authDomain: 'ceoaitransform.firebaseapp.com',
    projectId: 'ceoaitransform',
    storageBucket: 'ceoaitransform.firebasestorage.app',
    messagingSenderId: '560880173161',
    appId: '1:560880173161:web:7d4b811b90c5883e1aa2f8',
};

// Determine if the provided config is still a placeholder
const isPlaceholderConfig =
    typeof firebaseConfig.apiKey === 'string' && firebaseConfig.apiKey.startsWith('YOUR');

// Only allow the in-memory mock on localhost or private LAN addresses to avoid
// accidentally running a mock in production hosting.
const hostname = typeof location !== 'undefined' && location.hostname ? location.hostname : '';
const isLocalhost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.local') ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.');

// Allow forcing real Firebase on localhost by setting `window.FORCE_REAL_FIREBASE = true` in the page.
const forceRealFirebase =
    typeof window !== 'undefined' &&
    (window.FORCE_REAL_FIREBASE === true || window.FORCE_REAL_FIREBASE === '1');

// Prefer the in-memory mock when running on localhost (unless explicitly forced), to avoid using real Firebase during local development.
if (isLocalhost && !forceRealFirebase) {
    // Simple in-memory mock for auth and firestore to allow local testing without Firebase
    (function () {
        const makeId = () => Math.random().toString(36).slice(2, 10);

        const store = {
            users: {
                // Pre-seeded mock user for local testing
                vincentp: {
                    uid: 'vincentp',
                    email: 'vincentapowell@msn.com',
                    // Updated mock password to match local testing password (localhost-only mock)
                    password: 'Testing01&',
                    name: 'Vincent Powell',
                    projects: ['proj1'],
                },
                // additional alias/account for Vincent (requested)
                vincentapowell: {
                    uid: 'vincentapowell',
                    email: 'vincentapowell@msn.com',
                    password: 'Testing01&',
                    name: 'Vincent A. Powell',
                    projects: ['proj1'],
                },
            },
            projects: {
                // demo project visible in local mock
                proj1: {
                    clientName: 'Demo Project',
                    createdBy: 'vincentp',
                    teamMembers: ['vincentp', 'vincentapowell'],
                    team: [
                        { uid: 'vincentp', email: 'vincentapowell@msn.com', role: 'lead' },
                        {
                            uid: 'vincentapowell',
                            email: 'vincentapowell@msn.com',
                            role: 'consultant',
                        },
                    ],
                    primaryService: 'executive-ai-advisor',
                    assignedServices: ['executive-ai-advisor'],
                    serviceDeliverables: [
                        {
                            id: 'executive-ai-advisor__advisory-pack',
                            serviceId: 'executive-ai-advisor',
                            serviceName: 'Executive AI Advisor',
                            title: 'Executive advisory pack (priorities, risks, decisions)',
                            status: 'in_progress',
                            updates: [
                                { note: 'Initial draft started', timestamp: Date.now() - 86400000 },
                            ],
                            updatedAt: Date.now(),
                        },
                        {
                            id: 'executive-ai-advisor__decision-briefs',
                            serviceId: 'executive-ai-advisor',
                            serviceName: 'Executive AI Advisor',
                            title: 'Decision briefs (funding, vendors, organisational design)',
                            status: 'not_started',
                            updates: [],
                            updatedAt: Date.now(),
                        },
                        {
                            id: 'executive-ai-advisor__leadership-narrative',
                            serviceId: 'executive-ai-advisor',
                            serviceName: 'Executive AI Advisor',
                            title: 'Leadership narrative for internal alignment',
                            status: 'not_started',
                            updates: [],
                            updatedAt: Date.now(),
                        },
                    ],
                    projectPlan: [
                        {
                            id: 'declare-redesign',
                            title: 'Declare AI as Business Redesign',
                            bestPractice:
                                'Executive sponsorship, clear ownership, and explicit value targets tied to P&L and risk.',
                            status: 'in_progress',
                            updates: [
                                {
                                    note: 'CEO alignment meeting completed',
                                    timestamp: Date.now() - 172800000,
                                },
                            ],
                            updatedAt: Date.now(),
                        },
                        {
                            id: 'decision-architecture',
                            title: 'Redesign Decision Architecture',
                            bestPractice:
                                'Define where AI advises vs decides, assign named decision owners, and set override rules.',
                            status: 'not_started',
                            updates: [],
                            updatedAt: Date.now(),
                        },
                    ],
                    engagementPeople: [
                        {
                            id: 'person_demo1',
                            name: 'Sarah Chen',
                            role: 'CTO',
                            contact: 'sarah@example.com',
                            createdAt: Date.now(),
                        },
                    ],
                    industry: 'technology',
                    status: 'active',
                    progress: 20,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    description: 'Sample project created by local mock for testing',
                },
            },
        };

        const listeners = [];
        let currentUser = null;

        const auth = {
            get currentUser() {
                return currentUser;
            },
            onAuthStateChanged(cb) {
                listeners.push(cb);
                // call immediately
                setTimeout(() => cb(currentUser), 0);
            },
            async signInWithEmailAndPassword(email, password) {
                const user = Object.values(store.users).find(
                    (u) => u.email === email && u.password === password
                );
                if (!user) throw new Error('Invalid email or password (mock)');
                currentUser = { uid: user.uid, email: user.email, displayName: user.name };
                listeners.forEach((cb) => cb(currentUser));
                return { user: currentUser };
            },
            async createUserWithEmailAndPassword(email, password) {
                if (Object.values(store.users).some((u) => u.email === email))
                    throw new Error('Email already exists (mock)');
                const uid = makeId();
                const userRecord = {
                    uid,
                    email,
                    password,
                    name: email.split('@')[0],
                    projects: [],
                };
                store.users[uid] = userRecord;
                currentUser = { uid, email, displayName: userRecord.name };
                listeners.forEach((cb) => cb(currentUser));
                return {
                    user: Object.assign(
                        {
                            updateProfile: async ({ displayName }) => {
                                userRecord.name = displayName;
                                currentUser.displayName = displayName;
                            },
                        },
                        currentUser
                    ),
                };
            },
            async signOut() {
                currentUser = null;
                listeners.forEach((cb) => cb(null));
            },
            async sendPasswordResetEmail(email) {
                const exists = Object.values(store.users).some((u) => u.email === email);
                if (!exists) throw new Error('No user found with that email address (mock)');
                store.lastPasswordResetEmail = email;
                return true;
            },
        };

        const normalizeValue = (v) => {
            if (v && v.__ts) return v.__ts;
            if (v && v.__arrayUnion) return { __arrayUnion: v.__arrayUnion };
            if (v && v.__arrayRemove) return { __arrayRemove: v.__arrayRemove };
            return v;
        };

        const FieldValue = {
            serverTimestamp: () => ({ __ts: new Date() }),
            arrayUnion: (...items) => ({ __arrayUnion: items }),
            arrayRemove: (...items) => ({ __arrayRemove: items }),
        };

        const getByPath = (obj, path) =>
            path
                .split('.')
                .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);

        const setByPath = (obj, path, value) => {
            const parts = path.split('.');
            let ref = obj;
            for (let i = 0; i < parts.length - 1; i += 1) {
                const key = parts[i];
                if (!ref[key] || typeof ref[key] !== 'object') ref[key] = {};
                ref = ref[key];
            }
            ref[parts[parts.length - 1]] = value;
        };

        const applyUpdateValue = (obj, path, raw) => {
            const v = normalizeValue(raw);
            if (v && v.__arrayUnion) {
                const current = getByPath(obj, path) || [];
                setByPath(obj, path, Array.from(new Set([...(current || []), ...v.__arrayUnion])));
                return;
            }
            if (v && v.__arrayRemove) {
                const current = getByPath(obj, path) || [];
                setByPath(
                    obj,
                    path,
                    (current || []).filter((item) => !v.__arrayRemove.includes(item))
                );
                return;
            }
            setByPath(obj, path, v);
        };

        const collection = (name) => {
            if (!store[name]) store[name] = {};
            return {
                doc(id) {
                    const ref = {
                        id,
                        async delete() {
                            delete store[name][id];
                        },
                        async set(obj) {
                            const data = Object.assign({}, obj);
                            Object.keys(data).forEach((k) => {
                                data[k] = normalizeValue(data[k]);
                            });
                            store[name][id] = Object.assign({}, store[name][id] || {}, data);
                        },
                        async update(obj) {
                            const existing = store[name][id] || {};
                            Object.keys(obj).forEach((k) => {
                                applyUpdateValue(existing, k, obj[k]);
                            });
                            store[name][id] = existing;
                        },
                        async get() {
                            const data = store[name][id];
                            return { exists: !!data, id, data: () => data };
                        },
                    };
                    return ref;
                },
                async add(obj) {
                    const id = makeId();
                    const data = Object.assign({}, obj);
                    Object.keys(data).forEach((k) => {
                        data[k] = normalizeValue(data[k]);
                    });
                    data.createdAt =
                        data.createdAt && data.createdAt.__ts
                            ? data.createdAt.__ts
                            : data.createdAt || new Date();
                    data.updatedAt =
                        data.updatedAt && data.updatedAt.__ts
                            ? data.updatedAt.__ts
                            : data.updatedAt || new Date();
                    store[name][id] = data;
                    return { id };
                },
                where(field, op, value) {
                    const query = {
                        _filters: [{ field, op, value }],
                        _orderBy: null,
                        where(nextField, nextOp, nextValue) {
                            this._filters.push({ field: nextField, op: nextOp, value: nextValue });
                            return this;
                        },
                        orderBy(orderField, direction = 'asc') {
                            this._orderBy = {
                                field: orderField,
                                direction: String(direction).toLowerCase(),
                            };
                            return this;
                        },
                        async get() {
                            let filtered = Object.entries(store[name]).map(([id, data]) => ({
                                id,
                                data,
                            }));
                            this._filters.forEach((f) => {
                                if (f.op === 'array-contains') {
                                    filtered = filtered.filter((item) =>
                                        (getByPath(item.data, f.field) || []).includes(f.value)
                                    );
                                } else if (f.op === '==') {
                                    filtered = filtered.filter(
                                        (item) => getByPath(item.data, f.field) === f.value
                                    );
                                }
                            });
                            if (this._orderBy) {
                                const { field: orderField, direction } = this._orderBy;
                                filtered.sort((a, b) => {
                                    const av = getByPath(a.data, orderField);
                                    const bv = getByPath(b.data, orderField);
                                    const an = av && av.__ts ? av.__ts : av;
                                    const bn = bv && bv.__ts ? bv.__ts : bv;
                                    if (an === bn) return 0;
                                    if (an > bn) return direction === 'desc' ? -1 : 1;
                                    return direction === 'desc' ? 1 : -1;
                                });
                            }
                            return {
                                docs: filtered.map((item) => ({
                                    id: item.id,
                                    data: () => item.data,
                                    ref: collection(name).doc(item.id),
                                })),
                            };
                        },
                    };
                    return query;
                },
                async get() {
                    const all = Object.entries(store[name]).map(([id, data]) => ({ id, data }));
                    return {
                        docs: all.map((item) => ({
                            id: item.id,
                            data: () => item.data,
                            ref: collection(name).doc(item.id),
                        })),
                    };
                },
            };
        };

        const db = {
            collection,
            batch() {
                const ops = [];
                return {
                    update(ref, data) {
                        ops.push({ type: 'update', ref, data });
                    },
                    async commit() {
                        for (const op of ops) {
                            if (op.type === 'update') await op.ref.update(op.data);
                        }
                    },
                };
            },
            _store: store,
        };

        // expose a minimal firebase object for code that references firebase.firestore.FieldValue
        const firebaseMock = { firestore: { FieldValue } };

        window.firebaseServices = { auth, db, firebase: firebaseMock };
    })();
} else if (!isPlaceholderConfig) {
    // Initialize real Firebase when a non-placeholder config is supplied (or when forced)
    if (typeof window.firebase === 'undefined') {
        console.error(
            'Firebase SDK not loaded. Ensure firebase scripts are included in index.html before config.js'
        );
        window.firebaseServices = { auth: null, db: null, firebase: null };
    } else {
        try {
            if (!window.firebase.apps || window.firebase.apps.length === 0) {
                window.firebase.initializeApp(firebaseConfig);
            }
            const auth = window.firebase.auth();
            const db = window.firebase.firestore();
            window.firebaseServices = { auth, db, firebase: window.firebase };
        } catch (e) {
            console.error('Error initializing Firebase SDK:', e);
            window.firebaseServices = { auth: null, db: null, firebase: null };
        }
    }
} else {
    // In non-local environments with placeholder config, fail fast and log guidance
    console.error(
        'Firebase is not configured. Please update public/config.js with your firebaseConfig or provide window.__FIREBASE_CONFIG__. See DEPLOYMENT_GUIDE.md for details.'
    );
}
