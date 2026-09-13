# eCafeHimachal

**Online Services Made Simple** — a simple digital-service platform for customers and cyber-cafe partners.

## Phase 1 setup

### Prerequisites

- Node.js LTS
- MongoDB Community Server running locally
- VS Code

### Install dependencies

From the project root:

```powershell
npm run install:all
```

### Configure local environment

In PowerShell, from the project root:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

`backend/.env` defaults to a local MongoDB database named `ecafehimachal`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/ecafehimachal
```

### Start the app

From the project root:

```powershell
npm run dev
```

Open `http://localhost:5173` for the website, then visit `http://localhost:5000/api/health` to confirm the API is connected to MongoDB.

## Current phase scope

Phase 1 provides the frontend/backend foundation, MongoDB connection, secure baseline middleware, environment templates, and a landing-page shell. Authentication, data models, services, payments, receipts, WhatsApp workflow, and admin features will be added in later phases.

## Phase 2: authentication

After copying the environment files, set a strong `JWT_SECRET`, an admin email, and an admin password in `backend/.env`. Then create the private first admin account:

```powershell
cd backend
npm run seed
```

Customer registration is available at `/register`. Partner registration is available at `/partner/register`; a partner remains pending until an admin approves them in the future admin-management phase. The admin login is `/admin/login`.

## Phase 3: services

Run the seed command again after Phase 3 to add the initial service catalog:

```powershell
npm run seed --prefix backend
```

Administrators manage services at `/admin/services`. The public catalog uses the customer price; approved partners see the partner price after logging in.

## Phase 4: orders

Customers and approved partners create an order from their protected service catalog. The backend fetches the selected service and calculates the appropriate price, so a browser cannot change the payable amount. New orders remain `PENDING_PAYMENT` until the Razorpay phase.

## Phase 5: Razorpay Test Mode

Create a Razorpay account, use its **Test Mode** API keys, and add them only to `backend/.env`:

```env
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

Restart the backend after saving the file. The browser receives only the Razorpay key ID. Payment amounts are calculated from the stored service and verified by the backend using the Razorpay signature.

## Phase 6: receipts

Every successfully verified Razorpay payment gets a unique receipt number in the format `ECH-REC-YYYY-XXXXXX`. Customers and partners can view payment history and download their own PDF receipts. Admins can access all receipts at `/admin/receipts`.

## Phase 7: WhatsApp workflow

Set `ADMIN_WHATSAPP_NUMBER` in `backend/.env` using digits only, with India's country code `91` (for example, `918920302813`). After a successful verified payment, the order page shows a WhatsApp button with an order-specific pre-filled message. Customers and partners exchange all documents directly in WhatsApp; the website does not store documents.

## Phase 10: testing and security

Run backend checks from the `backend` folder:

```powershell
node test/security.test.js
```

The automated test runner can also be run with `npm test`. The test suite verifies server-side role pricing and safe WhatsApp link generation. Private APIs enforce authentication and roles; customers and partners can only query orders associated with their own account.
