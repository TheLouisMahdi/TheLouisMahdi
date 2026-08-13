# Comfy Cakes runtime provenance

The current browser runtime is an adapted build based on [adorzhang/Comfy-Cakes](https://github.com/adorzhang/Comfy-Cakes). The upstream repository was at commit `42ebf7636c1d49144bcb57448ff6814001ec4308` when this provenance note was added; this does not prove that the existing bundle was built from that exact commit.

Project-specific behavior includes difficulty selection through the iframe query string, single-cake mode, original sound playback, result messages, lifecycle pause messages, and keyboard shortcut forwarding.

The generated JavaScript bundles are deployment artifacts. Future gameplay changes should be made in a restored TypeScript source tree and rebuilt in production mode instead of editing minified bundles directly. Keep the exact source commit, dependency lockfile, build command, and generated asset hashes with any replacement build.

See the repository-level `THIRD_PARTY_NOTICES.md` for license and media-rights information.
