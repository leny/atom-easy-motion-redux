{ View } = require "atom-space-pen-views"

LetterCoverView = require "./letter-cover"

module.exports = class CoverView extends View
  aLetterCovers: []

  @content: ->
    @div class: "easy-motion-redux-cover"

  initialize: ( @oRefTextEditor ) ->

  addLetterCover: ( oRange, sLetter, oOptions ) ->
    oLetterCover = new LetterCoverView @oRefTextEditor, oRange, sLetter
    @append oLetterCover
    @aLetterCovers.push oLetterCover

    oLetterCover.addClass if oOptions.single then "single" else "many"

  clearLetterCovers: =>
    do oLetterCover.remove() for oLetterCover in @aLetterCovers
