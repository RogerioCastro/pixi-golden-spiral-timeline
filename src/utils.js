/**
 * Fornece uma forma cross-browser para obter as dimensões da tela
 * via: http://stackoverflow.com/questions/5864467/internet-explorer-innerheight
 *
 * @returns {Object} Atributos largura e altura { width, height }
 */
export function getWindowSize () {
  if (window.innerWidth !== undefined) {
    return { width: window.innerWidth, height: window.innerHeight, element: window }
  } else if (document && document.documentElement?.clientWidth !== undefined) {
    const D = document.documentElement
    return { width: D.clientWidth, height: D.clientHeight, element: D }
  } else {
    const D = document.body
    return { width: D.clientWidth, height: D.clientHeight, element: D }
  }
}

/**
 * Aplica regras CSS a um elemento DOM
 * via: https://www.javascripttutorial.net/dom/css/add-styles-to-an-element/
 *
 * @param {Object} element
 * @param {Object|string} style
 */
export function css (element, style) {
  for (const property in style) {
    element.style[property] = style[property]
  }
}

/**
 * Cria um elemento DOM com vários atributos
 * via: https://github.com/usablica/intro.js
 *
 * @param {String} tagName
 * @param {Object} attrs
 * @return Elemento
 */
export function createElement (tagName, attrs) {
  let element = document.createElement(tagName)

  attrs = attrs || {}

  // atributos que precisam ser inseridos por meio da função 'setAttribute'
  const setAttRegex = /^(?:role|data-|aria-)/

  for (const k in attrs) {
    let v = attrs[k]

    if (k === 'style') {
      css(element, v)
    } else if (k.match(setAttRegex)) {
      element.setAttribute(k, v)
    } else {
      element[k] = v
    }
  }

  return element
}

/**
 * Remove todos os elementos dentro de outro elemento HTML informado
 * @param {Object} parent HTMLElement a ser limpo
 */
export function clearElement (parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild)
  }
}

/**
 * Verifica a existência de uma classe CSS em um elemento
 * via: https://stackoverflow.com/questions/26736587/how-to-add-and-remove-classes-in-javascript-without-jquery
 *
 * @param {Object} el Elemento HTML
 * @param {String} className Nome da classe
 */
export function hasClass (el, className) {
  if (el.classList) {
    return el.classList.contains(className)
  }
  return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}

/**
 * Insere uma classe a um elemento, caso ela já não esteja no elemento
 * via: https://stackoverflow.com/questions/26736587/how-to-add-and-remove-classes-in-javascript-without-jquery
 *
 * @param {Object} el Elemento HTML
 * @param {String} className Nome da classe
 */
export function addClass (el, className) {
  if (el.classList) {
    el.classList.add(className)
  } else if (!hasClass(el, className)) {
    el.className += ` ${className}`
  }
}

/**
 * Remove uma classe de um elemento
 * via: https://stackoverflow.com/questions/26736587/how-to-add-and-remove-classes-in-javascript-without-jquery
 *
 * @param {Object} el Elemento HTML
 * @param {String} className Nome da classe
 */
export function removeClass (el, className) {
  if (el.classList) {
    el.classList.remove(className)
  } else if (hasClass(el, className)) {
    const reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
    el.className = el.className.replace(reg, ' ')
  }
}

/**
 * Aplica um debounce na execução de uma função que roda várias vezes durante um evento.
 * @param {number} ms Milissegundos para aguardar a execução da callback
 * @param {Function} fn Função callback
 * @returns Função com debounce aplicado
 */
export function debounce (ms, fn) {
  var timer;
  return function() {
    clearTimeout(timer);
    var args = Array.prototype.slice.call(arguments);
    args.unshift(this);
    timer = setTimeout(fn.bind.apply(fn, args), ms);
  }
}

/**
 * Função para observar o redimensionamento de um elemento HTML utilizando a API ResizeObserver
 * e aplicando um debounce para evitar várias execuções durante o redimensionamento
 * @param {HTMLElement} element Elemento HTML a ser observado
 * @param {Function} fn Callback function que recebe a largura e altura do elemento { width, height }
 * @returns Retorna a instância ResizeObserver criada
 */
export function resizeObserver (element, fn) {
  const ro = new ResizeObserver(debounce(500, (entries) => {
    const { width, height } = entries[0].contentRect;
    fn({ width, height });
  }))
  ro.observe(element);
  return ro;
}

/**
 * via: https://www.30secondsofcode.org/js/s/truncate-string-at-whitespace
 */
export function truncateString (str, lim, ending = '...') {
  if (str.length <= lim) return str;
  const lastSpace = str.slice(0, lim - ending.length + 1).lastIndexOf(' ');
  return str.slice(0, lastSpace > 0 ? lastSpace : lim - ending.length) + ending;
}

/**
 * Retorna a extensão de uma array numérica.
 *
 * @param {Number[]} values - Iterável com os elementos a serem verificados.
 * @param {Function} valueof - Função accessor para cada elemento.
 *
 * @returns {array} Array com dois elementos, valor máximo e mínimo, respectivamente.
 */
export function extent(values, valueof) {
  let min;
  let max;
  if (valueof === undefined) {
      for (const value of values) {
          if (value != null) {
              if (min === undefined) {
                  if (value >= value) min = max = value;
              } else {
                  if (min > value) min = value;
                  if (max < value) max = value;
              }
          }
      }
  } else {
      let index = -1;
      for (let value of values) {
          if ((value = valueof(value, ++index, values)) != null) {
              if (min === undefined) {
                  if (value >= value) min = max = value;
              } else {
                  if (min > value) min = value;
                  if (max < value) max = value;
              }
          }
      }
  }
  return [min, max];
}