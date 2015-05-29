InputView = require "./views/input"

module.exports =
  config:
    replaceCharacters:
      type: "string"
      default: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

  start: ( bReverse = no ) ->
    console.log "easy-motion-redux:start()"
    oInput = new InputView atom.workspace.getActiveTextEditor(), bReverse
    atom.workspace.addBottomPanel item: oInput

    if oInput.hasWords()
      oInput.focus()
    else
      oInput.remove()

  activate: ->
    atom.commands.add "atom-text-editor:not([mini])",
      "easy-motion-redux:start": => @start()
      "easy-motion-redux:start-reverse": => @start yes
