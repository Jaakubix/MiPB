/**
 * Test Scenario Execution: Academic Teacher Leave Request - Approved
 * Based on "Leave Request Test Scenario.docx"
 */

// Mock LocalStorage
const localStorage = {
    _data: {},
    getItem(key) { return this._data[key] || null; },
    setItem(key, val) { this._data[key] = val; }
};

// --- Configuration (Copied from app.js with latest updates) ---

const USERS = [
    { id: 'alice', name: 'Alice Academic', role: 'Employee', isAcademic: true },
    { id: 'nancy', name: 'Nancy NonAcademic', role: 'Employee', isAcademic: false },
    { id: 'holly', name: 'Holly Head', role: 'HeadOU' },
    { id: 'penny', name: 'Penny Personnel', role: 'PD' },
    { id: 'adam', name: 'Adam Rector', role: 'Rector' },
    { id: 'carl', name: 'Carl Chancellor', role: 'Chancellor' },
    { id: 'paula', name: 'Paula VREdu', role: 'PRK' },
    { id: 'peter', name: 'Peter VRSci', role: 'PRN' }
];

const PROCESS_DEF = {
    start: 'StartEvent_ApplicationSubmitted',
    nodes: {
        'StartEvent_ApplicationSubmitted': {
            name: 'Submit Leave Request',
            role: 'Employee',
            next: 'Task_ReviewAndForward_HeadOU',
        },
        'Task_ReviewAndForward_HeadOU': {
            name: 'Review and approve leave request',
            role: 'HeadOU',
            next: 'Task_ReviewApplication_PD',
        },
        'Task_ReviewApplication_PD': {
            name: 'Review leave request (check entitlement)',
            role: 'PD',
            next: 'Gateway_IsAcademicTeacher',
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
            onComplete: (data) => { data.final_decision_maker = 'Rector'; }
        },
        'Task_MakeDecision_Chancellor': {
            name: 'Make decision (KAN)',
            role: 'Chancellor',
            next: 'Gateway_JoinDecision',
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
        },
        'Task_ImplementChanges': {
            name: 'Register leave in HR system',
            role: 'PD',
            next: 'EndEvent_ProcessEnded',
        },
        'EndEvent_ProcessEnded': {
            type: 'end',
            name: 'Process Ended'
        }
    }
};

class AppState {
    constructor() {
        this.currentUser = USERS[0];
        this.requests = [];
    }

