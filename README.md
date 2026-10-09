# W2E Campus 🌱

**W2E Campus** is an AI-assisted campus waste management prototype. It helps users identify visible waste materials, estimate approximate waste weight from a photo, explore responsible waste-routing options, and record sustainability activities.

> **Project status:** Prototype. AI-generated weights are estimates, not physical measurements. Demo dashboard data and browser-stored activity records should not be treated as verified campus operational data.

## Features

- **Waste Analyzer:** Describe waste or upload a photo to help identify waste materials and estimate approximate weight.
- **AI photo-based weight estimation:** Uses a vision-capable model through the Node.js backend and Ollama Cloud API.
- **Waste-routing recommendations:** Uses a deterministic waste-routing engine to suggest suitable handling options based on the detected materials.
- **Dashboard:** Visualizes example campus waste zones and trends. Demo data should be labelled as illustrative.
- **My Impact:** Lets users submit sustainability activities with photo evidence and an AI-generated weight estimate.
- **Pending Green Points:** New photo-based activity points remain pending rather than being awarded immediately.
- **Leaderboard:** Displays prototype participation/impact information.
- **Responsive interface:** React, Vite, React Router, CSS, and Recharts/other page-level libraries used by the app.

## Main routes

| Route | Page |
|---|---|
| `/` | Home |
| `/analyzer` | Waste Analyzer |
| `/dashboard` | Dashboard |
| `/impact` | My Impact |
| `/leaderboard` | Leaderboard |

## Tech stack

- React
- Vite
- React Router
- Node.js and Express
- Multer for image uploads
- Ollama Cloud API through an OpenAI-compatible client
- CSS for styling

## Requirements

- Node.js 20 or newer
- npm
- An Ollama Cloud API key
- A vision-capable model available to your Ollama account

## Setup

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>
```

Replace the placeholders with your repository URL and project folder.

### 2. Install frontend dependencies

From the React/Vite project root:

```bash
npm install
```

### 3. Configure the Vite proxy

Ensure `vite.config.js` preserves the React plugin and contains a development proxy to the backend:

```js
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
```

If your existing Vite configuration has other options, merge the proxy into it rather than replacing unrelated settings.

### 4. Configure the AI backend

Open a terminal in `w2e-ai-backend` and install its dependencies:

```bash
npm install
```

Create a `.env` file inside `w2e-ai-backend` (copy `.env.example` if the file exists). Add your own Ollama Cloud key and a vision-capable model available to your account:

```env
OLLAMA_API_KEY=your_actual_ollama_key
OLLAMA_MODEL=gemma4:31b
PORT=3001
```

The model name above is an example; confirm model availability and image-input support for your account. Never commit the real `.env` file or expose the API key in frontend code.

### 5. Start the backend

In the `w2e-ai-backend` terminal:

```bash
npm run dev
```

The API should listen at:

```text
http://localhost:3001
```

Check its health endpoint:

```text
http://localhost:3001/api/health
```

A successful health response is:

```json
{"ok":true}
```

### 6. Start the frontend

Open a second terminal in the React/Vite project root:

```bash
npm run dev
```

Open the local URL printed by Vite. Keep both the backend and frontend terminals running during development.

## API endpoint

### `POST /api/estimate-weight`

Accepts a multipart form upload with the image in the `image` field. Supported image formats depend on backend validation (JPEG, PNG, WebP, and GIF are accepted by the current implementation).

A successful response has this general structure:

```json
{
  "materials": [
    {
      "id": "plastic",
      "label": "Plastic bottles",
      "estimatedKg": 0.5
    }
  ],
  "estimatedWeightKg": 0.5,
  "minWeightKg": 0.2,
  "maxWeightKg": 0.9,
  "confidence": "low",
  "notes": "Visual estimate only.",
  "disclaimer": "Photo-based estimate; not a measured weight."
}
```

The values above are illustrative, not a prediction for a real photo. The API can return an error if the image is invalid, the model is unavailable, authentication fails, or the model output cannot be parsed.

## How photo-based estimation works

1. The frontend uploads an image to the Express backend.
2. The backend validates the uploaded image and sends it to a vision-capable Ollama Cloud model.
3. The model returns visible material categories and an approximate weight estimate with a low/high range.
4. The frontend can display the estimate and let the user review the result.
5. The waste-routing engine uses material information to generate recommendations.

A single image without a known size reference cannot reliably establish mass. Perspective, density, moisture, packaging, hidden contents, and image framing can cause substantial error. The estimate must not be represented as a measured or guaranteed weight.

## Green Points and anti-cheat limitations

The My Impact flow is a prototype intended to make abuse harder by requiring photo evidence, using AI-estimated weights, checking for duplicate images in the available activity history, and keeping points pending.

These client-side measures are **not cheat-proof**:

- `localStorage` can be modified by the user and is not a secure database.
- Client-side image hashes can be bypassed with edited, cropped, or re-encoded images.
- An AI model can make mistakes or be manipulated.
- A photo estimate alone does not prove that the user collected or recycled the waste.

Before awarding real points, implement server-side authentication, persistent backend storage, server-side duplicate detection, rate limits, audit logs, and an approval process. Only the server should make the final decision to award points.

## Security

- Keep secrets in backend environment variables.
- Do not use `VITE_` variables for private API keys; Vite exposes those values to client-side code.
- Add `.env` to `.gitignore`.
- Never commit API keys, credentials, or real user evidence to a public repository.
- Restrict upload size and validate file types on the backend.
- For production, add authentication, rate limiting, secure evidence storage, request logging, and appropriate retention/privacy policies.

Example `.gitignore` entries:

```gitignore
.env
.env.*
!.env.example
node_modules/
dist/
```

If a secret has already been pushed to GitHub, revoke/rotate it; removing the file in a later commit does not remove the secret from repository history.

## Current limitations

- Photo-based weights are approximate and may have wide uncertainty.
- AI model availability, image support, API limits, and pricing depend on the Ollama Cloud account and selected model.
- Demo dashboard/leaderboard data may be illustrative.
- Browser-stored activity history is suitable only for a prototype.
- The project does not by itself verify actual waste collection or recycling at a campus facility.

## Future improvements

- Server-side user accounts and database persistence
- Admin review and approval workflow for Green Points
- Backend duplicate-image and abuse detection
- More reliable weight estimation using size references or physical measurements
- Verified campus waste data and facility-specific routing rules
- Tests, monitoring, and production deployment configuration

## License

Add the license appropriate for your project before distributing or accepting contributions.
