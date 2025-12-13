/**
 * Test Scenario: Decorations and Medals
 */

// Mock LocalStorage
const localStorage = {
    _data: {},
    getItem(key) { return this._data[key] || null; },
    setItem(key, val) { this._data[key] = val; }
};

// --- Configuration ---

const USERS = [
    { id: 'alice', name: 'Alice Academic', role: 'Employee', isAcademic: true },
    { id: 'nancy', name: 'Nancy NonAcademic', role: 'Employee', isAcademic: false },
    { id: 'holly', name: 'Holly Head', role: 'HeadOU' },
    { id: 'penny', name: 'Penny Personnel', role: 'PD' },
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
                onComplete: (data) => console.log('Leave Request Started')
            },
            // ... (Truncated for brevity, focusing on Decorations)
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
            },
            'Task_PresentApplicationsForAcceptance': {
                name: 'Present applications for acceptance',
                role: 'PD',
                next: 'Task_ReviewApplications',
            },
            'Task_ReviewApplications': {
                name: 'Review applications and forward to PD',
                role: 'PRK',
                next: 'Task_PresentApplicationsToRKR',
            },
            'Task_PresentApplicationsToRKR': {
                name: 'Present reviewed applications to Rector',
                role: 'PD',
                next: 'Task_MakeDecision',
            },
            'Task_MakeDecision': {
                name: 'Make decision',
                role: 'Rector',
                next: 'Gateway_RKRDecision',
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
            },
            'Task_HandleApplicationsExternal': {
                name: 'Handle applications (external transfer)',
                role: 'MPD',
                next: 'Task_ReceiveDecision',
            },
            'Task_ReceiveDecision': {
                name: 'Receive decision on award',
                role: 'PD',
                next: 'Task_EnterToRegister',
            },
            'Task_EnterToRegister': {
                name: 'Enter decoration into register',
                role: 'PD',
                next: 'EndEvent_Completed',
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
    }
};

class AppState {
    constructor() {
        this.currentUser = USERS[0];
        this.requests = [];
    }

    createRequest(processType) {
        const definition = PROCESS_DEFS[processType];

        let initiatorRoleRequired = 'Employee';
        if (processType === 'Decorations') {
            initiatorRoleRequired = 'HeadOU';
        }

        if (this.currentUser.role !== initiatorRoleRequired) {
            console.log(`[ERROR] User ${this.currentUser.name} cannot start ${processType}`);
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
        this.requests.push(newRequest);
        return newRequest.id;
    }

    processStep(requestId, user, formData) {
        this.currentUser = user;
        const request = this.requests.find(r => r.id === requestId);

        const procType = request.processType;
        const procDef = PROCESS_DEFS[procType];
        const node = procDef.nodes[request.currentNode];

        // Validation
        if (node.role !== user.role && !(request.currentNode === procDef.start && user.name === request.initiator)) {
            console.log(`[ERROR] User ${user.name} (${user.role}) cannot perform task ${node.name} (Required: ${node.role})`);
            return;
        }

        console.log(`[ACTION] ${user.name} completing ${node.name}...`);

        // Update data
        request.data = { ...request.data, ...formData };

        // Execute onComplete if exists
        if (node.onComplete) {
            node.onComplete(request.data);
        }

        // Move to next
        let nextNodeId = node.next;

        while (procDef.nodes[nextNodeId] && procDef.nodes[nextNodeId].type === 'gateway') {
            const gateway = procDef.nodes[nextNodeId];
            nextNodeId = gateway.handler(request.data);
        }

        request.currentNode = nextNodeId;

        // Check if End
        if (procDef.nodes[nextNodeId] && procDef.nodes[nextNodeId].type === 'end') {
            request.status = 'Completed';
            console.log(`[INFO] Process Completed! Outcome: ${request.data.process_outcome || 'Finished'}`);
        } else {
            console.log(`[INFO] Next Task: ${procDef.nodes[nextNodeId].name} (Assigned to: ${procDef.nodes[nextNodeId].role})`);
        }
    }
}

// --- Run Test Scenario ---

const app = new AppState();
const holly = USERS.find(u => u.id === 'holly'); // HeadOU
const penny = USERS.find(u => u.id === 'penny'); // PD
const paula = USERS.find(u => u.id === 'paula'); // PRK
const adam = USERS.find(u => u.id === 'adam');   // Rector
const mike = USERS.find(u => u.id === 'mike');   // MPD

console.log("--- Starting Decorations Test Scenario ---");

// Step 1: Start Process (Head of O.U.)
app.currentUser = holly;
const reqId = app.createRequest('Decorations');
app.processStep(reqId, holly, {
    employee_name: 'Peter VRSci',
    organizational_unit: 'Office of VP',
    decoration_type: 'Gold Medal',
    application_justification: '30 years service'
});

// Step 2: PD Initial Review
app.processStep(reqId, penny, { pd_verification: true });

// Step 3: PRK Review
app.processStep(reqId, paula, { reviewer_opinion: 'Strongly support' });

// Step 4: PD Forward to Rector
app.processStep(reqId, penny, { pd_forward_rector: true });

// Step 5: Rector Decision
app.processStep(reqId, adam, { rkr_decision: 'Accepted' });

// Step 6: PD Forward to MPD
app.processStep(reqId, penny, { pd_forward_mpd: true });

// Step 7: MPD Handle
app.processStep(reqId, mike, { mpd_handle_external: true });

// Step 8: PD Receive Decision
app.processStep(reqId, penny, { award_received: true });

// Step 9: PD Enter to Register
app.processStep(reqId, penny, { award_grant_date: '2025-06-01' });

// Verification
const finalReq = app.requests.find(r => r.id === reqId);
if (finalReq.status === 'Completed' && finalReq.data.process_outcome === 'Completed') {
    console.log("TEST PASSED");
} else {
    console.log("TEST FAILED");
}
