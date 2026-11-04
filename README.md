# En de goedemorgen

Trigger Thursday soundboard for [popijn.nl](https://popijn.nl). It only works on Thursdays (Europe/Amsterdam time). On other days it says "Het is nog geen trigger thursday".

## Adding a sound

1. Put the `.mp3` in `public/sounds/`.
2. Add an entry to `public/sounds.json`:
   ```json
   { "label": "Naam", "file": "bestand.mp3", "emoji": "🐈" }
   ```

## Local development

```sh
npm install
npm run dev
```

Open `http://localhost:8787/?force` to test the board on a day that isn't Thursday. `?force` only works on localhost.

## Deploy (Cloudflare Workers static assets, free)

```sh
npx wrangler login
npm run deploy
```

Or connect this GitHub repo in the Cloudflare dashboard (Workers & Pages → Create → Import a repository) so every push deploys automatically.

### Hooking up popijn.nl (TransIP)

1. In Cloudflare: **Add a domain** → `popijn.nl` (Free plan).
2. In TransIP, set the nameservers for `popijn.nl` to the two Cloudflare nameservers you're given. Turn off TransIP DNSSEC first.
3. Once the domain is active in Cloudflare: Workers & Pages → `en-de-goedemorgen` → Settings → Domains & Routes → Add → Custom domain → `popijn.nl` (and `www.popijn.nl` if you want it).
