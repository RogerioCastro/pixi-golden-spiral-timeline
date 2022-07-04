/**
 * Via: https://www.youtube.com/watch?v=czETLIAeAUU
 * Inspiration: https://www.creativecruise.nl/
 * Ref: https://pixijs.download/release/docs/index.html
 * Ref: https://greensock.com/docs/v3/GSAP/gsap.to()
 * Ref: https://greensock.com/docs/v3/Eases
 */
// import { Application, Sprite, Texture } from 'pixi.js';
import * as PIXI from 'pixi.js';
import { WebfontLoaderPlugin } from "pixi-webfont-loader";
import { scaleLinear } from 'd3-scale';
import { debounce, truncateString, getWindowSize, extent } from './utils';
import createTooltip from './tooltip';
import createDialog from './dialog';
import timelineData from './data.json';
import "./styles.css";

PIXI.Loader.registerPlugin(WebfontLoaderPlugin);

class Sketch {
  constructor () {
    /* console.info('testando...', windowSize);
    document.getElementById('header').innerHTML = windowSize.element.innerWidth; */
    let windowSize = getWindowSize();
    this.loading = document.getElementById('loading');
    this.width = windowSize.width;
    this.height = windowSize.height;
    this.currentRotation = 0;
    this.stepWheel = 0.1;
    this.containerChunkSize = 3;
    this.chunksTotal = Math.ceil(timelineData.length / this.containerChunkSize);
    // this.maxCurrentWheel = this.stepWheel * 5;
    // this.minCurrentWheel = 0.45 * timelineData.length * -1;
    this.maxCurrentWheel = 0.5;
    this.minCurrentWheel = ((Math.ceil(timelineData.length / this.containerChunkSize) - 1) * Math.PI / 2) * -1;
    this.yearsExtent = extent(timelineData.map(t => t.year))
    this.texts = [];
    this.circles = [];
    this.app = new PIXI.Application({
      // backgroundColor: 0xffdec9,
      resolution: window.devicePixelRatio || 1,
      resizeTo: windowSize.element,
      backgroundAlpha: 0,
      antialias: true
    });
    this.canvas = this.app.view;
    document.body.appendChild(this.app.view);
    this.tooltip = createTooltip(this.canvas);
    this.dialog = createDialog({ container: document.body });

    this.container = new PIXI.Container();
    this.containerSpiral = new PIXI.Container();
    this.containerControl = new PIXI.Container();
    this.app.stage.addChild(this.containerSpiral);
    this.app.stage.addChild(this.container);
    this.app.stage.addChild(this.containerControl);
    this.controlMarker = null;
    this.controlMargin = 60;
    this.controlPositionY = this.height - 20;
    this.time = 0;
    this.phi = 0.5 + Math.sqrt(5)/2;
    this.center = 0.7213595499957939;
    this.touchY = 0;
    this.container.interactiveChildren = true;
    
    this.app.view.addEventListener('wheel', this.onWheel.bind(this));
    this.app.view.addEventListener('touchmove', this.onTouchMove.bind(this));
    this.app.view.addEventListener('touchstart', this.onTouchStart.bind(this));
    /* this.app.view.addEventListener('click', () => {
      // -4.71238898038469
      this.currentRotation = -7.853981633974483;
      gsap.to(this.container, {
        rotation: this.currentRotation,
        duration: 1,
        onUpdate: () => {
          this.container.scale.set(Math.pow(1/this.phi,this.container.rotation/(Math.PI/2)));
          this.rotateTexts();
          this.updateControlMarker();
        }
      });
    }); */

    // Ordem por ano decrescente (maior para o menor)
    timelineData.sort((a, b) => (a.year < b.year) ? 1 : ((b.year < a.year) ? -1 : 0));

    // Carregando assets
    this.app.loader
      // .add({ name: 'Google Roboto', url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap' })
      .add({ name: 'Google Fjalla', url: 'https://fonts.googleapis.com/css2?family=Fjalla+One&display=swap' })
      .add('assets/circles1.png')
      .add('assets/circles2.png')
      .add('assets/circles3.png')
      .add('assets/circles3end.png')
      .add('assets/control-marker.png');



    this.app.loader.load(() => {
      this.loading.style.display = 'none';
      this.addGoldenSpiral();
      this.addStuff();
      this.addTimelineControl();
      this.render();
      gsap.to(this.container, {
          rotation: 0.3,
          duration: 1.5,
          ease: 'back',
          onUpdate: () => {
            this.rotateTexts();
            this.currentRotation = this.container.rotation;
            this.container.scale.set(Math.pow(1/this.phi,this.currentRotation/(Math.PI/2)));
            this.updateControlMarker();
          }
      });
    });

    // Refazendo os containers no redimensionamento da janela
    window.addEventListener('resize', debounce(500, () => {
      let windowSize = getWindowSize();
      this.containerControl.removeChildren();
      this.containerSpiral.removeChildren();
      this.container.removeChildren();
      this.width = windowSize.width;
      this.height = windowSize.height;
      this.controlMarker = null;
      this.controlPositionY = this.height - 20;
      this.addGoldenSpiral();
      this.addStuff();
      this.addTimelineControl();
      this.rotateTexts();
      this.updateControlMarker();
    }));
    
  }

