(function () {
    var api;
    function getApi() {
        if (!api) api = window.appApi || {};
        return api;
    }
    function esc(v) {
        return window.safeHtml && window.safeHtml.escapeHtml
            ? window.safeHtml.escapeHtml(v)
            : String(v == null ? '' : v);
    }
    function $(id) {
        return document.getElementById(id);
    }
    function relDate(v) {
        if (!v) return '';
        var d = typeof v === 'number' ? new Date(v) : new Date(v);
        if (isNaN(d.getTime())) return '';
        var days = Math.floor((Date.now() - d.getTime()) / 86400000);
        if (days <= 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return days + 'd ago';
        return d.toLocaleDateString();
    }
    function statusOptions(current) {
        var options = ['not_started', 'in_progress', 'blocked', 'at_risk', 'done'];
        return options
            .map(function (o) {
                return (
                    '<option value="' +
                    esc(o) +
                    '"' +
                    (o === current ? ' selected' : '') +
                    '>' +
                    esc(o.replace(/_/g, ' ')) +
                    '</option>'
                );
            })
            .join('');
    }
    function serviceSelectOptions(currentId) {
        var catalog =
            (getApi().getServiceCatalog && getApi().getServiceCatalog()) ||
            window.serviceCatalog ||
            {};
        var keys = Object.keys(catalog);
        return (
            '<option value="">Select a service</option>' +
            keys
                .map(function (key) {
                    return (
                        '<option value="' +
                        esc(key) +
                        '"' +
                        (key === currentId ? ' selected' : '') +
                        '>' +
                        esc(catalog[key].name || key) +
                        '</option>'
                    );
                })
                .join('')
        );
    }
    function serviceInfo(serviceId) {
        var catalog =
            (getApi().getServiceCatalog && getApi().getServiceCatalog()) ||
            window.serviceCatalog ||
            {};
        return catalog[serviceId] || null;
    }

    var currentTab = 'overview';

    function computeProgress(project) {
        var deliverables = project.serviceDeliverables || [];
        var plan = project.projectPlan || [];
        var total = deliverables.length + plan.length;
        if (!total) return 0;
        var done = 0;
        deliverables.forEach(function (d) {
            if (d.status === 'done') done++;
        });
        plan.forEach(function (p) {
            if (p.status === 'done') done++;
        });
        return Math.round((done / total) * 100);
    }

    function renderProjectDetail(project) {
        var container = $('projectDetailView');
        if (!container) return;

        var service = serviceInfo(project.primaryService);
        var serviceName = service ? service.name : 'Service not assigned';

        var badges =
            '<span class="status ' +
            esc(project.status || 'active') +
            '">' +
            esc(project.status || 'active') +
            '</span>';
        if (project.industry) badges += '<span class="badge">' + esc(project.industry) + '</span>';
        if (serviceName) badges += '<span class="badge category">' + esc(serviceName) + '</span>';

        container.innerHTML =
            '<div class="project-detail-header">' +
            '<div><h2>' +
            esc(project.clientName || project.id) +
            '</h2>' +
            '<div class="project-meta-bar">' +
            badges +
            '</div></div>' +
            '<div class="project-detail-actions">' +
            '<button class="btn-secondary" data-action="switch-view" data-view="projects">Back</button>' +
            '<button class="btn-secondary" data-action="edit-project" data-id="' +
            esc(project.id) +
            '">Edit</button>' +
            '<button class="btn-secondary" data-action="open-team" data-id="' +
            esc(project.id) +
            '">Team</button>' +
            '<button class="btn-secondary" data-action="export-project" data-id="' +
            esc(project.id) +
            '">Export</button>' +
            '<button class="btn-danger" data-action="delete-project" data-id="' +
            esc(project.id) +
            '">Delete</button>' +
            '</div></div>' +
            '<nav class="detail-tabs" id="detailTabs">' +
            '<button class="detail-tab' +
            (currentTab === 'overview' ? ' active' : '') +
            '" data-detail-tab="overview">Overview</button>' +
            '<button class="detail-tab' +
            (currentTab === 'deliverables' ? ' active' : '') +
            '" data-detail-tab="deliverables">Deliverables</button>' +
            '<button class="detail-tab' +
            (currentTab === 'plan' ? ' active' : '') +
            '" data-detail-tab="plan">Project Plan</button>' +
            '<button class="detail-tab' +
            (currentTab === 'people' ? ' active' : '') +
            '" data-detail-tab="people">People</button>' +
            '</nav>' +
            '<div class="tab-content-area" id="tabContentArea"></div>';

        container.querySelectorAll('.detail-tab').forEach(function (btn) {
            btn.addEventListener('click', function () {
                currentTab = btn.dataset.detailTab;
                container.querySelectorAll('.detail-tab').forEach(function (x) {
                    x.classList.remove('active');
                });
                btn.classList.add('active');
                renderTabContent(project);
            });
        });

        renderTabContent(project);
    }

    function renderTabContent(project) {
        var area = $('tabContentArea');
        if (!area) return;
        switch (currentTab) {
            case 'overview':
                renderOverview(area, project);
                break;
            case 'deliverables':
                renderDeliverables(area, project);
                break;
            case 'plan':
                renderPlan(area, project);
                break;
            case 'people':
                renderPeople(area, project);
                break;
        }
    }

    function renderOverview(area, project) {
        var service = serviceInfo(project.primaryService);
        var deliverables = project.serviceDeliverables || [];
        var plan = project.projectPlan || [];
        var delDone = deliverables.filter(function (d) {
            return d.status === 'done';
        }).length;
        var planDone = plan.filter(function (p) {
            return p.status === 'done';
        }).length;
        var progress = computeProgress(project);

        var serviceHtml;
        if (service) {
            serviceHtml =
                '<div class="service-display"><div class="service-icon">' +
                esc(service.name[0]) +
                '</div>' +
                '<div class="service-info"><div class="service-name">' +
                esc(service.name) +
                '</div>' +
                '<div class="service-category">' +
                esc(service.category) +
                '</div></div></div>';
        } else {
            serviceHtml = '<p class="muted">No service assigned.</p>';
        }

        serviceHtml +=
            '<div class="service-change-row"><select id="changeServiceSelect">' +
            serviceSelectOptions(project.primaryService) +
            '</select><button class="btn-secondary" data-action="assign-primary-service">Change Service</button></div>';

        area.innerHTML =
            '<div class="overview-grid">' +
            '<div class="overview-card"><h4>Service</h4>' +
            serviceHtml +
            '</div>' +
            '<div class="overview-card"><h4>Progress</h4>' +
            '<div class="overview-stat">' +
            progress +
            '%</div>' +
            '<div class="overview-stat-label">Overall completion</div>' +
            '<div class="progress-wrap" style="margin-top:12px"><div class="progress-bar"><div class="progress-fill" style="width:' +
            progress +
            '%"></div></div></div></div>' +
            '<div class="overview-card"><h4>Deliverables</h4>' +
            '<div class="overview-stat">' +
            delDone +
            ' / ' +
            deliverables.length +
            '</div>' +
            '<div class="overview-stat-label">Completed</div></div>' +
            '<div class="overview-card"><h4>Project Plan</h4>' +
            '<div class="overview-stat">' +
            planDone +
            ' / ' +
            plan.length +
            '</div>' +
            '<div class="overview-stat-label">Phases completed</div></div>' +
            '</div>' +
            (project.description
                ? '<div class="overview-card" style="margin-top:16px"><h4>Description</h4><p>' +
                  esc(project.description) +
                  '</p></div>'
                : '');
    }

    function renderDeliverables(area, project) {
        var deliverables = project.serviceDeliverables || [];
        if (!deliverables.length) {
            area.innerHTML =
                '<div class="empty-state"><h4>No deliverables</h4><p>Assign a service to populate deliverables.</p></div>';
            return;
        }

        area.innerHTML =
            '<div class="section-header"><h3>Deliverables (' +
            deliverables.length +
            ')</h3></div>' +
            deliverables
                .map(function (d) {
                    var updates = (d.updates || []).slice().reverse();
                    var historyHtml = '';
                    if (updates.length) {
                        historyHtml =
                            '<div class="update-history">' +
                            updates
                                .map(function (u) {
                                    return (
                                        '<div class="update-entry"><strong>' +
                                        esc(u.note || '') +
                                        '</strong> <span>' +
                                        relDate(u.timestamp || u.date) +
                                        '</span></div>'
                                    );
                                })
                                .join('') +
                            '</div>';
                    }
                    return (
                        '<div class="deliverable-card" data-deliverable-id="' +
                        esc(d.id) +
                        '">' +
                        '<div class="deliverable-title">' +
                        esc(d.title) +
                        '</div>' +
                        '<div class="deliverable-service">' +
                        esc(d.serviceName || '') +
                        '</div>' +
                        '<div class="deliverable-controls">' +
                        '<select id="delStatus_' +
                        esc(d.id) +
                        '">' +
                        statusOptions(d.status || 'not_started') +
                        '</select>' +
                        '<button class="btn-secondary" data-action="update-deliverable-status" data-deliverable-id="' +
                        esc(d.id) +
                        '">Save Status</button>' +
                        '</div>' +
                        '<div class="deliverable-update-row">' +
                        '<input id="delNote_' +
                        esc(d.id) +
                        '" type="text" placeholder="Add an update note..." />' +
                        '<button class="btn-secondary" data-action="add-deliverable-update" data-deliverable-id="' +
                        esc(d.id) +
                        '">Add Update</button>' +
                        '</div>' +
                        historyHtml +
                        '</div>'
                    );
                })
                .join('');
    }

    function renderPlan(area, project) {
        var plan = project.projectPlan || [];
        if (!plan.length) {
            area.innerHTML =
                '<div class="empty-state"><h4>No project plan</h4><p>A project plan will be created when the project is set up.</p></div>';
            return;
        }

        area.innerHTML =
            '<div class="section-header"><h3>Project Plan (' +
            plan.length +
            ' phases)</h3></div>' +
            plan
                .map(function (phase) {
                    var updates = (phase.updates || []).slice().reverse();
                    var historyHtml = '';
                    if (updates.length) {
                        historyHtml =
                            '<div class="update-history">' +
                            updates
                                .map(function (u) {
                                    return (
                                        '<div class="update-entry"><strong>' +
                                        esc(u.note || '') +
                                        '</strong> <span>' +
                                        relDate(u.timestamp || u.date) +
                                        '</span></div>'
                                    );
                                })
                                .join('') +
                            '</div>';
                    }
                    return (
                        '<div class="phase-card" data-phase-id="' +
                        esc(phase.id) +
                        '">' +
                        '<div class="phase-title">' +
                        esc(phase.title) +
                        '</div>' +
                        (phase.bestPractice
                            ? '<div class="phase-best-practice">' +
                              esc(phase.bestPractice) +
                              '</div>'
                            : '') +
                        '<div class="phase-controls">' +
                        '<select id="planStatus_' +
                        esc(phase.id) +
                        '">' +
                        statusOptions(phase.status || 'not_started') +
                        '</select>' +
                        '<button class="btn-secondary" data-action="update-plan-status" data-phase-id="' +
                        esc(phase.id) +
                        '">Save Status</button>' +
                        '</div>' +
                        '<div class="phase-update-row">' +
                        '<input id="planNote_' +
                        esc(phase.id) +
                        '" type="text" placeholder="Add a phase update..." />' +
                        '<button class="btn-secondary" data-action="add-plan-update" data-phase-id="' +
                        esc(phase.id) +
                        '">Add Update</button>' +
                        '</div>' +
                        historyHtml +
                        '</div>'
                    );
                })
                .join('');
    }

    function renderPeople(area, project) {
        var people = project.engagementPeople || [];

        area.innerHTML =
            '<div class="section-header"><h3>Stakeholders (' +
            people.length +
            ')</h3></div>' +
            '<div class="person-form">' +
            '<input id="personName" type="text" placeholder="Name" />' +
            '<input id="personRole" type="text" placeholder="Role / Title" />' +
            '<input id="personContact" type="text" placeholder="Email or phone" />' +
            '<button class="btn-primary" data-action="add-engagement-person">Add</button>' +
            '</div>' +
            (people.length
                ? people
                      .map(function (p) {
                          return (
                              '<div class="person-card" data-person-id="' +
                              esc(p.id) +
                              '">' +
                              '<div class="person-info"><strong>' +
                              esc(p.name || 'Unnamed') +
                              '</strong>' +
                              '<div class="small">' +
                              esc(p.role || '') +
                              (p.contact ? ' &middot; ' + esc(p.contact) : '') +
                              '</div></div>' +
                              '<div class="person-actions">' +
                              '<button class="btn-link" data-action="edit-engagement-person" data-person-id="' +
                              esc(p.id) +
                              '">Edit</button>' +
                              '<button class="btn-link" style="color:var(--bad)" data-action="delete-engagement-person" data-person-id="' +
                              esc(p.id) +
                              '">Remove</button>' +
                              '</div></div>'
                          );
                      })
                      .join('')
                : '<div class="empty-state"><h4>No stakeholders added</h4><p>Add key people involved in this project.</p></div>');
    }

    async function updateProject(projectId, patch) {
        var a = getApi();
        if (!a.db) return null;
        patch.updatedAt = a.FieldValue ? a.FieldValue.serverTimestamp() : new Date();
        await a.db.collection('projects').doc(projectId).set(patch, { merge: true });
        if (a.refreshProject) return await a.refreshProject(projectId);
        return null;
    }

    async function refreshAndRender(projectId) {
        var a = getApi();
        if (!a.refreshProject) return;
        var project = await a.refreshProject(projectId);
        if (project) {
            renderProjectDetail(project);
            if (a.loadProjects && window.appState && window.appState.currentUser) {
                await a.loadProjects(window.appState.currentUser.uid);
            }
        }
    }

    window.assignPrimaryService = async function () {
        var project = window.appState && window.appState.currentProject;
        if (!project) return;
        var select = $('changeServiceSelect');
        if (!select) return;
        var newServiceId = select.value;
        if (!newServiceId) return (window.showToast || alert)('Select a service', true);
        var a = getApi();
        var assignedServices = [newServiceId];
        var merged = a.mergeDeliverablesForServices
            ? a.mergeDeliverablesForServices(project.serviceDeliverables, assignedServices)
            : project.serviceDeliverables || [];
        await updateProject(project.id, {
            primaryService: newServiceId,
            assignedServices: assignedServices,
            serviceDeliverables: merged,
        });
        currentTab = 'overview';
        await refreshAndRender(project.id);
        (window.showToast || alert)('Service updated');
    };

    window.updateDeliverableStatus = async function (deliverableId) {
        var project = window.appState && window.appState.currentProject;
        if (!project) return;
        var select = $('delStatus_' + deliverableId);
        if (!select) return;
        var newStatus = select.value;
        var deliverables = (project.serviceDeliverables || []).map(function (d) {
            if (d.id !== deliverableId) return d;
            return Object.assign({}, d, { status: newStatus, updatedAt: Date.now() });
        });
        var progress = computeProgressFromArrays(deliverables, project.projectPlan || []);
        await updateProject(project.id, { serviceDeliverables: deliverables, progress: progress });
        currentTab = 'deliverables';
        await refreshAndRender(project.id);
        (window.showToast || alert)('Status saved');
    };

    window.addDeliverableUpdate = async function (deliverableId) {
        var project = window.appState && window.appState.currentProject;
        if (!project) return;
        var input = $('delNote_' + deliverableId);
        if (!input) return;
        var note = String(input.value || '').trim();
        if (!note) return (window.showToast || alert)('Enter a note', true);
        var deliverables = (project.serviceDeliverables || []).map(function (d) {
            if (d.id !== deliverableId) return d;
            var updates = (d.updates || []).concat([{ note: note, timestamp: Date.now() }]);
            return Object.assign({}, d, { updates: updates, updatedAt: Date.now() });
        });
        await updateProject(project.id, { serviceDeliverables: deliverables });
        currentTab = 'deliverables';
        await refreshAndRender(project.id);
        (window.showToast || alert)('Update added');
    };

    window.updatePlanStatus = async function (phaseId) {
        var project = window.appState && window.appState.currentProject;
        if (!project) return;
        var select = $('planStatus_' + phaseId);
        if (!select) return;
        var newStatus = select.value;
        var plan = (project.projectPlan || []).map(function (p) {
            if (p.id !== phaseId) return p;
            return Object.assign({}, p, { status: newStatus, updatedAt: Date.now() });
        });
        var progress = computeProgressFromArrays(project.serviceDeliverables || [], plan);
        await updateProject(project.id, { projectPlan: plan, progress: progress });
        currentTab = 'plan';
        await refreshAndRender(project.id);
        (window.showToast || alert)('Status saved');
    };

    window.addPlanUpdate = async function (phaseId) {
        var project = window.appState && window.appState.currentProject;
        if (!project) return;
        var input = $('planNote_' + phaseId);
        if (!input) return;
        var note = String(input.value || '').trim();
        if (!note) return (window.showToast || alert)('Enter a note', true);
        var plan = (project.projectPlan || []).map(function (p) {
            if (p.id !== phaseId) return p;
            var updates = (p.updates || []).concat([{ note: note, timestamp: Date.now() }]);
            return Object.assign({}, p, { updates: updates, updatedAt: Date.now() });
        });
        await updateProject(project.id, { projectPlan: plan });
        currentTab = 'plan';
        await refreshAndRender(project.id);
        (window.showToast || alert)('Update added');
    };

    window.addEngagementPerson = async function () {
        var project = window.appState && window.appState.currentProject;
        if (!project) return;
        var name = String(($('personName') && $('personName').value) || '').trim();
        var role = String(($('personRole') && $('personRole').value) || '').trim();
        var contact = String(($('personContact') && $('personContact').value) || '').trim();
        if (!name) return (window.showToast || alert)('Enter a name', true);
        var a = getApi();
        var newId = a.makeId ? a.makeId('person') : 'person_' + Date.now();
        var people = (project.engagementPeople || []).concat([
            { id: newId, name: name, role: role, contact: contact, createdAt: Date.now() },
        ]);
        await updateProject(project.id, { engagementPeople: people });
        currentTab = 'people';
        await refreshAndRender(project.id);
        (window.showToast || alert)('Person added');
    };

    window.editEngagementPerson = async function (personId) {
        var project = window.appState && window.appState.currentProject;
        if (!project) return;
        var person = (project.engagementPeople || []).find(function (p) {
            return p.id === personId;
        });
        if (!person) return;
        var newName = window.prompt('Name:', person.name || '');
        if (newName === null) return;
        var newRole = window.prompt('Role:', person.role || '');
        if (newRole === null) return;
        var newContact = window.prompt('Contact:', person.contact || '');
        if (newContact === null) return;
        var people = (project.engagementPeople || []).map(function (p) {
            if (p.id !== personId) return p;
            return Object.assign({}, p, {
                name: newName.trim() || p.name,
                role: newRole.trim(),
                contact: newContact.trim(),
                updatedAt: Date.now(),
            });
        });
        await updateProject(project.id, { engagementPeople: people });
        currentTab = 'people';
        await refreshAndRender(project.id);
        (window.showToast || alert)('Person updated');
    };

    window.deleteEngagementPerson = async function (personId) {
        var project = window.appState && window.appState.currentProject;
        if (!project) return;
        var a = getApi();
        if (a.openConfirmModal) {
            var ok = await a.openConfirmModal({
                title: 'Remove person',
                message: 'Remove this stakeholder from the project?',
                confirmText: 'Remove',
            });
            if (!ok) return;
        }
        var people = (project.engagementPeople || []).filter(function (p) {
            return p.id !== personId;
        });
        await updateProject(project.id, { engagementPeople: people });
        currentTab = 'people';
        await refreshAndRender(project.id);
        (window.showToast || alert)('Person removed');
    };

    function computeProgressFromArrays(deliverables, plan) {
        var total = deliverables.length + plan.length;
        if (!total) return 0;
        var done = 0;
        deliverables.forEach(function (d) {
            if (d.status === 'done') done++;
        });
        plan.forEach(function (p) {
            if (p.status === 'done') done++;
        });
        return Math.round((done / total) * 100);
    }

    window.renderProjectDetail = renderProjectDetail;
})();
