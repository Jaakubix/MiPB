/**
 * Leave Request, Decorations & Employment Conditions Application Logic
 */

// --- Configuration ---

const USERS = [
    { id: 'alice', name: 'Alice Academic', role: 'Employee', isAcademic: true },
    { id: 'nancy', name: 'Nancy NonAcademic', role: 'Employee', isAcademic: false },
    { id: 'holly', name: 'Holly Head', role: 'HeadOU' },
    { id: 'penny', name: 'Penny Personnel', role: 'PD' },
    { id: 'quentin', name: 'Quentin Quartermaster', role: 'KWE' }, // New Role
    { id: 'adam', name: 'Adam Rector', role: 'Rector' },
    { id: 'carl', name: 'Carl Chancellor', role: 'Chancellor' },
    { id: 'paula', name: 'Paula VREdu', role: 'PRK' },
    { id: 'peter', name: 'Peter VRSci', role: 'PRN' },
    { id: 'mike', name: 'Mike MPD', role: 'MPD' }
];

const PROCESS_DEFS = {
    'LeaveRequest': {
        name: 'Leave Request',
        start: 'StartEvent_ApplicationSubmitted',
        nodes: {
            'StartEvent_ApplicationSubmitted': {
                name: 'Submit Leave Request',
                role: 'Employee',
                next: 'Task_ReviewAndForward_HeadOU',
                form: [
                    { name: 'request_date', label: 'Request Date', type: 'date', readonly: true },
                    { name: 'employee_position', label: 'Position', type: 'text', default: 'Lecturer' },
                    { name: 'leave_type', label: 'Leave Type', type: 'select', options: ['Recreational', 'Childcare', 'Exceptional'] },
                    { name: 'leave_start_date', label: 'Start Date', type: 'date' },
                    { name: 'leave_end_date', label: 'End Date', type: 'date' },
                    { name: 'leave_duration_days', label: 'Duration (Days)', type: 'number', readonly: true }
                ]
            },
            'Task_ReviewAndForward_HeadOU': {
                name: 'Review and approve leave request',
                role: 'HeadOU',
                next: 'Task_ReviewApplication_PD',
                form: [
                    { name: 'head_ou_decision', label: 'Decision', type: 'select', options: ['Approved', 'Rejected'] }
                ]
            },
            'Task_ReviewApplication_PD': {
                name: 'Review leave request (check entitlement)',
                role: 'PD',
                next: 'Gateway_IsAcademicTeacher',
                form: [
                    { name: 'pd_review_status', label: 'Entitlement Check', type: 'select', options: ['Entitlement Confirmed', 'Entitlement Exceeded'] },
                    { name: 'is_academic_teacher', label: 'Is an Academic Teacher?', type: 'checkbox' },
                    { name: 'lss_opinion_notes', label: 'LSS Opinion Notes', type: 'textarea' }
                ]
            },
            'Gateway_IsAcademicTeacher': {
                type: 'gateway',
                handler: (data) => {
                    return data.is_academic_teacher ? 'Task_Review_PRK' : 'Task_MakeDecision_Chancellor';
                }
            },
            'Task_Review_PRK': {
                name: 'Review application (PRK)',
                role: 'PRK',
                next: 'Task_Review_PRN',
                form: [
                    { name: 'prk_review_status', label: 'Review Status', type: 'select', options: ['Positive', 'Negative'] }
                ]
            },
            'Task_Review_PRN': {
                name: 'Review application (PRN)',
                role: 'PRN',
                next: 'Task_MakeDecision_RKR',
                form: [
                    { name: 'prn_review_status', label: 'Review Status', type: 'select', options: ['Positive', 'Negative'] }
                ]
            },
            'Task_MakeDecision_RKR': {
                name: 'Make decision (RKR)',
                role: 'Rector',
                next: 'Gateway_JoinDecision',
                form: [
                    { name: 'final_decision', label: 'Final Decision', type: 'select', options: ['Approved', 'Rejected'] }
                ],
                onComplete: (data) => { data.final_decision_maker = 'Rector'; }
            },
            'Task_MakeDecision_Chancellor': {
                name: 'Make decision (KAN)',
                role: 'Chancellor',
                next: 'Gateway_JoinDecision',
                form: [
                    { name: 'final_decision', label: 'Final Decision', type: 'select', options: ['Approved', 'Rejected'] }
                ],
                onComplete: (data) => { data.final_decision_maker = 'Chancellor'; }
            },
            'Gateway_JoinDecision': {
                type: 'gateway',
                handler: () => 'Task_InformHeadOU'
            },
            'Task_InformHeadOU': {
                name: 'Inform Head of O.U.',
                role: 'PD',
                next: 'Task_ImplementChanges',
                form: [
                    { name: 'inform_confirmation', label: 'I have informed the Head of O.U.', type: 'checkbox' }
                ]
            },
            'Task_ImplementChanges': {
                name: 'Register leave in HR system',
                role: 'PD',
                next: 'EndEvent_ProcessEnded',
                form: [
                    { name: 'register_confirmation', label: 'Leave registered in system', type: 'checkbox' }
                ]
            },
            'EndEvent_ProcessEnded': {
                type: 'end',
                name: 'Process Ended'
            }
        }
    },
    'Decorations': {
        name: 'Decorations and Medals',
        start: 'Task_SubmitApplication',
        nodes: {
            'Task_SubmitApplication': {
                name: 'Submit application for distinction',
                role: 'HeadOU',
                next: 'Task_PresentApplicationsForAcceptance',
                form: [
                    { name: 'employee_name', label: 'Employee Name', type: 'text' },
                    { name: 'organizational_unit', label: 'Organizational Unit', type: 'text' },
                    { name: 'decoration_type', label: 'Decoration Type', type: 'text' },
                    { name: 'application_justification', label: 'Justification', type: 'textarea' }
                ]
            },
            'Task_PresentApplicationsForAcceptance': {
                name: 'Present applications for acceptance',
                role: 'PD',
                next: 'Task_ReviewApplications',
                form: [
                    { name: 'pd_verification', label: 'Application Verified', type: 'checkbox' }
                ]
            },
            'Task_ReviewApplications': {
                name: 'Review applications and forward to PD',
                role: 'PRK',
                next: 'Task_PresentApplicationsToRKR',
                form: [
                    { name: 'reviewer_opinion', label: 'Reviewer Opinion', type: 'textarea' }
                ]
            },
            'Task_PresentApplicationsToRKR': {
                name: 'Present reviewed applications to Rector',
                role: 'PD',
                next: 'Task_MakeDecision',
                form: [
                    { name: 'pd_forward_rector', label: 'Forwarded to Rector', type: 'checkbox' }
                ]
            },
            'Task_MakeDecision': {
                name: 'Make decision',
                role: 'Rector',
                next: 'Gateway_RKRDecision',
                form: [
                    { name: 'rkr_decision', label: 'Rector Decision', type: 'select', options: ['Accepted', 'Rejected'] }
                ]
            },
            'Gateway_RKRDecision': {
                type: 'gateway',
                handler: (data) => {
                    return data.rkr_decision === 'Accepted' ? 'Task_ForwardApplicationsToMPD' : 'EndEvent_Rejected';
                }
            },
            'Task_ForwardApplicationsToMPD': {
                name: 'Forward accepted applications to MPD',
                role: 'PD',
                next: 'Task_HandleApplicationsExternal',
                form: [
                    { name: 'pd_forward_mpd', label: 'Forwarded to MPD', type: 'checkbox' }
                ]
            },
            'Task_HandleApplicationsExternal': {
                name: 'Handle applications (external transfer)',
                role: 'MPD',
                next: 'Task_ReceiveDecision',
                form: [
                    { name: 'mpd_handle_external', label: 'Sent to External Body', type: 'checkbox' }
                ]
            },
            'Task_ReceiveDecision': {
                name: 'Receive decision on award',
                role: 'PD',
                next: 'Task_EnterToRegister',
                form: [
                    { name: 'award_received', label: 'Award Decision Received', type: 'checkbox' }
                ]
            },
            'Task_EnterToRegister': {
                name: 'Enter decoration into register',
                role: 'PD',
                next: 'EndEvent_Completed',
                form: [
                    { name: 'award_grant_date', label: 'Award Grant Date', type: 'date' }
                ],
                onComplete: (data) => { data.process_outcome = 'Completed'; }
            },
            'EndEvent_Rejected': {
                type: 'end',
                name: 'Application Rejected',
                onComplete: (data) => { data.process_outcome = 'Rejected'; }
            },
            'EndEvent_Completed': {
                type: 'end',
                name: 'Process Ended'
            }
        }
    },
    'EmploymentConditions': {
        name: 'Change of Employment Conditions',
        start: 'StartEvent_ApplicationSubmitted',
        nodes: {
            'StartEvent_ApplicationSubmitted': {
                name: 'Submit Application',
                role: 'HeadOU', // Initiator
                next: 'Task_ReviewAndForward_HeadOU',
                // Note: In BPMN StartEvent goes to Review. We simulate start by creating. 
                // But wait, the scenario says "Start Process... Complete necessary data... Confirm form".
                // So we need a Start Node form effectively.
                form: [
                    { name: 'employee_name', label: 'Employee Name', type: 'text' },
                    { name: 'proposed_conditions', label: 'Proposed Conditions', type: 'textarea' },
                    { name: 'change_justification', label: 'Justification', type: 'textarea' },
                    { name: 'change_effective_date', label: 'Effective Date', type: 'date' }
                ]
            },
            'Task_ReviewAndForward_HeadOU': {
                name: 'Review and forward application to PD',
                role: 'HeadOU',
                next: 'Task_ReviewApplication_PD',
                form: [
                    { name: 'head_of_ou_review_status', label: 'Head OU Decision', type: 'select', options: ['Approved', 'Rejected'] }
                ]
            },
            'Task_ReviewApplication_PD': {
                name: 'Review application (PD)',
                role: 'PD',
                next: 'Task_Review_KWE',
                form: [
                    { name: 'pd_review_status', label: 'PD Review Status', type: 'select', options: ['Confirmed', 'Rejected'] },
                    { name: 'is_academic_teacher', label: 'Is Academic Teacher?', type: 'checkbox', default: true }
                ]
            },
            'Task_Review_KWE': {
                name: 'Review application (Quartermaster)',
                role: 'KWE',
                next: 'Gateway_IsAcademicTeacher',
                form: [
                    { name: 'kwe_financial_opinion', label: 'Financial Opinion', type: 'select', options: ['Funds Available', 'No Funds'] }
                ]
            },
            'Gateway_IsAcademicTeacher': {
                type: 'gateway',
                handler: (data) => {
                    return data.is_academic_teacher ? 'Task_Review_PRK' : 'Task_MakeDecision_Chancellor';
                }
            },
            'Task_MakeDecision_Chancellor': {
                name: 'Make decision (KAN)',
                role: 'Chancellor',
                next: 'Gateway_JoinDecision',
                form: [
                    { name: 'final_decision', label: 'Final Decision', type: 'select', options: ['Approved', 'Rejected'] }
                ],
                onComplete: (data) => { data.final_decision_maker = 'Chancellor'; }
            },
            'Task_Review_PRK': {
                name: 'Review application (PRK)',
                role: 'PRK',
                next: 'Task_Review_PRN',
                form: [
                    { name: 'prk_opinion', label: 'PRK Opinion', type: 'select', options: ['Approved', 'Rejected'] }
                ]
            },
            'Task_Review_PRN': {
                name: 'Review application (PRN)',
                role: 'PRN',
                next: 'Task_MakeDecision_RKR',
                form: [
                    { name: 'prn_opinion', label: 'PRN Opinion', type: 'select', options: ['Approved', 'Rejected'] }
                ]
            },
            'Task_MakeDecision_RKR': {
                name: 'Make decision (RKR)',
                role: 'Rector',
                next: 'Gateway_JoinDecision',
                form: [
                    { name: 'final_decision', label: 'Final Decision', type: 'select', options: ['Approved', 'Rejected'] }
                ],
                onComplete: (data) => { data.final_decision_maker = 'Rector'; }
            },
            'Gateway_JoinDecision': {
                type: 'gateway',
                handler: () => 'Task_ImplementAndPrepare'
            },
            'Task_ImplementAndPrepare': {
                name: 'Implement, Prepare, and Inform',
                role: 'PD',
                next: 'Task_HandOverAndArchive',
                form: [
                    { name: 'inform_head_ou', label: 'Inform Head of O.U.', type: 'checkbox' },
                    { name: 'implement_hr', label: 'Implement in HR System', type: 'checkbox' },
                    { name: 'prepare_docs', label: 'Prepare Confirming Documents', type: 'checkbox' }
                ]
            },
            'Task_HandOverAndArchive': {
                name: 'Hand Over Documents and Archive',
                role: 'PD',
                next: 'EndEvent_ProcessEnded',
                form: [
                    { name: 'hand_over_docs', label: 'Hand over to employee', type: 'checkbox' },
                    { name: 'archive_copy', label: 'Archive copy in personnel files', type: 'checkbox' }
                ]
            },
            'EndEvent_ProcessEnded': {
                type: 'end',
                name: 'Service process ended',
                onComplete: (data) => { data.status = 'Completed'; }
            }
        }
    }
};

