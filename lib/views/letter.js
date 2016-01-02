"use babel";

import { View } from "atom-space-pen-views";

export default class LetterCoverView extends View {
    static content() {
        return this.div( {
            "class": "easy-motion-redux-letter"
        } );
    }

    initialize( oTextEditor, oTextEditorView, oRange, sLetter, oOptions ) {
        this.text( sLetter );

        let { "left": iLeft } = oTextEditorView.pixelPositionForBufferPosition( oRange[ 0 ] );

        iWidth = oTextEditorView.pixelPositionForBufferPosition( oRange[ 1 ] ).left - iLeft;
        iHeight = oTextEditor.getLineHeightInPixels();

        this.addClass( oOptions.single ? "single" : "many" );

        this.css( {
            "position": "absolute",
            "height": `${ iHeight }px`,
            "top": `${ iHeight * -1 }px`,
            "left": `${ iWidth * -1 }px`
        } );

    }

}
