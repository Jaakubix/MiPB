# Academic Management System Walkthrough

This document provides a comprehensive guide to simulating the three core business processes implemented in the **Academic Management System**:
1.  **Leave Request**
2.  **Decorations and Medals**
3.  **Change of Employment Conditions**

## Setup and Running
1.  Open `index.html` (in `AplikacjaSystemu` folder) in a modern web browser.
2.  The application uses `localStorage` to persist data. To reset, clear your browser's local storage or use the console command `localStorage.clear()`.

---

## 1. Leave Request Process
**Goal**: An employee requests leave, which is reviewed by the Head of O.U. and confirmed by the Personnel Department (PD).

**Roles Involved**:
-   **Alice Academic** (Employee)
-   **Holly Head** (Head of O.U.)
-   **Penny Personnel** (PD)

### Step-by-Step Scenario
1.  **Initiate Request (Employee)**
    -   Select **Alice Academic** from the dropdown.
    -   Click the **New Leave Request** button.
    -   Fill in the form (Position, Leave Type, Dates).
    -   Click **Complete Task**.
2.  **Head of O.U. Approval**
    -   Select **Holly Head**.
    -   You will see a task: `Review and approve leave request`. Click it.
    -   Review details and set Decision to **Approved**.
    -   Click **Complete Task**.
3.  **Personnel Department Verification**
    -   Select **Penny Personnel**.
    -   Open task: `Review leave request (check entitlement)`.
    -   Set Entitlement Check to **Entitlement Confirmed**.
    -   (Optional) Check **Is an Academic Teacher?** (Alice is).
    -   Click **Complete Task**.
    *Note: Since Alice is academic, additional approvals might be triggered if configured, but the basic path leads to registration.*
4.  **Completion**
    -   Penny Personnel completes the final registration tasks: `Inform Head of O.U.` and `Register leave in HR system`.
    -   The process ends.

---

## 2. Decorations and Medals Process
**Goal**: The Head of O.U. nominates an employee for a decoration. The application goes through a review chain including the Vice-Rector, Rector, and external MPD processing.

**Roles Involved**:
-   **Holly Head** (Head of O.U.)
-   **Penny Personnel** (PD)
-   **Paula VREdu** (PRK - Vice-Rector Education)
-   **Adam Rector** (Rector)
-   **Mike MPD** (Military Personnel Dept - External)

### Step-by-Step Scenario
1.  **Initiate Application**
    -   Select **Holly Head**.
    -   Click **New Process...** -> Select **Decorations and Medals** (Left Card).
    -   Fill in employee details and justification. Click **Complete Task**.
2.  **PD Verification**
    -   Select **Penny Personnel**.
    -   Task: `Present applications for acceptance`. Check **Application Verified**.
3.  **PRK Review**
    -   Select **Paula VREdu** (PRK role).
    -   Task: `Review applications and forward to PD`. Enter an opinion.
4.  **Rector Decision**
    -   Select **Penny Personnel** to forward the reviewed app. Task: `Present reviewed applications to Rector`.
    -   Select **Adam Rector**.
    -   Task: `Make decision`. Select **Accepted**.
5.  **External Processing (MPD)**
    -   Select **Penny Personnel** to forward to MPD.
    -   Select **Mike MPD**.
    -   Task: `Handle applications (external transfer)`. Check **Sent to External Body**.
6.  **Finalize and Register**
    -   Select **Penny Personnel**.
    -   Tasks: `Receive decision on award` and `Enter decoration into register`.
    -   Process completes.

---

## 3. Change of Employment Conditions Process
**Goal**: Change employment terms (e.g., promotion) for an academic teacher. Requires extensive approval from Quartermaster (KWE) and Vice-Rectors.

**Roles Involved**:
-   **Holly Head** (Head of O.U.)
-   **Penny Personnel** (PD)
-   **Quentin Quartermaster** (KWE)
-   **Paula VREdu** (PRK)
-   **Peter VRSci** (PRN)
-   **Adam Rector** (Rector)

### Step-by-Step Scenario
1.  **Initiate Application**
    -   Select **Holly Head**.
    -   Click **New Process...** -> Select **Change Employment Conditions** (Right Card).
    -   Fill in Proposed Conditions (e.g., "Promotion to Professor") and Effective Date.
2.  **Review Chain Start**
    -   **Holly Head**: Approve the "Review and forward" task immediately (self-check).
    -   Select **Penny Personnel**. Task: `Review application (PD)`.
    -   **Important**: Ensure **Is Academic Teacher?** is Checked. Confirm.
3.  **Financial Check**
    -   Select **Quentin Quartermaster**.
    -   Task: `Review application (Quartermaster)`. Select **Funds Available**.
4.  **Academic Approvals**
    -   Select **Paula VREdu** (PRK). Approve.
    -   Select **Peter VRSci** (PRN). Approve.
5.  **Rector Decision**
    -   Select **Adam Rector**. Task: `Make decision (RKR)`. Select **Approved**.
6.  **Implementation**
    -   Select **Penny Personnel**.
    -   Complete: `Implement, Prepare, and Inform`.
    -   Complete: `Hand Over Documents and Archive`.
    -   Process completes.

---

## Verification Results
All processes have been verified using automated simulation scripts matching the above scenarios.
-   `test_scenario_execution.js` (Leave Request): **PASSED**
-   `test_decorations.js` (Decorations): **PASSED**
-   `test_employment.js` (Employment): **PASSED**
