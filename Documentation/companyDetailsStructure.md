UserCompanyDetails Document:
├── userId (unique) - User's ID from auth
├── email - User's email
├── companies[] - Array of company details
│   ├── company_name
│   ├── exists
│   ├── domain
│   ├── url
│   ├── confidence (0-100)
│   ├── title
│   ├── description
│   ├── verified
│   ├── source
│   ├── linkedin_url
│   └── logo_url
├── createdAt
└── updatedAt