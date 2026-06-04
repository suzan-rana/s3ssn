# PRD: Veyra

## 1. Product Overview

**Product name:** Veyra
**Category:** Developer productivity, engineering intelligence, automatic work logs
**Primary users:** Freelancers, software agencies, small engineering teams, founders, engineering managers

Veyra automatically maps developer coding activity from VS Code to Git commits, branches, pull requests, projects, and clients. It helps developers and teams understand where engineering time goes without requiring manual timesheets.

The product should feel like a **developer-owned work journal**, not an employee monitoring tool.

## 2. One-Liner

**Veyra turns real coding activity into automatic work logs, project reports, and client-ready summaries.**

## 3. Problem

Developers, freelancers, agencies, and engineering teams struggle to answer simple but important questions:

* What did I actually work on today?
* How long did this feature take?
* How much effort went into this pull request?
* Which client/project consumed engineering time?
* What should I include in my standup?
* What work should be billed to a client?
* How accurate were our original estimates?

Current solutions are either:

* manual timesheets,
* generic time trackers,
* invasive employee monitoring tools,
* or project management tools disconnected from actual coding work.

Developers often forget to track time accurately, and managers/founders lack a reliable view of engineering effort.

## 4. Solution

Veyra combines:

1. **VS Code activity tracking**
2. **Git commit history**
3. **GitHub pull request data**
4. **Project/client mapping**
5. **AI-generated summaries and reports**

The result is an automatic engineering activity system that shows where coding time actually went.

Example output:

> “The invoice reminder feature took approximately 13h 40m of focused engineering time across 7 commits and 2 pull requests. Most effort was spent on backend scheduling, database schema updates, and overdue invoice handling.”

## 5. Goals

### MVP goals

* Track focused coding time from VS Code.
* Map time to repositories, branches, and commits.
* Connect GitHub commits and pull requests.
* Show daily developer work logs.
* Generate basic standup summaries.
* Generate project/client time reports.
* Make the product feel private, transparent, and non-invasive.

### Business goals

* Help freelancers and agencies bill more accurately.
* Help developers generate automatic work summaries.
* Help teams understand engineering effort without manual reporting.
* Build trust by avoiding surveillance-style tracking.

## 6. Non-Goals

Veyra should **not** be:

* an employee surveillance platform,
* a keystroke tracker,
* a screenshot monitoring tool,
* a productivity scoring system,
* a developer ranking tool,
* a payroll system,
* a replacement for Jira/Linear/GitHub Projects in the MVP.

Do not build:

* screenshots,
* keystroke tracking,
* browser history tracking,
* employee rankings,
* productivity scores,
* “low activity” alerts,
* invasive monitoring dashboards.

## 7. Target Users

## 7.1 Freelance Developers

Freelancers need accurate time records for client billing without manually starting and stopping timers.

Primary needs:

* automatic coding time tracking,
* client/project mapping,
* invoice-friendly summaries,
* proof of work from commits and PRs.

## 7.2 Software Agencies

Agencies need to understand effort per client and project.

Primary needs:

* billable reports,
* project profitability insights,
* effort by repository,
* client-ready weekly summaries.

## 7.3 Developers

Individual developers want personal work logs and easier standups.

Primary needs:

* “what did I work on today?”
* daily/weekly summaries,
* private activity history,
* commit-linked work journal.

## 7.4 Engineering Managers / Founders

Managers and founders need better visibility into engineering effort without micromanaging.

Primary needs:

* feature effort tracking,
* PR time estimates,
* project-level summaries,
* estimate vs actual comparisons later.

## 8. Core User Stories

### Developer

As a developer, I want Veyra to automatically track my focused coding time so I do not need to manually log hours.

As a developer, I want to pause tracking anytime so I feel in control.

As a developer, I want a daily summary of my work so I can write standups faster.

As a developer, I want to see which commits and branches my time was mapped to.

### Freelancer

As a freelancer, I want coding time mapped to client projects so I can create accurate invoices.

As a freelancer, I want client-friendly summaries so I can explain what I worked on.

### Agency owner

As an agency owner, I want to see engineering effort per client so I can understand project profitability.

As an agency owner, I want reports that combine time, commits, and PRs.

### Manager

As a manager, I want to understand effort per feature or PR without asking developers to manually report everything.

As a manager, I want team-level insights without seeing invasive personal tracking details.

## 9. MVP Scope

## 9.1 VS Code Extension

The extension tracks active coding context.

### Requirements

The extension should:

* detect current workspace,
* detect Git repository,
* detect current branch,
* detect active file type/language,
* detect editor focus and blur,
* detect file edit activity,
* detect idle time,
* send heartbeats while active,
* batch events locally,
* sync events to backend,
* allow pause/resume,
* show status in VS Code status bar,
* allow login/logout.

### Tracked data

Allowed:

* repository identifier,
* branch name,
* file extension,
* language ID,
* active/inactive state,
* timestamp,
* duration,
* event type.