  addGoldenSpiral () {
    this.ctx = new PIXI.Graphics;
    this.ctx.lineStyle(2, 0xffffff, 0.1);

    let lastRight = this.width;
    let lastBottom = this.width/this.phi;
    let tempHorizontal, tempVertical;

    this.ctx.moveTo(0, lastBottom);
    this.ctx.lineTo(lastRight, lastBottom);
    this.ctx.moveTo(lastRight, lastBottom);
    this.ctx.arc(lastRight, lastBottom, lastRight, 0.5*Math.PI, Math.PI);

    let lastLeft = lastRight/this.phi;
    this.ctx.moveTo(lastLeft, 0);
    this.ctx.lineTo(lastLeft, lastBottom);
    this.ctx.moveTo(lastLeft, lastBottom);
    this.ctx.arc(lastLeft, lastBottom, lastLeft, Math.PI, 1.5*Math.PI);
    let lastTop = lastBottom/this.phi;

    this.ctx.moveTo(lastLeft, lastTop);
    this.ctx.lineTo(lastRight, lastTop);
    this.ctx.moveTo(lastLeft, lastTop);
    this.ctx.arc(lastLeft, lastTop, lastTop, 1.5*Math.PI, 0);

    lastRight = lastRight - (lastRight - lastLeft)/this.phi;
    this.ctx.moveTo(lastRight, lastTop);
    this.ctx.lineTo(lastRight, lastBottom);
    this.ctx.moveTo(lastRight, lastTop);
    this.ctx.arc(lastRight, lastTop, lastBottom - lastTop, 0, 0.5*Math.PI);

    tempVertical = lastBottom - (lastBottom - lastTop)/this.phi;
    this.ctx.moveTo(lastLeft, tempVertical);
    this.ctx.lineTo(lastRight, tempVertical);
    this.ctx.moveTo(lastRight, tempVertical);
    this.ctx.arc(lastRight, tempVertical, lastBottom - tempVertical, 0.5*Math.PI, Math.PI);
    lastBottom = tempVertical;

    tempHorizontal = lastLeft + (lastRight - lastLeft)/this.phi;
    this.ctx.moveTo(tempHorizontal, lastTop);
    this.ctx.lineTo(tempHorizontal, lastBottom);
    this.ctx.moveTo(tempHorizontal, lastBottom);
    this.ctx.arc(tempHorizontal, lastBottom, tempHorizontal - lastLeft, Math.PI, 1.5*Math.PI);
    lastLeft = tempHorizontal;

    tempVertical = lastTop + (lastBottom - lastTop)/this.phi;
    this.ctx.moveTo(lastLeft, tempVertical);
    this.ctx.lineTo(lastRight, tempVertical);
    this.ctx.moveTo(lastLeft, tempVertical);
    this.ctx.arc(lastLeft, tempVertical, lastRight - lastLeft, 1.5*Math.PI, 0);
    lastTop = tempVertical;

    tempHorizontal = lastRight - (lastRight - lastLeft)/this.phi;
    this.ctx.moveTo(tempHorizontal, lastTop);
    this.ctx.lineTo(tempHorizontal, lastBottom);
    this.ctx.moveTo(tempHorizontal, lastTop);
    this.ctx.arc(tempHorizontal, lastTop, lastRight - tempHorizontal, 0, 0.5*Math.PI);
    lastRight = tempHorizontal;

    tempVertical = lastBottom - (lastBottom - lastTop)/this.phi;
    this.ctx.moveTo(lastLeft, tempVertical);
    this.ctx.lineTo(lastRight, tempVertical);
    this.ctx.moveTo(lastRight, tempVertical);
    this.ctx.arc(lastRight, tempVertical, lastRight - lastLeft, 0.5*Math.PI, Math.PI);
    lastBottom = tempVertical;

    tempHorizontal = lastLeft + (lastRight - lastLeft)/this.phi;
    this.ctx.moveTo(tempHorizontal, lastTop);
    this.ctx.lineTo(tempHorizontal, lastBottom);
    this.ctx.moveTo(tempHorizontal, lastBottom);
    this.ctx.arc(tempHorizontal, lastBottom, tempHorizontal - lastLeft, Math.PI, 1.5*Math.PI);
    lastLeft = tempHorizontal;

    tempVertical = lastTop + (lastBottom - lastTop)/this.phi;
    this.ctx.moveTo(lastRight, tempVertical);
    this.ctx.lineTo(lastLeft, tempVertical);
    this.ctx.moveTo(lastLeft, tempVertical);
    this.ctx.arc(lastLeft, tempVertical, lastRight - lastLeft, 1.5*Math.PI, 0);
    lastBottom = tempVertical;

    // console.info('=>', tempVertical/this.height, lastLeft/this.width);
    this.center = lastLeft/this.width;

    this.containerSpiral.addChild(this.ctx);
  }

