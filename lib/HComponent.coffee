$m = require 'mithril'

# ----------------------------------------------------------------------------------------------------------------------

Tracker = null

# ----------------------------------------------------------------------------------------------------------------------

class HComponent
  constructor: (args = {})->
    @_model = null
    @_view = null
    @_controller = null
    @_component = null

    @init args

  init: (args = {})->
    @setModel args.model
    @setView args.view
    @setController args.controller

  _buildControllerClass: (Controller)->
    component = @

    computations = []
    intervalIds = []
    timeoutIds = []

    stopAllComputations = ->
      comps = computations
      computations = []
      computation.stop() for computation in comps

    clearAllIntervals = ->
      iids = intervalIds
      intervalIds = []
      clearInterval iid for iid in iids

    clearAllTimeouts = ->
      tids = timeoutIds
      timeoutIds = []
      clearTimeout tid for tid in tids

    stopAll = ->
      stopAllComputations()
      clearAllIntervals()
      clearAllTimeouts()

    class HController extends Controller
      constructor: ->
        stopAll()
        super

      onunload: ->
        stopAll()
        super if Controller::onunload?

      autorun: (fn)->
        Tracker = HComponent.getTracker()
        throw new Error 'Tracker is not defined' if typeof Tracker?.autorun isnt 'function'

        computations.push computation = Tracker.autorun fn

        computation

      watch: (fn)->
        Tracker = HComponent.getTracker()
        throw new Error 'Tracker is not defined' if typeof Tracker?.autorun isnt 'function'

        computations.push computation = Tracker.autorun (c)->
          fn()
          Tracker.nonreactive(-> $m.redraw()) unless c.firstRun

        computation

      setInterval: (fn, timeout)->
        intervalIds.push iid = setInterval fn, timeout
        iid

      setTimeout: (fn, timeout)->
        timeoutIds.push tid = setTimeout fn, timeout
        tid

      getComponent: ->
        component

      getModel: ->
        component.getModel()

  _buildMithrilComponent: ->
    return @_component if @_component

    args = Array.prototype.slice.call arguments

    view = @getView true
    controller = do ($this = @, Controller = @getController())->
      return unless Controller?
      -> new (Function.prototype.bind.apply Controller, [null].concat args)

    @_component = $m.component
      view: view
      controller: controller

  setModel: (model)->
    @_model = model
    @

  getModel: ->
    @_model

  setView: (view)->
    @_view = view
    @

  getView: (bind = false)->
    return unless @_view?
    return @_view.bind @, $m if bind
    @_view

  setController: (Controller)->
    @_controller = if Controller then @_buildControllerClass Controller else null
    @

  getController: ->
    @_controller

  mount: (viewport)->
    component = @_buildMithrilComponent.apply @, Array.prototype.slice.call arguments, 1
    $m.mount viewport, component if viewport?

  render: (viewport, forceRecreation)->
    component = @_buildMithrilComponent.apply @, Array.prototype.slice.call arguments, 2
    $m.render viewport, component, forceRecreation if viewport?

  embed: ->
    @_buildMithrilComponent.apply @, arguments

  @setTracker: (tracker)->
    Tracker = tracker
    HComponent

  @getTracker: ->
    Tracker

# ----------------------------------------------------------------------------------------------------------------------

module.exports = HComponent
