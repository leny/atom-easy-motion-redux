"use babel";

import { CompositeDisposable } from "atom";
import InputView from "./views/input";

let oConfig,
    fActivate,
    fDeactivate,
    oDisposables,
    _fStart;

oConfig = {
    "replaceCharacters": {
        "type": "string",
        "default": "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    }
};

_fStart = function() {
    let oInput = new InputView( atom.workspace.getActiveTextEditor() );

    atom.workspace.addBottomPanel( {
        "item": oInput
    } );

    oInput.resetWords();

    if ( oInput.hasWords() ) {
        oInput.focus();
    } else {
        oInput.remove();
    }
};

fActivate = function() {
    oDisposables && oDisposables.dispose();
    oDisposables = new CompositeDisposable();

    oDisposables.add( atom.commands.add( "atom-text-editor:not([mini])", {
        "easy-motion-redux:start": _fStart
    } ) );
};

fDeactivate = function() {
    oDisposables && oDisposables.dispose();
};

export {
    oConfig as config,
    fActivate as activate,
    fDeactivate as deactivate
};
