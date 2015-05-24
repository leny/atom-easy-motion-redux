module.exports =
  config:
    replaceCharacters:
      type: "string"
      default: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

  start: ( bReverse = no ) ->
    console.log "easy-motion-redux:start", "reverse:#{ bReverse }"

  activate: ->
    atom.commands.add "atom-text-editor:not([mini])",
      "easy-motion-redux:start": => @start()
      "easy-motion-redux:start-reverse": => @start yes
