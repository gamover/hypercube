HComponent = require './HComponent.coffee'

# ----------------------------------------------------------------------------------------------------------------------

class HLayout extends HComponent
  constructor: (args = {})->
    super args

    @_content = default: []

  setContent: (content, placeName = 'default')->
    return @ unless content?
    @_content[placeName] = [].concat content ? []
    @

  getContent: (placeName = 'default')->
    (@_content[placeName] ? []).map (item)->
      return item.embed() if item instanceof HComponent
      item

# ----------------------------------------------------------------------------------------------------------------------

module.exports = HLayout
