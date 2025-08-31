# Youth Mental Health & Wellbeing Hub (Vue 3)
A minimal, **Vue 3 + Vite** application that satisfies the assignment feature list using the topic **Youth Mental Health and Wellbeing**.
## ✅ Features mapping
- **VueJS 3 framework**: Vite + Vue 3 + Composition API.
- **Responsive UI**: `assets/main.css` uses mobile-first layout, grids, and flex; test at different widths.
- **At least two input validations**: Email regex + password min length in Login/Register; comment length + link-ban in review form.
- **Dynamic data from JS**: See `src/data/resources.js` and its rendering in `Resources.vue`.
- **Basic authentication**: Local register/login with Pinia store + localStorage session.
- **Role-based auth (2 roles)**: `user` and `counselor`; route `/counselor` is protected by `router.beforeEach` and `meta.roles`.
- **Aggregated rating score**: `components/ReviewSection.vue` computes and displays average rating per resource.
- **Security measures (XSS)**: No `v-html`; `utils/sanitize.js` escapes HTML; CSP meta tag in `index.html`; link-blocking in comments.
- **Best practices**: Route guards, state isolation in Pinia, semantic UI, explicit input constraints.
## Run locally
```bash
npm install
npm run dev
# open http://localhost:5173/
```
### Test
Register a **User** and a **Counselor** account to verify role-based routing.
> Demo-only notice: For real apps, implement a backend with strong hashing, sessions, CSRF, and vetted sanitization.
