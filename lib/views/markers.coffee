{ $ } = require "atom-space-pen-views"

Letter = require "./letter"

module.exports = class Markers
  aMarkers: []

  constructor: ( @oRefTextEditor, @oRefTextEditorView ) ->

  add: ( oRange, sLetter, oOptions ) ->
    oMarker = @oRefTextEditor.markBufferRange oRange
    oDecoration = @oRefTextEditor.decorateMarker oMarker,
      type: "overlay"
      item: new Letter @oRefTextEditor, @oRefTextEditorView, oRange, sLetter, oOptions
    @aMarkers.push oMarker

  clear: =>
    do oMarker.destroy for oMarker in @aMarkers
