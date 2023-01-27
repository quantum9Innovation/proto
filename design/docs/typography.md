# Typography

This document describes the use of typography within Proto's application suite as well as its implications regarding internationalization and multilingual support

---

Proto uses a fixed set of fonts for different typographic elements at different sizes.
The system for choosing those fonts and applying them is based on the [Material You](https://m3.material.io/styles/typography/type-scale-tokens) documentation, which divides all text into display, headline, title, label, and body styles.
Each style has a different set of typographic attributes associated with it, described later on in this document.

## Multilingual Support

As Proto is designed to be used to learn a wide variety of languages, multilingual support is non-negotiable.
This means that all fonts used in the application should have native support for the most widely-used script families without resorting to fallbacks.
For less common script families, [Noto](https://fonts.google.com/noto), preferably in Sans-Serif, should be used as the default fallback.
