templates/
│
├── base/
│   ├── base.html
│   ├── auth_base.html
│   └── dashboard_base.html
│
├── components/
│   ├── navbar.html
│   ├── sidebar.html
│   ├── footer.html
│   ├── loader.html
│   ├── toast.html
│   ├── modal.html
│   ├── breadcrumbs.html
│   └── pagination.html
│
├── authentication/
│   ├── login.html
│   ├── register.html
│   ├── forgot_password.html
│   └── reset_password.html
│
├── dashboard/
│   └── dashboard.html
│
├── users/
├── roles/
├── employees/
└── settings/


static/
│
├── css/
│   ├── base.css
│   ├── variables.css
│   ├── auth.css
│   ├── dashboard.css
│   ├── navbar.css
│   ├── sidebar.css
│   ├── table.css
│   ├── forms.css
│   └── responsive.css
│
├── js/
│   ├── api.js
│   ├── auth.js
│   ├── common.js
│   ├── sidebar.js
│   ├── dashboard.js
│   ├── toast.js
│   ├── loader.js
│   └── validation.js
│
├── images/
├── icons/
├── fonts/
└── vendors/


base.html
        │
        ├──────────────┐
        │              │
        ▼              ▼
auth_base.html   dashboard_base.html
        │              │
        ▼              ▼
 login.html      dashboard.html
 register.html   users.html
 forgot.html     roles.html


 hai.

Matlab koi bhi normal registration karega → automatically EMPLOYEE banega.

ADMIN/HR baad me dashboard se create karega.

Next hum dashboard_base.html + sidebar role based banayenge.