import $m from 'mithril';

import { getTracker } from './Tracker.js';

// ---------------------------------------------------------------------------------------------------------------------

export class HComponent {
  constructor(args = {}) {
    this._model = null;
    this._view = null;
    this._controller = null;
    this._component = null;

    this.setModel(args.model);
    this.setView(args.view);
    this.setController(args.controller);
  }

  _buildControllerClass(Controller) {
    const component = this;

    let computations = [];
    let intervalIds = [];
    let timeoutIds = [];

    let stopAllComputations = ()=> {
      for (let computation of computations) computation.stop();
      computations = [];
    };
    let clearAllIntervals = ()=> {
      for (let iid of intervalIds) clearInterval(iid);
      intervalIds = [];
    };
    let clearAllTimeouts = ()=> {
      for (let tid of timeoutIds) clearTimeout(tid);
      timeoutIds = [];
    };
    let stopAll = ()=> {
      stopAllComputations();
      clearAllIntervals();
      clearAllTimeouts();
    };

    return class HController extends Controller {
      constructor() {
        stopAll();
        super(...arguments);
      }

      onunload() {
        stopAll();
        if (super.onunload) return super.onunload(...arguments);
      }

      autorun(fn) {
        let Tracker = getTracker();
        if (!Tracker) throw new Error('Tracker is not defined');

        let computation = Tracker.autorun(fn);
        computations.push(computation);
        return computation;
      }

      watch(fn) {
        let Tracker = getTracker();
        if (!Tracker) throw new Error('Tracker is not defined');

        let computation = Tracker.autorun(c => { fn(); if (!c.firstRun) Tracker.nonreactive(()=> $m.redraw()); });
        computations.push(computation);
        return computation;
      }

      setInterval(fn, timeout) {
        let iid = setInterval(fn, timeout);
        intervalIds.push(iid);
        return iid;
      }

      setTimeout(fn, timeout) {
        let tid = setTimeout(fn, timeout);
        timeoutIds.push(tid);
        return tid;
      }

      getComponent() {
        return component;
      }

      getModel() {
        return component.getModel();
      }
    }
  }

  _buildMithrilComponent(...args) {
    if (this._component) return this._component;

    let Controller = this.getController();

    return this._component = {
      view: ()=> this.getView(true)(),
      controller: Controller ? (()=> new (Function.prototype.bind.apply(Controller, [null].concat(args)))) : null
    }
  }

  getMithril() {
    return $m;
  }

  setModel(model) {
    if (model === undefined) return this;
    this._model = model;
    return this;
  }

  getModel() {
    return this._model;
  }

  setView(view) {
    if (view === undefined) return this;
    this._view = view;
    return this;
  }

  getView(bind) {
    if (this._view && bind) return this._view.bind(this, $m, this, this._controller, this._model);
    return this._view;
  }

  setController(Controller = null) {
    if (Controller === undefined) return this;
    this._controller = Controller ? this._buildControllerClass(Controller) : null;
    return this;
  }

  getController() {
    return this._controller;
  }

  mount(viewport, ...args) {
    let component = this._buildMithrilComponent(...args);
    return $m.mount(viewport, component);
  }

  render(viewport, forceRecreation, ...args) {
    let component = this._buildMithrilComponent(...args);
    return $m.render(viewport, component, forceRecreation);
  }

  embed() {
    return this._buildMithrilComponent(...arguments);
  }
}
