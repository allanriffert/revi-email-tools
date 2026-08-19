# revi-email-tools

Custom tools do editor de e-mail (Unlayer) usados pela Revi.

- `revi-theme-tools.js` — **v2.** Registra `revi_theme` (paleta clara e escura definida por
  color pickers, dentro do design) e `revi_theme_image` (imagem alternativa para dark mode,
  com link opcional).
- `revi-dark-mode-tools.js` — v1. Registra `revi_dark_mode` (pares de tema light/dark a partir
  de grupos fixos no próprio arquivo) e `revi_theme_image` (sem link).

As duas versões usam os mesmos nomes de classe (`revi-dm-*`), então blocos já marcados
continuam funcionando ao migrar.

## Uso

```js
unlayer.init({
  id: 'editor',
  displayMode: 'email',
  customJS: [
    'https://allanriffert.github.io/revi-email-tools/revi-theme-tools.js'
  ]
});
```

No design, o bloco precisa ser `type: "custom"` com o nome do tool em `slug`
(`revi_theme` ou `revi_theme_image`). Usar o nome direto em `type` faz o Unlayer
renderizar o bloco como "Missing" e o CSS não é injetado.

## v1 vs v2

| | v1 | v2 |
|---|---|---|
| onde as cores vivem | `const GROUPS` no `.js` | no design, via color pickers |
| trocar paleta | editar o script e publicar | abrir o bloco e clicar nas cores |
| modo claro | não gera CSS | gera CSS, igual ao escuro |
| paletas por template | uma só, global | uma por design |
| desligar o escuro | não dá | toggle no bloco |
| link na imagem | não | campo de ação |

## Marcação

As classes aplicadas nos blocos do template:

`revi-dm-bg`, `revi-dm-surface`, `revi-dm-surface-soft`, `revi-dm-surface-accent`,
`revi-dm-surface-strong`, `revi-dm-heading`, `revi-dm-text`, `revi-dm-menu`,
`revi-dm-link`, `revi-dm-button`, `revi-dm-border-accent`, `revi-dm-border-strong`,
`revi-dm-divider`.

Toda superfície precisa de uma classe de texto junto: `revi-dm-surface` sozinha troca o
fundo e deixa o texto na cor original — preto no preto.

## Verificado no editor

Carregado no Unlayer Playground (editor 1.472.0) a partir deste branch: os dois tools
aparecem na paleta, o bloco é criado como `type: "custom"` + `slug` sem virar "Missing",
os color pickers renderizam nas 5 seções, o `usageLimit` é respeitado e o `color_picker`
devolve string hex. Exportando, o CSS sai com regra base clara + media query escuro,
usando as cores definidas no design.

## Limitações conhecidas

- O export do Unlayer **descarta as regras `[data-ogsc]`** (fallback do Outlook): o seletor
  não casa com nenhum elemento no HTML exportado e o purge de CSS o remove. Na prática o
  modo escuro chega por `prefers-color-scheme`.
- O Unlayer só mantém no CSS as regras cujas classes aparecem no HTML.
- O Gmail ignora `prefers-color-scheme` e aplica inversão própria.