  addStuff () {
    this.centerX = this.width*this.center;
    this.centerY = this.width*this.center/this.phi;

    this.container.pivot.set(this.centerX, this.centerY);
    this.container.position.set(this.centerX, this.centerY);

    let containerIndexes = 0;
    this.texts = [];
    this.circles = [];

    for (let i = 0; i < timelineData.length; i += this.containerChunkSize) {
      // Dividindo as timelines em grupos de 3
      const timelinesChunk = timelineData.slice(i, i + this.containerChunkSize);
      let containerCircles = new PIXI.Container();
      let angle = containerIndexes * Math.PI / 2;
      let scale = Math.pow(1 / this.phi, containerIndexes);
      let circlesType = timelinesChunk.length < this.containerChunkSize 
        ? timelinesChunk.length
        : containerIndexes === (this.chunksTotal - 1) ? '3end' : 3;
      
      let spriteCircles = this.getCircles(circlesType);
      spriteCircles.width = this.width / this.phi;
      spriteCircles.height = this.width / this.phi;
      spriteCircles.position.set(-this.centerX, -this.centerY);

      containerCircles.interactiveChildren = true;
      containerCircles.position.set(this.centerX, this.centerY);
      containerCircles.scale.set(scale*0.95);
      containerCircles.rotation = angle;

      containerCircles.addChild(spriteCircles);

      timelinesChunk.forEach((timelineItem, idx) => {
        let timelineCircle = this.getInterativeCircle(idx);
        let timelineText = this.getTimelineItemText(timelineItem, idx, angle);
        // console.info('->', timelineText);
        timelineCircle
          .on('pointerover', () => {
            timelineCircle.alpha = 0.8;
            timelineText.style.fill = '#ffffff';
            this.tooltip.show(this.getTooltipContent(timelineItem));
          })
          .on('pointerout', () => {
            timelineCircle.alpha = 0.2;
            timelineText.style.fill = '#2b2947';
            this.tooltip.hide();
          })
          .on('pointerdown', () => {
            // timelineCircle.alpha = 1;
            gsap.to(timelineCircle, {
              alpha: 1,
              duration: 0.05,
              repeat: 1,
              yoyo: true
            });
            this.dialog.show({
              title: timelineItem.title,
              content: timelineItem.content,
            });
          });
        
        this.texts.push(timelineText);
        this.circles.push(timelineCircle);
        containerCircles.addChild(timelineCircle);
        containerCircles.addChild(timelineText);
        // console.log('item:', timelineItem.year, timelineText.rotation);
      });

      this.container.addChild(containerCircles);
      containerIndexes++;
    }
  }