    createRequest(user) {
        this.currentUser = user;
        const newRequest = {
            id: Date.now().toString(),
            initiator: this.currentUser.name,
            currentNode: PROCESS_DEF.start,
            status: 'Active',
            data: {
                employee_name: this.currentUser.name,
                // Note: In the real app, this comes from the user object, but PD can override it.
                // We initialize it here as per the app logic.
                is_academic_teacher: this.currentUser.isAcademic,
                employee_leave_entitlement_balance: 26,
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

        // Validation
        const node = PROCESS_DEF.nodes[request.currentNode];
        if (node.role !== user.role && !(request.currentNode === 'StartEvent_ApplicationSubmitted' && user.name === request.initiator)) {
            console.log(`[ERROR] User ${user.name} (${user.role}) cannot perform task ${node.name} (Required: ${node.role})`);
            return;
        }

        console.log(`[ACTION] ${user.name} completing ${node.name}...`);
        if (formData) {
            console.log(`   Data: ${JSON.stringify(formData)}`);
        }

        // Update data
        request.data = { ...request.data, ...formData };

        // Execute onComplete if exists
        if (node.onComplete) {
            node.onComplete(request.data);
        }

        // Move to next
        let nextNodeId = node.next;

        while (PROCESS_DEF.nodes[nextNodeId] && PROCESS_DEF.nodes[nextNodeId].type === 'gateway') {
            const gateway = PROCESS_DEF.nodes[nextNodeId];
            nextNodeId = gateway.handler(request.data);
        }

        request.currentNode = nextNodeId;

        // Check if End
        if (PROCESS_DEF.nodes[nextNodeId] && PROCESS_DEF.nodes[nextNodeId].type === 'end') {
            request.status = 'Completed';
            console.log(`[INFO] Process Completed!`);
        } else {
            console.log(`[INFO] Next Task: ${PROCESS_DEF.nodes[nextNodeId].name} (Assigned to: ${PROCESS_DEF.nodes[nextNodeId].role})`);
        }
    }
}

// --- Run Test Scenario ---

const app = new AppState();
const alice = USERS.find(u => u.id === 'alice');
const holly = USERS.find(u => u.id === 'holly');
const penny = USERS.find(u => u.id === 'penny');
const paula = USERS.find(u => u.id === 'paula');
const peter = USERS.find(u => u.id === 'peter');
const adam = USERS.find(u => u.id === 'adam');

console.log("--- Starting Test Scenario: Academic Teacher Leave Request - Approved ---");

// Step 1: Start Process (Initiator)
console.log("\nStep 1: Start Process (Alice Academic)");
const reqId = app.createRequest(alice);
app.processStep(reqId, alice, {
    employee_position: 'Professor',
    leave_type: 'Recreational',
    leave_start_date: '2025-02-01',
    leave_end_date: '2025-02-05',
    leave_duration_days: 5
});

// Step 2: Head of O.U. Approval (Holly Head)
console.log("\nStep 2: Head of O.U. Approval (Holly Head)");
app.processStep(reqId, holly, { head_ou_decision: 'Approved' });

// Step 3: Personnel Department Review (Penny Personnel)
console.log("\nStep 3: Personnel Department Review (Penny Personnel)");
// Note: Setting is_academic_teacher to TRUE as per scenario
app.processStep(reqId, penny, {
    pd_review_status: 'Entitlement Confirmed',
    is_academic_teacher: true
});

// Step 4: VRE (PRK) Approval (Paula VREdu)
console.log("\nStep 4: VRE (PRK) Approval (Paula VREdu)");
app.processStep(reqId, paula, { prk_review_status: 'Approved' });

// Step 5: VRSA (PRN) Approval (Peter VRSci)
console.log("\nStep 5: VRSA (PRN) Approval (Peter VRSci)");
app.processStep(reqId, peter, { prn_review_status: 'Approved' });

// Step 6: Rector (RKR) Final Approval (Adam Rector)
console.log("\nStep 6: Rector (RKR) Final Approval (Adam Rector)");
app.processStep(reqId, adam, { final_decision: 'Approved' });

// Step 7: Personnel Department Notification (Penny Personnel)
console.log("\nStep 7: Personnel Department Notification (Penny Personnel)");
app.processStep(reqId, penny, { inform_confirmation: true });

// Step 8: Personnel Department Finalize (Penny Personnel)
console.log("\nStep 8: Personnel Department Finalize (Penny Personnel)");
app.processStep(reqId, penny, { register_confirmation: true });

// Step 9: Final Verification
console.log("\nStep 9: Final Verification");
const finalReq = app.requests.find(r => r.id === reqId);
console.log("Final Status:", finalReq.status);
console.log("Head O.U. Decision:", finalReq.data.head_ou_decision);
console.log("PRK Review Status:", finalReq.data.prk_review_status);
console.log("PRN Review Status:", finalReq.data.prn_review_status);
console.log("Final Decision:", finalReq.data.final_decision);
console.log("Is Academic Teacher:", finalReq.data.is_academic_teacher);

if (
    finalReq.status === 'Completed' &&
    finalReq.data.head_ou_decision === 'Approved' &&
    finalReq.data.prk_review_status === 'Approved' &&
    finalReq.data.prn_review_status === 'Approved' &&
    finalReq.data.final_decision === 'Approved' &&
    finalReq.data.is_academic_teacher === true
) {
    console.log("TEST SCENARIO PASSED");
} else {
    console.log("TEST SCENARIO FAILED");
}
