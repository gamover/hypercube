import $m from 'mithril';

import { HComputations } from './HComputations';

// ---------------------------------------------------------------------------------------------------------------------

export class HComponent {
  /**
   * Конструктор компонента
   * @param {Object} args параметры компонента
   * @param {Any} ctrlArgs аргументы конструктора контроллера
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
      oninit: ()=> {
        if (controller && typeof controller.oninit === 'function') controller.oninit(...arguments);
      },
      oncreate: ()=> {
        if (controller && typeof controller.oncreate === 'function') controller.oncreate(...arguments);
      },
      onbeforeupdate: ()=> {
        if (controller && typeof controller.onbeforeupdate === 'function') controller.onbeforeupdate(...arguments);
      },
      onupdate: ()=> {
        if (controller && typeof controller.onupdate === 'function') controller.onupdate(...arguments);
      },
      onbeforeremove: ()=> {
        if (controller && typeof controller.onbeforeremove === 'function') controller.onbeforeremove(...arguments);
      },
      onremove: ()=> {
        if (controller && typeof controller.onremove === 'function') controller.onremove(...arguments);
      },

      view: view
    };
  }

  /**
   * Задание модели
   * @param {Any|null} model модель
   * @returns {HComponent}
   */
  setModel(model) {
    if (model === undefined) return this;
    this._model = model;
    return this;
  }

  /**
   * Получение модели
   * @returns {Any|null}
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
   * @param {Any} args аргументы конструктора контроллера
   * @returns {HComponent}
   */
  buildController(Controller, ...args) {
    if (Controller === undefined) return this;

    this._controller = Controller ? (()=> {
      let component = this;

      class HController extends Controller {
        oninit() {
          component._computations.stopAll();
          if (typeof super.oninit === 'function') return super.oninit(...arguments);
        }

        oncreate(vnode) {
          component._vnode = vnode;
          if (typeof super.oncreate === 'function') return super.oncreate(...arguments);
        }

        onremove() {
          component._computations.stopAll();
          if (typeof super.onremove === 'function') return super.onremove(...arguments);
        }

        getComponent() {
          if (typeof super.getComponent === 'function') return super.getComponent(...arguments);
          return component;
        }

        getModel() {
          if (typeof super.getModel === 'function') return super.getModel(...arguments);
          return component.getModel();
        }

        watch() {
          if (typeof super.watch === 'function') return super.watch(...arguments);
          return component.watch(...arguments);
        }

        autorun() {
          if (typeof super.autorun === 'function') return super.autorun(...arguments);
          return component.autorun(...arguments);
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

  route(viewport, defaultRoute, route) {
    let component = this._getMithrilComponent();
    $m.route(this._viewport = viewport, defaultRoute, { [route]: component });
    return this;
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
}