Avoid or hash:

* full file paths,
* local machine paths,
* repository remote URLs.

Never collect:

* source code contents,
* keystrokes,
* screenshots,
* terminal output,
* clipboard contents,
* browser history,
* environment variables,
* secrets.

## 9.2 Backend API

The backend receives events, stores activity, creates sessions, and maps activity to Git data.

Recommended stack:

* **NestJS**
* **PostgreSQL**
* **Prisma**
* **Redis + BullMQ**
* **GitHub OAuth/Webhooks**

### Core backend modules

* Auth
* Users
* Workspaces
* Repositories
* Projects
* Clients
* Activity Events
* Coding Sessions
* Commits
* Pull Requests
* Analytics
* Reports
* Integrations

## 9.3 Web Dashboard

The dashboard allows users to view activity and reports.

Recommended stack:

* **Next.js**
* **React**
* **TypeScript**
* **Tailwind CSS**

### MVP pages

* Dashboard
* Today
* Sessions
* Repositories
* Projects
* Clients
* Commits
* Pull Requests
* Reports
* Settings

## 9.4 GitHub Integration

The MVP should support GitHub.

### Requirements

* Connect GitHub account.
* Sync repositories.
* Import commits.
* Import pull requests.
* Receive GitHub webhooks.
* Match commits to coding sessions.

GitLab and Bitbucket are not MVP requirements.

## 10. Key Product Flows

## 10.1 Onboarding Flow

1. User signs up.
2. User creates a workspace.
3. User installs VS Code extension.
4. User logs into Veyra from VS Code.
5. User connects GitHub.
6. User selects repositories to track.
7. User optionally creates projects/clients.
8. User starts tracking.

Success state:

> User sees today’s coding time connected to their active repo/branch.

## 10.2 Daily Work Log Flow

1. Developer codes in VS Code.
2. Extension tracks active sessions.
3. Backend converts raw events into coding sessions.
4. User opens dashboard.
5. Dashboard shows:

   * total focused time,
   * active repos,
   * active branches,
   * recent sessions,
   * commits,
   * generated summary.

## 10.3 Commit Attribution Flow

1. Developer works on a branch.
2. Extension tracks active coding sessions.
3. Developer creates commit.
4. GitHub sync imports commit.
5. Backend finds matching sessions.
6. System attributes time to commit.
7. Dashboard shows estimated time per commit.

## 10.4 Client Report Flow

1. User maps repository to project/client.
2. Veyra tracks work across repo/branch/commits.
3. User selects date range.
4. Veyra generates:

   * total time,
   * commits,
   * PRs,
   * client-friendly summary,
   * billable report.

## 11. Time Attribution Logic

Veyra should estimate time attribution using confidence scoring.

### Branch attribution

A coding session belongs to a branch when:

* same repository,
* same branch,
* overlapping active time.

This should be the first and most reliable attribution method.

### Commit attribution

A session can be linked to a commit when:

* same repository,
* same branch,
* same user or matching Git author,
* session happened before commit,
* session occurred within attribution window.

Default attribution window:

> 24 hours before commit timestamp.

### Confidence score

Use a score from `0` to `1`.

Example scoring:

* same repository: `+0.40`
* same branch: `+0.25`
* same author/user: `+0.20`
* session ended within 2 hours of commit: `+0.10`
* matching language/file pattern: `+0.05`

Auto-link when confidence is `>= 0.60`.

Below that, show as suggested attribution.

## 12. Core Data Objects

## User

Represents an individual developer.

Fields:

* id
* name
* email
* avatar
* createdAt

## Workspace

Represents a personal workspace, agency, or team.

Fields:

* id
* name
* ownerId
* createdAt

## Repository

Represents a Git repository.

Fields:

* id
* workspaceId
* provider
* providerRepoId
* name
* remoteUrlHash
* defaultBranch

## Project

Business-level grouping of work.

Fields:

* id
* workspaceId
* clientId
* name
* description

## Client

Optional customer/client entity.

Fields:

* id
* workspaceId
* name

## ActivityEvent

Raw event from VS Code.

Fields:

* id
* userId
* workspaceId
* repositoryId
* branchName
* languageId
* eventType
* timestamp
* durationSeconds
* metadata

## CodingSession

Processed focused work session.

Fields:

* id
* userId
* repositoryId
* branchName
* startedAt
* endedAt
* activeSeconds
* idleSeconds
* primaryLanguage

## Commit

Git commit.

Fields:

* id
* repositoryId
* sha
* message
* authorName
* authorEmail
* committedAt
* additions
* deletions
* filesChanged

## PullRequest

GitHub pull request.

Fields:

* id
* repositoryId
* number
* title
* state
* author
* openedAt
* mergedAt
* closedAt

## 13. Reporting Requirements

## Today Report

Show:

