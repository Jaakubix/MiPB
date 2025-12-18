// --- Configuration ---
const API_URL = 'http://localhost:3000/api';
const AUTH_URL = 'http://localhost:3000/auth';

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
                    { name: 'employee_position', label: 'Position', type: 'text', readonly: true },
                    { name: 'leave_type', label: 'Leave Type', type: 'select', options: ['Recreational', 'Childcare', 'Exceptional'] },
                    { name: 'leave_start_date', label: 'Start Date', type: 'date' },
                    { name: 'leave_end_date', label: 'End Date', type: 'date' },
                    { name: 'leave_duration_days', label: 'Duration (Days)', type: 'number', readonly: true }
                ]
            },
            'Task_ReviewAndForward_HeadOU': { name: 'Review and approve leave request', role: 'HeadOU', next: 'Task_ReviewApplication_PD', form: [{ name: 'head_ou_decision', label: 'Decision', type: 'select', options: ['Approved', 'Rejected'] }] },
            'Task_ReviewApplication_PD': { name: 'Review leave request (check entitlement)', role: 'PD', targetDepartment: 'HR', next: 'Gateway_IsAcademicTeacher', form: [{ name: 'pd_review_status', label: 'Entitlement Check', type: 'select', options: ['Entitlement Confirmed', 'Entitlement Exceeded'] }, { name: 'is_academic_teacher', label: 'Is an Academic Teacher?', type: 'checkbox' }, { name: 'lss_opinion_notes', label: 'LSS Opinion Notes', type: 'textarea' }] },
            'Gateway_IsAcademicTeacher': { type: 'gateway', handler: (data) => data.is_academic_teacher ? 'Task_Review_PRK' : 'Task_MakeDecision_Chancellor' },
            'Task_Review_PRK': { name: 'Review application (PRK)', role: 'PRK', targetDepartment: 'Administration', next: 'Task_Review_PRN', form: [{ name: 'prk_review_status', label: 'Review Status', type: 'select', options: ['Positive', 'Negative'] }] },
            'Task_Review_PRN': { name: 'Review application (PRN)', role: 'PRN', targetDepartment: 'Administration', next: 'Task_MakeDecision_RKR', form: [{ name: 'prn_review_status', label: 'Review Status', type: 'select', options: ['Positive', 'Negative'] }] },
            'Task_MakeDecision_RKR': { name: 'Make decision (RKR)', role: 'Rector', targetDepartment: 'Administration', next: 'Gateway_JoinDecision', form: [{ name: 'final_decision', label: 'Final Decision', type: 'select', options: ['Approved', 'Rejected'] }], onComplete: (data) => { data.final_decision_maker = 'Rector'; } },
            'Task_MakeDecision_Chancellor': { name: 'Make decision (KAN)', role: 'Chancellor', targetDepartment: 'Administration', next: 'Gateway_JoinDecision', form: [{ name: 'final_decision', label: 'Final Decision', type: 'select', options: ['Approved', 'Rejected'] }], onComplete: (data) => { data.final_decision_maker = 'Chancellor'; } },
            'Gateway_JoinDecision': { type: 'gateway', handler: () => 'Task_InformHeadOU' },
            'Task_InformHeadOU': { name: 'Inform Head of O.U.', role: 'PD', targetDepartment: 'HR', next: 'Task_ImplementChanges', form: [{ name: 'inform_confirmation', label: 'I have informed the Head of O.U.', type: 'checkbox' }] },
            'Task_ImplementChanges': { name: 'Register leave in HR system', role: 'PD', targetDepartment: 'HR', next: 'EndEvent_ProcessEnded', form: [{ name: 'register_confirmation', label: 'Leave registered in system', type: 'checkbox' }] },
            'EndEvent_ProcessEnded': { type: 'end', name: 'Process Ended' }
        }
    },
    'Decorations': {
        name: 'Decorations and Medals',
        start: 'Task_SubmitApplication',
        nodes: {
            'Task_SubmitApplication': { name: 'Submit application for distinction', role: 'HeadOU', next: 'Task_PresentApplicationsForAcceptance', form: [{ name: 'employee_name', label: 'Employee Name', type: 'text' }, { name: 'organizational_unit', label: 'Organizational Unit', type: 'text' }, { name: 'decoration_type', label: 'Decoration Type', type: 'text' }, { name: 'application_justification', label: 'Justification', type: 'textarea' }] },
            'Task_PresentApplicationsForAcceptance': { name: 'Present applications for acceptance', role: 'PD', targetDepartment: 'HR', next: 'Task_ReviewApplications', form: [{ name: 'pd_verification', label: 'Application Verified', type: 'checkbox' }] },
            'Task_ReviewApplications': { name: 'Review applications and forward to PD', role: 'PRK', targetDepartment: 'Administration', next: 'Task_PresentApplicationsToRKR', form: [{ name: 'reviewer_opinion', label: 'Reviewer Opinion', type: 'textarea' }] },
            'Task_PresentApplicationsToRKR': { name: 'Present reviewed applications to Rector', role: 'PD', targetDepartment: 'HR', next: 'Task_MakeDecision', form: [{ name: 'pd_forward_rector', label: 'Forwarded to Rector', type: 'checkbox' }] },
            'Task_MakeDecision': { name: 'Make decision', role: 'Rector', targetDepartment: 'Administration', next: 'Gateway_RKRDecision', form: [{ name: 'rkr_decision', label: 'Rector Decision', type: 'select', options: ['Accepted', 'Rejected'] }] },
            'Gateway_RKRDecision': { type: 'gateway', handler: (data) => data.rkr_decision === 'Accepted' ? 'Task_ForwardApplicationsToMPD' : 'EndEvent_Rejected' },
            'Task_ForwardApplicationsToMPD': { name: 'Forward accepted applications to MPD', role: 'PD', targetDepartment: 'HR', next: 'Task_HandleApplicationsExternal', form: [{ name: 'pd_forward_mpd', label: 'Forwarded to MPD', type: 'checkbox' }] },
            'Task_HandleApplicationsExternal': { name: 'Handle applications (external transfer)', role: 'MPD', targetDepartment: 'External', next: 'Task_ReceiveDecision', form: [{ name: 'mpd_handle_external', label: 'Sent to External Body', type: 'checkbox' }] },
            'Task_ReceiveDecision': { name: 'Receive decision on award', role: 'PD', targetDepartment: 'HR', next: 'Task_EnterToRegister', form: [{ name: 'award_received', label: 'Award Decision Received', type: 'checkbox' }] },
            'Task_EnterToRegister': { name: 'Enter decoration into register', role: 'PD', targetDepartment: 'HR', next: 'EndEvent_Completed', form: [{ name: 'award_grant_date', label: 'Award Grant Date', type: 'date' }], onComplete: (data) => { data.process_outcome = 'Completed'; } },
            'EndEvent_Rejected': { type: 'end', name: 'Application Rejected', onComplete: (data) => { data.process_outcome = 'Rejected'; } },
            'EndEvent_Completed': { type: 'end', name: 'Process Ended' }
        }
    },
    'EmploymentConditions': {
        name: 'Change of Employment Conditions',
        start: 'StartEvent_ApplicationSubmitted',
        nodes: {
            'StartEvent_ApplicationSubmitted': { name: 'Submit Application', role: 'HeadOU', next: 'Task_ReviewAndForward_HeadOU', form: [{ name: 'employee_name', label: 'Employee Name', type: 'text' }, { name: 'proposed_conditions', label: 'Proposed Conditions', type: 'textarea' }, { name: 'change_justification', label: 'Justification', type: 'textarea' }, { name: 'change_effective_date', label: 'Effective Date', type: 'date' }] },
            'Task_ReviewAndForward_HeadOU': { name: 'Review and forward application to PD', role: 'HeadOU', next: 'Task_ReviewApplication_PD', form: [{ name: 'head_of_ou_review_status', label: 'Head OU Decision', type: 'select', options: ['Approved', 'Rejected'] }] },
            'Task_ReviewApplication_PD': { name: 'Review application (PD)', role: 'PD', targetDepartment: 'HR', next: 'Task_Review_KWE', form: [{ name: 'pd_review_status', label: 'PD Review Status', type: 'select', options: ['Confirmed', 'Rejected'] }, { name: 'is_academic_teacher', label: 'Is Academic Teacher?', type: 'checkbox', default: true }] },
            'Task_Review_KWE': { name: 'Review application (Quartermaster)', role: 'KWE', targetDepartment: 'Finance', next: 'Gateway_IsAcademicTeacher', form: [{ name: 'kwe_financial_opinion', label: 'Financial Opinion', type: 'select', options: ['Funds Available', 'No Funds'] }] },
            'Gateway_IsAcademicTeacher': { type: 'gateway', handler: (data) => data.is_academic_teacher ? 'Task_Review_PRK' : 'Task_MakeDecision_Chancellor' },
            'Task_MakeDecision_Chancellor': { name: 'Make decision (KAN)', role: 'Chancellor', targetDepartment: 'Administration', next: 'Gateway_JoinDecision', form: [{ name: 'final_decision', label: 'Final Decision', type: 'select', options: ['Approved', 'Rejected'] }], onComplete: (data) => { data.final_decision_maker = 'Chancellor'; } },
            'Task_Review_PRK': { name: 'Review application (PRK)', role: 'PRK', targetDepartment: 'Administration', next: 'Task_Review_PRN', form: [{ name: 'prk_opinion', label: 'PRK Opinion', type: 'select', options: ['Approved', 'Rejected'] }] },
            'Task_Review_PRN': { name: 'Review application (PRN)', role: 'PRN', targetDepartment: 'Administration', next: 'Task_MakeDecision_RKR', form: [{ name: 'prn_opinion', label: 'PRN Opinion', type: 'select', options: ['Approved', 'Rejected'] }] },
            'Task_MakeDecision_RKR': { name: 'Make decision (RKR)', role: 'Rector', targetDepartment: 'Administration', next: 'Gateway_JoinDecision', form: [{ name: 'final_decision', label: 'Final Decision', type: 'select', options: ['Approved', 'Rejected'] }], onComplete: (data) => { data.final_decision_maker = 'Rector'; } },
            'Gateway_JoinDecision': { type: 'gateway', handler: () => 'Task_ImplementAndPrepare' },
            'Task_ImplementAndPrepare': { name: 'Implement, Prepare, and Inform', role: 'PD', targetDepartment: 'HR', next: 'Task_HandOverAndArchive', form: [{ name: 'inform_head_ou', label: 'Inform Head of O.U.', type: 'checkbox' }, { name: 'implement_hr', label: 'Implement in HR System', type: 'checkbox' }, { name: 'prepare_docs', label: 'Prepare Confirming Documents', type: 'checkbox' }] },
            'Task_HandOverAndArchive': { name: 'Hand Over Documents and Archive', role: 'PD', targetDepartment: 'HR', next: 'EndEvent_ProcessEnded', form: [{ name: 'hand_over_docs', label: 'Hand over to employee', type: 'checkbox' }, { name: 'archive_copy', label: 'Archive copy in personnel files', type: 'checkbox' }] },
            'EndEvent_ProcessEnded': { type: 'end', name: 'Service process ended', onComplete: (data) => { data.status = 'Completed'; } }
        }
    }
};