// --- State Management ---

class AppState {
    constructor() {
        this.currentUser = USERS[0];
        this.requests = JSON.parse(localStorage.getItem('leaveRequests')) || [];
        this.renderUsers();
        this.render();
    }

    save() {
        localStorage.setItem('leaveRequests', JSON.stringify(this.requests));
        this.render();
    }

    setCurrentUser(userId) {
        this.currentUser = USERS.find(u => u.id === userId);
        this.render();
    }

    createRequest(processType) {
        const definition = PROCESS_DEFS[processType];

        // Role check
        let initiatorRoleRequired = 'Employee';
        if (processType === 'Decorations') initiatorRoleRequired = 'HeadOU';
        if (processType === 'EmploymentConditions') initiatorRoleRequired = 'HeadOU';

        if (this.currentUser.role !== initiatorRoleRequired) {
            alert(`Only ${initiatorRoleRequired} can start a ${definition.name}.`);
            return;
        }

        const newRequest = {
            id: Date.now().toString(),
            processType: processType,
            initiator: this.currentUser.name,
            currentNode: definition.start,
            status: 'Active',
            data: {
                request_date: new Date().toISOString().split('T')[0]
            },
            history: []
        };

        // Pre-fill specific data
        if (processType === 'LeaveRequest') {
            newRequest.data.employee_name = this.currentUser.name;
            newRequest.data.is_academic_teacher = this.currentUser.isAcademic;
            newRequest.data.employee_leave_entitlement_balance = 26;
        }

        this.requests.push(newRequest);
        this.save();
        this.selectRequest(newRequest.id);
    }

