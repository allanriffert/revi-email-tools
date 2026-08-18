# revi-email-tools

Custom tools do editor de e-mail (Unlayer) usados pela Revi.

- `revi-dark-mode-tools.js` — registra as ferramentas `revi_dark_mode` (pares de tema light/dark + CSS `prefers-color-scheme` e fallback `[data-ogsc]`) e `revi_theme_image` (imagem alternativa para dark mode).

## Uso

```js
unlayer.init({
  id: 'editor',
  displayMode: 'email',
  customJS: [
    'https://allanriffert.github.io/revi-email-tools/revi-dark-mode-tools.js'
  ]
});
```
