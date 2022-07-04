/**
 * Via: https://popper.js.org/docs/v2/
 */

import { createPopper } from '@popperjs/core';
import createOverlay from './overlay';
import createIcon from './icon';
import { createElement, getWindowSize, addClass, removeClass } from './utils';

export default function createDialog (options) {
  let container = options.container;
  let winSize = getWindowSize();
  let titleContent, bodyContent;
  let virtualElement = { // Elemento virtual para o popper simular um diálogo
    getBoundingClientRect: () => ({
      width: 0,
      height: 0,
      top: winSize.height / 2,
      left: winSize.width / 2,
      bottom: winSize.height / 2,
      right: winSize.width / 2
    }),
  };
  // Elemento principal (dialog)
  let dialog = createElement('div', {
    className: 'dialog'
  });
  // Elemento principal (dialog)
  let dialogContainer = createElement('div', {
    className: 'dialog-container'
  });
  // Cabeçalho (toolbar)
  let header = createElement('div', {
    className: 'dialog-header'
  });
  // Botão FECHAR
  let closeIcon = createIcon({ icon: 'close', className: 'dialog-close' });
  // Título
  let title = createElement('div', {
    className: 'dialog-title'
  });
  // Conteúdo
  let body = createElement('div', {
    className: 'dialog-body'
  });
  let overlay = createOverlay({
    onClick: hide
  });

  header.appendChild(title);
  header.appendChild(closeIcon);
  dialogContainer.appendChild(header);
  dialogContainer.appendChild(body);
  dialog.appendChild(dialogContainer);
  container.appendChild(overlay.element);
  container.appendChild(dialog);

  // Iniciando o popper
  const popper = createPopper(virtualElement, dialog, {
    placement: 'bottom',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: ({ popper }) => {
            // Centralizando o popper verticalmente
            return [0, -(popper.height / 2)]
          },
        },
      }
    ],
  });

  /**
   * Exibe o popover
   */
  function show (params) {
    title.innerHTML = params.title;
    body.innerHTML = params.content;
    // Exibindo
    overlay.show();
    dialog.setAttribute('data-show', '');
    // Evitando o scroll da página abaixo do diálogo
    // via: https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/
    removeClass(dialog, 'dialog-out');
    addClass(dialog, 'dialog-in');
    addClass(document.body, 'dialog-open');
    // Habilitando os eventos da instância (performance)
    // via: https://popper.js.org/docs/v2/tutorial/#performance
    popper.setOptions((popperOptions) => ({
      ...popperOptions,
      modifiers: [
        ...popperOptions.modifiers,
        { name: 'eventListeners', enabled: true }
      ]
    }));
    // Atualizando a instância
    popper.update();
  }

  /**
   * Oculta o popover
   */
  function hide () {
    // Ocultando
    overlay.hide();
    removeClass(dialog, 'dialog-in');
    addClass(dialog, 'dialog-out');
    setTimeout(() => {
      dialog.removeAttribute('data-show');
      title.innerHTML = '';
      body.innerHTML = '';
    }, 600);
    
    // Voltando o scroll da página abaixo do diálogo
    removeClass(document.body, 'dialog-open');
    // Desabilitando os eventos da instância (performance)
    // via: https://popper.js.org/docs/v2/tutorial/#performance
    popper.setOptions((popperOptions) => ({
      ...popperOptions,
      modifiers: [
        ...popperOptions.modifiers,
        { name: 'eventListeners', enabled: false }
      ]
    }));
  }

  /**
   * destrói o componente
   */
  function destroy () {
    popper.destroy();
    overlay.destroy();
  }

  closeIcon.addEventListener('click', hide, false);

  return {
    element: dialog,
    destroy,
    show,
    hide
  };
}