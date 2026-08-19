(function () {
  // Paleta de partida. Serve só como defaultValue dos color pickers —
  // a partir daqui as cores vivem no design, não neste arquivo.
  const PADRAO = {
    light: {
      background:'#e7e7e7', surface:'#fffefe', surfaceSoft:'#ffecec',
      surfaceAccent:'#ffc1c2', surfaceStrong:'#ffb3b4',
      heading:'#6d0b01', text:'#000000', link:'#e03e2d',
      buttonBg:'#ffecec', buttonText:'#6d0b01',
      border:'#ffc1c2', borderStrong:'#ffb3b4'
    },
    dark: {
      background:'#121214', surface:'#1a1718', surfaceSoft:'#251719',
      surfaceAccent:'#3a2023', surfaceStrong:'#4a2529',
      heading:'#ffb7b2', text:'#f5f5f5', link:'#ff8d80',
      buttonBg:'#5c2b30', buttonText:'#fff7f7',
      border:'#513034', borderStrong:'#6a383d'
    }
  };

  // O color_picker do Unlayer pode devolver string ou objeto, dependendo da versão.
  // Normaliza para "#rrggbb" e cai no padrão se vier vazio ou inválido.
  function cor(v, fallback) {
    let s = v;
    if (v && typeof v === 'object') s = v.color || v.value || v.hex || v.rgba;
    if (typeof s !== 'string') return fallback;
    s = s.trim();
    if (!s) return fallback;
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s)) return s;
    if (/^(rgb|hsl)a?\(/i.test(s)) return s;
    return fallback;
  }

  function paleta(values, modo) {
    const p = {}, base = PADRAO[modo];
    Object.keys(base).forEach(function (k) {
      p[k] = cor(values[modo + '_' + k], base[k]);
    });
    return p;
  }

  // Um único gerador para os dois modos: o CSS claro é a regra base,
  // o escuro entra no media query. Mesmos nomes de classe da v1.
  function regras(r, prefix) {
    prefix = prefix ? prefix + ' ' : '';
    return [
      prefix+'.revi-dm-bg{background-color:'+r.background+' !important;color:'+r.text+' !important;}',
      prefix+'.revi-dm-surface{background-color:'+r.surface+' !important;}',
      prefix+'.revi-dm-surface-soft{background-color:'+r.surfaceSoft+' !important;}',
      prefix+'.revi-dm-surface-accent{background-color:'+r.surfaceAccent+' !important;}',
      prefix+'.revi-dm-surface-strong{background-color:'+r.surfaceStrong+' !important;}',
      prefix+'.revi-dm-heading,'+prefix+'.revi-dm-heading h1,'+prefix+'.revi-dm-heading h2,'+prefix+'.revi-dm-heading h3{color:'+r.heading+' !important;}',
      prefix+'.revi-dm-text,'+prefix+'.revi-dm-text p,'+prefix+'.revi-dm-text span{color:'+r.text+' !important;}',
      prefix+'.revi-dm-menu,'+prefix+'.revi-dm-menu a{color:'+r.text+' !important;}',
      prefix+'.revi-dm-link a{color:'+r.link+' !important;}',
      prefix+'.revi-dm-button a{background-color:'+r.buttonBg+' !important;color:'+r.buttonText+' !important;}',
      prefix+'.revi-dm-border-accent{border-color:'+r.border+' !important;}',
      prefix+'.revi-dm-border-strong{border-color:'+r.borderStrong+' !important;}',
      prefix+'.revi-dm-divider,'+prefix+'.revi-dm-divider div,'+prefix+'.revi-dm-divider td{border-color:'+r.border+' !important;}'
    ].join('\n');
  }

  function css(values) {
    const L = paleta(values, 'light');
    const D = paleta(values, 'dark');
    const out = [
      ':root{color-scheme:light dark;supported-color-schemes:light dark;}',
      '/* claro — regra base */',
      regras(L, '')
    ];
    if (values.aplicarDark !== false) {
      out.push('/* escuro */');
      out.push('@media (prefers-color-scheme:dark){');
      out.push(regras(D, ''));
      out.push('}');
      // Fallback Outlook. Atenção: o export do Unlayer descarta estas regras,
      // porque o atributo data-ogsc só existe em tempo de execução.
      out.push(regras(D, '[data-ogsc]'));
    }
    return out.join('\n');
  }

  // ---- montagem dos campos: 12 papéis × 2 modos, em 4 seções ----
  const ROTULOS = {
    background:'Fundo geral', surface:'Superfície', surfaceSoft:'Superfície suave',
    surfaceAccent:'Superfície destaque', surfaceStrong:'Superfície forte',
    heading:'Título', text:'Texto', link:'Link',
    buttonBg:'Botão — fundo', buttonText:'Botão — texto',
    border:'Borda', borderStrong:'Borda forte'
  };
  const SUPERFICIES = ['background','surface','surfaceSoft','surfaceAccent','surfaceStrong'];
  const CONTEUDO = ['heading','text','link','buttonBg','buttonText','border','borderStrong'];

  function campos(modo, chaves) {
    const o = {};
    chaves.forEach(function (k) {
      o[modo + '_' + k] = {
        label: ROTULOS[k],
        defaultValue: PADRAO[modo][k],
        widget: 'color_picker'
      };
    });
    return o;
  }

  const valoresIniciais = { aplicarDark: true };
  ['light','dark'].forEach(function (m) {
    Object.keys(PADRAO[m]).forEach(function (k) {
      valoresIniciais[m + '_' + k] = PADRAO[m][k];
    });
  });

  unlayer.registerTool({
    name: 'revi_theme',
    label: 'Tema (cores)',
    icon: 'fa-palette',
    supportedDisplayModes: ['email'],
    usageLimit: 1,
    options: {
      claro_superficies: { title: 'Claro — superfícies', position: 1, collapsed: false,
        options: campos('light', SUPERFICIES) },
      claro_conteudo: { title: 'Claro — conteúdo', position: 2, collapsed: true,
        options: campos('light', CONTEUDO) },
      escuro_superficies: { title: 'Escuro — superfícies', position: 3, collapsed: true,
        options: campos('dark', SUPERFICIES) },
      escuro_conteudo: { title: 'Escuro — conteúdo', position: 4, collapsed: true,
        options: campos('dark', CONTEUDO) },
      geral: { title: 'Geral', position: 5, collapsed: true, options: {
        aplicarDark: { label: 'Aplicar modo escuro', defaultValue: true, widget: 'toggle' }
      }}
    },
    values: valoresIniciais,
    renderer: {
      Viewer: unlayer.createViewer({
        render: function (values) {
          const L = paleta(values, 'light'), D = paleta(values, 'dark');
          function amostra(r, titulo) {
            return '<div style="flex:1;border:1px solid #ccc;border-radius:6px;overflow:hidden;font-family:Arial,sans-serif;">'
              + '<div style="padding:6px 8px;font-size:11px;font-weight:bold;background:'+r.surface+';color:'+r.heading+';">'+titulo+'</div>'
              + '<div style="padding:8px;background:'+r.background+';color:'+r.text+';font-size:11px;">'
              +   'Texto &middot; <span style="color:'+r.link+'">link</span>'
              +   '<div style="margin-top:6px;display:inline-block;padding:5px 10px;border-radius:3px;background:'+r.buttonBg+';color:'+r.buttonText+';font-size:11px;font-weight:bold;">Botão</div>'
              + '</div></div>';
          }
          return '<div style="padding:10px;border:1px dashed #888;border-radius:6px;font-family:Arial,sans-serif;">'
            + '<strong style="font-size:12px;">Tema Revi</strong>'
            + '<div style="display:flex;gap:8px;margin-top:8px;">'
            +   amostra(L, 'Claro') + amostra(D, 'Escuro')
            + '</div>'
            + '<div style="margin-top:6px;font-size:10px;color:#777;">Bloco invisível no e-mail — só injeta o CSS.</div>'
            + '</div>';
        }
      }),
      exporters: {
        web: function () { return '<!-- Revi Theme -->'; },
        email: function () { return '<!-- Revi Theme -->'; }
      },
      head: { css: css, js: function () { return ''; } }
    },
    validator: function () { return []; }
  });


  // ---------------------------------------------------------------
  // Theme Image: arte clara/escura, agora com ação (link) opcional.
  // ---------------------------------------------------------------
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // Lê a URL de um campo de texto simples. O widget 'link' do Unlayer guarda o valor
  // no design mas NÃO o repassa ao exporter, então a URL fica num campo 'text'.
  // O formato de objeto continua aceito, caso o valor venha de um design antigo.
  function acao(values) {
    let bruto = values.linkUrl;
    if (bruto == null || bruto === '') bruto = values.link;
    if (!bruto) return null;
    let href;
    if (typeof bruto === 'string') {
      href = bruto;
    } else {
      const vals = bruto.values || bruto;
      href = vals.href;
    }
    href = (href || '').trim();
    if (!href) return null;
    const novaAba = values.linkNovaAba !== false;
    return { href: href, target: novaAba ? '_blank' : '_self' };
  }

  function themeImageHtml(values) {
    let light = values.lightImage && values.lightImage.url || '';
    let dark = values.darkImage && values.darkImage.url || '';
    if (!light && !dark) return '';
    if (!light) light = dark;
    if (!dark) dark = light;

    const alt = esc(values.altText || '');
    const align = esc(values.textAlign || 'center');
    const padding = esc(values.containerPadding || '0px');
    const maxWidth = esc(values.maxWidth || '600');
    const comum = 'width:100%;height:auto;max-width:'+maxWidth+'px;border:0;outline:none;text-decoration:none;';
    const a = acao(values);

    // <a> por imagem: quando a img está display:none o link colapsa,
    // então não sobra área clicável invisível no modo errado.
    function envolver(imgHtml) {
      if (!a) return imgHtml;
      return '<a href="'+esc(a.href)+'" target="'+esc(a.target)+'"'
        + ' style="display:inline-block;font-size:0;line-height:0;text-decoration:none;border:0;">'
        + imgHtml + '</a>';
    }

    const imgLight = '<img class="revi-theme-image-light" src="'+esc(light)+'" alt="'+alt+'" style="display:inline-block;'+comum+'">';
    const imgDark  = '<img class="revi-theme-image-dark" src="'+esc(dark)+'" alt="'+alt+'" style="display:none;max-height:0;overflow:hidden;mso-hide:all;'+comum+'">';

    return '<div style="padding:'+padding+';text-align:'+align+';line-height:0;">'
      + envolver(imgLight) + envolver(imgDark)
      + '</div>';
  }

  unlayer.registerTool({
    name: 'revi_theme_image',
    label: 'Theme Image',
    icon: 'fa-image',
    supportedDisplayModes: ['email'],
    options: {
      imagens: { title: 'Imagens claro / escuro', position: 1, collapsed: false, options: {
        lightImage: { label: 'Imagem — modo claro', defaultValue: { url: '' }, widget: 'image' },
        darkImage: { label: 'Imagem — modo escuro', defaultValue: { url: '' }, widget: 'image' },
        previewDark: { label: 'Prever a versão escura', defaultValue: false, widget: 'toggle' }
      }},
      acao: { title: 'Ação', position: 2, collapsed: false, options: {
        linkUrl: { label: 'Link ao clicar (URL)', defaultValue: '', widget: 'text' },
        linkNovaAba: { label: 'Abrir em nova aba', defaultValue: true, widget: 'toggle' }
      }},
      aparencia: { title: 'Aparência', position: 3, collapsed: true, options: {
        altText: { label: 'Texto alternativo', defaultValue: '', widget: 'text' },
        textAlign: { label: 'Alinhamento', defaultValue: 'center', widget: 'alignment' },
        containerPadding: { label: 'Espaçamento', defaultValue: '0px', widget: 'text' },
        maxWidth: { label: 'Largura máxima (px)', defaultValue: '600', widget: 'text' }
      }}
    },
    values: {
      lightImage: { url: '' }, darkImage: { url: '' }, previewDark: false,
      linkUrl: '', linkNovaAba: true,
      altText: '', textAlign: 'center', containerPadding: '0px', maxWidth: '600'
    },
    renderer: {
      Viewer: unlayer.createViewer({
        render: function (values) {
          const light = values.lightImage && values.lightImage.url || '';
          const dark = values.darkImage && values.darkImage.url || '';
          const src = values.previewDark && dark ? dark : light;
          const modo = values.previewDark && dark ? 'Escuro' : 'Claro';
          if (!src) return '<div style="padding:20px;border:2px dashed #ccc;text-align:center;font-family:Arial,sans-serif;">Escolha uma imagem</div>';
          const a = acao(values);
          return '<div style="padding:'+esc(values.containerPadding||'0px')+';text-align:'+esc(values.textAlign||'center')+';">'
            + '<div style="font:11px Arial,sans-serif;color:#777;margin-bottom:4px;">Prévia: '+modo
            +   (a ? ' &middot; com link' : ' &middot; sem link') + '</div>'
            + '<img src="'+esc(src)+'" alt="'+esc(values.altText||'')+'" style="display:inline-block;width:100%;height:auto;max-width:'+esc(values.maxWidth||'600')+'px;border:0;">'
            + '</div>';
        }
      }),
      exporters: { web: themeImageHtml, email: themeImageHtml },
      head: {
        css: function (values) {
          const dark = values.darkImage && values.darkImage.url;
          const id = values._meta && values._meta.htmlID || '';
          if (!dark || !id) return '';
          return [
            '#'+id+' .revi-theme-image-dark{display:none !important;max-height:0 !important;overflow:hidden !important;mso-hide:all !important;}',
            '@media (prefers-color-scheme:dark){',
            '#'+id+' .revi-theme-image-light{display:none !important;mso-hide:all !important;}',
            '#'+id+' .revi-theme-image-dark{display:block !important;max-height:none !important;overflow:visible !important;}',
            '}',
            '[data-ogsc] #'+id+' .revi-theme-image-light{display:none !important;mso-hide:all !important;}',
            '[data-ogsc] #'+id+' .revi-theme-image-dark{display:block !important;max-height:none !important;overflow:visible !important;}'
          ].join('\n');
        },
        js: function () { return ''; }
      }
    },
    validator: function () { return []; }
  });

  // Exposto para teste fora do editor.
  if (typeof module !== 'undefined' && module.exports) module.exports = { css: css, cor: cor, themeImageHtml: themeImageHtml, acao: acao };
})();
