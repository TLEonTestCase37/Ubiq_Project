Ubiq — QR & Face Verification App

This is a Next.js project for QR + face-based verification and registration.

The app ensures only registered users can access features and provides functionality to:

Scan a person's QR code → decode → fetch user info.

Scan a person’s face → compute embedding → match/register in database.

Register a person → store face embedding and user data in Supabase, generate QR code.

Features / Algorithms Used

Authentication: Firebase Authentication (email/password). Users must log in to use the app.

QR Encryption: AES encryption/decryption via CryptoJS.AES. QR codes store encrypted user payloads.

Face Recognition: face-api.js using:

tinyFaceDetector (face detection)

faceLandmark68Net (landmarks)

faceRecognitionNet (128D embeddings)

Matching via Euclidean distance (threshold ~0.6).

Database: Supabase (PostgreSQL) stores user info and embeddings. Recommended column for face vector: jsonb.

Optional Email: Nodemailer (previously used for OTP verification).

Download & Run

Clone the repository

git clone git@github.com:<your-org>/<your-repo>.git
cd <your-repo>


Install dependencies

npm install
# or
yarn
# or
pnpm install


Set up environment variables
Create a .env.local at project root:

# Firebase (client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key

# Server-side secret for QR encryption
SECRET_KEY=your_secret_key_here


Keep SECRET_KEY server-side only in production.

Download face-api.js models
Create public/models and place the following model files:

tiny_face_detector_model-weights_manifest.json + weights

face_landmark_68_model-weights_manifest.json + weights

face_recognition_model-weights_manifest.json + weights

These are required for face detection/recognition.

Run the development server

npm run dev
# or
yarn dev
# or
pnpm dev


Visit http://localhost:3000
 to see the app.

Database Setup (Supabase)

Table users should have:

id — UUID primary key

name — text

email — text

roll_no — text

qr_key — text

face_vector — jsonb (128D embedding array)

How it Works

QR Flow:

Registration generates a random qr_key stored in DB.

QR payload = AES encryption of qr_key with SECRET_KEY.

Scanner → /api/decodeQr → decrypt → fetch user info.

Face Flow:

Capture/upload face → face-api.js generates 128D descriptor.

Compare with embeddings in DB → match if Euclidean distance < 0.6.

Store embeddings in face_vector (JSON).