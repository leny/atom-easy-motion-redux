{ View } = require "atom-space-pen-views"

module.exports = class LetterCoverView extends View

  @content: ->
    @div class: "letter-cover"

  initialize: ( oTextEditor, oRange, sLetter ) ->
    @text sLetter

    { iTop, iLeft } = oTextEditor.pixelPositionForBufferPosition oRange.start

    iWidth = oTextEditor.pixelPositionForBufferPosition( oRange.end ).right - iLeft

    @css
      position: "absolute"
      width: "#{ iWidth }px"
      height: "#{ oTextEditor.lineHeight }px"
      top: "#{ iTop }px"
      left: "#{ iLeft }px"
