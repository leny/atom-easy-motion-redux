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
        "default": "ASDFJKLGHQWERTYUIOPZXCVBNM"
    }
};

_fStart = function( sMode, bSelect ) {
    let oInput = new InputView( atom.workspace.getActiveTextEditor(), sMode, bSelect ),
        oPanel;

    oPanel = atom.workspace.addBottomPanel( {
        "item": oInput
    } );

    oInput.resetPositions();
    oInput.panel = oPanel;

    if ( oInput.hasPositions() ) {
        oInput.focus();
    } else {
        oInput.remove();
        oPanel.destroy();
    }
};

fActivate = function() {
    oDisposables && oDisposables.dispose();
    oDisposables = new CompositeDisposable();

    oDisposables.add( atom.commands.add( "atom-text-editor:not([mini])", {
        "easy-motion-redux:words": () => {
            _fStart( InputView.MODE_WORDS );
        },
        "easy-motion-redux:letter": () => {
            _fStart( InputView.MODE_LETTER );
        },
        "easy-motion-redux:words_starting": () => {
            _fStart( InputView.MODE_WORDS_STARTING );
        },
        "easy-motion-redux:lines": () => {
            _fStart( InputView.MODE_LINES );
        },
        "easy-motion-redux:words-select": () => {
            _fStart( InputView.MODE_WORDS, true );
        },
        "easy-motion-redux:letter-select": () => {
            _fStart( InputView.MODE_LETTER, true );
        },
        "easy-motion-redux:words_starting-select": () => {
            _fStart( InputView.MODE_WORDS_STARTING, true );
        },
        "easy-motion-redux:lines-select": () => {
            _fStart( InputView.MODE_LINES, true );
        }
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
