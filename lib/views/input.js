"use babel";

/* eslint-disable no-loop-func, no-bitwise, no-continue */

import { View, TextEditorView } from "atom-space-pen-views";
import { CompositeDisposable } from "atom";
import _ from "underscore-plus";
import Markers from "./markers";

export default class InputView extends View {
    static content() {
        return this.div( {
            "class": "easy-motion-redux-input"
        }, () => {
            this.div( {
                "class": "editor-container",
                "outlet": "editorContainer"
            } );
            return this.subview( "editorInput", new TextEditorView( {
                "mini": true,
                "placeholderText": "EasyMotion"
            } ) );
        } );
    }

    constructor( oRefTextEditor ) {
        super( oRefTextEditor );
    }

    initialize( oRefTextEditor ) {
        this.aWordStarts = [];
        this.oRefTextEditor = oRefTextEditor;

        this.subscriptions = new CompositeDisposable();

        this.oRefTextEditorView = atom.views.getView( this.oRefTextEditor );
        this.markers = new Markers( this.oRefTextEditor, this.oRefTextEditorView );

        this.oRefTextEditorView.classList.add( "easy-motion-redux-editor" );

        this.handleEvents();
    }

    handleEvents() {
        this.editorInput.element.addEventListener( "keypress", this.autosubmit.bind( this ) );
        this.editorInput.element.addEventListener( "blur", this.remove.bind( this ) );
        this.subscriptions.add( atom.commands.add( this.editorInput.element, {
            "core:confirm": () => {
                this.confirm();
            },
            "core:cancel": () => {
                this.goBack();
            },
            "core:page-up": () => {
                this.oRefTextEditor.trigger( "core:page-up" );
            },
            "core:page-down": () => {
                this.oRefTextEditor.trigger( "core:page-down" );
            }
        } ) );
        this.subscriptions.add( this.oRefTextEditor.onDidChangeScrollTop( this.goBack.bind( this ) ) );
    }

    resetWords() {
        this.markers.clear();
        this.loadWords();
        this.groupWords();
    }

    hasWords() {
        return this.aWordStarts.length > 0;
    }

    autosubmit( oEvent ) {
        this.pickWords( String.fromCharCode( oEvent.charCode ) );
        if ( this.aWordStarts.length > 1 ) {
            this.groupWords();
        } else {
            this.confirm();
        }
        return false;
    }

    remove() {
        this.subscriptions.dispose();
        this.markers.clear();
        this.oRefTextEditorView.classList.remove( "easy-motion-redux-editor" );
        super.remove();
    }

    confirm() {
        this.oRefTextEditor.setCursorBufferPosition( this.aWordStarts[ 0 ][ 0 ] );
        this.goBack();
    }

    goBack() {
        this.oRefTextEditorView.focus();
        this.remove();
    }

    focus() {
        this.editorInput.focus();
    }

    groupWords() {
        let iCount = this.aWordStarts.length,
            sReplaceCharacters = atom.config.get( "easy-motion-redux.replaceCharacters" ),
            iLast = 0;

        this.oGroupedWordStarts = {};

        for ( let i of _.range( 0, sReplaceCharacters.length ) ) {
            let iTake = Math.floor( iCount / sReplaceCharacters.length );

            if ( i < iCount % sReplaceCharacters.length ) {
                iTake += 1;
            }

            this.oGroupedWordStarts[ sReplaceCharacters[ i ] ] = [];
            this.aWordStarts.slice( iLast, iLast + iTake ).forEach( ( oWordStart, j ) => {
                let sReplacement,
                    bSingle = iTake === 1;

                if ( bSingle ) {
                    sReplacement = sReplaceCharacters[ i ];
                } else {
                    let iCharsAmount = sReplaceCharacters.length,
                        iRemains = iTake % iCharsAmount,
                        k;

                    if ( iTake <= iCharsAmount ) {
                        k = j % iTake;
                    } else if ( iTake < 2 * iCharsAmount && j >= iRemains * 2 ) {
                        k = j - iRemains;
                    } else {
                        k = -1;
                    }

                    sReplacement = sReplaceCharacters[ i ] + ( sReplaceCharacters[ k ] || "•" );
                }

                this.oGroupedWordStarts[ sReplaceCharacters[ i ] ].push( oWordStart );
                this.markers.add( oWordStart, sReplacement, {
                    "single": bSingle
                } );
            } );

            iLast += iTake;
        }
    }

