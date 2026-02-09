const puppeteer = require('puppeteer');
const httpServer = require('http-server');

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function click(page, selector) {
    await page.waitForSelector(selector, { timeout: 20000 });
    await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) throw new Error('missing-selector:' + sel);
        el.scrollIntoView({ block: 'center' });
        el.click();
    }, selector);
}

async function typeInto(page, selector, value) {
    await page.waitForSelector(selector, { timeout: 20000 });
    await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) el.value = '';
    }, selector);
    if (value) await page.type(selector, value);
}

async function selectValue(page, selector, value) {
    await page.waitForSelector(selector, { timeout: 20000 });
    await page.select(selector, value);
}

async function createEngagement(page, engagement) {
    await click(page, '[data-action="open-new-project"]');
    await page.waitForSelector('#newProjectModal.active', { timeout: 20000 });

    await typeInto(page, '#clientName', engagement.clientName);
    await selectValue(page, '#clientIndustry', engagement.industry);
    await selectValue(page, '#companySize', engagement.companySize);
    await selectValue(page, '#annualRevenue', engagement.revenue);
    for (const suite of engagement.suites) {
        await click(page, `input[name="suite"][value="${suite}"]`);
    }
    await selectValue(page, '#primaryService', engagement.primaryService);
    await typeInto(page, '#projectDescription', engagement.description);

    await click(page, '#createProjectBtn');
    await page.waitForFunction(
        (name) =>
            Array.from(document.querySelectorAll('.project-card h4')).some(
                (el) => el.textContent.trim() === name
            ),
        { timeout: 30000 },
        engagement.clientName
    );
}

async function openEngagement(page, clientName) {
    await page.waitForSelector('.project-card[data-id]', { timeout: 20000 });
    await page.evaluate((name) => {
        const cards = Array.from(document.querySelectorAll('.project-card[data-id]'));
        const target = cards.find((card) => {
            const title = card.querySelector('h4');
            return title && title.textContent.trim() === name;
        });
        if (!target) throw new Error('engagement-card-not-found:' + name);
        target.click();
    }, clientName);
    await page.waitForSelector('.workspace-panel', { timeout: 30000 });
}

async function editEngagementFields(page, updates) {
    await click(page, '[data-action="edit-project"]');
    await page.waitForSelector('#newProjectModal.active', { timeout: 20000 });

    if (updates.clientName) await typeInto(page, '#clientName', updates.clientName);
    if (updates.industry) await selectValue(page, '#clientIndustry', updates.industry);
    if (updates.companySize) await selectValue(page, '#companySize', updates.companySize);
    if (updates.revenue) await selectValue(page, '#annualRevenue', updates.revenue);
    if (updates.primaryService) await selectValue(page, '#primaryService', updates.primaryService);
    if (updates.description) await typeInto(page, '#projectDescription', updates.description);

    await click(page, '#createProjectBtn');
    await page.waitForFunction(
        () => {
            const modal = document.getElementById('newProjectModal');
            return !modal || !modal.classList.contains('active');
        },
        { timeout: 20000 }
    );
}

async function exerciseWorkspaceCrud(page, person) {
    await typeInto(page, '#personName', person.name);
    await typeInto(page, '#personEmail', person.email);
    await typeInto(page, '#personRole', person.role);
    await typeInto(page, '#personFirm', person.firm);
    await typeInto(page, '#personNotes', person.notes);
    await click(page, '[data-action="add-engagement-person"]');
    await page.waitForFunction(
        (name) => document.body.innerText.includes(name),
        { timeout: 20000 },
        person.name
    );

    await page.evaluate((edited) => {
        window.__promptQueue = [edited.name, edited.email, edited.role, edited.firm, edited.notes];
        window.prompt = () => {
            return window.__promptQueue.length ? window.__promptQueue.shift() : '';
        };
    }, person.edited);
    await click(page, '[data-action="edit-engagement-person"]');
    await page.waitForFunction(
        (name) => document.body.innerText.includes(name),
        { timeout: 20000 },
        person.edited.name
    );

    await click(page, '[data-action="delete-engagement-person"]');
    await click(page, '#confirmOk');
    await page.waitForFunction(
        (name) => !document.body.innerText.includes(name),
        { timeout: 20000 },
        person.edited.name
    );

    await typeInto(page, '#personName', person.final.name);
    await typeInto(page, '#personEmail', person.final.email);
    await typeInto(page, '#personRole', person.final.role);
    await typeInto(page, '#personFirm', person.final.firm);
    await typeInto(page, '#personNotes', person.final.notes);
    await click(page, '[data-action="add-engagement-person"]');
}

