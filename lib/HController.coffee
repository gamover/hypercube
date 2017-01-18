$m = require 'mithril'

HComponent = require './HComponent.coffee'

# ----------------------------------------------------------------------------------------------------------------------

class HController
  constructor: (@_cmp, args = {})->
    super if A.__super__?

  onunload: ->
    @_cmp.stopAll()

  autorun: (fn)->
    Tracker = HComponent.getTracker()
    throw new Error 'Tracker is not defined' if typeof Tracker?.autorun isnt 'function'

    @_cmp.addComputation computation = Tracker.autorun fn

    computation

  watch: (fn)->
    Tracker = HComponent.getTracker()
    throw new Error 'Tracker is not defined' if typeof Tracker?.autorun isnt 'function'

    @_cmp.addComputation computation = Tracker.autorun (c)->
      fn()
      Tracker.nonreactive(-> $m.redraw()) unless c.firstRun

    computation

  setInterval: (fn, timeout)->
    @_cmp.addIntervalId iid = setInterval fn, timeout
    iid

  setTimeout: (fn, timeout)->
    @_cmp.addIntervalId tid = setTimeout fn, timeout
    tid

# ----------------------------------------------------------------------------------------------------------------------

module.exports = HController
