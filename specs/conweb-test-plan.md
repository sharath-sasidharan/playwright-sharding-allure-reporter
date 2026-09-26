# Concerto ConWeb Application Test Plan

## Application Overview

Concerto (ConWeb) by Realization Technologies is a browser-based Critical Chain Project Management (CCPM) suite (v5.10) accessed at https://installera2.realization.com/conweb. It is a classic multi-frame ASP.NET application: a persistent top banner (logo, username/server info, My Profile / Log Off links) sits above a horizontal module bar with 11 modules: Full Kit Mgt, Task Mgt, Project Mgt, Resource Mgt, Executive, Program Mgt, Pipeline Mgt, Metrics, Buffer Diagnostics, P2P, Business Rules, and Admin. Selecting a module loads a left/second-level menu of reports/tools inside nested iframes, and most reports render as data grids with a common pattern: a collapsible "Filters" panel (multi-select dropdowns such as Division/Project/Status/Resource Manager), a free-text Search box, summary "tiles" (counts due within date ranges), Export to Excel / Printer-Friendly / Batch Print actions, sortable column headers, and pager controls ("Page X of Y"). Project Mgt exposes per-project tool icons (Chain View - Gantt, Task List, Full Kit Report, Project Review, Chain View - Table). Pipeline Mgt opens as a separate single-page application in a new browser tab with its own New/Open/Save/Save As toolbar and a project-selection/filter panel. Admin and Business Rules expose system configuration (user/group/team management, buffering policy, scheduling rules) that must not be altered during testing. Login is a simple username/password form; invalid credentials or empty submission return "Concerto logon failed. Invalid Username or Password.", while navigating to an internal page without a valid session returns "Concerto logon failed. Server might be down." and redirects to the login form. Logging off redirects to the login page with a "You logged off at <timestamp>" confirmation message.

## Test Scenarios

### 1. Authentication and Session

**Seed:** `tests/seed.spec.ts`

#### 1.1. Successful login with valid credentials

**File:** `tests/auth/login-success.spec.ts`

**Steps:**
  1. Navigate to https://installera2.realization.com/conweb
    - expect: The Concerto login page is displayed with Username and Password fields, a Log In button, and the Realization logo
  2. Enter username 'ResAdmin' in the Username field
  3. Enter password 'ResAdmin1$' in the Password field
  4. Click the Log In button
    - expect: The user is redirected to welcome.aspx
    - expect: The top banner shows 'Username: ResAdmin' and 'Server Name: Concerto'
    - expect: The module bar shows all 11 modules: Full Kit Mgt, Task Mgt, Project Mgt, Resource Mgt, Executive, Program Mgt, Pipeline Mgt, Metrics, Buffer Diagnostics, P2P, Business Rules, Admin

#### 1.2. Login fails with empty username and password

**File:** `tests/auth/login-empty-fields.spec.ts`

**Steps:**
  1. Navigate to https://installera2.realization.com/conweb
    - expect: The login page is displayed
  2. Leave Username and Password fields empty and click Log In
    - expect: The page reloads to default.aspx?failed=1
    - expect: The message 'Concerto logon failed. Invalid Username or Password.' is displayed
    - expect: The user remains on the login page

#### 1.3. Login fails with valid username and wrong password

**File:** `tests/auth/login-wrong-password.spec.ts`

**Steps:**
  1. Navigate to https://installera2.realization.com/conweb
    - expect: The login page is displayed
  2. Enter username 'ResAdmin' and password 'WrongPassword123', then click Log In
    - expect: The page reloads to default.aspx?failed=1
    - expect: The message 'Concerto logon failed. Invalid Username or Password.' is displayed
    - expect: No session is established (module bar is not shown)

#### 1.4. Login fails with unknown username

**File:** `tests/auth/login-unknown-user.spec.ts`

**Steps:**
  1. Navigate to https://installera2.realization.com/conweb
    - expect: The login page is displayed
  2. Enter username 'NoSuchUser999' and any password (e.g. 'Whatever1$'), then click Log In
    - expect: The login fails with 'Concerto logon failed. Invalid Username or Password.'

#### 1.5. Login fails with username entered but password left blank

**File:** `tests/auth/login-missing-password.spec.ts`

**Steps:**
  1. Navigate to https://installera2.realization.com/conweb
    - expect: The login page is displayed
  2. Enter username 'ResAdmin' only, leave Password blank, click Log In
    - expect: The login fails with 'Concerto logon failed. Invalid Username or Password.'

#### 1.6. Password field masks input

**File:** `tests/auth/login-password-masking.spec.ts`

**Steps:**
  1. Navigate to https://installera2.realization.com/conweb
    - expect: The login page is displayed
  2. Type any characters into the Password field
    - expect: Entered characters are masked (rendered as dots/asterisks, placeholder shows '********')

#### 1.7. Login is case-sensitive / resilient to leading-trailing whitespace in credentials

**File:** `tests/auth/login-whitespace-username.spec.ts`

**Steps:**
  1. Navigate to https://installera2.realization.com/conweb
    - expect: The login page is displayed
  2. Enter username '  ResAdmin  ' (with leading/trailing spaces) and password 'ResAdmin1$', click Log In
    - expect: Either the login succeeds (whitespace trimmed) or fails with the standard invalid credentials message - verify the behavior is consistent and no server error/stack trace is shown

