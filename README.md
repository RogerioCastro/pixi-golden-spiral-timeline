# PixiJS Golden Spiral Timeline

Exemplo de uma *timeline* interativa no formato da [espiral dourada](https://en.wikipedia.org/wiki/Golden_spiral), desenvolvido com [PixiJS](https://pixijs.com/) e empacotado com [Rollup](https://rollupjs.org/).

## Demonstração

Veja a demonstração [clicando aqui](https://eixao.com.br/timeline/).

<p align="center"><img src="https://raw.githubusercontent.com/RogerioCastro/pixi-golden-spiral-timeline/main/assets/screen.png"></p>

## Características

- Responde a eventos do mouse e toque;
- Dinâmica ([`data.json`](/src/data.json)).

## Desenvolvimento

Esse exemplo foi desenvolvido utilizando [Rollup](https://rollupjs.org/) para o empacotamento.

```bash
# Dependências
$ npm install

# Utilizando o rollup watch para desenvolvimento
$ npm run watch

# Para testar sem gerar problemas de CORS
# pode ser utilizado um servidor node como o http-server:
$ npm i -g http-server
$ http-server
```

> O comando `npm run build` irá gerar os arquivos `bundle.js` e `bundle.css` no diretório raiz.

> **GSAP 3** e **Particles.js** são dependências externas e estão no diretório [`/assets`](/assets).

> Os dados utilizados estão no arquivo JSON [`/src/data.json`](/src/data.json).

## Créditos

[PixiJS](https://pixijs.com/) - Renderizador 2D WebGL.

[Rollup + PixiJS](https://github.com/bigtimebuddy/pixi-rollup-example) - *Boilerplate* com exemplo de utilização de rollup e PixiJS com vanilla JavaScript.

[Tippy.js](https://atomiks.github.io/tippyjs/) - Solução completa para *tooltips* customizáveis.

[D3 Scale](https://github.com/d3/d3-scale) - Módulo de escalas da D3.js. É utilizada aqui para algumas escalas.

[Popper](https://lodash.com/) - Biblioteca de posicionamento de *tooltips* e *popovers*, utilizada nas janelas (*modal*) de descrição dos itens.

[GSAP 3](https://greensock.com/docs/v3/) - Animações web robustas. Utilizada para suavizar movimentos.

[particles.js](https://vincentgarreau.com/particles.js/) - Animações de párticulas.

[Golden spiral city with pixi.js #45](https://www.youtube.com/watch?v=czETLIAeAUU) - Vídeo com as técnicas utilizadas no site [www.creativecruise.nl](https://www.creativecruise.nl/).

## License

MIT &copy; Rogério Castro