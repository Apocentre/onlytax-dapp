# Build

```bash
docker buildx build \
--platform linux/amd64  -f ./operations/Dockerfile ./ \
--ssh default \
-t ghcr.io/apocentre/onlytax-dapp:0.1.0
```
