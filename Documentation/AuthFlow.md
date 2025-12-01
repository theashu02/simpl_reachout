┌────────────────────────────────────────────────────┐
│                   USER ACTION                      │
└────────────────────────────────────────────────────┘
                ↓  clicks "Continue with Google"

┌──────────────────────────────────────────────┐
│ SignInButton (Client)                        │
│ signIn("google", { callbackUrl: "/dashboard"})│
└──────────────────────────────────────────────┘
                ↓ POST /api/auth/signin/google

┌──────────────────────────────────────────────┐
│ NextAuth (App Router)                        │
│ Creates OAuth request                        │
│ Stores PKCE + state cookies                  │
└──────────────────────────────────────────────┘
                ↓ Redirect to Google

┌──────────────────────────────────────────────┐
│ Google Login Page                             │
└──────────────────────────────────────────────┘
                ↓ Returns authorization code

┌──────────────────────────────────────────────┐
│ /api/auth/callback/google                    │
│ NextAuth exchanges code → tokens             │
│ Builds normalized user object                │
└──────────────────────────────────────────────┘
                ↓

┌──────────────────────────────────────────────┐
│ callbacks.signIn                             │
│ Connect to MongoDB                           │
│ Create/update user row                       │
└──────────────────────────────────────────────┘
                ↓

┌──────────────────────────────────────────────┐
│ callbacks.jwt                                │
│ Build token payload:                         │
│   id, name, email, picture                    │
│ Return `token` object                         │
└──────────────────────────────────────────────┘
                ↓

┌──────────────────────────────────────────────┐
│ NextAuth signs + encrypts JWT                │
│ Stores in cookie:                            │
│ next-auth.session-token                      │
└──────────────────────────────────────────────┘
                ↓ Redirect /dashboard

┌──────────────────────────────────────────────┐
│ Server Components (getServerAuthSession)     │
│ Read cookie → verify → jwt → session         │
│ Return session.user                          │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ Client (SessionProvider / useSession)        │
│ Fetch /api/auth/session                      │
│ Decode cookie → jwt → session                │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ Dashboard backend call (BackendAuthProbe client)          │
│ fetch("/api/backend/profile")                             │
│ Sends browser cookies (NextAuth session token)            │
└──────────────────────────────────────────────────────────┘
                ↓

┌──────────────────────────────────────────────────────────┐
│ Next.js route /api/backend/profile                        │
│ getToken({ req, raw: true }) → signed JWT                 │
│ Forward Authorization: Bearer <jwt> to Bun microservice   │
└──────────────────────────────────────────────────────────┘
                ↓

┌──────────────────────────────────────────────────────────┐
│ Bun + Elysia microservice (/api/protected/profile)        │
│ jwtVerify(token, NEXTAUTH_SECRET)                         │
│ Rejects invalid tokens → 401                              │
│ Returns protected payload when token is valid             │
└──────────────────────────────────────────────────────────┘
                ↓

┌──────────────────────────────────────────────────────────┐
│ Dashboard UI updates                                      │
│ Shows backend response / errors                           │
└──────────────────────────────────────────────────────────┘