#### 1.8. Directly requesting an internal page without an active session redirects to login

**File:** `tests/auth/session-required.spec.ts`

**Steps:**
  1. Without logging in (fresh browser context), navigate directly to https://installera2.realization.com/conweb/welcome.aspx
    - expect: The user is redirected to the login page (default.aspx?failed=1)
    - expect: The message 'Concerto logon failed. Server might be down.' or the standard invalid-credentials message is shown instead of exposing the internal page

#### 1.9. Log Off terminates the session and returns to login page

**File:** `tests/auth/logout.spec.ts`

**Steps:**
  1. Log in with username 'ResAdmin' and password 'ResAdmin1$'
    - expect: Welcome page is displayed
  2. Click the 'Log Off' link in the top banner
    - expect: The user is redirected to default.aspx?signedout=1
    - expect: A confirmation message 'You logged off at <date/time>' is displayed
    - expect: The Username/Password login form is shown again
  3. Use the browser Back button
    - expect: The application does not display any previously loaded protected content without re-authentication (no cached sensitive grid data is shown as an interactive/live page)

#### 1.10. My Profile link opens the current user's profile

**File:** `tests/auth/my-profile.spec.ts`

**Steps:**
  1. Log in with username 'ResAdmin' and password 'ResAdmin1$'
    - expect: Welcome page is displayed
  2. Click the 'My Profile' link in the top banner
    - expect: The profile page for user 'ResAdmin' loads (usermgr/userprofile.aspx) without error
    - expect: User details/settings fields are visible
  3. Do not change any field; navigate away without saving
    - expect: No data is modified

### 2. Global Navigation

**Seed:** `tests/seed.spec.ts`

#### 2.1. All top-level module links are visible and navigable after login

**File:** `tests/navigation/top-menu.spec.ts`

**Steps:**
  1. Log in with valid credentials (ResAdmin / ResAdmin1$)
    - expect: Welcome page loads with the module bar
  2. Verify the following links are present in the module bar: Full Kit Mgt, Task Mgt, Project Mgt, Resource Mgt, Executive, Program Mgt, Pipeline Mgt, Metrics, Buffer Diagnostics, P2P, Business Rules, Admin
    - expect: All 12 links are visible and enabled
  3. Click each module link one at a time (except Pipeline Mgt) and wait for its content frame to load
    - expect: Each module loads its own second-level menu inside the content iframe without a client-side error or blank frame
    - expect: The clicked module link is visually marked active

#### 2.2. Pipeline Mgt opens in a new browser tab

**File:** `tests/navigation/pipeline-new-tab.spec.ts`

**Steps:**
  1. Log in with valid credentials
    - expect: Welcome page loads
  2. Click the 'Pipeline Mgt' module link
    - expect: A new browser tab/window opens with URL ending in /conweb/PipelinePlanning/ and title 'PipelinePlanning'
    - expect: The original ConWeb tab remains on the welcome page
  3. Switch to the new tab
    - expect: The 'Concerto Pipeline' toolbar (New, Open, Save, Save As) and a 'Filter Projects' panel are displayed

#### 2.3. Clicking the Concerto logo/header returns to the main landing page

**File:** `tests/navigation/logo-home-link.spec.ts`

**Steps:**
  1. Log in and navigate into any module, e.g. Task Mgt > Task List
    - expect: Task List grid is displayed
  2. Click the 'Concerto Project Planning & Execution' logo/link in the top banner
    - expect: The application returns to the default landing view without raising a script error

#### 2.4. QRG/Help links open the correct documentation for each module

**File:** `tests/navigation/help-links.spec.ts`

**Steps:**
  1. Log in and open Task Mgt
    - expect: Task Mgt submenu is visible with a 'TaskMgt Help' icon
  2. Click the Help icon
    - expect: A PDF (e.g. 'Concerto Task Manager QRG.pdf') opens in a new tab or downloads, without a 404/broken-link error
  3. Repeat for Project Mgt ('Concerto Project Manager QRG.pdf'), Resource Mgt ('Concerto Resource Manager QRG.pdf'), and Admin ('Concerto Administrator.pdf')
    - expect: Each Help icon opens its respective PDF successfully

### 3. Project Mgt - Project Status Report

**Seed:** `tests/seed.spec.ts`

#### 3.1. Project Status report loads with grid, tiles and pagination

**File:** `tests/project-mgt/project-status-load.spec.ts`

**Steps:**
  1. Log in and navigate to Project Mgt > Reports > Project Status
    - expect: The grid loads with columns: Project Tools, Project Name, Project Type, Project UID, Project Status, Description, Due Date, Projected Date, Delay, Buffer Consumed, Longest Chain Complete, Penetrating Task, Last Update, Help Needed, Comments, Buffer Trend, Remaining Float, Default Sort
    - expect: Three summary tiles are shown: 'Projects due within 30 days', 'Projects due between 31-90 days', 'Projects due beyond 90 days', each broken down into On time/Late/Very late counts
    - expect: A pager shows 'Page 1 of N' with Previous/Next controls (Previous disabled on page 1)

