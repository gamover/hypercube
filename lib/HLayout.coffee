HComponent = require './HComponent'

# ----------------------------------------------------------------------------------------------------------------------

class HLayout extends HComponent
  constructor: (args = {})->
    super

    @_content = default: []

  setContent: (content, placeName = 'default')->
    return @ unless content?
    @_content[placeName] = [].concat content ? []
    @

  getContent: (placeName = 'default')->
    (@_content[placeName] ? []).map (item)->
      return item.render() if item instanceof HComponent
      item

# ----------------------------------------------------------------------------------------------------------------------

module.exports = HLayout
