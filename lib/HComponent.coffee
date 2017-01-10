$m = require 'mithril'

# ----------------------------------------------------------------------------------------------------------------------

class HComponent
  Tracker = null

  constructor: (args = {})->
    @_model = null
    @_view = null
    @_controller = null

    @setModel args.model
    @setView args.view
    @setController args.controller

  getInstance: (args = {})->
    new HComponent args

  setModel: (model)->
    @_model = model
    @

  getModel: ->
    @_model

  setView: (view)->
    throw new Error 'The view must be a function' if view? and typeof view isnt 'function'
    @_view = view
    @

  getView: (fn = false, bind = false)->
    return unless @_view?

    if fn
      return @_view.bind @, $m, @_model, @_controller if bind
      return @_view

    @_view.call @, $m, @_model, @_controller

  setController: (controller)->
    @_controller = controller
    @

  getController: ->
    @_controller

  render: (viewport, forceRecreation)->
    return unless @_view?
    return $m.render viewport, view: @_view.bind(@, $m, @_model, @_controller), forceRecreation if viewport?
    @getView()

  mount: (viewport)->
    return unless @_view?
    return $m.mount viewport, view: @_view.bind @, $m, @_model, @_controller if viewport?
    @getView()

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
    HComponent

  @getTracker: ->
    Tracker

# ----------------------------------------------------------------------------------------------------------------------

module.exports = HComponent
