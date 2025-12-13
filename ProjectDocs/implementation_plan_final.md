# System Implementation Plan (Final)

## Goal
A client-side **Academic Management System** supporting multiple business processes with role-based simulation.

## Architecture
-   **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+).
-   **Persistence**: Browser `localStorage` for persisting requests and state across sessions.
-   **Process Engine**: Custom lightweight JS engine (`AppState` class) handling BPMN-like flows defined in JSON configuration.

## Implemented Processes

### 1. Leave Request
-   **Definition**: `PROCESS_DEFS['LeaveRequest']`
-   **Initiator**: Employee
-   **Flow**: Submit -> HeadOU Review -> PD Entitlement Check -> (Academic Logic) -> Registration.

### 2. Decorations and Medals
-   **Definition**: `PROCESS_DEFS['Decorations']`
-   **Initiator**: Head of O.U.
-   **Flow**: Submit -> PD Verify -> PRK Review -> Rector Decision -> MPD (External) -> Registration.

### 3. Change of Employment Conditions
-   **Definition**: `PROCESS_DEFS['EmploymentConditions']`
-   **Initiator**: Head of O.U.
-   **Flow**: Submit -> HeadOU Review -> PD Review -> KWE (Quartermaster) Check -> PRK/PRN Opinions -> Rector Decision -> Implementation.

## Security & Roles
Authentication is simulated via a dropdown user selector.
-   **Employee**: Alice, Nancy
-   **HeadOU**: Holly
-   **PD**: Penny
-   **KWE**: Quentin
-   **Rectors/Chancellors**: Adam, Carl, Paula, Peter
-   **External**: Mike (MPD)

## Directory Structure
-   `AplikacjaSystemu/`: Main application folder.
    -   `index.html`: Single Page Application entry.
    -   `style.css`: Styles containing Modal and Card definitions.
    -   `app.js`: Core logic, defined processes, and UI rendering.
-   `ProjectDocs/`: Documentation.
    -   `walkthrough.md`: User guide and scenarios.
    -   `implementation_plan_final.md`: Technical overview (this file).
-   `test_*.js`: Node.js simulation scripts for verification.
