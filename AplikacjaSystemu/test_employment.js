/**
 * Test Scenario: Change of Employment Conditions
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
    { id: 'quentin', name: 'Quentin Quartermaster', role: 'KWE' },
    { id: 'adam', name: 'Adam Rector', role: 'Rector' },
    { id: 'carl', name: 'Carl Chancellor', role: 'Chancellor' },
    { id: 'paula', name: 'Paula VREdu', role: 'PRK' },
    { id: 'peter', name: 'Peter VRSci', role: 'PRN' },
    { id: 'mike', name: 'Mike MPD', role: 'MPD' }
];

const PROCESS_DEFS = {
    'EmploymentConditions': {
        name: 'Change of Employment Conditions',
        start: 'StartEvent_ApplicationSubmitted',
        nodes: {
            'StartEvent_ApplicationSubmitted': {
                name: 'Submit Application',
                role: 'HeadOU', // Initiator
                next: 'Task_ReviewAndForward_HeadOU',
            },
            'Task_ReviewAndForward_HeadOU': {
                name: 'Review and forward application to PD',
                role: 'HeadOU',
                next: 'Task_ReviewApplication_PD',
            },
            'Task_ReviewApplication_PD': {
                name: 'Review application (PD)',
                role: 'PD',
                next: 'Task_Review_KWE',
            },
            'Task_Review_KWE': {
                name: 'Review application (Quartermaster)',
                role: 'KWE',
                next: 'Gateway_IsAcademicTeacher',
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
            },
            'Task_Review_PRK': {
                name: 'Review application (PRK)',
                role: 'PRK',
                next: 'Task_Review_PRN',
            },
            'Task_Review_PRN': {
                name: 'Review application (PRN)',
                role: 'PRN',
                next: 'Task_MakeDecision_RKR',
            },
            'Task_MakeDecision_RKR': {
                name: 'Make decision (RKR)',
                role: 'Rector',
                next: 'Gateway_JoinDecision',
            },
            'Gateway_JoinDecision': {
                type: 'gateway',
                handler: () => 'Task_ImplementAndPrepare'
            },
            'Task_ImplementAndPrepare': {
                name: 'Implement, Prepare, and Inform',
                role: 'PD',
                next: 'Task_HandOverAndArchive',
            },
            'Task_HandOverAndArchive': {
                name: 'Hand Over Documents and Archive',
                role: 'PD',
                next: 'EndEvent_ProcessEnded',
            },
            'EndEvent_ProcessEnded': {
                type: 'end',
                name: 'Service process ended',
                onComplete: (data) => { data.status = 'Completed'; }
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

        // Simplified role check for test

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
            if (procDef.nodes[nextNodeId].onComplete) {
                procDef.nodes[nextNodeId].onComplete(request.data);
            }
            console.log(`[INFO] Process Completed! Outcome: ${request.data.status || 'Finished'}`);
        } else {
            console.log(`[INFO] Next Task: ${procDef.nodes[nextNodeId].name} (Assigned to: ${procDef.nodes[nextNodeId].role})`);
        }
    }
}

// --- Run Test Scenario ---

const app = new AppState();
const holly = USERS.find(u => u.id === 'holly'); // HeadOU
const penny = USERS.find(u => u.id === 'penny'); // PD
const quentin = USERS.find(u => u.id === 'quentin'); // KWE
const paula = USERS.find(u => u.id === 'paula'); // PRK
const peter = USERS.find(u => u.id === 'peter');   // PRN
const adam = USERS.find(u => u.id === 'adam');   // Rector

console.log("--- Starting Employment Conditions Test Scenario ---");

// Step 1: Start Process
app.currentUser = holly;
const reqId = app.createRequest('EmploymentConditions');
app.processStep(reqId, holly, {
    employee_name: 'Alice Academic',
    proposed_conditions: 'Senior Lecturer, 8000 PLN',
    change_justification: 'Promotion',
    change_effective_date: '2025-03-01'
});

// Step 2: Head OU Approval (in system step)
app.processStep(reqId, holly, { head_of_ou_review_status: 'Approved' });

// Step 3: PD Review
app.processStep(reqId, penny, {
    pd_review_status: 'Confirmed',
    is_academic_teacher: true
});

// Step 4: KWE Review
app.processStep(reqId, quentin, { kwe_financial_opinion: 'Funds Available' });

// Step 5: PRK Review
app.processStep(reqId, paula, { prk_opinion: 'Approved' });

// Step 6: PRN Review
app.processStep(reqId, peter, { prn_opinion: 'Approved' });

// Step 7: Rector Decision
app.processStep(reqId, adam, { final_decision: 'Approved' });

// Step 8: Implement
app.processStep(reqId, penny, {
    inform_head_ou: true,
    implement_hr: true,
    prepare_docs: true
});

// Step 9: Archive
app.processStep(reqId, penny, {
    hand_over_docs: true,
    archive_copy: true
});

// Verification
const finalReq = app.requests.find(r => r.id === reqId);
if (finalReq.status === 'Completed') {
    console.log("TEST PASSED");
} else {
    console.log("TEST FAILED");
}
