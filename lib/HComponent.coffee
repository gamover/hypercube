$m = require 'mithril'

# ----------------------------------------------------------------------------------------------------------------------

class HComponent
  Tracker = null

  constructor: (args = {})->
    @_loaded = false
    @_computations = []

    @_model = null
    @_view = null
    @_controller = null

    @init args

  getInstance: (args = {})->
    new HComponent args

  init: (args = {})->
    @setModel args.model
    @setView args.view
    @setController args.controller

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
      return @_view.bind @, $m if bind
      return @_view

    @_view.call @, $m, @_controller

  setController: (controller = {})->
    $this = @
    controller.onload = do (onload = controller.onload)-> ->
      onload?.call controller
      $this._loaded = true
    controller.onunload = do (onunload = controller.onunload)-> ->
      computations = $this._computations
      $this._computations = []
      computations.forEach (c)-> c.stop()
      onunload?.call controller
      $this._loaded = false

    @_controller = controller
    @

  getController: ->
    @_controller

  render: (viewport, forceRecreation)->
    $this = @

    return unless @_view?

    view = @getView true, true

    controller = $this.getController()
    if controller?
      controller.onunload?() if @_loaded
      controller.onload?()

    component = $m.component
      view: view
      controller: -> controller

    return $m.render viewport, component, forceRecreation if viewport?

    component

  mount: (viewport)->
    $this = @

    return unless @_view?

    view = @getView true, true

    controller = $this.getController()
    if controller?
      controller.onunload?() if @_loaded
      controller.onload?()

    component = $m.component
      view: view
      controller: -> controller

    return $m.mount viewport, component if viewport?

    component

  watch: (param)->
    return param if typeof param isnt 'function'
    return param() if typeof Tracker?.autorun isnt 'function'

    @_computations.push Tracker.autorun (c)->
      param()
      Tracker.nonreactive(-> $m.redraw()) unless c.firstRun

    param()

  @setTracker: (tracker)->
    Tracker = tracker
    HComponent

  @getTracker: ->
    Tracker

# ----------------------------------------------------------------------------------------------------------------------

module.exports = HComponent
