import $m from 'mithril';

import { getTracker } from './Tracker';
import { HComputations } from './HComputations';

// ---------------------------------------------------------------------------------------------------------------------

export class HComponent {
  /**
   * Конструктор компонента
   * @param {Object} args параметры компонента
   * @param {*} ctrlArgs аргументы конструктора контроллера
   */
  constructor(args, ...ctrlArgs) {
    args = args || {};

    this._model = null;
    this._view = null;
    this._controller = null;
    this._component = null;

    this._computations = new HComputations(this);
    this._viewport = null;
    this._vnode = null;
    this._eventHandlers = {
      init: [],
      create: [],
      beforeupdate: [],
      update: [],
      beforeremove: [],
      remove: []
    };

    this.setModel(args.model);
    this.setView(args.view);
    this.buildController(args.controller, ...ctrlArgs);
  }

  /**
   * Получение компонента mithril
   * @see http://mithril.js.org/components.html
   * @returns {Object} компонент mithril
   * @private
   */
  _getMithrilComponent() {
    if (this._component) return this._component;

    let view = this.getView();
    let controller = this.getController();

    return this._component = {
      oninit() {
        if (controller && typeof controller.oninit === 'function')
          return controller.oninit(...arguments);
      },
      oncreate() {
        if (controller && typeof controller.oncreate === 'function')
          return controller.oncreate(...arguments);
      },
      onbeforeupdate() {
        if (controller && typeof controller.onbeforeupdate === 'function')
          return controller.onbeforeupdate(...arguments);
      },
      onupdate() {
        if (controller && typeof controller.onupdate === 'function')
          return controller.onupdate(...arguments);
      },
      onbeforeremove() {
        if (controller && typeof controller.onbeforeremove === 'function')
          return controller.onbeforeremove(...arguments);
      },
      onremove() {
        if (controller && typeof controller.onremove === 'function')
          return controller.onremove(...arguments);
      },

      view: view
    };
  }

  /**
   * Задание модели
   * @param {*|null} model модель
   * @returns {HComponent}
   */
  setModel(model) {
    if (model === undefined) return this;
    this._model = model;
    return this;
  }

  /**
   * Получение модели
   * @returns {*|null}
   */
  getModel() {
    return this._model;
  }

  /**
   * Задание функции вида
   * @param {Function|null} view функция вида
   * @returns {HComponent}
   */
  setView(view) {
    if (view === undefined) return this;
    this._view = ()=> view.call(this, $m, this, this.getController(), this.getModel());
    return this;
  }

  /**
   * Получение функции вида
   * @returns {Function|null}
   */
  getView() {
    return this._view;
  }

