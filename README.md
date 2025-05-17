# Deploy-It: Cloud Deployment Platform
If you want to know more about it, you can read it 
[here](https://vercel.com/blog/behind-the-scenes-of-vercels-infrastructure).


## Tech Stack

* **Storage**: AWS S3 / Cloudflare R2 (Bucket)
* **Queue**: Redis (FIFO Queue)
* **Backend**: Node.js, Express
* **Frontend**: React, TailwindCSS


## Architecture Overview

The platform is composed of four core services:

1. **Web Interface**
2. **Upload Service**
3. **Deploy Service**
4. **Request Handler Service**


### 1. Web Interface

* **Tech**: React + TailwindCSS
* **Function**:

  * Accepts a GitHub repository URL from the user.
  * Sends a POST request to the Upload Service with the repo URL.
  * Receives a `projectId` in response.
  * Polls project status (`uploading`, `building`, `deployed`) via status endpoint.
  * Displays final deployed URL: `https://<projectId>.parentdomain.com`.


### 2. Upload Service

* **Tech**: Node.js + Express
* **Endpoint**: `POST /upload`, `GET /status`
* **Request Body**: `{ repoUrl: string }`
* **Response**: `{ projectId: string }`
* **Workflow**:

  * Generates a unique `projectId`.
  * Clones/downloads the GitHub repository locally.
  * Uploads the raw source code to a storage bucket under path: `output/<projectId>/`.
  * Pushes the `projectId` into Redis queue: `build-queue`.


### 3. Deploy Service

* **Tech**: Node.js + Express
* **Function**:

  * Continuously polls the Redis `build-queue`.
  * On receiving a `projectId`:

    * Downloads source from `output/<projectId>/`.
    * Runs build commands (e.g., `npm install && npm run build`).
    * Uploads the compiled output to `build/<projectId>/` in the bucket.
    * Optionally updates project status (for polling on UI).


### 4. Request Handler Service

* **Tech**: Node.js + Express + HTTP Proxy Logic
* **Function**:

  * Handles wildcard subdomain routing: `*.parentdomain.com`.
  * Extracts `projectId` from the subdomain and `filepath` from request path.
  * Fetches file from bucket: `build/<projectId>/<filepath>`.
  * Serves file as static response (with correct MIME type and caching headers).
  * Acts as a CDN-like layer to deliver deployed assets.


## Example Flow

1. **User submits**: `https://github.com/user/repo`
2. **Frontend → Upload Service**: `POST /upload`
3. **Upload Service**:

   * Generates `projectId = abc123`
   * Clones & uploads source
   * Pushes `abc123` to Redis
4. **Deploy Service**:

   * Picks `abc123`, builds, uploads build output
5. **Request Handler**:

   * Serves files from `https://abc123.parentdomain.com/index.html`
