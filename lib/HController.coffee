$m = require 'mithril'

HComponent = require './HComponent.coffee'

# ----------------------------------------------------------------------------------------------------------------------

class HController
  constructor: (args = {})->
    @_computations = []

    @onunload = do ($this = @, onunload = @onunload)-> ->
      computations = $this._computations
      $this._computations = []
      c.stop() for c in computations
      onunload?.apply $this, arguments

  getInstance: (args = {})->
    new HController args

  autorun: ->
    Tracker = HComponent.getTracker()
    throw new Error 'Tracker not found' if typeof Tracker?.autorun isnt 'function'
    @_computations.push Tracker.autorun.apply Tracker, arguments

  watch: (fn)->
    return if typeof fn isnt 'function'

    Tracker = HComponent.getTracker()
    return if typeof Tracker?.autorun isnt 'function'

    @_computations.push computation = Tracker.autorun (c)->
      fn()
      Tracker.nonreactive(-> $m.redraw()) unless c.firstRun

    computation

# ----------------------------------------------------------------------------------------------------------------------

module.exports = HController