  addTimelineControl () {
    // Atualizando a função de escala
    this.controlScale = scaleLinear()
      .domain([this.maxCurrentWheel, this.minCurrentWheel])
      .range([this.width - this.controlMargin, this.controlMargin]);
    const controlLine = new PIXI.Graphics;
    const controlBox = new PIXI.Sprite(PIXI.Texture.WHITE);
    const textStyle = new PIXI.TextStyle({ 
      fontFamily: 'Fjalla One',
      fontSize: '14px',
      fill: '#ffffff',
      align: 'center'
    });
    const minYearText = new PIXI.Text(this.yearsExtent[0], textStyle);
    const maxYearText = new PIXI.Text(this.yearsExtent[1], textStyle);
    
    minYearText.anchor.set(1, 0.5);
    minYearText.x = this.controlMargin - 10;
    minYearText.y = this.controlPositionY;
    maxYearText.anchor.set(0, 0.5);
    maxYearText.x = this.width - this.controlMargin + 10;
    maxYearText.y = this.controlPositionY;

    controlBox.tint = 0x000000;
    controlBox.alpha = 0.4;
    controlBox.width = this.width;
    controlBox.height = 40;
    controlBox.x = 0;
    controlBox.y = this.height - 40;
    
    controlLine.lineStyle(1, 0xffffff, 0.8);
    controlLine.moveTo(this.controlMargin, this.controlPositionY);
    controlLine.lineTo(this.width - this.controlMargin, this.controlPositionY);

    this.controlMarker = this.getControlMarker();
    this.controlMarker.anchor.set(0.5, 0.5);
    this.controlMarker.position.set(this.width - this.controlMargin, this.controlPositionY);
    this.controlMarker.interactive = true;
    this.controlMarker.buttonMode = true;
    this.controlMarker
      .on('pointerdown', this.onControlDragStart.bind(this))
      .on('pointerup', this.onControlDragEnd.bind(this))
      .on('pointerupoutside', this.onControlDragEnd.bind(this))
      .on('pointermove', this.onControlDragMove.bind(this))
      .on('touchstart', this.onControlDragStart.bind(this))
      .on('touchend', this.onControlDragEnd.bind(this))
      .on('touchendoutside', this.onControlDragEnd.bind(this))
      .on('touchmove', this.onControlDragMove.bind(this));

    this.containerControl.addChild(controlBox);
    this.containerControl.addChild(controlLine);
    this.containerControl.addChild(minYearText);
    this.containerControl.addChild(maxYearText);
    this.containerControl.addChild(this.controlMarker);
  }

  getInterativeCircle (type = 0) {
    const factors = [
      { s: 0.18, x: 1.08, y: 1.08 },
      { s: 0.17, x: 2.6, y: 3.47 },
      { s: 0.154, x: 5.16, y: 5.32 }
    ] 
    let timelineCircle = new PIXI.Graphics();
    let width = this.width / this.phi;
    let height = width;
    let size = width * factors[type].s;
    timelineCircle.lineStyle(0);
    timelineCircle.beginFill(0x2b2a4a, 1);
    timelineCircle.drawCircle(-this.centerX + size * factors[type].x, -this.centerY + (height - size * factors[type].y), size);
    timelineCircle.endFill();
    timelineCircle.interactive = true;
    timelineCircle.buttonMode = true;
    timelineCircle.alpha = 0.2;
    return timelineCircle;
  }

  getTimelineItemText (timelineItem, type = 0, startAngle = 0) {
    // console.info((this.width / this.phi));
    const factors = [
      { s: 0.18, x: 1.195, y: 0.3, fontSize: `${(this.width / this.phi) * 0.05}px` },
      { s: 0.165, x: 1.61, y: -1.12, fontSize: `${(this.width / this.phi) * 0.045}px` },
      { s: 0.15, x: 3.13, y: -1.93, fontSize: `${(this.width / this.phi) * 0.04}px` }
    ] 
    const text = new PIXI.Text(`${timelineItem.year}\n${timelineItem.title}`,
      new PIXI.TextStyle({ 
        fontFamily: 'Fjalla One',
        fontSize: factors[type].fontSize,
        // fontWeight: '700',
        fill: '#2b2947',
        align: 'center',
        wordWrap: true,
        wordWrapWidth: (this.width / this.phi * factors[type].s)*2,
      }));
    text.anchor.set(0.5, 0.5);
    text.x = -this.centerX / factors[type].x;
    text.y = (-this.centerY + this.width / this.phi) * factors[type].y;
    text.rotation -= startAngle;
    text.startAngle = text.rotation;
    // console.info('text:', text);
    return text;
  }

