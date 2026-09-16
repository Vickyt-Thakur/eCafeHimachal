# eCafeHimachal

**Online Services Made Simple** — a private digital-service platform for customers and cyber-cafe partners. eCafeHimachal is not an official government website and is not affiliated with, endorsed by, or officially connected to a government department or authority.

## Phase 1 setup

### Prerequisites

- Node.js LTS
- A MongoDB Atlas cluster (no MongoDB Community Server is required)
- VS Code

### Install dependencies

From the project root:

```powershell
npm run install:all
```

### Configure the environment

In PowerShell, from the project root:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Set `backend/.env` with your MongoDB Atlas connection string and private secrets. Do not commit this file:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/ecafehimachal
JWT_SECRET=use_a_long_unique_random_secret
PORT=5000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=choose_a_strong_initial_password
```

In MongoDB Atlas, create a database user, add your current IP address to the cluster Network Access list, and replace the placeholders above with its encoded username/password and cluster host. The database name may remain `ecafehimachal`.

### Start the app

From the project root:

```powershell
npm run dev
```

Open `http://localhost:5173` for the website, then visit `http://localhost:5000/api/health` to confirm the API is running. The backend prints `MongoDB Atlas Connected Successfully` before it starts accepting requests; it exits if the database is unavailable.

### Deploy with Docker on EC2

Install Docker and the Docker Compose plugin on the EC2 instance, then copy the project to the server. Create `backend/.env` and set the MongoDB connection, JWT secret, admin credentials, and production integrations. Do not commit this file.

From the project root, set the public URL used by the backend and start the production containers:

```bash
export FRONTEND_URL=http://YOUR_EC2_PUBLIC_IP
docker compose up -d --build
docker compose run --rm backend npm run seed
```

Allow inbound TCP port 80 in the EC2 security group, then open `http://YOUR_EC2_PUBLIC_IP`. The admin login is at `/admin/login`. The frontend container serves the React build and proxies `/api` requests to the backend container; the backend port does not need to be publicly exposed.

For a real domain, point DNS to the instance and put HTTPS in front of the nginx container. Set `FRONTEND_URL` to the HTTPS origin and keep `NODE_ENV=production` so authentication cookies are secure.

## Current phase scope

Phase 1 provides the frontend/backend foundation, MongoDB connection, secure baseline middleware, environment templates, and a landing-page shell. Authentication, data models, services, payments, receipts, WhatsApp workflow, and admin features will be added in later phases.

## Phase 2: authentication

After copying the environment files, set a strong `JWT_SECRET`, an admin email, and an admin password in `backend/.env`. Then create or update the private first admin account. The seed command hashes `ADMIN_PASSWORD` with bcrypt before storing it:

```powershell
cd backend
npm run seed
```

Customer registration is available at `/customer/register`; partner registration is available at `/partner/register`; a partner remains pending until an admin approves them. Separate role-specific login pages are `/customer/login`, `/partner/login`, and `/admin/login`. The backend rejects an account submitted to the wrong role-specific login endpoint.

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
