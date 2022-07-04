import { createElement, css, addClass, removeClass } from './utils'

/**
 * Componente overlay (fundo)
 *
 * @param {Object} options
 * @returns {Object} Componente overlay
 */
export default function overlay (options) {

  const settings = {
    container: document.body,
    class: 'dialog-overlay',
    onClick: () => {},
    ...options
  }

  /* CRIANDO O ELEMENTO PRINCIPAL E INSERINDO NO CONTAINER */
  let element = createElement('div', {
    className: settings.class
  })
  settings.container.appendChild(element)

  /**
   * Ativa a overlay no container
   */
  function show () {
    css(element, { display: 'block' })
    removeClass(element, 'dialog-out');
    addClass(element, 'dialog-in');
  }

  /**
   * Desativa a overlay do container
   */
  function hide () {
    removeClass(element, 'dialog-in');
    addClass(element, 'dialog-out');
    setTimeout(() => {
      css(element, { display: 'none' })
    }, 600);
    
  }

  /**
   * destrói o componente
   */
  function destroy () {
    element.remove()
    element = null
  }

  /* EVENTOS (HANDLERS) */
  /**
   * Manipula o evento click no elemento overlay e dispara o evento onClick do componente
   * @param {Object} e Evento
   */
  function onClick (e) {
    e.preventDefault()
    settings.onClick()
  }

  /* EVENTOS (LISTENERS) */
  element.addEventListener('click', onClick, false)

  return {
    element,
    destroy,
    show,
    hide
  }
}