async function updateDeliverablesAndPlan(page, deliverableNote, planNote) {
    await page.waitForSelector('[data-deliverable-status]', { timeout: 20000 });
    const deliverableId = await page.$eval('[data-deliverable-status]', (el) =>
        el.getAttribute('data-deliverable-status')
    );
    await selectValue(page, `[data-deliverable-status="${deliverableId}"]`, 'in_progress');
    await click(page, `[data-action="update-deliverable-status"][data-deliverable-id="${deliverableId}"]`);
    await typeInto(page, `[data-deliverable-note="${deliverableId}"]`, deliverableNote);
    await click(page, `[data-action="add-deliverable-update"][data-deliverable-id="${deliverableId}"]`);

    const phaseId = await page.$eval('[data-phase-status]', (el) =>
        el.getAttribute('data-phase-status')
    );
    await selectValue(page, `[data-phase-status="${phaseId}"]`, 'in_progress');
    await click(page, `[data-action="update-plan-status"][data-phase-id="${phaseId}"]`);
    await typeInto(page, `[data-phase-note="${phaseId}"]`, planNote);
    await click(page, `[data-action="add-plan-update"][data-phase-id="${phaseId}"]`);
}

async function exerciseTeamModal(page, inviteEmail) {
    await click(page, '[data-action="open-team"]');
    await page.waitForSelector('#teamModal.active', { timeout: 20000 });
    await typeInto(page, '#inviteEmail', inviteEmail);
    await selectValue(page, '#inviteRole', 'consultant');
    await click(page, '#sendInviteBtn');
    await page.waitForFunction(
        (email) => document.body.innerText.includes(email),
        { timeout: 20000 },
        inviteEmail
    );
    await click(page, '.cancel-invite');
    await click(page, '#confirmOk');
    await click(page, '#teamModalClose');
}

async function exerciseModule(page) {
    const hasModuleCards = await page
        .waitForFunction(
            () => document.querySelectorAll('.module-card').length > 0,
            { timeout: 20000 }
        )
        .then(() => true)
        .catch(() => false);
    if (!hasModuleCards) {
        const snapshot = await page.evaluate(() => ({
            currentView: window.appState && window.appState.currentView,
            suites:
                window.appState &&
                window.appState.currentProject &&
                window.appState.currentProject.suites,
            diagnosticText: (document.getElementById('diagnosticView') || {}).innerText || '',
        }));
        throw new Error('module-cards-missing:' + JSON.stringify(snapshot));
    }
    await click(page, '.module-card');
    await page.waitForSelector('#moduleAssessmentScreen', { timeout: 20000 });

    await click(page, '.nav-section[data-section="quantitative"]');
    await click(page, '.score-btn');
    await click(page, '[data-action="calculate-score"]');
    await click(page, '[data-action="save-assessment"]');

    await click(page, '.nav-section[data-section="findings"]');
    await typeInto(page, '#keyFindings', 'Decision rights are currently unclear in two workflows.');
    await typeInto(page, '#gapAnalysis', 'Operational governance is not consistently enforced.');
    await typeInto(
        page,
        '#recommendations',
        'Define control points and assign accountable owners by function.'
    );
    await click(page, '[data-action="add-priority"]');
    await page.type('#priorityActions input:last-child', 'Set weekly steerco escalation protocol');
    await click(page, '[data-action="save-findings"]');

    await click(page, '.nav-section[data-section="documents"]');
    await click(page, '[data-action="upload-document"]');
    await click(page, '[data-action="add-document-link"]');

    await click(page, '[data-action="close-module"]');
    await page.waitForSelector('.workspace-panel', { timeout: 20000 });
}

async function addSuiteFromDetail(page) {
    await click(page, '#toggleSuiteAddBtn');
    const addButtons = await page.$$('[data-action="add-suite"]');
    if (addButtons.length > 0) {
        await addButtons[0].click();
        await sleep(500);
    }
}

async function deleteCurrentEngagement(page) {
    await click(page, '[data-action="delete-project"]');
    await click(page, '#confirmOk');
    await page.waitForSelector('#projectsView', { timeout: 20000 });
}

async function switchToProjectsView(page) {
    await click(page, '.sidebar-link[data-view="projects"]');
    await page.waitForSelector('#projectsView', { timeout: 20000 });
}

async function searchForEngagement(page, name) {
    await typeInto(page, '#searchProjects', name);
    await page.waitForFunction(
        (n) =>
            Array.from(document.querySelectorAll('.project-list-name')).some((el) =>
                el.textContent.includes(n)
            ),
        { timeout: 20000 },
        name
    );
    await typeInto(page, '#searchProjects', '');
}

async function login(page, email, password) {
    await click(page, '[data-tab="login"]');
    await typeInto(page, '#loginEmail', email);
    await typeInto(page, '#loginPassword', password);
    await click(page, '#loginBtn');
    await page.waitForSelector('#mainApp', { timeout: 30000 });
}

