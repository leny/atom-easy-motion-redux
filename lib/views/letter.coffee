{ View } = require "atom-space-pen-views"

module.exports = class LetterCoverView extends View

  @content: ->
    @div class: "easy-motion-redux-letter"

  initialize: ( oTextEditor, oTextEditorView, oRange, sLetter, oOptions ) ->
    @text sLetter

    { top: iTop, left: iLeft } = oTextEditorView.pixelPositionForBufferPosition oRange[ 0 ]

    iWidth = oTextEditorView.pixelPositionForBufferPosition( oRange[ 1 ] ).left - iLeft
    iHeight = oTextEditor.getLineHeightInPixels()

    @addClass if oOptions.single then "single" else "many"

    @css
      position: "absolute"
      height: "#{ iHeight }px"
      top: "#{ iHeight * -1 }px"
      left: "#{ iWidth * -1 }px"
