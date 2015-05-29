InputView = require "./views/input"

module.exports =
  config:
    replaceCharacters:
      type: "string"
      default: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

  start: ( bReverse = no ) ->
    oInput = new InputView atom.workspace.getActiveTextEditor()
    atom.workspace.addBottomPanel item: oInput

    oInput.resetWords()

    if oInput.hasWords()
      oInput.focus()
    else
      oInput.remove()

  activate: ->
    atom.commands.add "atom-text-editor:not([mini])",
      "easy-motion-redux:start": => @start()
