# Academic Management System - Full Stack Migration

## Requirements

To run this application, you need to have the following installed on your machine:

* **Node.js** (version 14.0 or higher)
* **npm** (Node Package Manager, usually comes with Node.js)

## Installation and Setup

1. **Navigate to the project directory:**
   Open your terminal or command prompt and go to the `AplikacjaSystemu` folder.

   ```bash
   cd "AplikacjaSystemu"
   ```
2. **Install Dependencies:**
   Run the following command to install all required libraries (Express, Sequelize, SQLite3, etc.):

   ```bash
   npm install
   ```
3. **Start the Server:**
   Run the application using:

   ```bash
   npm start
   ```

   This command will:

   * Start the Express server on `http://localhost:3000`.
   * Initialize the SQLite database (`database.sqlite`).
   * **Seed the database** with default users if it's empty.

## Default Users (Credentials)

**Default Password Policy:** `FirstNameLastName123@` (e.g., , `HollyHead123@`)
**Admin Password:** `SystemAdmin123@`

| Email (Username)                        | Role            | Full Name       | Notes                               |
| :-------------------------------------- | :-------------- | :-------------- | :---------------------------------- |
| **admin**                         | **Admin** | System Admin    | **Pass: `SystemAdmin123@`** |
| **alice.academic@university.pl**  | Employee        | Alice Academic  | Position: Lecturer                  |
| **holly.head@university.pl**      | HeadOU          | Holly Head      | Position: Head of Department        |
| **penny.personnel@university.pl** | PD              | Penny Personnel | Position: HR Specialist             |

*Note: All other users follow the `firstname.lastname@university.pl` pattern.*

## New Features

* **Admin Panel:** Enhanced with User Search, Add User, and Role editing. Can reset user passwords.
* **Authentication:** Users use **Email** to login. Users can **Change Password**.
* **History:** "My Requests" now shows processes you participated in, not just ones you started.
* **Positions:** User positions are auto-filled in forms and read-only.

## Application Features

### Authentication & Roles

* **Login:** Users must log in to access the system.
* **Admin Panel:** Log in as **admin** to see the "Admin Panel" in the sidebar. This allows you to view all registered users and change their roles (e.g., promote a user to `HeadOU`).

### Processes

The system supports three full processes:

1. **Leave Request:** Initiated by `Employee`.
2. **Decorations and Medals:** Initiated by `HeadOU`.
3. **Change of Employment Conditions:** Initiated by `HeadOU`.

### Architecture

* **Backend:** Node.js + Express.
* **Database:** SQLite (persisted in `database.sqlite` file).
* **Frontend:** Vanilla JS + HTML/CSS (communicates via REST API).
