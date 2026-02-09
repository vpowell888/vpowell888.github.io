const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const base = process.env.BASE_URL || 'http://127.0.0.1:8082';
    const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: true });
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);
    try {
        console.log('Opening', base);
        await page.goto(base, { waitUntil: 'networkidle2' });
        // Sign in mock user
        await page.waitForSelector('#loginEmail');
        await page.type('#loginEmail', 'vincentapowell@msn.com');
        await page.type('#loginPassword', 'Testing01&');
        await page.click('#loginBtn');
        await page.waitForSelector('#mainApp', { visible: true });

        // Create a project directly via DB
        const created = await page.evaluate(async () => {
            const db =
                (window.firebaseServices && window.firebaseServices.db) ||
                (window.firebase && window.firebase.firestore && window.firebase.firestore());
            const userUid =
                (window.firebaseServices &&
                    window.firebaseServices.auth &&
                    window.firebaseServices.auth.currentUser &&
                    window.firebaseServices.auth.currentUser.uid) ||
                'smoke-runner';
            const projectData = {
                clientName: 'Invite Test Co',
                suites: ['strategic'],
                status: 'active',
                createdAt:
                    window.firebase &&
                    window.firebase.firestore &&
                    window.firebase.firestore.FieldValue
                        ? window.firebase.firestore.FieldValue.serverTimestamp()
                        : new Date(),
                updatedAt:
                    window.firebase &&
                    window.firebase.firestore &&
                    window.firebase.firestore.FieldValue
                        ? window.firebase.firestore.FieldValue.serverTimestamp()
                        : new Date(),
                createdBy: userUid,
                teamMembers: [userUid],
                team: [{ uid: userUid, email: userUid + '@example.com', role: 'lead' }],
            };
            const doc = await db.collection('projects').add(projectData);
            return doc.id;
        });
        console.log('Created project', created);

        // Open team modal programmatically
        await page.evaluate(async (projId) => {
            window.openTeamModal && window.openTeamModal(projId);
        }, created);
        await page.waitForSelector('#teamModal', { visible: true });
        // Stub sendSignInLinkToEmail to instead create invite doc in Firestore so no real email is sent
        await page.evaluate(() => {
            try {
                if (window.firebase && window.firebase.auth) {
                    window.firebase._origSendSignInLinkToEmail =
                        window.firebase.auth().sendSignInLinkToEmail;
                    window.firebase.auth().sendSignInLinkToEmail = async (
                        email,
                        actionCodeSettings
                    ) => {
                        const db = window.firebase.firestore();
                        await db.collection('invites').add({
                            email,
                            projectId: window.appState.currentProject.id,
                            role: 'collaborator',
                            status: 'pending',
                            createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
                        });
                        return true;
                    };
                }
            } catch (e) {
                console.warn('Could not stub sendSignInLinkToEmail', e);
            }
        });

        // Fill invite email and click send
        await page.type('#teamModal input#inviteEmail', 'invitee.test@example.com');
        await page.select('#inviteRole', 'collaborator');
        await page.click('#sendInviteBtn');
        await page.waitForTimeout(1000);

        // Simulate invite acceptance: create user doc and mark invite accepted
        await page.evaluate(async () => {
            const db = window.firebase.firestore();
            // find invite
            const snap = await db
                .collection('invites')
                .where('email', '==', 'invitee.test@example.com')
                .where('status', '==', 'pending')
                .get();
            if (!snap.docs || snap.docs.length === 0) return false;
            const inv = snap.docs[0];
            // create user doc
            const usersRef = db.collection('users');
            const newUser = await usersRef.add({
                email: 'invitee.test@example.com',
                name: 'Invitee Test',
                role: 'collaborator',
                projects: [],
            });
            // update project
            await db
                .collection('projects')
                .doc(inv.data().projectId)
                .update({
                    teamMembers: window.firebase.firestore.FieldValue.arrayUnion(newUser.id),
                    team: window.firebase.firestore.FieldValue.arrayUnion({
                        uid: newUser.id,
                        email: 'invitee.test@example.com',
                        role: 'collaborator',
                    }),
                });
            await inv.ref.update({
                status: 'accepted',
                acceptedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
                acceptedByUid: newUser.id,
            });
            return true;
        });

        // Verify project contains new member
        const verify = await page.evaluate(async (projId) => {
            const db =
                (window.firebaseServices && window.firebaseServices.db) ||
                (window.firebase && window.firebase.firestore && window.firebase.firestore());
            const doc = await db.collection('projects').doc(projId).get();
            const data = doc.data();
            return data.teamMembers && data.teamMembers.length > 1;
        }, created);

        console.log('Invite acceptance verified?', verify);
        await browser.close();
        process.exit(verify ? 0 : 2);
    } catch (e) {
        console.error('Test failed', e);
        try {
            await browser.close();
        } catch (e) {}
        process.exit(1);
    }
})();