    processStep(requestId, formData) {
        const request = this.requests.find(r => r.id === requestId);
        if (!request) return;

        const procType = request.processType || 'LeaveRequest';
        const procDef = PROCESS_DEFS[procType];
        const currentNodeDef = procDef.nodes[request.currentNode];

        // Update data
        request.data = { ...request.data, ...formData };

        // Add history
        request.history.push({
            node: currentNodeDef.name,
            actor: this.currentUser.name,
            date: new Date().toLocaleString(),
            action: 'Completed'
        });

        // Execute onComplete if exists
        if (currentNodeDef.onComplete) {
            currentNodeDef.onComplete(request.data);
        }

        // Move to next
        let nextNodeId = currentNodeDef.next;

        // Handle Gateways
        while (procDef.nodes[nextNodeId] && procDef.nodes[nextNodeId].type === 'gateway') {
            const gateway = procDef.nodes[nextNodeId];
            nextNodeId = gateway.handler(request.data);
        }

        request.currentNode = nextNodeId;

        // Check if End
        if (procDef.nodes[nextNodeId] && procDef.nodes[nextNodeId].type === 'end') {
            request.status = 'Completed';
            request.history.push({
                node: procDef.nodes[nextNodeId].name,
                actor: 'System',
                date: new Date().toLocaleString(),
                action: 'Finished'
            });
            if (procDef.nodes[nextNodeId].onComplete) {
                procDef.nodes[nextNodeId].onComplete(request.data);
            }
        }

        this.save();

        document.getElementById('formContainer').classList.add('hidden');
        document.getElementById('welcomeMessage').classList.remove('hidden');
    }

