$m = require 'mithril'

# ----------------------------------------------------------------------------------------------------------------------

class HComponent
  Tracker = null

  constructor: (args = {})->
    @_view = args.view ? null

  setView: (view)->
    @_view = view
    @

  render: (viewport, forceRecreation)->
    return unless @_view?
    return $m.render viewport, @render(), forceRecreation if viewport?
    $m view: @_view.bind @, $m

  mount: (viewport)->
    $m.mount viewport, @render()

  watch: (param)->
    return param if typeof param isnt 'function'
    return param() unless Tracker?

    Tracker.autorun (c)->
      param()
      unless c.firstRun
        c.stop()
        Tracker.nonreactive -> $m.redraw()
    param()

  @setTracker: (tracker)->
    Tracker = tracker

# ----------------------------------------------------------------------------------------------------------------------

module.exports = HComponent
