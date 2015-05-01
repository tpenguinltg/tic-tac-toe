# Game internals

The squares on the grid are numbered from 0 to 8, left to right, top to bottom:

    012
    345
    678

This allows the squares to be accessed easily in an array.

The two files `x.json` and `o.json` contain the unminified DFA for the game's "impossible" mode for the machine playing as X and O, respectively. Each object is a DFA state object that contains a `move` field and a `status` field. The `move` field specifies the next move that the machine should take; its value is an integer from 0 to 8 representing one of the squares on the grid. The `status` field specifies the game's winning status: `1` for a win, `-1` for a loss, `0` for a draw, and `null` for an unfinished game (you will never see `-1` because this machine never loses _\*evil laughter\*_). If the value of `status` is `null`, then the object will also contain entries whose keys correspond to each of the empty squares on the grid available for the opponent to play and whose values are a DFA state object. `o.json` contains an array at the root because the machine is expected to play second; the elements in the array (with keys 0 to 8) are DFA state objects.

The data for `x.json` and `o.json` is courtesy of [XKCD comic #832](https://www.xkcd.com/832/).
