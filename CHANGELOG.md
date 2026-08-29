# Changelog

## [1.0.2](https://github.com/pixelasticity/Almsby/compare/v1.0.1...v1.0.2) (2026-08-29)


### Bug Fixes

* **barcode:** replace mounted setState-in-effect with useSyncExternalStore ([0b6f189](https://github.com/pixelasticity/Almsby/commit/0b6f1892a9677a880cb44e80735c91e690514283))
* **env,barcode:** literal NEXT_PUBLIC access + log URI-construction failures ([a83b721](https://github.com/pixelasticity/Almsby/commit/a83b721c6a194a8fd8ca04273dadea75876f2467))

## [1.0.1](https://github.com/pixelasticity/Almsby/compare/v1.0.0...v1.0.1) (2026-08-29)


### Bug Fixes

* **barcode:** defer DualMarkLabel render past hydration to avoid mismatch ([e389520](https://github.com/pixelasticity/Almsby/commit/e38952033cb8baa44f1eddc311ad9c617c7f9295))
* **env,barcode:** localhost guard + normalize GTIN to GTIN-14 for DualMarkLabel ([58d7458](https://github.com/pixelasticity/Almsby/commit/58d74589c86e92b8baa4bb4d614388a3c54665b9))
* **env:** skip localhost guard in CI builds ([0b842cb](https://github.com/pixelasticity/Almsby/commit/0b842cb9eb80602953483171b358a6e072bc6a28))

## 1.0.0 (2026-08-28)


### Features

* **app:** branded 404 and error boundary pages ([b0b8c70](https://github.com/pixelasticity/Almsby/commit/b0b8c705b7afa92d1bbb390907144ec1474f8a65))
* **app:** branded 404 and error boundary pages ([4a36103](https://github.com/pixelasticity/Almsby/commit/4a36103a89714484c259d0efbeffa3c21d9dec05))
* **barcode:** GS1 Digital Link QR + DataMatrix dual-mark render + print route ([#6](https://github.com/pixelasticity/Almsby/issues/6)) ([e594979](https://github.com/pixelasticity/Almsby/commit/e594979fd795ab90f069d69376fd1f0563784e35))
* **barcode:** GS1 Digital Link QR + DataMatrix dual-mark render + print route ([#6](https://github.com/pixelasticity/Almsby/issues/6)) ([a3f68b0](https://github.com/pixelasticity/Almsby/commit/a3f68b0bf2bc4dab438f5091445b3b8b9d62b54f))
* **business:** post-registration business onboarding wizard ([24e883a](https://github.com/pixelasticity/Almsby/commit/24e883a87a061d04ce333bc07e013287d71aa36d))
* **business:** post-registration business onboarding wizard (#) ([3c35c8e](https://github.com/pixelasticity/Almsby/commit/3c35c8e1b4cfe39d5e5ce1bc107fc2afbff712a5))
* **concierge:** guided GTIN setup + sequential allocation ([#4](https://github.com/pixelasticity/Almsby/issues/4)) ([df04b70](https://github.com/pixelasticity/Almsby/commit/df04b70694d184e146657e2a831dd9fcc77346e6))
* **concierge:** guided GTIN setup with sequential allocation under a GS1 prefix ([#4](https://github.com/pixelasticity/Almsby/issues/4)) ([f29ce66](https://github.com/pixelasticity/Almsby/commit/f29ce662a0905d58d7db84fd3c500dfae9237dd1))
* **dev:** local Supabase CLI flow; gated migration deploy; fix CI trigger branches ([91b504d](https://github.com/pixelasticity/Almsby/commit/91b504da6a3d2e36ef208dbc1ea68ade814ab0e6))
* **gs1:** resolve GTINs against the DB in /01/[gtin] ([f4d0a0d](https://github.com/pixelasticity/Almsby/commit/f4d0a0d02ffd3b8204b642d26f4a626eeceaca07))
* **gs1:** resolve GTINs against the DB in /01/[gtin] ([#8](https://github.com/pixelasticity/Almsby/issues/8)) ([d047e25](https://github.com/pixelasticity/Almsby/commit/d047e25e03600bb28b729e4dde1114b984e592da))
* **i18n:** next-intl cookie locale (en/es) + key-parity CI gate ([d8c81ee](https://github.com/pixelasticity/Almsby/commit/d8c81eefe09596f1c58e9fe59ea3f2df539c6694))
* **products:** friendly error when a GTIN is already claimed ([32570ff](https://github.com/pixelasticity/Almsby/commit/32570ffc39a7e051b8f4f9bd3caa5ce65f3495e8))
* **products:** GTIN import + classification ([#3](https://github.com/pixelasticity/Almsby/issues/3)) ([56f4552](https://github.com/pixelasticity/Almsby/commit/56f45527bdaf2bc74ff4948d7c99eb80352ca498))
* **products:** GTIN import + classification ([#3](https://github.com/pixelasticity/Almsby/issues/3)) ([e8d2afa](https://github.com/pixelasticity/Almsby/commit/e8d2afacd49dbcb9c1749798ac2d47c404e53bab))
* **products:** product creation form + core fields ([#2](https://github.com/pixelasticity/Almsby/issues/2)) ([a5fa9ef](https://github.com/pixelasticity/Almsby/commit/a5fa9ef69a4e3f9284c39caa827e40e1a9d5e6bf))
* **products:** product creation form with core fields ([#2](https://github.com/pixelasticity/Almsby/issues/2)) ([32b6b63](https://github.com/pixelasticity/Almsby/commit/32b6b63dd1e26a5ad71c4224189a017e2e5cd2f1))
* **resolver:** DB-backed /01/{gtin} lookup (404/503 split) ([#8](https://github.com/pixelasticity/Almsby/issues/8)) ([72bc27a](https://github.com/pixelasticity/Almsby/commit/72bc27ab323fcc3d8057109666c514572edf4528))


### Bug Fixes

* **business:** controlled inputs so onboarding wizard values survive step changes ([246f361](https://github.com/pixelasticity/Almsby/commit/246f361df8f9db85005553b5c511559086619170))
* **business:** controlled inputs so wizard values survive step changes ([9a9a1a0](https://github.com/pixelasticity/Almsby/commit/9a9a1a0085b84554ab808229182a10f469becb44))
* **business:** keep onboarding wizard steps in DOM so final submit carries all fields ([8a1fa50](https://github.com/pixelasticity/Almsby/commit/8a1fa508d20bc60b60380b3c6df78af5ebb33a7c))
* **business:** keep onboarding wizard steps in DOM so final submit carries all fields ([2ee2cae](https://github.com/pixelasticity/Almsby/commit/2ee2cae0363567da3d312ad91ee96978627174d1))
* **business:** keep wizard steps in DOM + move redirects out of try/catch ([763bfc1](https://github.com/pixelasticity/Almsby/commit/763bfc118d3bc54bff3495fd8d2ffe0d46871b1b))


### Performance Improvements

* **db:** index Business.ownerId and Product.businessId ([6a5bbb8](https://github.com/pixelasticity/Almsby/commit/6a5bbb8ab52a66706cdb46148edb4f3e2ed0d629))
* **db:** index Business.ownerId and Product.businessId ([e0b8b5f](https://github.com/pixelasticity/Almsby/commit/e0b8b5f5204cc6a64401964f4145df775138adb4))
* dedupe product-detail query and collapse barcode SVG nodes ([7dc3721](https://github.com/pixelasticity/Almsby/commit/7dc3721092be0817d51095c41de4fa78dee1f481))
* dedupe product-detail query and collapse barcode SVG nodes ([43ae026](https://github.com/pixelasticity/Almsby/commit/43ae0262ef4bb0b535e0adda0140b0cbad945259))