#### 3.2. Search by project name filters the grid

**File:** `tests/project-mgt/project-status-search.spec.ts`

**Steps:**
  1. Log in and open Project Mgt > Project Status
    - expect: Grid is loaded with multiple projects
  2. Type a known project name substring (e.g. 'Gama') into the 'Search by project name' box
    - expect: The grid updates to show only rows whose Project Name contains the search text
  3. Clear the search box
    - expect: The grid returns to showing the full unfiltered project list

#### 3.3. Search with a non-existent project name shows no results

**File:** `tests/project-mgt/project-status-search-no-results.spec.ts`

**Steps:**
  1. Log in and open Project Mgt > Project Status
    - expect: Grid is loaded
  2. Type an unlikely string, e.g. 'zzzzz_nonexistent_project_999', into the search box
    - expect: The grid displays zero rows / an empty state, with no JavaScript error and the tiles/pager updating consistently (e.g. Page 1 of 1 or hidden pager)

#### 3.4. Filters panel: filter projects by Status

**File:** `tests/project-mgt/project-status-filter-status.spec.ts`

**Steps:**
  1. Log in and open Project Mgt > Project Status
    - expect: Grid is loaded
  2. Click the Filters icon to expand the Filters panel
    - expect: The panel expands showing Projects, Status, Division, Project Manager, and Milestones selectors, plus an 'Apply Filters' button
  3. Open the Status multi-select and remove all but one status (e.g. keep only 'In Process')
    - expect: The Status control reflects the single selected value
  4. Click 'Apply Filters'
    - expect: The grid refreshes to show only projects whose Project Status column equals 'In Process'

#### 3.5. Filters panel: filter by Division and Project Manager together

**File:** `tests/project-mgt/project-status-filter-combo.spec.ts`

**Steps:**
  1. Log in and open Project Mgt > Project Status, expand Filters
    - expect: Filters panel is visible
  2. Select a specific Division from the Division dropdown and a specific Project Manager from the Project Manager dropdown
    - expect: Both selectors show the chosen values
  3. Click 'Apply Filters'
    - expect: The grid shows only projects matching both the selected Division and Project Manager (or an empty grid if no project matches both)
  4. Reset filters back to '.All Division' / '.All Project Managers'
    - expect: The grid returns to the full, unfiltered list

#### 3.6. Summary tile click filters/highlights matching projects

**File:** `tests/project-mgt/project-status-tile-click.spec.ts`

**Steps:**
  1. Log in and open Project Mgt > Project Status
    - expect: The 'Projects due within 30 days' tile shows a nonzero count
  2. Click the 'Projects due within 30 days' tile
    - expect: The grid filters/scrolls to show only projects due within 30 days, consistent with the tile's On time/Late/Very late breakdown

#### 3.7. Pagination navigates through Project Status pages

**File:** `tests/project-mgt/project-status-pagination.spec.ts`

**Steps:**
  1. Log in and open Project Mgt > Project Status
    - expect: Pager shows 'Page 1 of N' (N > 1) with Previous disabled and Next enabled
  2. Click Next
    - expect: The grid content changes to the next set of rows; pager shows 'Page 2 of N'; Previous becomes enabled
  3. Click Previous
    - expect: The grid returns to page 1; Previous becomes disabled again

#### 3.8. Sorting the grid via the Default Sort / Due Date column header

**File:** `tests/project-mgt/project-status-sort.spec.ts`

**Steps:**
  1. Log in and open Project Mgt > Project Status
    - expect: Grid loaded with a default sort order
  2. Click the 'Due Date' column header
    - expect: Rows re-sort by Due Date ascending (indicated by a sort arrow) without error
  3. Click the 'Due Date' column header again
    - expect: Rows re-sort by Due Date descending

#### 3.9. Export to Excel and Printer-Friendly controls are available and trigger without error

**File:** `tests/project-mgt/project-status-export.spec.ts`

**Steps:**
  1. Log in and open Project Mgt > Project Status
    - expect: Export to Excel, Printer-Friendly Report, Export Action Items To Excel, and Key Event & Milestone Report icons are visible
  2. Click 'Export To Excel'
    - expect: A file download begins (or an export dialog/new tab opens) without a script error
  3. Click 'Printer-Friendly Report'
    - expect: A print-friendly view opens in a new tab/window showing the report data

#### 3.10. Hide/Show Charts and Hide/Show Delay Summary toggles work

**File:** `tests/project-mgt/project-status-toggle-panels.spec.ts`

**Steps:**
  1. Log in and open Project Mgt > Project Status
    - expect: Charts and Delay Summary sections are visible with 'Hide Charts' / 'Hide Delay Summary' controls
  2. Click 'Hide Charts'
    - expect: The chart area collapses/hides and the control label toggles (e.g. to 'Show Charts')
  3. Click the control again
    - expect: The chart area reappears

#### 3.11. Project Tools icons open the correct sub-views for a project row

**File:** `tests/project-mgt/project-status-row-tools.spec.ts`

