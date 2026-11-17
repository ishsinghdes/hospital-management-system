# Local 3D engine

`three.js` is a locally bundled IIFE of **Three.js 0.187.0 / r187**, published under the MIT license. See `THREE-LICENSE.txt` for the full upstream notice. No runtime CDN or network request is required.

- Upstream: https://threejs.org/ and https://github.com/mrdoob/three.js
- Pinned package: https://registry.npmjs.org/three/-/three-0.187.0.tgz
- Verified package SHA-512: `Qiu7R+Cmh8CstZsY1uJOSWnVlfo7ZtNLV7mF8Jltk3LB3AtDu9cRZlcnRKkAk8Y4z6KKw35z7Y7Urd7jWY8etA==`
- Bundle entry: `import * as THREE from './build/three.module.js'; window.THREE = THREE;`
- Bundler: esbuild 0.25.0, `--bundle --minify --format=iife --legal-comments=inline`.

The hospital, beds, cabinets, courtyard, labels and staff activity are original procedural models and interface code in `floor-plan.js`. No third-party 3D models, photographs, reference artwork or textures are embedded.
