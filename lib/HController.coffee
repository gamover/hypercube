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

  autorun: (fn)->
    Tracker = HComponent.getTracker()
    throw new Error 'Tracker is not defined' if typeof Tracker?.autorun isnt 'function'

    @_computations.push computation = Tracker.autorun fn

    computation

  watch: (fn)->
    throw new Error 'Computation must be a function' if typeof fn isnt 'function'

    Tracker = HComponent.getTracker()
    throw new Error 'Tracker is not defined' if typeof Tracker?.autorun isnt 'function'

    @_computations.push computation = Tracker.autorun (c)->
      fn()
      Tracker.nonreactive(-> $m.redraw()) unless c.firstRun

    computation

# ----------------------------------------------------------------------------------------------------------------------

module.exports = HController
