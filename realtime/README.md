# Live shared workspaces

`npm run dev` and `npm run start` use the custom [server](../server.mjs), which serves Next.js and upgrades `/api/realtime` to WebSocket on the same port. Run one persistent Node process and allow WebSocket upgrades through the reverse proxy. Restart the development server after pulling these changes.

The socket requires a short-lived token issued by the authenticated [token route](../app/api/realtime-token/route.ts). The server checks the project's database permissions at connection time and before relaying each edit. Viewers receive updates; only owners and editors can send them. The merged scene is saved to `whiteBoardData`.

Rooms are kept in this process's memory. A deployment with multiple application instances needs shared pub/sub and coordination before live edits will cross instances. Serverless hosts that do not keep a Node process open cannot run this WebSocket server.
