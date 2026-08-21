# Optional DNS override

If MongoDB Atlas SRV lookups fail in Node with `querySrv ECONNREFUSED` while Windows DNS lookups succeed, add this line to `server/.env`:

```env
DNS_SERVERS=1.1.1.1,8.8.8.8
```

Leave `DNS_SERVERS` empty on machines that do not need the override.
