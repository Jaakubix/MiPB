# Academic Management System - Full Stack Migration

## Requirements
To run this application, you need to have the following installed on your machine:
*   **Node.js** (version 14.0 or higher)
*   **npm** (Node Package Manager, usually comes with Node.js)

## Installation and Setup

1.  **Navigate to the project directory:**
    Open your terminal or command prompt and go to the `AplikacjaSystemu` folder.
    ```bash
    cd "AplikacjaSystemu"
    ```

2.  **Install Dependencies:**
    Run the following command to install all required libraries (Express, Sequelize, SQLite3, etc.):
    ```bash
    npm install
    ```

3.  **Start the Server:**
    Run the application using:
    ```bash
    npm start
    ```
    This command will:
    *   Start the Express server on `http://localhost:3000`.
    *   Initialize the SQLite database (`database.sqlite`).
    *   **Seed the database** with default users if it's empty.

## Default Users (Credentials)
The system comes pre-configured with the following users for testing.
**Default Password for ALL users:** `password123`

| Username | Role | Full Name | Notes |
| :--- | :--- | :--- | :--- |
| **admin** | **Admin** | Admin Account | Can manage users and roles. |
| **alice** | Employee | Alice Academic | Academic Teacher (Can start Leave Request). |
| **nancy** | Employee | Nancy NonAcademic | Administrative Staff. |
| **holly** | HeadOU | Holly Head | Head of Organizational Unit. |
| **penny** | PD | Penny Personnel | Personnel Department. |
| **quentin**| KWE | Quentin Quartermaster| Quaestor (Finance). |
| **adam** | Rector | Adam Rector | Rector. |
| **carl** | Chancellor | Carl Chancellor | Chancellor. |
| **paula** | PRK | Paula VREdu | Vice-Rector for Education. |
| **peter** | PRN | Peter VRSci | Vice-Rector for Science. |
| **mike** | MPD | Mike MPD | Marketing & Promotion. |

## Application Features

### Authentication & Roles
*   **Login:** Users must log in to access the system.
*   **Admin Panel:** Log in as **admin** to see the "Admin Panel" in the sidebar. This allows you to view all registered users and change their roles (e.g., promote a user to `HeadOU`).

### Processes
The system supports three full processes:
1.  **Leave Request:** Initiated by `Employee`.
2.  **Decorations and Medals:** Initiated by `HeadOU`.
3.  **Change of Employment Conditions:** Initiated by `HeadOU`.

### Architecture
*   **Backend:** Node.js + Express.
*   **Database:** SQLite (persisted in `database.sqlite` file).
*   **Frontend:** Vanilla JS + HTML/CSS (communicates via REST API).
