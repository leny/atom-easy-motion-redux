InputView = require "./views/input"

module.exports =
  config:
    replaceCharacters:
      type: "string"
      default: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

  start: ( bReverse = no ) ->
    oInput = new InputView atom.workspace.getActiveTextEditor()
    atom.workspace.addBottomPanel item: oInput
    oInput.go()

  startWithLetter: () ->
    oInput = new InputView atom.workspace.getActiveTextEditor(), { 'withLetterMode': true }
    atom.workspace.addBottomPanel item: oInput
    oInput.go()

  activate: ->
    atom.commands.add "atom-text-editor:not([mini])",
      "easy-motion-redux:start": => @start()
      "easy-motion-redux:start-with-letter": => @startWithLetter()