async function logout(page) {
    await click(page, '#userMenuBtn');
    await click(page, '#logoutBtn');
    await page.waitForSelector('#loginScreen', { timeout: 20000 });
}

async function register(page, email, password, name, company) {
    await click(page, '[data-tab="register"]');
    await typeInto(page, '#registerName', name);
    await typeInto(page, '#registerEmail', email);
    await typeInto(page, '#registerCompany', company);
    await selectValue(page, '#registerRole', 'lead');
    await typeInto(page, '#registerPassword', password);
    await click(page, '#registerBtn');
    await page.waitForSelector('#mainApp', { timeout: 30000 });
}

async function run() {
    const server = httpServer.createServer({ root: 'public', cache: -1 });
    await new Promise((resolve, reject) => {
        server.server.listen(0, '127.0.0.1', resolve);
        server.server.on('error', reject);
    });
    const port = server.server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    const stamp = Date.now();
    const userEmail = `lifecycle.user.${stamp}@example.com`;
    const userPassword = 'Testing01&';

    let browser;
    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        page.setDefaultTimeout(45000);
        await page.goto(baseUrl, { waitUntil: 'networkidle2' });
        await page.waitForSelector('#loginScreen', { timeout: 20000 });

        await register(page, userEmail, userPassword, 'Lifecycle User', 'Oblongix');

        const scenarioOne = {
            clientName: `Apex Financial ${stamp}`,
            industry: 'financial',
            companySize: 'large',
            revenue: 'large',
            suites: ['strategic'],
            primaryService: 'ai-strategy-design',
            description: 'Enterprise strategy and governance reset.',
        };
        await createEngagement(page, scenarioOne);
        await openEngagement(page, scenarioOne.clientName);
        await editEngagementFields(page, {
            description: 'Enterprise strategy and governance reset (phase 1).',
            primaryService: 'ai-transformation-roadmap',
        });
        await addSuiteFromDetail(page);
        await exerciseWorkspaceCrud(page, {
            name: 'Maya Carter',
            email: 'maya.carter@example.com',
            role: 'COO',
            firm: 'Apex Financial',
            notes: 'Executive sponsor',
            edited: {
                name: 'Maya Carter-Edwards',
                email: 'maya.edwards@example.com',
                role: 'Chief Operating Officer',
                firm: 'Apex Financial',
                notes: 'Updated executive sponsor notes',
            },
            final: {
                name: 'Maya Carter',
                email: 'maya.carter@example.com',
                role: 'COO',
                firm: 'Apex Financial',
                notes: 'Final stakeholder record',
            },
        });
        await updateDeliverablesAndPlan(
            page,
            'Initial strategy draft reviewed with executive team.',
            'Governance design workstream has started with weekly checkpoints.'
        );
        await exerciseTeamModal(page, `invite.one.${stamp}@example.com`);
        await exerciseModule(page);
        await switchToProjectsView(page);
        await searchForEngagement(page, scenarioOne.clientName);

        await openEngagement(page, scenarioOne.clientName);
        await logout(page);
        await login(page, userEmail, userPassword);
        await openEngagement(page, scenarioOne.clientName);
        await page.waitForFunction(
            () =>
                document.body.innerText.includes('Initial strategy draft reviewed with executive team.'),
            { timeout: 20000 }
        );

        const scenarioTwo = {
            clientName: `Northstar Healthcare ${stamp}`,
            industry: 'healthcare',
            companySize: 'medium',
            revenue: 'medium',
            suites: ['organizational'],
            primaryService: 'assessments',
            description: 'Workforce and governance readiness diagnostic.',
        };
        await switchToProjectsView(page);
        await createEngagement(page, scenarioTwo);
        await openEngagement(page, scenarioTwo.clientName);
        await editEngagementFields(page, {
            industry: 'technology',
            description: 'Workforce and governance readiness diagnostic (cross-industry benchmark).',
            primaryService: 'fundamentals',
        });
        await updateDeliverablesAndPlan(
            page,
            'Capability gap baseline completed with leadership input.',
            'Foundational data ownership map drafted and socialized.'
        );
        await exerciseTeamModal(page, `invite.two.${stamp}@example.com`);
        await exerciseModule(page);

        // Complete lifecycle by deleting both test engagements.
        await deleteCurrentEngagement(page);
        await openEngagement(page, scenarioOne.clientName);
        await deleteCurrentEngagement(page);

        console.log('FULL LIFECYCLE EXAMPLES: PASS');
        await browser.close();
        await new Promise((resolve) => server.server.close(resolve));
    } catch (error) {
        console.error(
            'FULL LIFECYCLE EXAMPLES: FAIL',
            error && (error.stack || error.message || error)
        );
        try {
            if (browser) await browser.close();
        } catch (e) {}
        try {
            await new Promise((resolve) => server.server.close(resolve));
        } catch (e) {}
        process.exitCode = 1;
    }
}

run();