  /**
   * Сборка контроллера
   * @param {Function|null} Controller конструктор контроллера
   * @param {*} args аргументы конструктора контроллера
   * @returns {HComponent}
   */
  buildController(Controller, ...args) {
    if (Controller === undefined) return this;

    this._controller = Controller ? (()=> {
      let component = this;

      class HController extends Controller {
        oninit() {
          component._computations.stopAll();
          let res;
          if (typeof super.oninit === 'function') res = super.oninit(...arguments);
          component._eventHandlers.init.forEach(eventHandler => eventHandler(...arguments));
          return res;
        }

        oncreate(vnode) {
          component._vnode = vnode;
          let res;
          if (typeof super.oncreate === 'function') res = super.oncreate(...arguments);
          component._eventHandlers.create.forEach(eventHandler => eventHandler(...arguments));
          return res;
        }

        onbeforeupdate() {
          let res;
          if (typeof super.onbeforeupdate === 'function') res = super.onbeforeupdate(...arguments);
          component._eventHandlers.beforeupdate.forEach(eventHandler => eventHandler(...arguments));
          return res;
        }

        onupdate() {
          let res;
          if (typeof super.onupdate === 'function') res = super.onupdate(...arguments);
          component._eventHandlers.update.forEach(eventHandler => eventHandler(...arguments));
          return res;
        }

        onbeforeremove() {
          let res;
          if (typeof super.onbeforeremove === 'function') res = super.onbeforeremove(...arguments);
          component._eventHandlers.beforeremove.forEach(eventHandler => eventHandler(...arguments));
          return res;
        }

        onremove() {
          component._computations.stopAll();
          let res;
          if (typeof super.onremove === 'function') res = super.onremove(...arguments);
          component._eventHandlers.remove.forEach(eventHandler => eventHandler(...arguments));
          return res;
        }

        getComponent() {
          if (typeof super.getComponent === 'function') return super.getComponent(...arguments);
          return component;
        }

        getModel() {
          if (typeof super.getModel === 'function') return super.getModel(...arguments);
          return component.getModel();
        }

        redraw() {
          if (typeof super.redraw === 'function') return super.redraw(...arguments);
          return component.redraw(...arguments);
        }

        watch() {
          if (typeof super.watch === 'function') try {
            return super.watch(...arguments);
          }
          catch (err) {
            if (!(err instanceof TypeError)) console.error(err);
          }
          return component.watch(...arguments);
        }

        autorun() {
          if (typeof super.autorun === 'function') return super.autorun(...arguments);
          return component.autorun(...arguments);
        }

        nonreactive() {
          if (typeof super.nonreactive === 'function') return super.nonreactive(...arguments);
          return component.nonreactive(...arguments);
        }

        subscribe() {
          if (typeof super.subscribe === 'function') return super.subscribe(...arguments);
          return component.subscribe(...arguments);
        }

        setInterval() {
          if (typeof super.setInterval === 'function') return super.setInterval(...arguments);
          return component.setInterval(...arguments);
        }

        setTimeout() {
          if (typeof super.setTimeout === 'function') return super.setTimeout(...arguments);
          return component.setTimeout(...arguments);
        }
      }

      return new HController(...args);
    })() : null;

    return this;
  }

  /**
   * Получение контроллера
   * @returns {Object|null}
   */
  getController() {
    return this._controller;
  }

  /**
   * Монтирование компонента
   * @see http://mithril.js.org/mount.html
   * @param {HTMLElement|null} viewport вьюпорт
   * @returns {MithrilComponent|HComponent}
   */
  mount(viewport) {
    let component = this._getMithrilComponent();
    if (!viewport) return $m(component);
    $m.mount(this._viewport = viewport, component);
    return this;
  }

  /**
   * Размонтирование компонента
   * @returns {HComponent}
   */
  unmount() {
    if (this._viewport) $m.mount(this._viewport, null);
    else if (this._vnode) {
      this._component.onbeforeremove(this._vnode);
      this._vnode.dom.remove();
      this._component.onremove(this._vnode);
    }
    return this;
  }

  /**
   * Перерисовка компонента
   * @returns {HComponent}
   */
  redraw() {
    $m.redraw();
    return this;
  }

  /**
   * Отслеживание изменений с последующей перерисовкой компонента
   * @returns {Computation} вычисление
   */
  watch() {
    return this._computations.watch(...arguments);
  }

  /**
   * Создание реактивного вычисления
   * @returns {Computation} вычисление
   */
  autorun() {
    return this._computations.autorun(...arguments);
  }

  /**
   * Предотвращение реактивного вычисления
   */
  nonreactive() {
    let Tracker = getTracker();
    if (!Tracker) throw new Error('Tracker is not defined');

    return Tracker.nonreactive(...arguments);
  }

  /**
   * Создание реактивной подписки
   * @returns {Subscribe} подписка
   */
  subscribe() {
    return this._computations.subscribe(...arguments);
  }

  /**
   * Задание интервала
   * @returns {Number} идентификатор интервала
   */
  setInterval() {
    return this._computations.setInterval(...arguments);
  }

  /**
   * Задание таймаута
   * @returns {Number} идентификатор таймаута
   */
  setTimeout() {
    return this._computations.setTimeout(...arguments);
  }

  /**
   * Добавление обработчика события
   * @param {String} eventName имя события
   * @param {Function} eventHandler обработчик события
   * @returns {HComponent}
   */
  on(eventName, eventHandler) {
    this._eventHandlers[eventName].push(eventHandler);
    return this;
  }
}
