"use babel";

import { View } from "atom-space-pen-views";

export default class LetterCoverView extends View {
    static content() {
        return this.div( {
            "class": "easy-motion-redux-letter"
        } );
    }

    initialize( oTextEditor, oTextEditorView, oRange, sLetter, oOptions ) {
        let iHeight = oTextEditor.getLineHeightInPixels();

        this.text( sLetter );
        this.addClass( oOptions.single ? "single" : "many" );

        this.css( {
            "position": "absolute",
            "height": `${ iHeight }px`,
            "top": `${ iHeight * -1 }px`,
            "left": `${ oTextEditor.getDefaultCharWidth() * -1 }px`
        } );
    }

}
