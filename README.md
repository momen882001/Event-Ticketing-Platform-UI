# 🎟️ EventMe — Event Ticketing Platform (Frontend)

<p align="center">
  <img
    width="150"
    alt="EventMe logo"
    src="https://github.com/user-attachments/assets/d38be274-e87c-4474-9d23-a837591c1df3"
    style="border-radius: 20px;"
  />
</p>

<p align="center">
  A role-based Angular web application for browsing, booking, and managing event tickets —
  with dedicated experiences for <b>Guests</b>, <b>Users</b>, <b>Organizers</b>, and <b>Admins</b>.
</p>

<p align="center">
  <img alt="Angular" src="https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white" />
  <img alt="Angular Material" src="https://img.shields.io/badge/UI-Angular%20Material-673AB7?logo=material-design&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-green" />
</p>

---

##  Overview

**EventMe** is the frontend of an event ticketing platform that lets guests discover public events, registered users book and manage tickets, organizers create and run events, and admins oversee the whole system (users, venues, categories). It's built with **standalone Angular components**, **Angular Material**, and a clean **core / shared / features / layout** architecture, and it integrates a full calendar view, QR-code ticket generation, and an in-browser QR ticket scanner for check-in.
<img width="1496" height="842" alt="image" src="https://github.com/user-attachments/assets/a770745b-4dd4-47c7-a280-a0a30c3c128c" />

---

##  Screenshots

| Home / Discover | Event Calendar | Booking Flow |
| :---: | :---: | :---: |
| <img width="95%" alt="Home / Discover" src="https://github.com/user-attachments/assets/4c910271-216e-45fa-b511-3fc5a45d08bf" /> | <img width="95%" alt="Event Calendar" src="https://github.com/user-attachments/assets/7021845c-eff0-411d-979b-b53b7eac37fe" /> | <img width="95%" alt="Booking Flow" src="https://github.com/user-attachments/assets/64c9d827-d48f-406c-948d-1a9751f172d0" /> |

| Ticket & QR Code | Ticket Scanner | Admin Dashboard |
| :---: | :---: | :---: |
| <img width="95%" alt="Ticket & QR Code" src="https://github.com/user-attachments/assets/a9f39f69-6979-419a-ad17-88c8e660d769" /> | <img width="95%" alt="Ticket Scanner" src="https://github.com/user-attachments/assets/639f11e7-d538-462f-acff-49d59dcaf2b1" /> | <img width="95%" alt="Admin Dashboard" src="https://github.com/user-attachments/assets/ddcb4a19-c4e4-4220-b8a5-61fd902f1ec6" /> |


---
## Email Notifications

Transactional emails are sent **asynchronously** (via `@Async("emailExecutor")`, configured in `AsyncConfig`) using Spring Mail + Thymeleaf HTML templates in `src/main/resources/templates/`:

| Template | Trigger |
|---|---|
| `welcome-email.html` | New user registration |
| `booking-confirmation.html` | Successful booking |
| `booking-cancellation.html` | Booking cancellation |

Email delivery failures raise an `EmailSendException`, which is caught by the global exception handler rather than failing the triggering request.

<p align="center">
  <img width="32%" src="https://github.com/user-attachments/assets/5f43b722-0568-497d-9d02-b26b36556df2" />
  <img width="32%" src="https://github.com/user-attachments/assets/b447888c-f16f-41fc-8f7a-9f3f4cc02b16" />
  <img width="32%" src="https://github.com/user-attachments/assets/9e7bffc2-fcb0-4acd-9817-d4e4ea19d31a" />
</p>

##  Features

###  Guest (Public)
- Landing page with featured / upcoming events
- Browse and search all events (`/events`) with filtering
- View event details, venue, category, and schedule

###  Authenticated User
- Sign up / log in with route guards (`AuthGuard`) protecting private pages
- Interactive **event calendar** (day / week / month / list views) via FullCalendar
- Book tickets for an event, choose quantity, and review a **booking summary**
- Pay via an in-app **payment card** flow
- View booking history and booking details
- View issued **tickets with QR codes**
- Manage profile and reset password

###  Organizer
- Create and edit events (`add-edit-event`) directly from the calendar
- Scan attendee tickets at the door using the **camera-based QR scanner** (`@zxing/browser`) for real-time check-in

###  Admin
- Manage platform **users** (view, list, roles)
- Manage **venues** (create / edit / list, filter by category)
- Manage **categories** (create / edit / list)
- Full access to organizer and calendar tooling

###  Platform-wide
- Role-based access control via `UserRoleEnum` (`ADMIN`, `ORGANIZER`, `USER`) enforced with route-level `data.roles` + `AuthGuard`
- Centralized HTTP layer with interceptors (auth token, error handling, spinner)
- Toast notifications (`ngx-toastr`) and a global loading spinner
- Generic, reusable data table component for admin CRUD screens
- Confirmation dialogs for destructive actions
- Fully responsive UI built with Angular Material + Bootstrap Icons

