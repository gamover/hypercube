import $m from 'mithril';

import { getMeteor } from './Meteor';
import { getTracker } from './Tracker';

// ---------------------------------------------------------------------------------------------------------------------

export class HComputations {
  constructor(component) {
    this._component = component;
    this._computations = [];
    this._subscribes = [];
    this._intervals = [];
    this._timeouts = [];
  }

  watch(fn, comp = false) {
    let Tracker = getTracker();
    if (!Tracker) throw new Error('Tracker is not defined');

    let computation = Tracker.autorun(c => { comp ? fn(...arguments) : fn(); if (!c.firstRun) Tracker.nonreactive($m.redraw); });
    this._computations.push(computation);
    return computation;
  }

  autorun() {
    let Tracker = getTracker();
    if (!Tracker) throw new Error('Tracker is not defined');

    let computation = Tracker.autorun(...arguments);
    this._computations.push(computation);
    return computation;
  }

  subscribe() {
    let Meteor = getMeteor();
    if (!Meteor) throw new Error('Meteor is not defined');

    let subscribe = Meteor.subscribe(...arguments);
    this._subscribes.push(subscribe);
    return subscribe;
  }

  setInterval() {
    let iid = setInterval(...arguments);
    this._intervals.push(iid);
    return iid;
  }

  setTimeout() {
    let tid = setTimeout(...arguments);
    this._timeouts.push(tid);
    return tid;
  }

  stopAllComputations() {
    this._computations = this._computations.filter(computation => { computation.stop(); return false; });
    return this;
  }

  stopAllSubscribes() {
    this._subscribes = this._subscribes.filter(subscribe => { subscribe.stop(); return false; });
    return this;
  }

  clearAllIntervals() {
    this._intervals = this._intervals.filter(interval => { clearInterval(interval); return false; });
    return this;
  }

  clearAllTimeouts() {
    this._timeouts = this._timeouts.filter(timeout => { clearTimeout(timeout); return false; });
    return this;
  }

  stopAll() {
    this.stopAllComputations();
    this.stopAllSubscribes();
    this.clearAllIntervals();
    this.clearAllTimeouts();
    return this;
  }
}
