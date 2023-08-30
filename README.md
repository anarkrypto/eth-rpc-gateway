# Eth RPC Proxy
A JSON RPC gateway for EVM compatible networks. Allows contract events caching and runs on EDGE.

This project is made with Hono web framework and its deployed on Cloudflare Workers using D1 as database.

### 🚧 Work in progress!
We are in alpha, not recommended for production use yet.

#### TODO:

- [x] Implement JSON-RPC gateway
- [x] Implement D1 database
- [x] Conciliate remote and cached logs
- [ ] Implement contract sync
- [ ] Implement authentication
- [ ] Add logger
- [ ] Add documentation
- [ ] Add unit tests
- [ ] Publish initial release
- [ ] Publish article

### Running locally
```
pnpm install
pnpm dev
```

### Deploy to Cloudflare Workers
```
pnpm run deploy
```