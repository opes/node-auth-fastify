# node-auth-fastify
This project is a demo for a simple user registration and authentication flow. It uses Node.js & fastify for the web server, MongoDB for the database, and a lightweight HTML/JS web client for the UI. It has JWTs and server-side sessions, email verification, and password resetting.

## Getting Started
### Prerequisites
You'll need [Caddy](https://caddyserver.com/docs/install) for running the API and UI servers.

You'll also need to add the following to your `/etc/hosts` file:

```
127.0.0.1   nodeauth.dev
127.0.0.1   api.nodeauth.dev
```

### Running the Project
After you've installed Caddy and set up your hosts file, clone down the project:
```bash
git clone git@github.com:opes/node-auth-fastify.git
```

Then, install the API dependencies and start the server:
```bash
cd node-auth-fastify/api
npm i
cp .env-example .env
```

Then, install the web UI dependencies and start the server:
```bash
cd node-auth-fastify/web
npm i
cp .env-example .env
```

Finally, from the root of the project, run Caddy:
```bash
cd node-auth-fastify
caddy run
```
