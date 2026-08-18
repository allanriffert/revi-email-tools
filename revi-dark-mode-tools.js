(function () {
  const GROUPS = {
    valentine_light: {
      label: 'Valentine Light',
      colors: ['#e7e7e7','#fffefe','#ffecec','#ffc1c2','#ffb3b4','#6d0b01','#000000','#e03e2d','#0000ee','#ffffff'],
      roles: {
        background:'#e7e7e7',
        surface:'#fffefe',
        surfaceSoft:'#ffecec',
        surfaceAccent:'#ffc1c2',
        surfaceStrong:'#ffb3b4',
        heading:'#6d0b01',
        text:'#000000',
        link:'#e03e2d',
        primary:'#ffecec',
        buttonText:'#6d0b01',
        border:'#ffc1c2',
        borderStrong:'#ffb3b4'
      }
    },
    valentine_dark: {
      label: 'Valentine Dark',
      colors: ['#121214','#1a1718','#251719','#3a2023','#4a2529','#ffb7b2','#f5f5f5','#ff8d80','#9db0ff','#ffffff'],
      roles: {
        background:'#121214',
        surface:'#1a1718',
        surfaceSoft:'#251719',
        surfaceAccent:'#3a2023',
        surfaceStrong:'#4a2529',
        heading:'#ffb7b2',
        text:'#f5f5f5',
        link:'#ff8d80',
        primary:'#5c2b30',
        buttonText:'#fff7f7',
        border:'#513034',
        borderStrong:'#6a383d'
      }
    }
  };

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  }

  // Also expose these groups in Unlayer's native color picker.
  if (typeof unlayer.setColorPickerConfig === 'function') {
    unlayer.setColorPickerConfig({
      colors: Object.keys(GROUPS).map(function (id) {
        return {
          id:id,
          label:GROUPS[id].label,
          colors:GROUPS[id].colors,
          default:id === 'valentine_light'
        };
      })
    });
  }

  // Self-contained group selector: no extra Playground init JSON required.
  unlayer.registerPropertyEditor({
    name:'revi_group_select',
    layout:'bottom',
    Widget:unlayer.createWidget({
      schema:{type:'string',description:'Color group id'},
      render:function(value) {
        const opts = Object.keys(GROUPS).map(function(id) {
          return '<option value="'+esc(id)+'"'+(id===value?' selected':'')+'>'+esc(GROUPS[id].label)+'</option>';
        }).join('');
        return '<select class="revi-group-select" style="width:100%;padding:8px;">'+opts+'</select>';
      },
      mount:function(node,value,updateValue) {
        node.querySelector('.revi-group-select').onchange = function(e) {
          updateValue(e.target.value);
        };
      }
    })
  });

  function darkCss(r, prefix) {
    prefix = prefix || '';
    return [
      prefix+' .revi-dm-bg{background-color:'+r.background+' !important;color:'+r.text+' !important;}',
      prefix+' .revi-dm-surface{background-color:'+r.surface+' !important;}',
      prefix+' .revi-dm-surface-soft{background-color:'+r.surfaceSoft+' !important;}',
      prefix+' .revi-dm-surface-accent{background-color:'+r.surfaceAccent+' !important;}',
      prefix+' .revi-dm-surface-strong{background-color:'+r.surfaceStrong+' !important;}',
      prefix+' .revi-dm-heading,'+prefix+' .revi-dm-heading h1,'+prefix+' .revi-dm-heading h2,'+prefix+' .revi-dm-heading h3{color:'+r.heading+' !important;}',
      prefix+' .revi-dm-text,'+prefix+' .revi-dm-text p,'+prefix+' .revi-dm-text span{color:'+r.text+' !important;}',
      prefix+' .revi-dm-menu,'+prefix+' .revi-dm-menu a{color:'+r.text+' !important;}',
      prefix+' .revi-dm-link a{color:'+r.link+' !important;}',
      prefix+' .revi-dm-button a{background-color:'+r.primary+' !important;color:'+r.buttonText+' !important;}',
      prefix+' .revi-dm-border-accent{border-color:'+r.border+' !important;}',
      prefix+' .revi-dm-border-strong{border-color:'+r.borderStrong+' !important;}',
      prefix+' .revi-dm-divider,'+prefix+' .revi-dm-divider div,'+prefix+' .revi-dm-divider td{border-color:'+r.border+' !important;}'
    ].join('\n');
  }

  unlayer.registerTool({
    name:'revi_dark_mode',
    label:'Dark Mode',
    icon:'fa-adjust',
    supportedDisplayModes:['email'],
    usageLimit:1,
    options:{
      theme:{
        title:'Theme Pair',
        position:1,
        collapsed:false,
        options:{
          lightGroup:{label:'Light Mode Group',defaultValue:'valentine_light',widget:'revi_group_select'},
          darkGroup:{label:'Dark Mode Group',defaultValue:'valentine_dark',widget:'revi_group_select'}
        }
      }
    },
    values:{lightGroup:'valentine_light',darkGroup:'valentine_dark'},
    renderer:{
      Viewer:unlayer.createViewer({
        render:function(values){
          const light = GROUPS[values.lightGroup] || GROUPS.valentine_light;
          const dark = GROUPS[values.darkGroup] || GROUPS.valentine_dark;
          return '<div style="padding:12px;border:1px dashed #888;border-radius:6px;font-family:Arial,sans-serif;">'
            +'<strong>Revi Dark Mode</strong><br>'
            +'<span style="font-size:12px;color:#666;">'+esc(light.label)+' → '+esc(dark.label)+'</span>'
            +'</div>';
        }
      }),
      exporters:{
        web:function(){return '<!-- Revi Dark Mode settings -->';},
        email:function(){return '<!-- Revi Dark Mode settings -->';}
      },
      head:{
        css:function(values){
          const dark = GROUPS[values.darkGroup] || GROUPS.valentine_dark;
          const r = dark.roles;
          return [
            ':root{color-scheme:light dark;supported-color-schemes:light dark;}',
            '@media (prefers-color-scheme:dark){',
            darkCss(r,''),
            '}',
            darkCss(r,'[data-ogsc]')
          ].join('\n');
        },
        js:function(){return '';}
      }
    },
    validator:function(){return [];}
  });

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
    const common = 'width:100%;height:auto;max-width:'+maxWidth+'px;border:0;outline:none;text-decoration:none;';

    return '<div style="padding:'+padding+';text-align:'+align+';line-height:0;">'
      +'<img class="revi-theme-image-light" src="'+esc(light)+'" alt="'+alt+'" style="display:inline-block;'+common+'">'
      +'<img class="revi-theme-image-dark" src="'+esc(dark)+'" alt="'+alt+'" style="display:none;max-height:0;overflow:hidden;mso-hide:all;'+common+'">'
      +'</div>';
  }

  unlayer.registerTool({
    name:'revi_theme_image',
    label:'Theme Image',
    icon:'fa-image',
    supportedDisplayModes:['email'],
    options:{
      images:{
        title:'Light / Dark Images',
        position:1,
        collapsed:false,
        options:{
          lightImage:{label:'Light Mode Image',defaultValue:{url:''},widget:'image'},
          darkImage:{label:'Dark Mode Image',defaultValue:{url:''},widget:'image'},
          previewDark:{label:'Preview Dark Image',defaultValue:false,widget:'toggle'}
        }
      },
      appearance:{
        title:'Image',
        position:2,
        options:{
          altText:{label:'Alt Text',defaultValue:'',widget:'text'},
          textAlign:{label:'Alignment',defaultValue:'center',widget:'alignment'},
          containerPadding:{label:'Padding',defaultValue:'0px',widget:'text'},
          maxWidth:{label:'Max Width (px)',defaultValue:'600',widget:'text'}
        }
      }
    },
    values:{
      lightImage:{url:''},
      darkImage:{url:''},
      previewDark:false,
      altText:'',
      textAlign:'center',
      containerPadding:'0px',
      maxWidth:'600'
    },
    renderer:{
      Viewer:unlayer.createViewer({
        render:function(values){
          const light = values.lightImage && values.lightImage.url || '';
          const dark = values.darkImage && values.darkImage.url || '';
          const src = values.previewDark && dark ? dark : light;
          const mode = values.previewDark && dark ? 'Dark' : 'Light';
          if (!src) return '<div style="padding:20px;border:2px dashed #ccc;text-align:center;">Choose an image</div>';
          return '<div style="padding:'+esc(values.containerPadding||'0px')+';text-align:'+esc(values.textAlign||'center')+';">'
            +'<div style="font:11px Arial,sans-serif;color:#777;margin-bottom:4px;">Preview: '+mode+'</div>'
            +'<img src="'+esc(src)+'" alt="'+esc(values.altText||'')+'" style="display:inline-block;width:100%;height:auto;max-width:'+esc(values.maxWidth||'600')+'px;border:0;">'
            +'</div>';
        }
      }),
      exporters:{
        web:themeImageHtml,
        email:themeImageHtml
      },
      head:{
        css:function(values){
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
        js:function(){return '';}
      }
    },
    validator:function(){return [];}
  });
})();