// --- State Management ---

class AppState {
    constructor() {
        this.token = localStorage.getItem('token');
        this.currentUser = JSON.parse(localStorage.getItem('user')) || null;
        this.requests = [];
        this.sortDesc = true; // Default sort: Newest first
        this.init();
    }

    init() {
        if (!this.token) {
            this.showLogin();
        } else {
            this.renderUserHeader();
            if (this.currentUser.role === 'Admin') {
                this.showAdminPanel();
            } else {
                this.loadRequests();
            }
        }

        // Login Handler
        document.getElementById('loginForm').onsubmit = (e) => this.handleLogin(e);
        document.getElementById('btnLogout').onclick = () => this.handleLogout();

        // Admin & User Handlers
        const addUserForm = document.getElementById('addUserForm');
        if (addUserForm) addUserForm.onsubmit = (e) => this.handleAddUser(e);

        const changePassForm = document.getElementById('changePasswordForm');
        if (changePassForm) changePassForm.onsubmit = (e) => this.handleChangePassword(e);

        const btnChangePass = document.getElementById('btnChangePass');
        if (btnChangePass) btnChangePass.onclick = () => document.getElementById('passwordModal').classList.remove('hidden');

        // Auto-fill email
        const addNameInput = document.querySelector('#addUserForm [name="fullName"]');
        const addEmailInput = document.querySelector('#addUserForm [name="username"]');
        if (addNameInput && addEmailInput) {
            addNameInput.addEventListener('input', () => {
                const name = addNameInput.value.trim().toLowerCase();
                const safeName = name.replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '.');
                addEmailInput.value = safeName ? `${safeName}@university.pl` : '';
            });
        }
    }

    showLogin() {
        document.getElementById('loginModal').style.display = 'flex';
    }

    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const res = await fetch(`${AUTH_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (res.ok) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.currentUser));

                document.getElementById('loginModal').style.display = 'none';
                this.renderUserHeader();
                if (this.currentUser.role === 'Admin') {
                    this.showAdminPanel();
                } else {
                    this.loadRequests();
                }
            } else {
                alert('Login failed: ' + data.message);
            }
        } catch (err) {
            alert('Login error: ' + err.message);
        }
    }

    async handleChangePassword(e) {
        e.preventDefault();
        const oldPassword = document.getElementById('oldPass').value;
        const newPassword = document.getElementById('newPass').value;

        try {
            const res = await fetch(`${AUTH_URL}/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}` // Good practice, though backend might expect it in body for this app
                },
                body: JSON.stringify({
                    userId: this.currentUser.id, // Keeping consistent with backend expectation
                    oldPassword,
                    newPassword
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert('Password changed successfully. Please login again.');
                document.getElementById('passwordModal').classList.add('hidden');
                e.target.reset();
                this.handleLogout();
            } else {
                alert('Failed to change password: ' + (data.message || data.error));
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    }

    handleLogout() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    }

    renderUserHeader() {
        if (this.currentUser) {
            document.getElementById('userInfo').textContent = `Welcome, ${this.currentUser.fullName} (${this.currentUser.role})`;
            document.getElementById('btnLogout').style.display = 'inline-block';
            document.getElementById('btnChangePass').style.display = 'inline-block';
            this.updateUIState(); // Refresh buttons/permissions
        }
    }



    async showAdminPanel() {
        document.getElementById('formContainer').classList.add('hidden');
        document.getElementById('welcomeMessage').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        await this.loadUsers();
    }

    async loadUsers() {
        try {
            const res = await fetch(`${AUTH_URL}/users`);
            this.allUsers = await res.json();
            this.renderUserTable(this.allUsers);
        } catch (err) {
            console.error(err);
        }
    }

    filterUsers() {
        const term = document.getElementById('userSearch').value.toLowerCase();
        const filtered = this.allUsers.filter(u =>
            u.fullName.toLowerCase().startsWith(term) ||
            u.username.toLowerCase().startsWith(term)
        );
        this.renderUserTable(filtered);
    }

    renderUserTable(users) {
        const tbody = document.getElementById('userListBody');
        tbody.innerHTML = users.map(u => `
            <tr style="${u.isActive === false ? 'opacity: 0.6; background: #f0f0f0;' : ''}">
                <td>
                    <b>${u.fullName}</b> ${u.isActive === false ? '(Inactive)' : ''}<br>
                    <small>${u.username}</small>
                </td>
                <td style="text-align: right;">
                    <button class="primary-btn" onclick="app.openManageUserModal(${u.id})">Manage</button>
                </td>
            </tr>
        `).join('');
    }

    openManageUserModal(userId) {
        const user = this.allUsers.find(u => u.id === userId);
        if (!user) return;

        document.getElementById('manageUserId').value = user.id;
        document.getElementById('manageUserTitle').textContent = `Manage: ${user.fullName}`;
        document.getElementById('manageUserRole').value = user.role;
        document.getElementById('manageUserPosition').value = user.position || '';
        document.getElementById('manageUserActive').checked = user.isActive !== false; // Default true

        // Setup Reset Button
        const btnReset = document.getElementById('btnResetUserPass');
        btnReset.onclick = () => this.resetUserPassword(user.id);

        const manageForm = document.getElementById('manageUserForm');
        manageForm.onsubmit = (e) => this.handleManageUserSave(e);

        document.getElementById('manageUserModal').classList.remove('hidden');
    }

    async handleManageUserSave(e) {
        e.preventDefault();
        const userId = document.getElementById('manageUserId').value;
        const role = document.getElementById('manageUserRole').value;
        const position = document.getElementById('manageUserPosition').value;
        const isActive = document.getElementById('manageUserActive').checked;

        try {
            const res = await fetch(`${AUTH_URL}/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role, position, isActive })
            });

            if (res.ok) {
                alert('User updated successfully');
                document.getElementById('manageUserModal').classList.add('hidden');
                this.loadUsers();
            } else {
                const data = await res.json();
                alert('Failed to update user: ' + (data.error || data.message));
            }
        } catch (err) {
            console.error(err);
            alert('Error: ' + err.message);
        }
    }

    async resetUserPassword(userId) {
        if (!confirm('Are you sure you want to reset this user\'s password?')) return;
        try {
            const res = await fetch(`${AUTH_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            const data = await res.json();
            alert(data.message);
        } catch (err) { console.error(err); }
    }

    async handleAddUser(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.isAcademic = formData.get('isAcademic') === 'on';

        try {
            const res = await fetch(`${AUTH_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const response = await res.json();
            if (res.ok) {
                alert(`User created! Default password: ${response.defaultPassword}`);
                document.getElementById('addUserModal').classList.add('hidden');
                e.target.reset();
                this.loadUsers(); // Refresh list
            } else {
                alert('Error: ' + response.error);
            }
        } catch (err) { console.error(err); }
    }

    async loadRequests() {
        try {
            const res = await fetch(`${API_URL}/requests`);
            this.requests = await res.json();
            this.render();
        } catch (err) {
            console.error('Failed to load requests:', err);
        }
    }

    async createRequest(processType) {
        const definition = PROCESS_DEFS[processType];

        // START: Permission Check Relaxed
        // Both Employee and HeadOU can start any process
        const allowedRoles = ['Employee', 'HeadOU'];

        if (!allowedRoles.includes(this.currentUser.role)) {
            alert(`Your role (${this.currentUser.role}) cannot start a new process.`);
            return;
        }
        // END: Permission Check Relaxed

        const newRequest = {
            id: Date.now().toString(),
            processType: processType,
            initiator: this.currentUser.username, // Using username
            currentNode: definition.start,
            status: 'Active',
            data: {
                request_date: new Date().toISOString().split('T')[0]
            },
            history: []
        };

        // Pre-fill
        if (processType === 'LeaveRequest') {
            newRequest.data.employee_name = this.currentUser.fullName;
            newRequest.data.employee_position = this.currentUser.position || 'Unknown';
            newRequest.data.is_academic_teacher = this.currentUser.isAcademic;
            newRequest.data.employee_leave_entitlement_balance = 26;
        }

        try {
            const res = await fetch(`${API_URL}/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRequest) // Backend now expects department
            });
            if (res.ok) {
                this.closeModal();
                this.loadRequests();
                this.selectRequest(newRequest.id);
            }
        } catch (err) {
            console.error(err);
        }
    }

    async processStep(requestId, formData) {
        const request = this.requests.find(r => r.id === requestId);
        if (!request) return;

        const procType = request.processType || 'LeaveRequest';
        const procDef = PROCESS_DEFS[procType];
        const currentNodeDef = procDef.nodes[request.currentNode];

        // 1. Update Data
        request.data = { ...request.data, ...formData };

        // 2. Add History on Client (then save)
        request.history.push({
            node: currentNodeDef.name,
            actor: this.currentUser.username,
            date: new Date().toLocaleString(),
            action: 'Completed'
        });

        // 3. Logic: Execute onComplete
        if (currentNodeDef.onComplete) {
            currentNodeDef.onComplete(request.data);
        }

        // 4. Logic: Move next
        let nextNodeId = currentNodeDef.next;
        // Gateways
        while (procDef.nodes[nextNodeId] && procDef.nodes[nextNodeId].type === 'gateway') {
            const gateway = procDef.nodes[nextNodeId];
            nextNodeId = gateway.handler(request.data);
        }

        request.currentNode = nextNodeId;

        // 5. Logic: Check End
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

        // 6. Save to API
        try {
            const res = await fetch(`${API_URL}/requests/${request.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentNode: request.currentNode,
                    status: request.status,
                    data: request.data,
                    currentNode: request.currentNode,
                    status: request.status,
                    data: request.data,
                    history: request.history
                })
            });
            if (res.ok) {
                this.loadRequests(); // Reload to refresh UI properly
                document.getElementById('formContainer').classList.add('hidden');
                document.getElementById('welcomeMessage').classList.remove('hidden');
            }
        } catch (err) {
            console.error(err);
        }
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

        // Filter by Initiator (My Created Requests)
        let myRequests = this.requests.filter(r => r.initiator === this.currentUser.username);

        // Sort
        myRequests.sort((a, b) => {
            const dateA = parseInt(a.id); // ID is timestamp
            const dateB = parseInt(b.id);
            return this.sortDesc ? dateB - dateA : dateA - dateB;
        });

        list.innerHTML = myRequests.map(r => {
            const procType = r.processType || 'LeaveRequest';
            const procDef = PROCESS_DEFS[procType];
            const nodeName = procDef.nodes[r.currentNode] ? procDef.nodes[r.currentNode].name : 'End';
            const dateStr = new Date(parseInt(r.id)).toLocaleDateString();

            return `
            <li class="list-item" onclick="app.selectRequest('${r.id}')">
                <h4>${procDef.name}</h4>
                <p>Status: ${r.status}</p>
                <p>Node: ${nodeName}</p>
                <small>Created: ${dateStr}</small>
            </li>
            `}).join('');
    }

    toggleSort() {
        this.sortDesc = !this.sortDesc;
        this.renderRequestList();
    }

    canUserPerformTask(request) {
        if (request.status !== 'Active') return false;
        const procType = request.processType || 'LeaveRequest';
        const procDef = PROCESS_DEFS[procType];
        const node = procDef.nodes[request.currentNode];
        if (!node) return false;

        if (request.currentNode === procDef.start) {
            return this.currentUser.username === request.initiator;
        }

        if (this.currentUser.role !== node.role) return false;

        return true;
    }

    selectRequest(requestId) {
        const request = this.requests.find(r => r.id === requestId.toString()); // Ensure string comparison
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
                    } else if (field.default === true) {
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

            // Special logic for Leave Request Duration (Client Side)
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

            const form = document.getElementById('taskForm');
            form.onsubmit = (e) => {
                e.preventDefault();
                const formData = {};
                new FormData(form).forEach((value, key) => formData[key] = value);
                node.form.forEach(f => {
                    if (f.type === 'checkbox') {
                        formData[f.name] = form.querySelector(`[name = "${f.name}"]`).checked;
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
        // Admin Section Check
        const adminSection = document.getElementById('adminSection');
        if (adminSection) {
            if (this.currentUser && this.currentUser.role === 'Admin') {
                adminSection.style.display = 'block';
            } else {
                adminSection.style.display = 'none';
            }
        }

        const btn = document.getElementById('btnNewRequest');
        if (!this.currentUser) return;

        let canStartSomething = false;
        if (this.currentUser.role === 'Employee') canStartSomething = true;
        if (this.currentUser.role === 'HeadOU') canStartSomething = true;

        if (canStartSomething) {
            btn.style.display = 'block';
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
