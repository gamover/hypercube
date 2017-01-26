import $m from 'mithril';

import { getMeteor } from './Meteor';
import { getTracker } from './Tracker';

// ---------------------------------------------------------------------------------------------------------------------

export class HComponent {
  constructor(args = {}) {
    this._model = null;
    this._view = null;
    this._controller = null;
    this._component = null;

    this.setModel(args.model);
    this.setView(args.view);
    this.buildController(args.controller);
  }

  _buildControllerClass(Controller) {
    const component = this;

    let computations = [];
    let subscribes = [];
    let intervalIds = [];
    let timeoutIds = [];

    let stopAllComputations = ()=> {
      for (let computation of computations) computation.stop();
      computations = [];
    };
    let stopAllSubscribes = ()=> {
      for (let subscribe of subscribes) subscribe.stop();
      subscribes = [];
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
      stopAllSubscribes();
      clearAllIntervals();
      clearAllTimeouts();
    };

    return class HController extends Controller {
      constructor() {
        stopAll();
        super(...arguments);
      }

      oninit() {
        if (typeof super.oninit === 'function') return super.oninit(...arguments);
      }

      onunload() {
        stopAll();
        if (typeof super.onunload === 'function') return super.onunload(...arguments);
      }

      autorun(...args) {
        let Tracker = getTracker();
        if (!Tracker) throw new Error('Tracker is not defined');

        let computation = Tracker.autorun(...args);
        computations.push(computation);
        return computation;
      }

      subscribe(...args) {
        let Meteor = getMeteor();
        if (!Meteor) throw new Error('Meteor is not defined');

        let subscribe = Meteor.subscribe(...args);
        subscribes.push(subscribe);
        return subscribe;
      }

      watch(fn) {
        let Tracker = getTracker();
        if (!Tracker) throw new Error('Tracker is not defined');

        let computation = Tracker.autorun(c => { fn(); if (!c.firstRun) Tracker.nonreactive($m.redraw); });
        computations.push(computation);
        return computation;
      }

      setInterval(...args) {
        let iid = setInterval(...args);
        intervalIds.push(iid);
        return iid;
      }

      setTimeout(...args) {
        let tid = setTimeout(...args);
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

  _getMithrilComponent() {
    if (this._component) return this._component;

    let view = this.getView();
    let controller = this.getController();

    return this._component = {
      view: view,
      controller: controller ? ()=> {
        controller.oninit();
        return controller;
      } : null
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
    this._view = ()=> view.call(this, this.getMithril(), this, this.getController(), this.getModel());
    return this;
  }

  getView() {
    return this._view;
  }

  buildController(Controller, ...args) {
    if (Controller === undefined) return this;
    this._controller = Controller ? new (this._buildControllerClass(Controller))(...args) : null;
    return this;
  }

  getController() {
    return this._controller;
  }

  mount(viewport, ...args) {
    let component = this._getMithrilComponent(...args);
    return $m.mount(viewport, component);
  }

  render(viewport, forceRecreation, ...args) {
    let component = this._getMithrilComponent(...args);
    return $m.render(viewport, component, forceRecreation);
  }

  embed() {
    return this._getMithrilComponent(...arguments);
  }
}