    // --- Rendering ---

    renderUsers() {
        const select = document.getElementById('currentUser');
        select.innerHTML = USERS.map(u => `<option value="${u.id}">${u.name} (${u.role})</option>`).join('');
        select.addEventListener('change', (e) => this.setCurrentUser(e.target.value));
        select.value = this.currentUser.id;
    }

    render() {
        this.renderTaskList();
        this.renderRequestList();
        this.updateUIState();
    }

    renderTaskList() {
        const list = document.getElementById('taskList');
        const tasks = this.requests.filter(r => r.status === 'Active' && this.canUserPerformTask(r));

        document.getElementById('taskCount').textContent = tasks.length;

        list.innerHTML = tasks.map(r => {
            const procType = r.processType || 'LeaveRequest';
            const procDef = PROCESS_DEFS[procType];
            const nodeName = procDef.nodes[r.currentNode].name;
            const context = r.data.employee_name || 'Unknown';

            return `
            <li class="list-item" onclick="app.selectRequest('${r.id}')">
                <h4>${nodeName}</h4>
                <p>Process: ${procDef.name}</p>
                <p>For: ${context}</p>
                <p>ID: ${r.id}</p>
            </li>
        `}).join('');
    }

    renderRequestList() {
        const list = document.getElementById('requestList');
        list.innerHTML = this.requests.map(r => {
            const procType = r.processType || 'LeaveRequest';
            const procDef = PROCESS_DEFS[procType];
            const nodeName = procDef.nodes[r.currentNode] ? procDef.nodes[r.currentNode].name : 'End';

            return `
            <li class="list-item" onclick="app.selectRequest('${r.id}')">
                <h4>${r.initiator}</h4>
                <p>${procDef.name}</p>
                <p>Status: ${r.status}</p>
                <p>Current: ${nodeName}</p>
            </li>
        `}).join('');
    }

