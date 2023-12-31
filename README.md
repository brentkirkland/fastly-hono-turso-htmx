# Fastly Hono Turso HTMX

(What a mouth full)

This is an example project how to build a serverless htmx UI that connects to a SQLite db.

Check out the demo: https://www.surf.rodeo
NOTE: This project is using Turso's free tier with replicas in Los Angeles, Virginia, and Chicago. If you are outside the US, you may witness some latency.

## Stack

- Fastly's Compute@Edge
- Hono.js
- Turso (LibSQL)
- HTMX

## Get starts

### Turso (or LibSQL)

Turso quickly spins up a (distributed) libsql (a fork of sqlite) db. It uses fly.io under the hood making it easy to create replicas across 20+ regions.

To get started follow the setup guide here: https://docs.turso.tech/reference/turso-cli

You are not required to signup, turso cli includes `turso dev` which runs a libsql instance locally. If you wish to deploy on fastly, you will need a publically available libsql db though.

### fastly.toml

Run the following commands

```
cp fastly.toml.example fastly.toml
```

Add your Turso URL and Auth Token to the toml file.

### Local dev

```
pnpm install
pnpm run dev
```

```
open http://localhost:7676
```

### Deploy to fastly

```

fastly deploy --token=TOKEN --service-id=SERVICE_ID
fastly backend create --name=db --address=DB_URL --service-id=SERVICE_ID --token=TOKEN --version=active --autoclone --port=443

# Listen to logs
fastly log-tail --service-id=SERVICE_ID --token=TOKEN
```

### Inspired by

- https://github.com/fvucemilo/beth-stack

### Notes

- Add a backend via fastly cli
