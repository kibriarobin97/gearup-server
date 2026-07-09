# GearUp 🏋️
**"Rent Sports & Outdoor Gear Instantly"**

A backend REST API for a sports and outdoor equipment rental service. Customers can browse gear, place rental orders, and pay online. Providers manage their inventory and fulfill orders. Admins oversee the entire platform.

**Live API:** https://gearup-server-mocha.vercel.app
**API Docs:** https://github.com/kibriarobin97/gearup-server/blob/main/gearup-server.postman_collection.json

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js + Express | REST API framework |
| TypeScript | Type safety |
| PostgreSQL + Prisma | Database + ORM |
| JWT (Access + Refresh Token) | Authentication |
| bcrypt | Password hashing |
| SSLCommerz | Payment gateway |
| Vercel | Deployment |

---

## 👥 Roles & Permissions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Customer** | Users who rent sports gear | Browse gear, place rental orders, make payments, track order status, leave reviews, manage profile |
| **Provider** | Gear vendors/rental shops | Manage gear inventory, view incoming orders, update order status |
| **Admin** | Platform moderators | Manage all users, oversee all rentals, manage gear/categories |

> Users select `CUSTOMER` or `PROVIDER` during registration. `ADMIN` accounts are seeded directly into the database and cannot be created via public registration.

---

## 🔐 Authentication Flow

1. User registers with `name`, `email`, `password`, and optionally `role` (`CUSTOMER` / `PROVIDER`) — if `role` is not provided, it defaults to `CUSTOMER`
2. Password is hashed with bcrypt before storing
3. On login, server verifies credentials and issues:
   - **Access Token** (short-lived, 1 day) — sent as httpOnly cookie + in response body
   - **Refresh Token** (long-lived, 7 days) — sent as httpOnly cookie only
4. `POST /api/auth/refresh-token` issues a new access token using a valid refresh token, without requiring the user to log in again
5. Role-based middleware (`auth("ADMIN")`, `auth("PROVIDER")`, etc.) protects restricted routes

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register as customer or provider |
| POST | `/api/auth/login` | Public | Login, returns access + refresh token |
| POST | `/api/auth/refresh-token` | Public | Get new access token using refresh token |
| GET | `/api/auth/me` | Authenticated | Get current logged-in user |

### Gear (Public)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/gear` | Public | Get all gear (filter by category, price, brand) |
| GET | `/api/gear/:id` | Public | Get single gear details |
| GET | `/api/categories` | Public | Get all gear categories |

### Rental Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/rentals` | Customer | Create a new rental order |
| GET | `/api/rentals` | Customer | Get logged-in customer's own orders |
| GET | `/api/rentals/:id` | Customer / Provider / Admin | Get single order details (ownership checked) |

### Payments (SSLCommerz)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/payments/create` | Customer | Initiate payment session for a `CONFIRMED` order |
| POST | `/api/payments/success` | SSLCommerz callback | Marks payment `COMPLETED` and order `PAID` |
| POST | `/api/payments/fail` | SSLCommerz callback | Marks payment `FAILED` |
| POST | `/api/payments/cancel` | SSLCommerz callback | Marks payment `FAILED` / cancelled |
| GET | `/api/payments` | Customer | Get logged-in user's payment history |
| GET | `/api/payments/:id` | Customer / Admin | Get single payment details |

### Provider
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/provider/gear` | Provider | Add new gear to inventory |
| PUT | `/api/provider/gear/:id` | Provider | Update own gear listing |
| DELETE | `/api/provider/gear/:id` | Provider | Remove gear from inventory |
| GET | `/api/provider/orders` | Provider | View incoming orders for own gear |
| PATCH | `/api/provider/orders/:id` | Provider | Update order status (`CONFIRMED`, `PICKED_UP`, etc.) |

### Reviews
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/reviews` | Customer | Leave a review after gear is returned |

### Admin
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/admin/users` | Admin | View all users |
| PATCH | `/api/admin/users/:id` | Admin | Suspend / activate a user |
| GET | `/api/admin/gear` | Admin | View all gear listings |
| GET | `/api/admin/rentals` | Admin | View all rental orders |

---

## 🗃️ Database Schema (Prisma)

**Users** — id, name, email, password (hashed), phone, role (`CUSTOMER`/`PROVIDER`/`ADMIN`), status (`ACTIVE`/`SUSPENDED`)

**GearItem** — id, name, description, pricePerDay, brand, model, totalStock, availableCount, categoryId, providerId

**Category** — id, name

**RentalOrder** — id, customerId, gearId, startTime, endTime, quantity, totalPrice, status (`PLACED` → `CONFIRMED` → `PAID` → `PICKED_UP` → `RETURNED` / `CANCELLED`)

**Payment** — id, transactionId, amount, status (`PENDING`/`COMPLETED`/`FAILED`), rentalOrderId, meta (raw gateway response)

**Review** — id, customerId, gearId, rating, comment

---

## 🔄 Rental Order Status Flow

```
                              ┌──────────────┐
                              │    PLACED    │
                              └──────────────┘
                               /            \
                              /              \
                       (provider)       (customer)
                        confirms         cancels
                            /                \
                           ▼                  ▼
                    ┌──────────────┐   ┌──────────────┐
                    │  CONFIRMED   │   │  CANCELLED   │
                    └──────────────┘   └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    PAID      │
                    │ (SSLCommerz) │
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  PICKED_UP   │
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  RETURNED    │
                    └──────────────┘
```

- A customer can only pay for an order once it is `CONFIRMED` by the provider.
- Cancelling an order restores the gear's `availableCount`.

---

## ✅ Key Implementation Highlights

- **Server-side price calculation** — `totalPrice` is always calculated on the backend (`pricePerDay × quantity × rental days`), never trusted from client input.
- **Stock management** — `availableCount` is decremented on order creation and restored on cancellation.
- **Ownership-based access control** — endpoints like `GET /api/rentals/:id` verify the requester is the order's customer, the gear's provider, or an admin before returning data.
- **Consistent error responses** — all errors return `{ success: false, message, errorDetails }` via a centralized error handler and a custom `ApiError` class.
- **Input validation** — request `body`/`params`/`query` validated on major endpoints before reaching controllers.
- **Secure auth** — passwords hashed with bcrypt, JWT access/refresh tokens stored in httpOnly cookies, refresh-token rotation endpoint for silent re-authentication.

---

## 🚀 Getting Started

```bash
# install dependencies
npm install

# generate Prisma client
npx prisma generate

# run migrations
npx prisma migrate dev

# seed admin user (and categories/sample data if applicable)
npx prisma db seed

# start development server
npm run dev
```

---

## 🧪 Testing

All endpoints tested via Postman. Collection covers:
- Customer flow (register → login → browse gear → place order → pay → review)
- Provider flow (register → login → add gear → confirm/update orders)
- Admin flow (view users → suspend user → view all rentals)

See API Documentation link above for the full Postman collection.