---

##  Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [Angular 22](https://angular.dev) (standalone components, `@angular/build`) |
| Language | TypeScript 6 |
| UI Components | Angular Material, Angular CDK, Bootstrap Icons |
| Calendar | FullCalendar (`@fullcalendar/angular`, day/week/month/list/interaction plugins) |
| QR Codes | `qrcode` (generation) · `@zxing/browser` (camera scanning / check-in) |
| Notifications | `ngx-toastr` |
| State / HTTP | Angular services + RxJS, HTTP interceptors |
| Testing | Vitest, jsdom |
| Tooling | Angular CLI, Prettier |

---

##  Project Structure

```
src/app/
├── core/                      # Cross-cutting app infrastructure
│   ├── api/                   # Centralized API endpoint definitions (api-urls.ts)
│   ├── constants/
│   ├── guards/                 # AuthGuard (auth + role-based route protection)
│   ├── interceptors/          # HTTP interceptors (auth, errors, spinner, etc.)
│   └── services/               # Auth, Users, Events, Bookings, Tickets, Venues,
│                                # Categories, Admin Users, Notifications, Storage, Spinner
│
├── layout/
│   ├── dashboard/              # Authenticated app shell + DASHBOARD_ROUTES
│   ├── navbar/
│   └── sidebar/
│
├── features/
│   ├── auth/                   # Login, Signup
│   ├── calendar/                # Calendar landing page, add/edit event, filters, status indicators
│   ├── bookings/                # Booking flow, summary, ticket card, payment card, view booking
│   ├── tickets/                 # Ticket view, QR ticket scanner (check-in)
│   ├── venues/                  # Venue CRUD
│   ├── categories/              # Category CRUD
│   ├── users/                   # User management, profile, reset password
│   └── guest/                   # Public homepage, "view all events", info pages
│
└── shared/
    ├── components/              # event-card, generic-table, page-hero, confirmation-dialog,
    │                            # loading-spinner, not-found, unauthorized
    ├── enums/                   # UserRoleEnum, etc.
    └── interfaces/
```

---

##  Roles & Route Access

| Route area | Guest | User | Organizer | Admin |
| --- | :---: | :---: | :---: | :---: |
| `/`, `/events` (browse) | ✅ | ✅ | ✅ | ✅ |
| `/auth/login`, `/auth/register` | ✅ | – | – | – |
| `/dashboard/calendar` | – | ✅ | ✅ | ✅ |
| `/dashboard/calendar/events/:id/booking` | – | ✅ | – | – |
| `/dashboard/bookings`, ticket view | – | ✅ | – | – |
| `/dashboard/bookings/tickets/scan` | – | – | ✅ | ✅ |
| `/dashboard/users` | – | – | – | ✅ |
| `/dashboard/categories` | – | – | – | ✅ |
| `/dashboard/venues` | – | – | – | ✅ |
| `/dashboard/user-profile` | – | ✅ | ✅ | ✅ |

Access is enforced with `AuthGuard` plus a `data: { roles: [...] }` property on each route, checked against the current user's role from `UserRoleEnum`.


##  Configuration

All backend endpoints are defined in one place:

```ts
// src/app/core/api/api-urls.ts
export const URLs = {
  apiBaseUrl: 'http://localhost:8082/api/',
  // auth, categories, venues, users, events, bookings, tickets...
};
```

To point the app at a different backend, update `apiBaseUrl` to match your API server.

**Key endpoints consumed by the app:**

| Domain | Endpoints |
| --- | --- |
| Auth | `auth/login`, `auth/register`, `users/password` |
| Categories | `categories`, `categories/paged`, `categories/:id` |
| Venues | `venues`, `venues/paged`, `venues/:id`, `venues/category/:categoryId` |
| Events | `events`, `events/paged`, `events/:id`, `events/:id/cancel` |
| Bookings | `bookings`, `bookings/:id`, `bookings/:id/cancel` |
| Tickets | `tickets/booking/:bookingId`, `tickets/:id`, `tickets/:ticketCode/check-in` |
| Users | `users` |

---

##  Core User Flows

1. **Discover** — A guest browses events on the homepage or `/events`.
2. **Authenticate** — The guest signs up / logs in; guest-only routes redirect once authenticated.
3. **Browse the calendar** — A logged-in user explores events on the interactive calendar.
4. **Book** — The user selects an event, proceeds through the booking flow, reviews the booking summary, and pays via the payment card component.
5. **Get tickets** — A ticket (with QR code) is issued per booking and viewable from the user's bookings.
6. **Check in** — At the venue, an organizer/admin opens the ticket scanner, scans the attendee's QR code, and the ticket is checked in via the API.
7. **Administer** — Admins manage users, venues, and categories from dedicated dashboard sections; organizers create/edit events from the calendar.



<p align="center">Built with ❤️ by EventMe</p>