* total focused coding time today,
* active repositories,
* active branches,
* languages used,
* recent sessions,
* commits today,
* suggested standup summary.

## Weekly Report

Show:

* total focused time,
* time by day,
* time by repository,
* time by project,
* time by client,
* commits and PRs,
* weekly summary.

## Client Report

Show:

* client name,
* selected date range,
* total billable time,
* projects,
* repositories,
* commits,
* PRs,
* client-friendly work summary.

## PR Report

Show:

* PR title,
* author,
* time spent,
* related commits,
* related sessions,
* active days,
* summary of work.

## 14. AI Features

AI should be optional in the MVP.

### AI Standup Summary

Input:

* coding sessions,
* commits,
* PRs,
* branches,
* project names.

Output:

> Yesterday I worked on the invoice reminder feature. I implemented the scheduler, updated invoice status logic, and opened a PR for the backend workflow.

### AI Client Summary

Input:

* client project activity,
* commits,
* PRs,
* sessions.

Output:

> This week we completed backend work for invoice reminders, including scheduler implementation, schema updates, overdue invoice handling, and related tests.

### AI Engineering Summary

Input:

* feature branch,
* PR,
* commits,
* sessions.

Output:

> This feature took approximately 12h 25m of focused engineering time across 6 commits and 1 pull request.

## 15. Privacy Requirements

Privacy is a core product requirement.

### Must-have privacy features

* Pause/resume tracking.
* Clear tracking status.
* Idle detection.
* Private mode.
* Repository exclusions.
* File/folder ignore patterns.
* Local event buffering.
* Data export.
* Data deletion.
* Workspace sharing controls.

### Privacy copy

Use copy like:

> Veyra tracks coding context, not your code.

> No screenshots. No keystrokes. No surveillance.

> You control what gets tracked and shared.

## 16. Success Metrics

## Activation

* User installs VS Code extension.
* User connects GitHub.
* User tracks first coding session.
* User sees first daily summary.

## Engagement

* Weekly active developers.
* Number of tracked sessions per week.
* Number of generated reports.
* Number of connected repositories.
* Number of generated standup summaries.

## Business

* Number of active workspaces.
* Number of agency/freelancer workspaces.
* Conversion from free to paid.
* Retention after 4 weeks.
* Reports generated per paying workspace.

## Trust

* Pause/resume usage.
* Excluded repositories configured.
* Low uninstall rate of extension.
* Positive feedback on privacy UX.

## 17. MVP Acceptance Criteria

The MVP is successful when:

1. A user can sign up and create a workspace.
2. A user can install and authenticate the VS Code extension.
3. The extension can detect repo, branch, language, and active coding state.
4. The extension can send batched activity events to the backend.
5. The backend can store raw events.
6. The backend can convert events into coding sessions.
7. The user can connect GitHub.
8. The backend can import commits and pull requests.
9. The system can estimate time per branch and commit.
10. The dashboard can show today’s focused coding time.
11. The dashboard can show time by repository and branch.
12. The user can generate a basic daily summary.
13. The user can generate a basic client/project report.
14. The user can pause tracking.
15. The system does not collect code contents, screenshots, or keystrokes.

## 18. Suggested Build Phases

## Phase 1: Foundation

* Set up monorepo.
* Set up Next.js web app.
* Set up NestJS API.
* Set up PostgreSQL.
* Set up Prisma.
* Add auth.
* Add user/workspace models.

## Phase 2: VS Code Extension

* Create extension shell.
* Add login.
* Add repo detection.
* Add branch detection.
* Add activity events.
* Add heartbeats.
* Add idle detection.
* Add pause/resume.
* Send events to API.

## Phase 3: Activity Processing

* Store raw events.
* Build sessionization logic.
* Generate coding sessions.
* Show today dashboard.

## Phase 4: GitHub Integration

* Add GitHub OAuth.
* Sync repositories.
* Import commits.
* Import PRs.
* Add webhook handling.

## Phase 5: Attribution

* Map sessions to branches.
* Map sessions to commits.
* Map commits to PRs.
* Add confidence scoring.

## Phase 6: Reports

* Daily summary.
* Weekly summary.
* Project report.
* Client report.
* AI-generated summaries.

## 19. Pricing Ideas

For later, not required in MVP.

### Free

* Personal tracking
* 1 user
* Limited history
* Basic daily summaries

### Pro

* Unlimited history
* GitHub integration
* AI summaries
* Client reports
* Export reports

### Team

* Multiple users
* Workspace reports
* Project insights
* Role permissions
* Team dashboard

### Agency

* Client billing reports
* Multiple clients/projects
* Invoice exports
* Profitability insights

## 20. Final Product Direction

Veyra should become the automatic work intelligence layer for software development.

It should help users go from:

> “I think this took around two days.”

To:

> “This feature took 13h 40m of focused engineering time across 7 commits, 2 PRs, and 3 active work sessions.”

The product wins if it feels useful to developers first, and valuable to teams second.
