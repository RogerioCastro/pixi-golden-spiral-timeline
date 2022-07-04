/**
 * Via: https://atomiks.github.io/tippyjs/
 */

import tippy, { followCursor, hideAll } from 'tippy.js'
import 'tippy.js/dist/tippy.css'
// import 'tippy.js/themes/translucent.css'

/**
 * Cria o controlador de tooltips em um elemento HTML
 * @param {HTMLElement} target Elemento HTML que receberá a funcionalidade
 */
export default function createTooltip (target) {
  // Configurando a tooltip
  const tooltip = tippy(target, {
    followCursor: true,
    trigger: 'manual',
    theme: 'custom',
    placement: 'right',
    arrow: false,
    appendTo: 'parent',
    allowHTML: true,
    plugins: [followCursor],
  })

  return {
    show: (data, format) => {
      let content
      if (format && typeof format === 'function') {
        content = format(data)
      } else {
        content = data
      }
      tooltip.setContent(content)
      tooltip.show()
    },
    hide: () => {
      tooltip.hide()
    },
    destroy: () => {
      hideAll()
      tooltip.destroy()
    },
    instance: tooltip,
    hideAll
  }
}