    pickWords( sChar ) {
        let sCharacter = sChar;

        this.markers.clear();
        if ( sCharacter in this.oGroupedWordStarts && this.oGroupedWordStarts[ sCharacter ].length ) {
            this.aWordStarts = this.oGroupedWordStarts[ sCharacter ];
            return;
        }

        if ( sCharacter !== sCharacter.toLowerCase() ) {
            sCharacter = sCharacter.toLowerCase();
        } else if ( sCharacter !== sCharacter.toUpperCase() ) {
            sCharacter = sCharacter.toUpperCase();
        } else {
            return;
        }

        if ( sCharacter in this.oGroupedWordStarts && this.oGroupedWordStarts[ sCharacter ].length ) {
            this.aWordStarts = this.oGroupedWordStarts[ sCharacter ];
        }
    }

    loadWords() {
        let oBuffer = this.oRefTextEditor.getBuffer(),
            aWordStarts = [],
            fMarkBeginning;

        fMarkBeginning = ( oObj ) => {
            let [ iBeginWord, iBeginWordEnd ] = [ null, null ];

            if ( !this.bReverseMatch ) {
                iBeginWord = oObj.range.start;
                iBeginWordEnd = [ iBeginWord.row, iBeginWord.column + 1 ];
            } else {
                iBeginWordEnd = oObj.range.end;
                iBeginWord = [ iBeginWordEnd.row, iBeginWordEnd.column - 1 ];
            }

            aWordStarts.push( [ iBeginWord, iBeginWordEnd ] );
        };

        for ( let oRowRange of this.getRowRanges() ) {
            oBuffer.scanInRange( this.wordRegExp(), oRowRange, fMarkBeginning );
        }

        this.aWordStarts = aWordStarts;
    }

    getRowRanges() {
        let iBeginRow = this.oRefTextEditorView.getFirstVisibleScreenRow(),
            iEndRowPadding = Math.ceil( this.outerHeight() / this.oRefTextEditor.getLineHeightInPixels() ) * 2,
            iEndRow = this.oRefTextEditorView.getLastVisibleScreenRow() - iEndRowPadding,
            aResultingRows = [];

        for ( let iRow of _.range( iBeginRow, iEndRow + 1 ) ) {
            if ( this.notFolded( iRow ) ) {
                aResultingRows.push( iRow );
            }
        }

        aResultingRows = aResultingRows.map( ( iRow ) => {
            return this.getColumnRangeForRow( iRow );
        } );

        return aResultingRows;
    }

    getColumnRangeForRow( iRow ) {
        let oBuffer = this.oRefTextEditor.getBuffer(),
            iBeginColumn,
            iEndColumn,
            oRange;

        if ( oBuffer.isRowBlank( iRow ) ) {
            return [ [ iRow, 0 ], [ iRow, 0 ] ];
        }

        if ( this.oRefTextEditor.isSoftWrapped() ) {
            oRange = oBuffer.rangeForRow( iRow );
            iBeginColumn = oRange.start.column;
            iEndColumn = oRange.end.column;
        } else {
            oRange = oBuffer.rangeForRow( iRow );
            let iMaxColumn = this.oRefTextEditor.getEditorWidthInChars(),
                iCharWidth = this.oRefTextEditor.getDefaultCharWidth(),
                iLeft = this.oRefTextEditor.getScrollLeft();

            if ( iLeft === 0 ) {
                iBeginColumn = 0;
                iEndColumn = iMaxColumn;
            } else {
                iBeginColumn = Math.floor( iLeft / iCharWidth );
                iEndColumn = iBeginColumn + iMaxColumn;
            }
        }

        return [ [ iRow, iBeginColumn ], [ iRow, iEndColumn ] ];
    }

    wordRegExp() {
        let sNonWordCharacters = atom.config.get( "editor.nonWordCharacters" );

        return new RegExp( `[^\\s${ _.escapeRegExp( sNonWordCharacters ) }]+`, "g" );
    }

    notFolded( iRow ) {
        return iRow === 0 || !this.oRefTextEditor.isFoldedAtBufferRow( iRow ) || !this.oRefTextEditor.isFoldedAtBufferRow( iRow - 1 );
    }

    binarySearch( iMaxValue, fCompare ) {
        let iStep = 1,
            iAnswer = -1;

        while ( iStep < iMaxValue ) {
            iStep *= 2;
        }

        while ( iStep > 0 ) {
            if ( iAnswer + iStep >= iMaxValue ) {
                iStep = iStep >> 1;
                continue;
            }

            if ( fCompare( iAnswer + iStep ) ) {
                iAnswer += iStep;
            }

            iStep = iStep >> 1;
        }

        return iAnswer;
    }
}