**Steps:**
  1. Log in and open Project Mgt > Project Status
    - expect: Grid rows show a 'Project Tools' cell with icons such as Chain View - Gantt, Task List, Full Kit Report, Project Review
  2. Click the 'Chain View - Gantt' icon for a project row
    - expect: The project's Gantt/Chain view opens (read-only checkout) without error, e.g. URL contains /GnattView/Gantt/<id>/checkoutReadOnly
  3. Navigate back and click the 'Task List' icon for the same row
    - expect: The Task List for that specific project opens, filtered to that project

#### 3.12. Projects menu items (Modify, Validate, Project Repair, Edit Info) are reachable but no changes are saved

**File:** `tests/project-mgt/projects-menu-readonly-check.spec.ts`

**Steps:**
  1. Log in and open Project Mgt
    - expect: The 'Projects' section shows Modify, Validate, Project Repair, Edit Info, Create New Plan, Upload Project File, Upload Excel, Bulk Project Upload, Download Excel Template, Download JSON Template links
  2. Click 'Modify'
    - expect: A project selection/modify report loads (pmrpt.aspx?Rpt=MP) listing projects, without opening an edit form automatically
  3. Navigate away without selecting/saving any project change
    - expect: No project data is altered

#### 3.13. Download Excel Template and Download JSON Template links work

**File:** `tests/project-mgt/download-templates.spec.ts`

**Steps:**
  1. Log in and open Project Mgt
    - expect: 'Download Excel Template' and 'Download JSON Template' links are visible under Projects
  2. Click 'Download Excel Template'
    - expect: An Excel template file download starts successfully
  3. Click 'Download JSON Template'
    - expect: A JSON template file download starts successfully

### 4. Task Mgt

**Seed:** `tests/seed.spec.ts`

#### 4.1. Task List loads with Quick Access filters and grid

**File:** `tests/task-mgt/task-list-load.spec.ts`

**Steps:**
  1. Log in and navigate to Task Mgt > Task List
    - expect: The grid loads (may take several seconds) showing task rows with columns for Project, Task, Resource, dates and status
    - expect: Quick Access buttons are shown: 'Red Tasks - <count>', 'Help Needed Tasks - <count>', 'Ready to Start Tasks - <count>', 'Upcoming Tasks - <count>'
    - expect: A 'Refresh' button and a 'Run BM' button are visible
    - expect: A pager shows 'Page 1 of N'

#### 4.2. Quick Access 'Red Tasks' filter narrows the grid

**File:** `tests/task-mgt/task-list-quick-red-tasks.spec.ts`

**Steps:**
  1. Log in and open Task Mgt > Task List, wait for it to load
    - expect: The 'Red Tasks - N' button shows a nonzero count
  2. Click 'Red Tasks - N'
    - expect: The grid filters down to only red/critical tasks; the displayed row count is consistent with N (subject to pagination)
  3. Click the same Quick Access button again (or Refresh)
    - expect: The filter toggles off and the grid returns to the full task list

#### 4.3. Search box filters the Task List grid

**File:** `tests/task-mgt/task-list-search.spec.ts`

**Steps:**
  1. Log in and open Task Mgt > Task List
    - expect: Grid is loaded with a Search box
  2. Type a known task or project name (e.g. 'ACE Execution') into Search
    - expect: The grid filters to rows matching the search text
  3. Clear the search box
    - expect: The full task list is restored

#### 4.4. Search with a nonsense string returns an empty grid gracefully

**File:** `tests/task-mgt/task-list-search-no-match.spec.ts`

**Steps:**
  1. Log in and open Task Mgt > Task List
    - expect: Grid is loaded
  2. Type 'qqqqzzzz_no_such_task' into the Search box
    - expect: No rows are shown; no JavaScript error occurs; pagination reflects zero/one page

#### 4.5. Subtask List view is reachable from Task Mgt

**File:** `tests/task-mgt/subtask-list.spec.ts`

**Steps:**
  1. Log in and open Task Mgt
    - expect: 'Task List' and 'Subtask List' links are visible
  2. Click 'Subtask List'
    - expect: A Kanban-style subtask view loads (loadSubtaskKanban=1) without error

#### 4.6. Pagination on Task List works across many pages

**File:** `tests/task-mgt/task-list-pagination.spec.ts`

**Steps:**
  1. Log in and open Task Mgt > Task List
    - expect: Pager shows e.g. 'Page 1 of 270'
  2. Click Next several times
    - expect: Each click advances the page number and the visible rows change accordingly
  3. Click the page indicator ('Page X of N') if it opens a jump-to-page control, and jump directly to a specific page number
    - expect: The grid navigates directly to the requested page

#### 4.7. Export to Excel and Batch Print are available on Task List

**File:** `tests/task-mgt/task-list-export-print.spec.ts`

**Steps:**
  1. Log in and open Task Mgt > Task List
    - expect: 'Export to Excel', 'Display Printer Friendly', and 'Batch Print' icons are visible
  2. Click 'Export to Excel'
    - expect: A file download begins without error
  3. Click 'Display Printer Friendly'
    - expect: A printer-friendly version of the task list opens

#### 4.8. Assign Task Mgrs report is reachable (view only)

**File:** `tests/task-mgt/assign-task-mgrs.spec.ts`

