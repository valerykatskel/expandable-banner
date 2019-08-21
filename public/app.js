var vm = new Vue({
  el: '#app',
  template: '<div class="tb-vision"><div class="tb-vision-holder"><div class="tb-vision-wrapper" :class="tappedClass" :style="inlineHeight"><div v-if="showSmallBanner" class="tb-vision-part tb-vision--small" :style="inlineSmallOpacity" v-touch:tap.prevent="onBannerTap" v-touch:start="onBannerDown" v-touch:moving="onBannerMove" v-touch:end="onBannerUp"><img src="./assets/banner-small.png" alt=""/></div><div v-if="showBigBanner" class="tb-vision-part tb-vision--big" :style="inlineBigOpacity"><a :href="this.goUrl" @click.prevent="onClickLink"><img src="./assets/banner-big.jpg" alt=""></a></div></div></div><div class="tb-vision-button" v-touch:tap="onBannerTap" v-touch:start="onBannerDown" v-touch:moving="onBannerMove" v-touch:end="onBannerUp"><span>Свернуть</span></div></div>',
  data: {
    goUrl: 'http://www.tut.by/',
    bannerMinHeight: 80, // Минимальная высота баннера (равняется высоте малого подбаннера).
    bannerMaxHeight: 300, // Максимальная  высота баннера (равняется высоте большого подбаннера).
    bannerHeight: 80, // Изначальная высота баннера (равняется малому подбаннеру).
    bannerDragActive: false, // Свойство, показывающее, что мы начали свайпить баннер.
    yPos: 0, // Свойство хранит координаты пальца при свайпе.
    bannerSmallOpacity: 1, // Начальная прзрачность малого подбаннера.
    bannerBigOpacity: 0, // Начальная прозрачность большого подбаннера.
    direction: 'none', // Свойство хранит направление, в котором растягивается баннер: вниз (раскрываем) или вверх (схлопываем).
    bigPartTriggerValue: 0.2, // Свойство хранит расстояние до максимальной высоты баннера (в %), с которого начнет показываться большой подбаннер.
    useTapEvent: true,
  },
  methods: {
    onBannerTap: function() {
      // Метод вызывается, когда мы тапнули по кнопке или мелкому подбаннеру
      // Если мы тапнули по большому подбаннеру, то редиректим на страницу рекламодателя
      this.useTapEvent = true;
      if (this.bannerHeight === this.bannerMinHeight) {
        this.bannerHeight = this.bannerMaxHeight;
      } else {
        this.bannerHeight = this.bannerMinHeight;
      }
    },

    onClickLink: function (event) {
      // Метод вызывается, когда мы кликнули по ссылке в большом подбаннере
      window.open(this.goUrl,'_blank');
    },

    onBannerDown: function (event) {
      // Метод вызывается, когда мы нажали по кнопке или мелкому подбаннеру   
      this.useTapEvent = false; 
      this.bannerDragActive = true;
      this.yPos = event.targetTouches[0].clientY;
    },
    
    onBannerUp: function () {
      // Метод вызывается, когда мы отпустили кнопку или мелкий подбаннер
      this.bannerDragActive = false;
      this.useTapEvent = true;
      this.yPos = 0;
    },
    
    onBannerMove: function (event) {
      // Метод вызывается, когда мы двигаем пальцем по тачскрину      
      if (this.bannerDragActive) {
        // Получаем текущую координату y при движении пальцем по тачскрину
        let currentY = event.targetTouches[0].clientY;
        // Получаем разность в пикселях между предыдущей координатой y и текущей
        let diff = currentY - this.yPos;
        // Обновляем координаты пальца при свайпе
        this.yPos = currentY;
        // Высчитываем новую высоту баннера
        this.bannerHeight += diff;        
        // Обновляем значение прозрачности для малого подбаннера
        this.getOpacityForSmallBannerPart(diff);
        // Обновляем значение прозрачности для большого подбаннера
        this.getOpacityForBigBannerPart(diff);

        // Ограничим изменение высоты баннера
        this.checkBannerHeight();
      }
    },

    getOpacityForSmallBannerPart: function (diff) {
      // Метод обновляет значение прозрачности для малого подбаннера
      let opacityDiff = (diff*(100/this.bannerMovingSize))/100;
      this.bannerSmallOpacity -= opacityDiff;
      if (this.bannerSmallOpacity < 0) this.bannerSmallOpacity = 0;
      if (this.bannerSmallOpacity > 1) this.bannerSmallOpacity = 1; 
    },
 
    getOpacityForBigBannerPart: function (diff) {
      // Метод обновляет значение прозрачности для большого подбаннера
      if (this.showBigBanner) {
        if (this.bannerHeight >= this.bannerMaxHeight) {
          this.bannerBigOpacity = 1;
        } else {
          let opacityDiff = (diff*(100/(this.bannerMovingSize*this.bigPartTriggerValue)))/100;
          this.bannerBigOpacity += opacityDiff;
            
          if (this.bannerBigOpacity < 0) this.bannerBigOpacity = 0;
          if (this.bannerBigOpacity > 1) this.bannerBigOpacity = 1; 
        }
      }
    }, 

    checkBannerHeight: function () {
      // Свойство обновляет высоту баннера, если это требуется
      if (this.bannerHeight < this.bannerMinHeight) {
        this.bannerHeight = this.bannerMinHeight;
      }
      if (this.bannerHeight > this.bannerMaxHeight) {
        this.bannerHeight = this.bannerMaxHeight;
      }
    },
  },

  watch: {
    bannerHeight: function (newValue, oldValue) {
      // Слушаем изменения свойства высоты баннера
      if (newValue === this.bannerMinHeight && newValue === this.bannerMaxHeight) {
        this.yPos = 0;
        this.bannerDragActive = false;
      }

      // Добавим оверлей
      if (newValue > this.bannerMinHeight) {
        document.querySelector('body').classList.add('active');
        // Проверим наличие функции adfox для расхлопа фрейма
        if (typeof window.expandBanner === "function") {
          window.expandBanner();
        }
      }

      // Удалим оверлей
      if (newValue === this.bannerMinHeight) {
        document.querySelector('body').classList.remove('active')
        // Проверим наличие функции adfox для расхлопа фрейма
        if (typeof window.collapseBanner === "function") { 
          window.collapseBanner();
        }
      }

      // Определяем направление изменения высоты баннера
      this.direction = newValue > oldValue? 'down' : 'up';

      // Уводим в ноль прозрачность малого подбаннера на очень маленьких значениях прозрачности, чтобы не было прыжков этой самой прозрачности (артефакт)
      if (this.direction === 'down' && this.bannerSmallOpacity <= 0.1)
        this.bannerSmallOpacity = 0;
    },

    bannerDragActive: function (newValue) {
      // Слушаем изменения свойства начала изменения высоты баннера
      if (!newValue && this.bannerHeight > this.bannerMinHeight)
        this.bannerHeight = this.bannerMaxHeight;

      if (!newValue) {
        if (this.direction === 'down') {
          this.bannerHeight = this.bannerMaxHeight;
          this.bannerSmallOpacity = 0;
          this.bannerBigOpacity = 1;
        }
        if (this.direction === 'up') {
          this.bannerHeight = this.bannerMinHeight;
          this.bannerSmallOpacity = 1;
          this.bannerBigOpacity = 0;
        }
      } 
    },
  },

  computed: {
    inlineHeight: function () {
      // Свойство возвращает инлайн стиль для изменения высоты баннера
      return 'height: ' + this.bannerHeight + 'px';
    },

    inlineSmallOpacity: function () {
      // Свойство возвращает инлайн стиль для обновления прозрачности малого подбаннера
      return 'opacity: ' + this.bannerSmallOpacity;
    },

    inlineBigOpacity: function () {
      // Свойство возвращает инлайн стиль для обновления прозрачности большого подбаннера
      return 'opacity: ' + this.bannerBigOpacity;
    },    

    showBigBanner: function () {
      // Свойство, которое показывает, нужно ли показывать большой подбаннер
      return this.bannerHeight >= (this.bannerMaxHeight - this.bannerMaxHeight * this.bigPartTriggerValue);
    },
    
    showSmallBanner: function () {
      // Свойство, которое показывает, нужно ли показывать малый подбаннер
      return this.bannerHeight < this.bannerMaxHeight;
    },

    bannerMovingSize: function () {
      // Свойство, которое возвращает диапазон (в пикселях), в котором изменяется высота баннера
      return this.bannerMaxHeight - this.bannerMinHeight;
    },

    tappedClass: function () {
      return this.useTapEvent? 'tapped' : '';
    }
  }
}