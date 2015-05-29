{ View, TextEditorView, $ } = require "atom-space-pen-views"
{ CompositeDisposable } = require "atom"

_ = require "underscore-plus"
Markers = require "./markers"

module.exports = class InputView extends View
  aWordStarts: []

  @content: ->
    @div class: "easy-motion-redux-input", =>
      @div class: "editor-container", outlet: "editorContainer"
      @subview "editor", new TextEditorView mini: yes, placeholderText: "EasyMotion"

  initialize: ( @oRefTextEditor, @bReverseMatch = no, oOptions = {} ) ->
    @oRefTextEditorView = atom.views.getView @oRefTextEditor
    @markers = new Markers @oRefTextEditor, @oRefTextEditorView

    # @oRefTextEditor.addClass "easy-motion-redux-editor"
    @editor
      .on "submit", @confirm
      .on "cancel", @remove
      .find "input"
        .on "keypress", @autosubmit
        .on "blur", @remove
        .end()
      # .on "core:page-up", => @oRefTextEditor.trigger "core:page-up"
      # .on "core:page-down", => @oRefTextEditor.trigger "core:page-down"

    console.log @editor.getModel()

    # @disposables = new CompositeDisposable()
    # @disposables.add @oRefTextEditor.onDidScrollTopChanged if oOptions.noReloadOnScroll then @goBack else _.debounce @resetWords, 50
    # @disposables.add ( $ window ).onDidResize if oOptions.noReloadOnResize then @goBack else _.debounce @resetWords, 50

    @resetWords()

  resetWords: =>
    do @markers.clear
    @loadWords()
    @groupWords()

  hasWords: => @aWordStarts.length > 0

  autosubmit: ( oEvent ) =>
    console.log "?"
    @pickWords oEvent.originalEvent.data
    if @aWordStarts.length > 1
      @groupWords()
    else
      @confirm()
    no

  remove: =>
    @markers.remove()
    # @oRefTextEditor.removeClass "easy-motion-redux-editor"
    super()

  confirm: =>
    @oRefTextEditor.setCursorBufferPosition @aWordStarts[ 0 ][ if not @bReverseMatch then "start" else "end" ]
    @goBack()

  goBack: =>
    # @disposables.dispose()
    @oRefTextEditor.focus()
    @remove()

  focus: ->
    @editor.focus()

  groupWords: =>
    iCount = @aWordStarts.length
    sReplaceCharacters = atom.config.get "easy-motion-redux.replaceCharacters"
    oBuffer = @oRefTextEditor.getBuffer()

    iLast = 0

    @oGroupedWordStarts = {}

    for i in [ 0 ... sReplaceCharacters.length ]
      iTake = Math.floor iCount / sReplaceCharacters.length
      iTake += 1 if i < iCount % sReplaceCharacters.length

      @oGroupedWordStarts[ sReplaceCharacters[ i ] ] = []
      for oWordStart, j in @aWordStarts[ iLast ... ( iLast + iTake ) ]
        bSingle = iTake is 1
        sReplacement = if bSingle
          sReplaceCharacters[ i ]
        else
          iCharsAmount = sReplaceCharacters.length
          iRemains = iTake % iCharsAmount
          k = if iTake <= iCharsAmount
            j % iTake
          else if iTake < 2 * iCharsAmount and j >= iRemains * 2
            j - iRemains
          else
            -1
          sReplaceCharacters[ i ] + ( sReplaceCharacters[ k ] or "•" )
        @oGroupedWordStarts[ sReplaceCharacters[ i ] ].push oWordStart
        @markers.add oWordStart, sReplacement,
          single: bSingle

      iLast += iTake

  pickWords: ( sCharacter ) ->
    do @cover.clearLetterCovers
    if sCharacter of @oGroupedWordStarts and @oGroupedWordStarts[ sCharacter ].length
      @aWordStarts = @oGroupedWordStarts[ sCharacter ]
      return

    # try different cases for alphabet letters
    if sCharacter isnt sCharacter.toLowerCase()
      sCharacter = sCharacter.toLowerCase()
    else if sCharacter isnt sCharacter.toUpperCase()
      sCharacter = sCharacter.toUpperCase()
    else
      return

    if sCharacter of @oGroupedWordStarts and @oGroupedWordStarts[ sCharacter ].length
      @aWordStarts = @oGroupedWordStarts[ sCharacter ]

  loadWords: =>
    aWords = []
    oBuffer = @oRefTextEditor.getBuffer()

    aWordStarts = []

    fMarkBeginning = ( oObj ) ->
      [ iBeginWord, iBeginWordEnd ] = [ null, null ]

      if not @bReverseMatch
        iBeginWord = oObj.range.start
        iBeginWordEnd = [ iBeginWord.row, iBeginWord.column + 1 ]
      else
        iBeginWordEnd = oObj.range.end
        iBeginWord = [ iBeginWordEnd.row, iBeginWordEnd.column - 1 ]

      aWordStarts.push [ iBeginWord, iBeginWordEnd ]

    for oRowRange in @getRowRanges()
      oBuffer.scanInRange @wordRegExp(), oRowRange, fMarkBeginning

    @aWordStarts = aWordStarts

  getRowRanges: =>
    oBuffer = @oRefTextEditor.getBuffer()
    iTop = @oRefTextEditor.getScrollTop()
    iBottom = iTop + @oRefTextEditor.getHeight()

    iBeginRow = @binarySearch oBuffer.getLineCount(), ( iRow ) =>
      @oRefTextEditorView.pixelPositionForBufferPosition( [ iRow, 0 ] ).top < iTop

    iBeginRow += 1

    iEndRow = @binarySearch oBuffer.getLineCount(), ( iRow ) =>
      iPosition = @oRefTextEditorView.pixelPositionForBufferPosition( [ iRow, 0 ] ).top
      iHeight = @oRefTextEditor.getLineHeightInPixels()
      iPosition + iHeight <= iBottom

    ( iRow for iRow in [ iBeginRow..iEndRow ] when @notFolded iRow ).map ( iRow ) =>
      @getColumnRangeForRow iRow

  getColumnRangeForRow: ( iRow ) =>
    oBuffer = @oRefTextEditor.getBuffer()
    iLeft = @oRefTextEditor.getScrollLeft()
    iRight = iLeft + @oRefTextEditor.getWidth()

    oColumns = @oRefTextEditor.clipBufferPosition [ iRow, Infinity ]
    iColumns = oColumns.column + 1

    iBeginColumn = @binarySearch iColumns, ( iColumn ) =>
      @oRefTextEditorView.pixelPositionForBufferPosition( [ iRow, iColumn ] ).left < iLeft

    iBeginColumn += 1

    iEndColumn = @binarySearch iColumns, ( iColumn ) =>
      @oRefTextEditorView.pixelPositionForBufferPosition( [ iRow, iColumn ] ).left <= iRight

    [ [ iRow, iBeginColumn ], [ iRow, iEndColumn ] ]

  wordRegExp: =>
    sNonWordCharacters = atom.config.get "editor.nonWordCharacters"
    new RegExp "[^\\s" + ( _.escapeRegExp sNonWordCharacters ) + "]+", "g"

  notFolded: ( iRow ) =>
    iRow is 0 or not @oRefTextEditor.isFoldedAtBufferRow( iRow ) or not @oRefTextEditor.isFoldedAtBufferRow( iRow - 1 )

  binarySearch: ( iMaxValue, fCompare ) ->
    iStep = 1
    while iStep < iMaxValue
      iStep *= 2

    iAnswer = -1
    while iStep > 0
      if iAnswer + iStep >= iMaxValue
        iStep = iStep >> 1
        continue

      iAnswer += iStep if fCompare iAnswer + iStep

      iStep = iStep >> 1

    iAnswer