**Steps:**
  1. Log in and navigate to Task Mgt (or Project Mgt > Reports) > Assign Task Mgrs
    - expect: A report/grid for assigning Task Managers loads without error
  2. Do not submit any assignment changes
    - expect: No task manager assignments are modified

#### 4.9. 'Run BM' button on Task List is visible but not executed (avoid destructive server-wide recompute)

**File:** `tests/task-mgt/run-bm-visible-only.spec.ts`

**Steps:**
  1. Log in and open Task Mgt > Task List
    - expect: A 'Run BM' button with an icon is visible in the Quick Access area
  2. Verify the button is enabled/clickable without actually clicking it (hover only)
    - expect: The button displays a tooltip or visual affordance consistent with triggering a Buffer Management run; no click is performed in this test to avoid altering shared project data

### 5. Full Kit Mgt

**Seed:** `tests/seed.spec.ts`

#### 5.1. Full Kit Report loads with tiles and grid

**File:** `tests/full-kit/full-kit-load.spec.ts`

**Steps:**
  1. Log in and navigate to Full Kit Mgt > Full Kit Report
    - expect: Three tiles display: 'Full Kit Tasks due within 15 days', 'due between 15-90 days', 'due beyond 90 days', each with On time/Delayed counts
    - expect: The grid loads with columns: Project Name, Project UID, Full Kit UID, MSP ID, Full Kit Name, Full Kit Mgr, Participants, Percent Complete, Due Date, Expected Finish, Delay (d), Release Date, Work order #, RZ Reference, Help Needed
    - expect: A pager shows 'Page 1 of N'

#### 5.2. Search filters the Full Kit grid by project/full kit name

**File:** `tests/full-kit/full-kit-search.spec.ts`

**Steps:**
  1. Log in and open Full Kit Mgt > Full Kit Report
    - expect: Grid is loaded
  2. Type a known full kit name fragment (e.g. 'Pre Repair') into Search and press Enter/click Search
    - expect: The grid filters to rows containing the search text in the Full Kit Name or related columns

#### 5.3. Filters panel narrows Full Kit results

**File:** `tests/full-kit/full-kit-filters.spec.ts`

**Steps:**
  1. Log in and open Full Kit Mgt > Full Kit Report
    - expect: Grid is loaded
  2. Click the Filters icon to expand the panel
    - expect: Filter controls (e.g. Division/Project/Manager) are displayed
  3. Apply a filter for a specific project
    - expect: The grid updates to show only Full Kit items for that project

#### 5.4. Clicking a tile updates the grid to matching Full Kit tasks

**File:** `tests/full-kit/full-kit-tile-click.spec.ts`

**Steps:**
  1. Log in and open Full Kit Mgt > Full Kit Report
    - expect: 'Full Kit Tasks due within 15 days' tile shows a nonzero total
  2. Click that tile
    - expect: The grid filters to Full Kit tasks due within 15 days, consistent with the on-time/delayed breakdown shown on the tile

#### 5.5. Export to Excel and Printer-Friendly Report work on Full Kit Report

**File:** `tests/full-kit/full-kit-export.spec.ts`

**Steps:**
  1. Log in and open Full Kit Mgt > Full Kit Report
    - expect: Export and Print icons are visible
  2. Click Export to Excel
    - expect: A download starts without error
  3. Click Printer-Friendly Report
    - expect: A print view opens correctly

### 6. Resource Mgt

**Seed:** `tests/seed.spec.ts`

#### 6.1. Resource Mgt landing page shows filters and requires Refresh to display report

**File:** `tests/resource-mgt/resource-load-initial.spec.ts`

**Steps:**
  1. Log in and navigate to Resource Mgt
    - expect: The 'View Resource L:C', Escalated Tasks, Task List, Assign Task Mgrs, Flow Trend by Task Count, Flow Trend by Resource Load, Global Resource File, Resource Needs, and Sand Chart links are shown
    - expect: The default report view shows filter controls: Horizon (numeric + unit dropdown Weeks/Months/Quarters), Division, Projects, Resource Manager, Show Hierarchy checkbox (checked by default), Subprojects checkbox, Set Aside Reserve Units checkbox (checked by default), and a Refresh button
    - expect: The report area shows the placeholder text 'Click Refresh to display the report.'

#### 6.2. Refresh with default filters generates the Resource Load report

**File:** `tests/resource-mgt/resource-load-refresh.spec.ts`

**Steps:**
  1. Log in and open Resource Mgt
    - expect: Filters panel visible with default values (.All Division, .All Projects, .All Resource Managers, Horizon = 4 Weeks)
  2. Click 'Refresh'
    - expect: The report renders a Resource Load chart/table for all resources instead of the placeholder text
    - expect: No script error occurs even though many divisions/projects/resource managers exist in the dropdowns

#### 6.3. Filtering Resource Load by a specific Division and refreshing

**File:** `tests/resource-mgt/resource-load-division-filter.spec.ts`

**Steps:**
  1. Log in and open Resource Mgt
    - expect: Division dropdown defaults to '.All Division'
  2. Select a specific division (e.g. 'SE') from the Division dropdown
    - expect: The Division field updates to the selected value
  3. Click 'Refresh'
    - expect: The report regenerates scoped to only that division's resources/projects