    canUserPerformTask(request) {
        if (request.status !== 'Active') return false;

        const procType = request.processType || 'LeaveRequest';
        const procDef = PROCESS_DEFS[procType];
        const node = procDef.nodes[request.currentNode];

        if (!node) return false;

        // For Start Nodes that are treated as tasks (simulated)
        if (request.currentNode === procDef.start) {
            return this.currentUser.name === request.initiator;
        }

        return node.role === this.currentUser.role;
    }

    selectRequest(requestId) {
        const request = this.requests.find(r => r.id === requestId);
        if (!request) return;

        const container = document.getElementById('formContainer');
        const welcome = document.getElementById('welcomeMessage');

        welcome.classList.add('hidden');
        container.classList.remove('hidden');

        const procType = request.processType || 'LeaveRequest';
        const procDef = PROCESS_DEFS[procType];
        const node = procDef.nodes[request.currentNode];

        const isTaskOwner = this.canUserPerformTask(request);

        document.getElementById('formTitle').textContent = request.status === 'Active' ? node.name : request.status;
        document.getElementById('formDescription').textContent = request.status === 'Active' ? `Assigned to: ${node.role}` : `Outcome: ${request.data.process_outcome || request.status}`;

        // Render Read-Only Data
        const dataGrid = document.getElementById('readOnlyData');
        dataGrid.innerHTML = Object.entries(request.data).map(([key, value]) => `
            <div class="data-item">
                <span class="data-label">${key.replace(/_/g, ' ')}</span>
                <span class="data-value">${value}</span>
            </div>
        `).join('');

        // Render Form
        const formFields = document.getElementById('formFields');
        formFields.innerHTML = '';
        const submitBtn = document.querySelector('#taskForm button');

        if (request.status === 'Active' && isTaskOwner && node.form) {
            submitBtn.style.display = 'block';
            node.form.forEach(field => {
                const div = document.createElement('div');
                div.className = 'form-group';

                const label = document.createElement('label');
                label.textContent = field.label;
                div.appendChild(label);

                let input;
                if (field.type === 'select') {
                    input = document.createElement('select');
                    field.options.forEach(opt => {
                        const option = document.createElement('option');
                        option.value = opt;
                        option.textContent = opt;
                        input.appendChild(option);
                    });
                } else if (field.type === 'textarea') {
                    input = document.createElement('textarea');
                } else if (field.type === 'checkbox') {
                    input = document.createElement('input');
                    input.type = 'checkbox';
                } else {
                    input = document.createElement('input');
                    input.type = field.type;
                }

                input.name = field.name;

                // Set initial value
                if (field.type === 'checkbox') {
                    if (request.data[field.name]) {
                        input.checked = true;
                    } else if (field.default === true) { // Explicit default
                        input.checked = true;
                    }
                } else {
                    if (request.data[field.name]) {
                        input.value = request.data[field.name];
                    } else if (field.default) {
                        input.value = field.default;
                    }
                }

                if (field.readonly) {
                    input.disabled = true;
                }

                div.appendChild(input);
                formFields.appendChild(div);
            });

            // Auto-calculate duration (Only for Leave Request)
            if (procType === 'LeaveRequest') {
                const startInput = formFields.querySelector('[name="leave_start_date"]');
                const endInput = formFields.querySelector('[name="leave_end_date"]');
                const durationInput = formFields.querySelector('[name="leave_duration_days"]');

                if (startInput && endInput && durationInput) {
                    const calculateDuration = () => {
                        if (startInput.value && endInput.value) {
                            const start = new Date(startInput.value);
                            const end = new Date(endInput.value);
                            const diffTime = Math.abs(end - start);
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                            durationInput.value = diffDays > 0 ? diffDays : 0;
                        }
                    };
                    startInput.addEventListener('change', calculateDuration);
                    endInput.addEventListener('change', calculateDuration);
                }
            }

            // Handle Submit
            const form = document.getElementById('taskForm');
            form.onsubmit = (e) => {
                e.preventDefault();
                const formData = {};
                new FormData(form).forEach((value, key) => formData[key] = value);

                // Handle checkboxes manually
                node.form.forEach(f => {
                    if (f.type === 'checkbox') {
                        formData[f.name] = form.querySelector(`[name="${f.name}"]`).checked;
                    }
                });

                this.processStep(requestId, formData);
            };

        } else {
            formFields.innerHTML = '<p>You cannot perform this task or the process is finished.</p>';
            submitBtn.style.display = 'none';
        }
    }

    updateUIState() {
        const btn = document.getElementById('btnNewRequest');

        let canStartSomething = false;
        if (this.currentUser.role === 'Employee') canStartSomething = true;
        if (this.currentUser.role === 'HeadOU') canStartSomething = true;

        if (canStartSomething) {
            btn.style.display = 'block';

            // Remove old listeners to avoid stacking (Clone node trick)
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            if (this.currentUser.role === 'Employee') {
                newBtn.textContent = 'New Leave Request';
                newBtn.onclick = () => this.createRequest('LeaveRequest');
            } else if (this.currentUser.role === 'HeadOU') {
                newBtn.textContent = 'New Process...';
                newBtn.onclick = () => {
                    document.getElementById('processModal').classList.remove('hidden');
                };
            }
        } else {
            btn.style.display = 'none';
        }
    }

    selectProcess(type) {
        this.createRequest(type);
        this.closeModal();
    }

    closeModal() {
        document.getElementById('processModal').classList.add('hidden');
    }
}

const app = new AppState();
