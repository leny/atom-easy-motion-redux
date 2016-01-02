"use babel";

import Letter from "./letter";

export default class Markers {

    constructor( oRefTextEditor, oRefTextEditorView ) {
        this.oRefTextEditor = oRefTextEditor;
        this.oRefTextEditorView = oRefTextEditorView;
        this.aMarkers = [];
    }

    add( oRange, sLetter, oOptions ) {
        oMarker = this.oRefTextEditor.markBufferRange( oRange );
        oDecoration = this.oRefTextEditor.decorateMarker( oMarker, {
            "type": "overlay",
            "item": new Letter( this.oRefTextEditor, this.oRefTextEditorView, oRange, sLetter, oOptions )
        } );
        this.aMarkers.push( oMarker );
    }

    clear() {
        for ( let oMarker of this.aMarkers ) {
            oMarker.destroy();
        }
    }

}