#### 6.4. Changing the Horizon unit (Weeks/Months/Quarters) affects the report window

**File:** `tests/resource-mgt/resource-load-horizon.spec.ts`

**Steps:**
  1. Log in and open Resource Mgt
    - expect: Horizon shows '4' and unit 'Weeks' by default
  2. Change the horizon number to a different value (e.g. 8) and the unit dropdown to 'Months'
    - expect: Both fields reflect the new values
  3. Click Refresh
    - expect: The report regenerates using the new horizon window without error

#### 6.5. Entering an invalid (non-numeric or negative) Horizon value is handled gracefully

**File:** `tests/resource-mgt/resource-load-horizon-invalid.spec.ts`

**Steps:**
  1. Log in and open Resource Mgt
    - expect: Horizon textbox defaults to '4'
  2. Clear the Horizon textbox and type a negative number (e.g. '-5') or non-numeric text (e.g. 'abc')
    - expect: The field either rejects the invalid input, reverts to a valid default, or shows a validation message when Refresh is clicked - no unhandled exception/blank page should occur

#### 6.6. Escalated Tasks report is reachable from Resource Mgt

**File:** `tests/resource-mgt/escalated-tasks.spec.ts`

**Steps:**
  1. Log in and open Resource Mgt > Escalated Tasks
    - expect: An escalated/stuck-task grid loads without error

#### 6.7. Global Resource File and Resource Needs reports load

**File:** `tests/resource-mgt/global-resource-file.spec.ts`

**Steps:**
  1. Log in and open Resource Mgt > Global Resource File
    - expect: A resource master list/report loads
  2. Navigate to Resource Mgt > Resource Needs
    - expect: A resource needs/shortage report loads

#### 6.8. Sand Chart view is reachable

**File:** `tests/resource-mgt/sand-chart.spec.ts`

**Steps:**
  1. Log in and open Resource Mgt > Sand Chart
    - expect: The Sand Chart visualization loads without error

### 7. Executive and Program Mgt Dashboards

**Seed:** `tests/seed.spec.ts`

#### 7.1. Executive dashboard loads with filters

**File:** `tests/dashboards/executive-load.spec.ts`

**Steps:**
  1. Log in and navigate to Executive
    - expect: Filter controls Division, Portfolio, Template(s), Customer are shown, each defaulting to '.All ...'
    - expect: A Refresh button is visible
    - expect: Action Items and Help icons are present

#### 7.2. Executive dashboard filters by Portfolio and refreshes

**File:** `tests/dashboards/executive-portfolio-filter.spec.ts`

**Steps:**
  1. Log in and open Executive
    - expect: Portfolio dropdown defaults to '.All Portfolio' with options such as 'AAA Vascular', 'P1', 'P2', 'P3'
  2. Select 'P1' from the Portfolio dropdown and click Refresh
    - expect: The dashboard updates to reflect only Portfolio 'P1' data without error

#### 7.3. Program Mgt dashboard Filters panel can be collapsed and expanded

**File:** `tests/dashboards/program-mgt-filters-toggle.spec.ts`

**Steps:**
  1. Log in and navigate to Program Mgt
    - expect: A 'Filters' toolbar with a 'Collapse panel' control is shown, and Division/Portfolio/Template(s)/Customer/Designers Required filters are visible
  2. Click 'Collapse panel'
    - expect: The filters panel collapses, freeing space for the dashboard content
  3. Expand it again
    - expect: The filters panel re-appears with previously selected values retained

#### 7.4. Program Mgt dashboard filters by Division and Customer combined

**File:** `tests/dashboards/program-mgt-combo-filter.spec.ts`

**Steps:**
  1. Log in and open Program Mgt
    - expect: Division defaults to a value (e.g. '9WOOD') and Customer defaults to '.All Customer'
  2. Select a different Division and a specific Customer (e.g. 'Customer1')
    - expect: Both selections are reflected in the controls
  3. Click Refresh
    - expect: The dashboard content updates according to both filters without error

### 8. Pipeline Mgt (standalone app)

**Seed:** `tests/seed.spec.ts`

#### 8.1. Pipeline Planning app loads with project list and filter panel

**File:** `tests/pipeline/pipeline-load.spec.ts`

**Steps:**
  1. Log in to ConWeb and click 'Pipeline Mgt'; switch to the newly opened tab
    - expect: The 'Concerto Pipeline' app loads with New / Open / Save / Save As toolbar actions
    - expect: A 'Filter Projects' panel shows Division, Portfolio, Template(s), Customer, Project Manager, and Default View (defaults to 'Pipeline View') dropdowns, a 'Group Projects by State w.r.t. Constraints' checkbox, and an optional date-range filter with 'Projects Start Date' / 'Projects End Date' fields (disabled until the 'Use following date range' checkbox is checked)
    - expect: A scrollable list of all projects with Start Date and End Date columns is shown
    - expect: Reset and Apply buttons are visible at the bottom

#### 8.2. Filtering the Pipeline project list by Division

**File:** `tests/pipeline/pipeline-division-filter.spec.ts`

