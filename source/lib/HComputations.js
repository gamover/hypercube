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

  watch(fn) {
    let Tracker = getTracker();
    if (!Tracker) throw new Error('Tracker is not defined');

    let computation = Tracker.autorun(c => { fn(); if (!c.firstRun) Tracker.nonreactive($m.redraw); });
    this._computations.push(computation);
    return computation;
  }

  autorun(...args) {
    let Tracker = getTracker();
    if (!Tracker) throw new Error('Tracker is not defined');

    let computation = Tracker.autorun(...args);
    this._computations.push(computation);
    return computation;
  }

  subscribe(...args) {
    let Meteor = getMeteor();
    if (!Meteor) throw new Error('Meteor is not defined');

    let subscribe = Meteor.subscribe(...args);
    this._subscribes.push(subscribe);
    return subscribe;
  }

  setInterval(...args) {
    let iid = setInterval(...args);
    this._intervals.push(iid);
    return iid;
  }

  setTimeout(...args) {
    let tid = setTimeout(...args);
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
