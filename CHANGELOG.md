# Changelog

## 1.0.0 (2026-09-19)


### Features

* **app:** branded 404 and error boundary pages ([b0b8c70](https://github.com/pixelasticity/Almsby/commit/b0b8c705b7afa92d1bbb390907144ec1474f8a65))
* **app:** branded 404 and error boundary pages ([4a36103](https://github.com/pixelasticity/Almsby/commit/4a36103a89714484c259d0efbeffa3c21d9dec05))
* **barcode:** GS1 Digital Link QR + DataMatrix dual-mark render + print route ([#6](https://github.com/pixelasticity/Almsby/issues/6)) ([e594979](https://github.com/pixelasticity/Almsby/commit/e594979fd795ab90f069d69376fd1f0563784e35))
* **barcode:** GS1 Digital Link QR + DataMatrix dual-mark render + print route ([#6](https://github.com/pixelasticity/Almsby/issues/6)) ([a3f68b0](https://github.com/pixelasticity/Almsby/commit/a3f68b0bf2bc4dab438f5091445b3b8b9d62b54f))
* **barcode:** per-generation decode verification gates the label ([#7](https://github.com/pixelasticity/Almsby/issues/7)) ([098ad49](https://github.com/pixelasticity/Almsby/commit/098ad490e1ad81e54afb3cbd1954ed4019481f50))
* **business:** post-registration business onboarding wizard ([24e883a](https://github.com/pixelasticity/Almsby/commit/24e883a87a061d04ce333bc07e013287d71aa36d))
* **business:** post-registration business onboarding wizard (#) ([3c35c8e](https://github.com/pixelasticity/Almsby/commit/3c35c8e1b4cfe39d5e5ce1bc107fc2afbff712a5))
* **concierge:** guided GTIN setup + sequential allocation ([#4](https://github.com/pixelasticity/Almsby/issues/4)) ([df04b70](https://github.com/pixelasticity/Almsby/commit/df04b70694d184e146657e2a831dd9fcc77346e6))
* **concierge:** guided GTIN setup with sequential allocation under a GS1 prefix ([#4](https://github.com/pixelasticity/Almsby/issues/4)) ([f29ce66](https://github.com/pixelasticity/Almsby/commit/f29ce662a0905d58d7db84fd3c500dfae9237dd1))
* **css:** soft squircle corners via corner-shape, progressive enhancement ([1ccd622](https://github.com/pixelasticity/Almsby/commit/1ccd62232c51dcd3b1bd59a26069a22a995a3a34))
* **dev:** local Supabase CLI flow; gated migration deploy; fix CI trigger branches ([91b504d](https://github.com/pixelasticity/Almsby/commit/91b504da6a3d2e36ef208dbc1ea68ade814ab0e6))
* **env:** resolver URL placeholder guard + boot-time assertion ([#17](https://github.com/pixelasticity/Almsby/issues/17)) ([d64e0cb](https://github.com/pixelasticity/Almsby/commit/d64e0cbb60046d5edbe3c1f2d1062cb80b279d72))
* **gs1:** resolve GTINs against the DB in /01/[gtin] ([f4d0a0d](https://github.com/pixelasticity/Almsby/commit/f4d0a0d02ffd3b8204b642d26f4a626eeceaca07))
* **gs1:** resolve GTINs against the DB in /01/[gtin] ([#8](https://github.com/pixelasticity/Almsby/issues/8)) ([d047e25](https://github.com/pixelasticity/Almsby/commit/d047e25e03600bb28b729e4dde1114b984e592da))
* **i18n:** next-intl cookie locale (en/es) + key-parity CI gate ([d8c81ee](https://github.com/pixelasticity/Almsby/commit/d8c81eefe09596f1c58e9fe59ea3f2df539c6694))
* **label:** explain absent legacy symbol for non-zero indicator GTINs ([#45](https://github.com/pixelasticity/Almsby/issues/45)) ([53a5f36](https://github.com/pixelasticity/Almsby/commit/53a5f36cde1f080408db91743e0a2570021547a3))
* **label:** genuine OCR-B HRI for the legacy EAN-13 ([#9](https://github.com/pixelasticity/Almsby/issues/9)) ([878ee4d](https://github.com/pixelasticity/Almsby/commit/878ee4dee8d509a8b4e3d60e7f2aeeb20d29a102))
* **label:** print-ready downloads ([#9](https://github.com/pixelasticity/Almsby/issues/9)) — legacy EAN-13, gated assets, exact-size print ([7eb287f](https://github.com/pixelasticity/Almsby/commit/7eb287f5e96e97a96d761ac8a71f9d831b477dd0))
* Phase 1 — GS1 compliance core, label pipeline, and release hardening (v0.1.0 → v1.3.2) ([07fb33a](https://github.com/pixelasticity/Almsby/commit/07fb33ae791f1a1e682bb1061c8d1dac32660fd2))
* **products:** friendly error when a GTIN is already claimed ([32570ff](https://github.com/pixelasticity/Almsby/commit/32570ffc39a7e051b8f4f9bd3caa5ce65f3495e8))
* **products:** GTIN import + classification ([#3](https://github.com/pixelasticity/Almsby/issues/3)) ([56f4552](https://github.com/pixelasticity/Almsby/commit/56f45527bdaf2bc74ff4948d7c99eb80352ca498))
* **products:** GTIN import + classification ([#3](https://github.com/pixelasticity/Almsby/issues/3)) ([e8d2afa](https://github.com/pixelasticity/Almsby/commit/e8d2afacd49dbcb9c1749798ac2d47c404e53bab))
* **products:** product creation form + core fields ([#2](https://github.com/pixelasticity/Almsby/issues/2)) ([a5fa9ef](https://github.com/pixelasticity/Almsby/commit/a5fa9ef69a4e3f9284c39caa827e40e1a9d5e6bf))
* **products:** product creation form with core fields ([#2](https://github.com/pixelasticity/Almsby/issues/2)) ([32b6b63](https://github.com/pixelasticity/Almsby/commit/32b6b63dd1e26a5ad71c4224189a017e2e5cd2f1))
* **resilience:** segment error + loading boundaries, shared widget boundary ([debd82d](https://github.com/pixelasticity/Almsby/commit/debd82d9c55caf69db67db51a0c0bbfaea5d4c8a))
* **resolver:** DB-backed /01/{gtin} lookup (404/503 split) ([#8](https://github.com/pixelasticity/Almsby/issues/8)) ([72bc27a](https://github.com/pixelasticity/Almsby/commit/72bc27ab323fcc3d8057109666c514572edf4528))
* **schema:** close Phase 1 product-field gaps + Phase 2 StoryPage JSON body ([b796c81](https://github.com/pixelasticity/Almsby/commit/b796c81378878d7e44a91ab6e6df7b807eb331b7))
* **schema:** close Phase 1 product-field gaps, Phase 2 StoryPage JSON body ([6a2afa0](https://github.com/pixelasticity/Almsby/commit/6a2afa0f7312539a38079137fef5ef7edca20141))
* **security:** CSP nonces via middleware; fix headers dropped on Vercel edge ([9cda05e](https://github.com/pixelasticity/Almsby/commit/9cda05e2328d8342add64fe3777fd0ac434b11c9))
* **security:** CSP with nonces via middleware; fix Vercel-dropped security headers ([fd96357](https://github.com/pixelasticity/Almsby/commit/fd9635715a4aa7eafe13d2d949a3fd0700c3977d))
* **story:** add italic and strike marks to the studio editor + preview ([ba3effa](https://github.com/pixelasticity/Almsby/commit/ba3effa7b3006948a238c5ea0941250b3cc3592e))
* **story:** data layer — GTIN story query + R2 photo upload ([#71](https://github.com/pixelasticity/Almsby/issues/71)) ([c68cf09](https://github.com/pixelasticity/Almsby/commit/c68cf09935f953ab9dfb0057b47867937be360df))
* **story:** data layer for story pages — GTIN query + R2 photo upload ([#71](https://github.com/pixelasticity/Almsby/issues/71)) ([48e04e8](https://github.com/pixelasticity/Almsby/commit/48e04e8639dfeb92a035a07f3c4d32232064144e))
* **story:** heading dropdown (h2-h6) in studio toolbar ([85a3ee9](https://github.com/pixelasticity/Almsby/commit/85a3ee93e070ef020658fa9577855bae42fb7da5))
* **story:** inline link input with add/edit/remove, replaces window.prompt ([dc1b7f5](https://github.com/pixelasticity/Almsby/commit/dc1b7f53ca1a437fe90af18f3393ac81b8f6f147))
* **story:** port Story Studio to app foundation (CSS modules + tokens + auth) ([b6f32b9](https://github.com/pixelasticity/Almsby/commit/b6f32b986b3defecfdabb4f2111ffc1cf39480b8))
* **story:** save feedback + dirty-state indicator in studio ([c34a2d2](https://github.com/pixelasticity/Almsby/commit/c34a2d2cd397d4280c41e29ec09c24ec1639b919))
* **story:** TipTap CMS editor with constrained schema (Phase 2 brief) ([66cf444](https://github.com/pixelasticity/Almsby/commit/66cf4448147a5efccf55f5eaa2fd74bcccc222a9))
* **story:** toolbar grouping + 'view live story' link in studio ([f33f775](https://github.com/pixelasticity/Almsby/commit/f33f775d22c81e9bc734a03ea6a578bbb2001fed))
* **story:** unpublish confirmation + TipTap editor placeholder ([31a7ba2](https://github.com/pixelasticity/Almsby/commit/31a7ba2d995701dcecb01c818ef4f8986570e14e))
* **studio:** story headline field (DoD [#1](https://github.com/pixelasticity/Almsby/issues/1)) ([3857d5b](https://github.com/pixelasticity/Almsby/commit/3857d5bbf791a92bec976ca315b5cacd7ecce193))
* **ui:** add shared Button component with primary/secondary/ghost variants ([f5ad1af](https://github.com/pixelasticity/Almsby/commit/f5ad1af419d3ae4ce0b9037442250190b8748c90))


### Bug Fixes

* **app:** drive global error home link from NEXT_PUBLIC_APP_URL ([94f1aea](https://github.com/pixelasticity/Almsby/commit/94f1aea2e36d021e7dd44385c4632ec591c83d90))
* **app:** drive global error home link from NEXT_PUBLIC_APP_URL ([cf538e9](https://github.com/pixelasticity/Almsby/commit/cf538e9e08d716807c85118db0dad4cc3c9e6a70))
* **auth:** add requireAuth guard, log auth errors, remove orphaned revalidate route ([9346a8a](https://github.com/pixelasticity/Almsby/commit/9346a8ab2e545a79275ce538b85fdda5925ae1c6))
* **auth:** opaque "{ }" signup error passthrough + audit silent catches ([#43](https://github.com/pixelasticity/Almsby/issues/43)) ([6736357](https://github.com/pixelasticity/Almsby/commit/67363575f0cf40879a7827f193938b2b3edb8a9f))
* **barcode:** defer DualMarkLabel render past hydration to avoid mismatch ([e389520](https://github.com/pixelasticity/Almsby/commit/e38952033cb8baa44f1eddc311ad9c617c7f9295))
* **barcode:** replace mounted setState-in-effect with useSyncExternalStore ([0b6f189](https://github.com/pixelasticity/Almsby/commit/0b6f1892a9677a880cb44e80735c91e690514283))
* **barcode:** self-describing SVG dimensions + explicit on-screen sizes ([f55a0e9](https://github.com/pixelasticity/Almsby/commit/f55a0e9774a5cd6f12fbc2192ae6a9542631d7fa))
* **build:** externalize resvg/zxing-wasm natives + promote to runtime deps ([4d69fff](https://github.com/pixelasticity/Almsby/commit/4d69fff4cf98f894e6d5fc6011d99d5febb22bf6))
* **business:** controlled inputs so onboarding wizard values survive step changes ([246f361](https://github.com/pixelasticity/Almsby/commit/246f361df8f9db85005553b5c511559086619170))
* **business:** controlled inputs so wizard values survive step changes ([9a9a1a0](https://github.com/pixelasticity/Almsby/commit/9a9a1a0085b84554ab808229182a10f469becb44))
* **business:** keep onboarding wizard steps in DOM so final submit carries all fields ([8a1fa50](https://github.com/pixelasticity/Almsby/commit/8a1fa508d20bc60b60380b3c6df78af5ebb33a7c))
* **business:** keep onboarding wizard steps in DOM so final submit carries all fields ([2ee2cae](https://github.com/pixelasticity/Almsby/commit/2ee2cae0363567da3d312ad91ee96978627174d1))
* **business:** keep wizard steps in DOM + move redirects out of try/catch ([763bfc1](https://github.com/pixelasticity/Almsby/commit/763bfc118d3bc54bff3495fd8d2ffe0d46871b1b))
* **env,barcode:** literal NEXT_PUBLIC access + log URI-construction failures ([a83b721](https://github.com/pixelasticity/Almsby/commit/a83b721c6a194a8fd8ca04273dadea75876f2467))
* **env,barcode:** localhost guard + normalize GTIN to GTIN-14 for DualMarkLabel ([58d7458](https://github.com/pixelasticity/Almsby/commit/58d74589c86e92b8baa4bb4d614388a3c54665b9))
* **env:** scope localhost-deploy guard to the server ([9f957c2](https://github.com/pixelasticity/Almsby/commit/9f957c239aa232d354aeb246baa8463b53ba6a06))
* **env:** skip localhost guard in CI builds ([0b842cb](https://github.com/pixelasticity/Almsby/commit/0b842cb9eb80602953483171b358a6e072bc6a28))
* **label:** clear EAN-13 HRI digits from the data bars ([#47](https://github.com/pixelasticity/Almsby/issues/47)) ([159492e](https://github.com/pixelasticity/Almsby/commit/159492e1b2e77da6e4d3e0a8f7c5b00ccc933d1e))
* **sidebar:** placeholder nav items are buttons, not dead links ([7ea8b97](https://github.com/pixelasticity/Almsby/commit/7ea8b97d1f4b0aaf01f7515fd9d1edc64261a13c))
* **story:** always render 'edit story' entry link on product page ([cb14896](https://github.com/pixelasticity/Almsby/commit/cb14896cc1ddcd13bd89ac7009dff0fb9886787e))
* **story:** distinguish 'recyclable' null from 'No'; warn on unsaved changes ([fb6a271](https://github.com/pixelasticity/Almsby/commit/fb6a2713742ef86a9ed05c03fd5381d6e57f0136))
* **story:** give studio inputs visible borders + focus styles ([195fab0](https://github.com/pixelasticity/Almsby/commit/195fab0a833d753bc2449146899e7adb254a0385))
* **story:** normalize legacy bodyContent so TipTap editor renders instead of crashing ([a229760](https://github.com/pixelasticity/Almsby/commit/a229760af7507a881fce1eb670f5e3cc1db0df15))
* **story:** normalize r2PublicDomain to strip leading https:// scheme ([e7eeb8c](https://github.com/pixelasticity/Almsby/commit/e7eeb8c1087afca6f0c953762dc9b030307e056d))
* **story:** remove duplicate Link extension — StarterKit v3 includes it ([6ba5557](https://github.com/pixelasticity/Almsby/commit/6ba55574950a63b8f2be4c55fb292d00db4f51a1))
* **story:** strip React client-reference markers before Server Action save ([0c963b8](https://github.com/pixelasticity/Almsby/commit/0c963b8287ae2473fa840b30a1f94c2c1a0afb73))
* **story:** strip React markers before publish + extract toPlainJson helper ([29af65d](https://github.com/pixelasticity/Almsby/commit/29af65d2362d819fc271f24c1397b94db37ca1da))
* **story:** studio accessibility — live status, editor label, tab semantics, alert banner ([c412b80](https://github.com/pixelasticity/Almsby/commit/c412b8066a492c04ce2a6db002b75c9e8adf6751))
* **studio:** eliminate double scrollbar + show passport data beside editor on wide screens ([90c9b56](https://github.com/pixelasticity/Almsby/commit/90c9b56ba5b5de95180230911289e2c8574dab57))
* **studio:** re-render toolbar on cursor move + add StoryEntry card link → /studio ([8358d80](https://github.com/pixelasticity/Almsby/commit/8358d8008d9c1958906701f113491d60e288fb33))
* **studio:** remove duplicate passport title + fix label/value visual hierarchy ([1397985](https://github.com/pixelasticity/Almsby/commit/13979858a0a90fac2ffcc4b9f6f88443975a2248))
* **studio:** repair corrupted CSS + improve passport visual hierarchy ([111c0d9](https://github.com/pixelasticity/Almsby/commit/111c0d9e9d9a30c9f18907f137c6e3c0ae1109e9))
* **ui:** selects match inputs — appearance:none + custom chevron, migrate stragglers ([8ddf837](https://github.com/pixelasticity/Almsby/commit/8ddf8375cec72da2ea90abec6f103b1809caa789))


### Performance Improvements

* **dashboard:** code-split bwip-js off the product page, fold story lookup ([39734e0](https://github.com/pixelasticity/Almsby/commit/39734e07bd5d8b15248cccf34ce1dc422c3db804))
* **db:** index Business.ownerId and Product.businessId ([6a5bbb8](https://github.com/pixelasticity/Almsby/commit/6a5bbb8ab52a66706cdb46148edb4f3e2ed0d629))
* **db:** index Business.ownerId and Product.businessId ([e0b8b5f](https://github.com/pixelasticity/Almsby/commit/e0b8b5f5204cc6a64401964f4145df775138adb4))
* dedupe product-detail query and collapse barcode SVG nodes ([7dc3721](https://github.com/pixelasticity/Almsby/commit/7dc3721092be0817d51095c41de4fa78dee1f481))
* dedupe product-detail query and collapse barcode SVG nodes ([43ae026](https://github.com/pixelasticity/Almsby/commit/43ae0262ef4bb0b535e0adda0140b0cbad945259))

## [1.4.0](https://github.com/pixelasticity/Almsby/compare/v1.3.2...v1.4.0) (2026-09-03)


### Features

* **security:** CSP nonces via middleware; fix headers dropped on Vercel edge ([9cda05e](https://github.com/pixelasticity/Almsby/commit/9cda05e2328d8342add64fe3777fd0ac434b11c9))
* **security:** CSP with nonces via middleware; fix Vercel-dropped security headers ([fd96357](https://github.com/pixelasticity/Almsby/commit/fd9635715a4aa7eafe13d2d949a3fd0700c3977d))

## [1.3.2](https://github.com/pixelasticity/Almsby/compare/v1.3.1...v1.3.2) (2026-08-31)


### Bug Fixes

* **app:** drive global error home link from NEXT_PUBLIC_APP_URL ([94f1aea](https://github.com/pixelasticity/Almsby/commit/94f1aea2e36d021e7dd44385c4632ec591c83d90))
* **env:** scope localhost-deploy guard to the server ([9f957c2](https://github.com/pixelasticity/Almsby/commit/9f957c239aa232d354aeb246baa8463b53ba6a06))

## [1.3.1](https://github.com/pixelasticity/Almsby/compare/v1.3.0...v1.3.1) (2026-08-31)


### Bug Fixes

* **label:** clear EAN-13 HRI digits from the data bars ([#47](https://github.com/pixelasticity/Almsby/issues/47)) ([159492e](https://github.com/pixelasticity/Almsby/commit/159492e1b2e77da6e4d3e0a8f7c5b00ccc933d1e))

## [1.3.0](https://github.com/pixelasticity/Almsby/compare/v1.2.0...v1.3.0) (2026-08-31)


### Features

* **label:** explain absent legacy symbol for non-zero indicator GTINs ([#45](https://github.com/pixelasticity/Almsby/issues/45)) ([53a5f36](https://github.com/pixelasticity/Almsby/commit/53a5f36cde1f080408db91743e0a2570021547a3))

## [1.2.0](https://github.com/pixelasticity/Almsby/compare/v1.1.0...v1.2.0) (2026-08-31)


### Features

* **env:** resolver URL placeholder guard + boot-time assertion ([#17](https://github.com/pixelasticity/Almsby/issues/17)) ([d64e0cb](https://github.com/pixelasticity/Almsby/commit/d64e0cbb60046d5edbe3c1f2d1062cb80b279d72))
* **label:** genuine OCR-B HRI for the legacy EAN-13 ([#9](https://github.com/pixelasticity/Almsby/issues/9)) ([878ee4d](https://github.com/pixelasticity/Almsby/commit/878ee4dee8d509a8b4e3d60e7f2aeeb20d29a102))
* **label:** print-ready downloads ([#9](https://github.com/pixelasticity/Almsby/issues/9)) — legacy EAN-13, gated assets, exact-size print ([7eb287f](https://github.com/pixelasticity/Almsby/commit/7eb287f5e96e97a96d761ac8a71f9d831b477dd0))

## [1.1.0](https://github.com/pixelasticity/Almsby/compare/v1.0.3...v1.1.0) (2026-08-30)


### Features

* **barcode:** per-generation decode verification gates the label ([#7](https://github.com/pixelasticity/Almsby/issues/7)) ([098ad49](https://github.com/pixelasticity/Almsby/commit/098ad490e1ad81e54afb3cbd1954ed4019481f50))


### Bug Fixes

* **auth:** opaque "{ }" signup error passthrough + audit silent catches ([#43](https://github.com/pixelasticity/Almsby/issues/43)) ([6736357](https://github.com/pixelasticity/Almsby/commit/67363575f0cf40879a7827f193938b2b3edb8a9f))
* **build:** externalize resvg/zxing-wasm natives + promote to runtime deps ([4d69fff](https://github.com/pixelasticity/Almsby/commit/4d69fff4cf98f894e6d5fc6011d99d5febb22bf6))

## [1.0.3](https://github.com/pixelasticity/Almsby/compare/v1.0.2...v1.0.3) (2026-08-29)


### Bug Fixes

* **barcode:** self-describing SVG dimensions + explicit on-screen sizes ([f55a0e9](https://github.com/pixelasticity/Almsby/commit/f55a0e9774a5cd6f12fbc2192ae6a9542631d7fa))

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