**Steps:**
  1. Open Pipeline Mgt (new tab)
    - expect: Division dropdown shows 'Select Division' placeholder
  2. Select a division from the Division dropdown
    - expect: The project list updates/narrows according to the selected division (or remains ready to Apply)
  3. Click 'Apply'
    - expect: The pipeline view/project list reflects the chosen division filter
  4. Click 'Reset'
    - expect: All filters revert to their default ('Select Division', 'All Portfolio', etc.) and the full project list is restored

#### 8.3. Enabling the custom date range filter enables the date fields

**File:** `tests/pipeline/pipeline-date-range-toggle.spec.ts`

**Steps:**
  1. Open Pipeline Mgt
    - expect: 'Use following date range' checkbox is unchecked and the 'Projects Start Date' / 'Projects End Date' textboxes are disabled
  2. Check the 'Use following date range' checkbox
    - expect: Both date textboxes become enabled/editable
  3. Enter a start date and an end date (start before end) and click Apply
    - expect: The project list filters to only projects overlapping that date range
  4. Enter an end date earlier than the start date
    - expect: The application either shows a validation message or otherwise prevents an invalid range from being applied without crashing

#### 8.4. 'Group Projects by State w.r.t. Constraints' checkbox changes grouping

**File:** `tests/pipeline/pipeline-group-by-state.spec.ts`

**Steps:**
  1. Open Pipeline Mgt
    - expect: Checkbox 'Group Projects by State w.r.t. Constraints' is unchecked by default
  2. Check the checkbox and click Apply
    - expect: The pipeline view groups/reorders projects according to their state relative to constraints, without error

#### 8.5. New / Open dialogs can be opened and cancelled without altering saved pipeline plans

**File:** `tests/pipeline/pipeline-new-open-cancel.spec.ts`

**Steps:**
  1. Open Pipeline Mgt
    - expect: 'New' and 'Open' toolbar actions are visible
  2. Click 'Open'
    - expect: A dialog/list of saved pipeline plans is displayed
  3. Close/cancel the dialog without selecting or deleting any saved plan
    - expect: The dialog closes and the current view is unchanged; no saved plan is modified or removed
  4. Click 'New'
    - expect: A confirmation prompt or a fresh/blank pipeline view is presented
  5. Cancel out without saving
    - expect: No new plan is persisted and existing data remains untouched

### 9. Metrics, Buffer Diagnostics and P2P

**Seed:** `tests/seed.spec.ts`

#### 9.1. Metrics landing page lists Performance and Compliance report links

**File:** `tests/metrics/metrics-landing.spec.ts`

**Steps:**
  1. Log in and navigate to Metrics
    - expect: Under 'Performance': Throughput, Cycle Time, On Time Delivery, Actual Delay, Red Project Delay links are shown
    - expect: Under 'Compliance': Pipelining, Full Kitting, Buffering, Task Mgt, Issue Resolution links are shown
    - expect: Custom Settings and Exclude Projects icons are shown

#### 9.2. Opening each Metrics performance report loads without error

**File:** `tests/metrics/metrics-performance-reports.spec.ts`

**Steps:**
  1. Log in and open Metrics
    - expect: Landing page is visible
  2. Click 'Throughput'
    - expect: The Throughput report loads with data/filters and no script error
  3. Return to Metrics and click 'Cycle Time'
    - expect: The Cycle Time report loads correctly
  4. Return to Metrics and click 'On Time Delivery'
    - expect: The On Time Delivery report loads correctly

#### 9.3. Opening each Metrics compliance report loads without error

**File:** `tests/metrics/metrics-compliance-reports.spec.ts`

**Steps:**
  1. Log in and open Metrics
    - expect: Landing page is visible
  2. Click 'Pipelining'
    - expect: The pipelining compliance report loads
  3. Return to Metrics and click 'Buffering'
    - expect: The buffering compliance report loads
  4. Return to Metrics and click 'Issue Resolution'
    - expect: The issue resolution compliance report loads

#### 9.4. Buffer Diagnostics: Buffer Consumption breakdown views load

**File:** `tests/buffer-diagnostics/buffer-consumption-views.spec.ts`

**Steps:**
  1. Log in and navigate to Buffer Diagnostics
    - expect: Links for 'By Help Needed', 'By Resources', 'By Task Managers', 'By Task Description', and 'Penetrating Chains' are shown under Buffer Consumption
  2. Click 'By Resources'
    - expect: A chart/report of buffer consumption grouped by resource loads (chartid=2)
  3. Return and click 'Penetrating Chains'
    - expect: A penetrating chains report loads without error

#### 9.5. P2P module links are all reachable

**File:** `tests/p2p/p2p-links.spec.ts`

**Steps:**
  1. Log in and navigate to P2P
    - expect: Links for Export Tasks, Add Links, View Links, Validate Links, P2P Status, P2P Planning are shown
  2. Click 'View Links'
    - expect: A read-only view of existing project-to-project links loads
  3. Return and click 'P2P Status'
    - expect: The P2P status/control report loads

#### 9.6. P2P 'Add Links' form can be opened and cancelled without creating a link

**File:** `tests/p2p/p2p-add-links-cancel.spec.ts`

