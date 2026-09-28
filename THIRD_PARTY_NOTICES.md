# Third-party notices

## Fusion Pixel Font

- Copyright (c) 2022, TakWolf (https://takwolf.com)
- Font files: `assets/fonts/fusion-pixel-12px-proportional-sc.woff2`, `assets/fonts/fusion-pixel-12px-monospaced-sc.woff2`, and `assets/fonts/fusion-pixel-latin.woff2`
- License: SIL Open Font License 1.1
- Full license text: `assets/fonts/LICENSE.fusion-pixel.txt`

The browser stylesheet loads the fonts through a three-tier candidate chain (plugin asset route, document-relative path, then a fixed commit on this project's own repository) and keeps system CJK fallbacks if no source can be fetched.

Historical note (corrected in 2.2.0): until 2.1.5 the third tier pointed at a fixed commit in a **different repository** (`ADAning/dsh-pixel-skin`), whose files did not match the ones shipped in `assets/fonts`. That reference has been removed; the remote tier now points only at this project's own origin pinned to a commit.

Open item: `assets/fonts/fusion-pixel-latin.woff2` is unusually large for a Latin-only subset (~912 KB) and has not been verified to be a properly subsetted Latin file. Font subsetting is tracked as follow-up work and does not affect functionality.