  getTooltipContent (timelineItem) {
    return `
      <div class="tooltip-title">${timelineItem.title}</div>
      <div class="tooltip-subtitle">${timelineItem.year}</div>
      <div class="tooltip-body">${truncateString(timelineItem.content, 200)}</div>
    `;
  }

  getCircles (length = 3) {
    let circles = new PIXI.Sprite.from(`assets/circles${length}.png`);
    return circles;
  }

  getControlMarker () {
    let marker = new PIXI.Sprite.from('assets/control-marker.png');
    return marker;
  }

  rotateTexts () {
    this.texts.forEach((t) => {
      t.rotation = t.startAngle - this.container.rotation;
    });
  }

  updateControlMarker () {
    let positionX = this.controlScale(this.container.rotation);
    // Não deixando o marcador passar dos limites
    positionX = positionX < this.controlMargin 
      ? this.controlMargin
      : positionX > this.width - this.controlMargin
        ? this.width - this.controlMargin
        : positionX;
    // this.controlMarker.position.set(positionX, this.controlPositionY);
    gsap.to(this.controlMarker.position, {
      x: positionX,
      duration: 0.3,
    });
  }

  updateContainerCoords (duration = 0.3, updateMarker = true) {
    gsap.to(this.container, {
      rotation: this.currentRotation,
      duration,
      onUpdate: () => {
        this.rotateTexts();
        updateMarker && this.updateControlMarker();
        this.container.scale.set(Math.pow(1/this.phi,this.container.rotation/(Math.PI/2)));
      }
    });
    /* gsap.to(this.container.scale, {
      x: Math.pow(1/this.phi,this.currentRotation/(Math.PI/2)),
      y: Math.pow(1/this.phi,this.currentRotation/(Math.PI/2)),
      duration,
    }); */
  }

  /* EVENTOS */
  onWheel (event) {
    event.preventDefault();
    let rotated = false;
    if (event.deltaY > 0 && this.maxCurrentWheel > this.container.rotation) {
      this.currentRotation += this.stepWheel;
      rotated = true;
      // console.log('maior (vai) ->', this.currentRotation);
    } else if (event.deltaY < 0 && this.minCurrentWheel < this.container.rotation) {
      this.currentRotation -= this.stepWheel;
      rotated = true;
      // console.log('menor (vem) ->', this.currentRotation);
    }
    rotated && this.updateContainerCoords();
  }

  onTouchMove (event) {
    event.preventDefault();
    const lastTouch = event.changedTouches[0].clientY;
    let rotated = false;
    if (this.touchY > (lastTouch + 5) && this.maxCurrentWheel > this.container.rotation) {
      this.currentRotation += this.stepWheel;
      rotated = true;
      // console.log('end -> para cima (vai)');
    } else if (this.touchY < (lastTouch - 5) && this.minCurrentWheel < this.container.rotation) {
      this.currentRotation -= this.stepWheel;
      rotated = true;
      // console.log('end -> para baixo (vem)');
    }
    rotated && this.updateContainerCoords();
    this.touchY = lastTouch;
  }

  onTouchStart (event) {
    event.preventDefault();
    this.touchY = event.changedTouches[0].clientY
  }

  onControlDragStart (event) {
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    this.controlMarker.data = event.data;
    this.controlMarker.dragging = true;
  }

  onControlDragEnd () {
    this.controlMarker.dragging = false;
    // set the interaction data to null
    this.controlMarker.data = null;
  }

  onControlDragMove () {
    if (this.controlMarker.dragging) {
      const newPosition = this.controlMarker.data.getLocalPosition(this.controlMarker.parent);
      if (newPosition.x >= this.controlMargin && newPosition.x <= (this.width - this.controlMargin)) {
        this.controlMarker.x = newPosition.x;
        this.currentRotation = this.controlScale.invert(newPosition.x);
        this.updateContainerCoords(0.5, false);
      }
    }
  }

  render () {
    this.app.ticker.add((delta) => {
      this.time += 0.01;
      /* this.container.rotation = this.time;
      this.container.scale.set(Math.pow(1/this.phi,this.time/(Math.PI/2)));
      this.texts.forEach((t) => {
        t.rotation = t.startAngle - this.container.rotation;
      }); */
      // console.info(this.time);
    })
  }
}

new Sketch()