**Steps:**
  1. Log in and navigate to P2P > Add Links
    - expect: A form/wizard to add a project-to-project link is displayed
  2. Without completing/submitting the form, navigate away or cancel
    - expect: No new link is created; navigating back to 'View Links' shows the link list unchanged

### 10. Business Rules and Admin (Read-Only Verification)

**Seed:** `tests/seed.spec.ts`

#### 10.1. Business Rules configuration tree is viewable without modification

**File:** `tests/business-rules/business-rules-view.spec.ts`

**Steps:**
  1. Log in and navigate to Business Rules
    - expect: A configuration tree loads showing sections: Buffering Policy, Buffer Pen/%Complete Graph, Buffer Priorities, CCBM Scheduling
  2. Click 'Buffering Policy'
    - expect: The Buffering Policy settings screen loads showing current minimum buffer settings
  3. Do NOT change or save any values; navigate away
    - expect: The global buffering policy remains unchanged (values on re-visit match the original)

#### 10.2. CCBM Scheduling section is viewable and values are not altered

**File:** `tests/business-rules/ccbm-scheduling-view.spec.ts`

**Steps:**
  1. Log in and open Business Rules > CCBM Scheduling
    - expect: Scheduling parameters used by the CC client and Buffer Management process are displayed
  2. Do not modify or submit any field
    - expect: No configuration change is made; leaving the page discards any accidental edits

#### 10.3. Admin landing page exposes System / Modify / Manage sections

**File:** `tests/admin/admin-landing.spec.ts`

**Steps:**
  1. Log in and navigate to Admin
    - expect: Under 'System': Manage Users, Manage Groups, Manage Teams, QC List, Run BM, Refresh Server, Modify Config links are shown
    - expect: Under 'Modify': Replace TMs/TPs, RMs by Projects, RMs by Resources, RMs Globally, Resource Assignments, Resource Names, Edit Info links are shown
    - expect: Under 'Manage': Divisions, Project Attributes, Help Needed Items, Cancelled Reasons, DueDate Change Reasons, Batch Print Lists, Project Update History, Remove Project Locks links are shown

#### 10.4. Manage Users grid loads and can be filtered by Division (view only)

**File:** `tests/admin/manage-users-view.spec.ts`

**Steps:**
  1. Log in and navigate to Admin > Manage Users
    - expect: A Division filter dropdown (default '.All Division') is shown above a users grid
  2. Select a specific division from the dropdown
    - expect: The users grid filters to show only users belonging to that division
  3. Do not create, edit, or delete any user account
    - expect: The underlying user list is unmodified when re-loading the page

#### 10.5. Manage Groups and Manage Teams pages are reachable (view only)

**File:** `tests/admin/manage-groups-teams-view.spec.ts`

**Steps:**
  1. Log in and navigate to Admin > Manage Groups
    - expect: A groups management grid/tree loads listing existing groups
  2. Navigate to Admin > Manage Teams
    - expect: A teams management grid loads listing existing teams
  3. Do not add, edit, or remove any group/team
    - expect: No group/team data is changed

#### 10.6. Manage > Divisions and Project Attributes pages are reachable (view only)

**File:** `tests/admin/manage-divisions-attributes-view.spec.ts`

**Steps:**
  1. Log in and navigate to Admin > Divisions
    - expect: A divisions maintenance screen loads listing existing divisions
  2. Navigate to Admin > Project Attributes
    - expect: A project attribute management screen loads
  3. Do not add/remove/edit any division or attribute
    - expect: No configuration changes are persisted

#### 10.7. QC List report is reachable

**File:** `tests/admin/qc-list-view.spec.ts`

**Steps:**
  1. Log in and navigate to Admin > QC List
    - expect: A Quality Checklist report loads (isNoSelection=1) without error

#### 10.8. Refresh Server / server status page is reachable but not triggered destructively

**File:** `tests/admin/refresh-server-view.spec.ts`

**Steps:**
  1. Log in and navigate to Admin > Refresh Server
    - expect: A server status page loads showing current server state/info
  2. Do not click any restart/refresh action button that would affect the shared server for other users
    - expect: The server continues running unaffected for the duration of the test

#### 10.9. Non-admin-critical Admin reports (Help Needed Items, Cancelled Reasons, DueDate Change Reasons) load

**File:** `tests/admin/reason-codes-view.spec.ts`

**Steps:**
  1. Log in and navigate to Admin > Help Needed Items
    - expect: A management grid of Help Needed reason codes loads
  2. Navigate to Admin > Cancelled Reasons
    - expect: A management grid of cancellation reason codes loads
  3. Navigate to Admin > DueDate Change Reasons
    - expect: A management grid of due-date change reason codes loads
  4. Do not add, edit or delete any reason code entries in this test
    - expect: No reason code data is modified

#### 10.10. Project Update History and Remove Project Locks pages are reachable (view only)

**File:** `tests/admin/project-history-locks-view.spec.ts`

**Steps:**
  1. Log in and navigate to Admin > Project Update History
    - expect: A history/audit report of project updates loads
  2. Navigate to Admin > Remove Project Locks
    - expect: A page listing currently locked projects/records loads
  3. Do NOT remove/unlock any project lock belonging to another active session
    - expect: No project locks are released as part of this test
