/* Constants */
HUMAN=0;
EASY=1;
REASONABLE=2;
IMPOSSIBLE=3;

/* Players */
X_PLAYER=1;
X_MARK="X";
O_PLAYER=2;
O_MARK="O";

/* Winning states */
NO_WIN=0;
H_WIN=1;
V_WIN=2;
LD_WIN=3; // 0-8 diagonal
RD_WIN=4; // 6-2 diagonal

// board as shown to the user
var board=document.getElementById("board").getElementsByTagName("td");

// board to keep track of occupancy internally
var cells=new Array(9);

var currentPlayer=X_PLAYER;
var x_difficulty=HUMAN;
var o_difficulty=REASONABLE;
var movesLeft=9;
var nextTimeout;
var lastMove=-1;

// DFAs for IMPOSSIBLE difficulty
var xDFA;
var oDFA;


/**
 * Resets the board and game state to initial conditions.
 * Difficulty levels for each player is taken from the dropdown menus
 */
function newGame()
  {
  clearTimeout(nextTimeout);

  currentPlayer=X_PLAYER;
  movesLeft=9;

  x_difficulty=parseInt(document.getElementById("x-difficulty").value);
  o_difficulty=parseInt(document.getElementById("o-difficulty").value);

  xDFA=(x_difficulty != IMPOSSIBLE)?
    null :
    {"move":0,"status":null,"1":{"move":4,"status":null,"2":{"move":8,"status":1},"3":{"move":8,"status":1},"5":{"move":8,"status":1},"6":{"move":8,"status":1},"7":{"move":8,"status":1},"8":{"move":6,"status":null,"2":{"move":3,"status":1},"3":{"move":2,"status":1},"5":{"move":3,"status":1},"7":{"move":3,"status":1}}},"2":{"move":6,"status":null,"1":{"move":3,"status":1},"3":{"move":8,"status":null,"1":{"move":7,"status":1},"4":{"move":7,"status":1},"5":{"move":7,"status":1},"7":{"move":4,"status":1}},"4":{"move":3,"status":1},"5":{"move":3,"status":1},"7":{"move":3,"status":1},"8":{"move":3,"status":1}},"3":{"move":4,"status":null,"1":{"move":8,"status":1},"2":{"move":8,"status":1},"3":{"move":8,"status":1},"5":{"move":8,"status":1},"6":{"move":8,"status":1},"7":{"move":8,"status":1},"8":{"move":2,"status":null,"1":{"move":6,"status":1},"5":{"move":1,"status":1},"6":{"move":1,"status":1},"7":{"move":1,"status":1}}},"4":{"move":8,"status":null,"1":{"move":7,"status":null,"2":{"move":6,"status":1},"3":{"move":6,"status":1},"5":{"move":6,"status":1},"6":{"move":2,"status":null,"3":{"move":5,"status":1},"5":{"move":3,"status":0}}},"2":{"move":6,"status":null,"1":{"move":3,"status":1},"3":{"move":7,"status":1},"5":{"move":7,"status":1},"7":{"move":3,"status":1}},"3":{"move":5,"status":null,"1":{"move":2,"status":1},"2":{"move":6,"status":null,"1":{"move":7,"status":1},"7":{"move":1,"status":0}},"6":{"move":2,"status":1},"7":{"move":2,"status":1}},"5":{"move":3,"status":null,"1":{"move":6,"status":1},"2":{"move":6,"status":1},"6":{"move":2,"status":null,"1":{"move":7,"status":0},"7":{"move":1,"status":1}},"7":{"move":6,"status":1}},"6":{"move":2,"status":null,"1":{"move":5,"status":1},"3":{"move":1,"status":1},"5":{"move":1,"status":1},"7":{"move":5,"status":1}},"7":{"move":1,"status":null,"2":{"move":6,"status":null,"3":{"move":5,"status":0},"5":{"move":3,"status":1}},"3":{"move":2,"status":1},"5":{"move":2,"status":1},"6":{"move":2,"status":1}}},"5":{"move":4,"status":null,"1":{"move":8,"status":1},"2":{"move":8,"status":1},"3":{"move":8,"status":1},"6":{"move":8,"status":1},"7":{"move":8,"status":1},"8":{"move":2,"status":null,"1":{"move":6,"status":1},"3":{"move":1,"status":1},"6":{"move":1,"status":1},"7":{"move":1,"status":1}}},"6":{"move":2,"status":null,"1":{"move":8,"status":null,"3":{"move":5,"status":1},"4":{"move":5,"status":1},"5":{"move":4,"status":1},"7":{"move":5,"status":1}},"3":{"move":1,"status":1},"4":{"move":1,"status":1},"5":{"move":1,"status":1},"7":{"move":1,"status":1},"8":{"move":1,"status":1}},"7":{"move":4,"status":null,"1":{"move":8,"status":1},"2":{"move":8,"status":1},"3":{"move":8,"status":1},"5":{"move":8,"status":1},"6":{"move":8,"status":1},"8":{"move":6,"status":null,"1":{"move":3,"status":1},"2":{"move":3,"status":1},"3":{"move":2,"status":1},"5":{"move":3,"status":1}}},"8":{"move":2,"status":null,"1":{"move":6,"status":null,"3":{"move":4,"status":1},"4":{"move":3,"status":1},"5":{"move":3,"status":1},"7":{"move":3,"status":1}},"3":{"move":1,"status":1},"4":{"move":1,"status":1},"5":{"move":1,"status":1},"6":{"move":1,"status":1},"7":{"move":1,"status":1}}};

  // reset board
  for(var i=0; i<9; i++)
    {
    cells[i]=0;
    board[i].className='open';
    board[i].innerHTML='<button id="choose'+i+'"></button>';

    //add click handlers to buttons
    document.getElementById("choose"+i).onclick=doMove;
    }//end for i

  document.getElementById("new-game").onclick=newGame;

  doNextMove(X_PLAYER, x_difficulty);
  }//end newGame


/**
 * Disables input and displays end game message
 */
function endGame()
  {
  allowInput(false);
  }//end endGame


/**
 * Checks for a winning state based on the last move
 * @return the appropriate winning state
 */
function isWin()
  {
  //check for horizontal win
  var hWin=
    cells[lastMove] &&
    cells[lastMove] == cells[Math.floor(lastMove/3)*3 + (lastMove+1)%3] &&
    cells[lastMove] == cells[Math.floor(lastMove/3)*3 + (lastMove+2)%3];

  //check for vertical win
  var vWin=
    cells[lastMove] &&
    cells[lastMove] == cells[lastMove%3 + Math.floor(lastMove/3 + 1)%3*3] &&
    cells[lastMove] == cells[lastMove%3 + Math.floor(lastMove/3 + 2)%3*3];

  //check 0-8 diagonal
  var ldWin=
    cells[4] &&
    cells[4] == cells[0] &&
    cells[4] == cells[8];

  //check 6-2 diagonal
  var rdWin=
    cells[4] &&
    cells[4] == cells[6] &&
    cells[4] == cells[2];

  var winCode=
    (hWin)?  H_WIN  :
    (vWin)?  V_WIN  :
    (ldWin)? LD_WIN :
    (rdWin)? RD_WIN :
             NO_WIN ;

  return winCode;
    
  }//end isWin


/**
 * Highlights the winning run on the board.
 * @param player  The player who won
 * @param cell    A cell in the winning run
 * @param winType The direction of the run
 */
function highlightWin(player, cell, winType)
  {
  if(winType == NO_WIN) return;

  // highlight cells
  switch(winType)
    {
    case H_WIN:
      board[cell].className+=" win";
      board[Math.floor(cell/3)*3 + (cell+1)%3].className+=" win";
      board[Math.floor(cell/3)*3 + (cell+2)%3].className+=" win";
      break;

    case V_WIN:
      board[cell].className+=" win";
      board[cell%3 + Math.floor(cell/3 + 1)%3*3].className+=" win";
      board[cell%3 + Math.floor(cell/3 + 2)%3*3].className+=" win";
      break;

    case LD_WIN:
      board[0].className+=" win";
      board[4].className+=" win";
      board[8].className+=" win";
      break;

    case RD_WIN:
      board[2].className+=" win";
      board[4].className+=" win";
      board[6].className+=" win";
      break;
    }//end switch

  // Announce win
  document.getElementById("board").caption.innerHTML=getMark(player)+" wins!";
  }//end highlightWin


/**
 * Enables or disables user input on the board
 * @param inputAllowed  true to allow input, false otherwise
 */
function allowInput(inputAllowed)
  {
  buttons=document.getElementById("board").getElementsByTagName("button");
  
  // set the disabled state of each button to the opposite of inputAllowed
  for(b in buttons)
    {
    buttons[b].disabled=!inputAllowed;
    }//end for b
  }//end allowInput


/**
 * Gets the mark for the given player
 * @param player  The player whose mark to return
 * @return X_MARK if player is X_PLAYER, and O_MARK if player is O_PLAYER
 */
function getMark(player)
  {
  var mark=" ";

  switch(player)
    {
    case X_PLAYER:
      mark=X_MARK;
      break;
    case O_PLAYER:
      mark=O_MARK;
      break;
    }//end switch player

  return mark;
  }//end getMark


/**
 * Callback method for the button's click event.
 * Places the current player's mark on the cell and sets up the state
 * for the next player's move.
 */
function doMove(e)
  {
  var win=NO_WIN;
  var cellIndex=this.id.charAt(this.id.length-1);

  //place on the board
  placeChar(currentPlayer, cellIndex);
  cells[cellIndex]=currentPlayer;
  lastMove=cellIndex;
  movesLeft--;

  // check for win
  if(win=isWin())
    {
    //TODO
    highlightWin(currentPlayer, cellIndex, win);
    endGame();
    return;
    }//end if
  
  //update DFA if necessary
  if(currentPlayer == X_PLAYER && o_difficulty == IMPOSSIBLE)
    {
    oDFA=oDFA[cellIndex];
    }
  else if(currentPlayer == O_PLAYER && x_difficulty == IMPOSSIBLE)
    {
    xDFA=xDFA[cellIndex];
    }//end if

  //next player's turn
  currentPlayer=(currentPlayer == X_PLAYER)? O_PLAYER:X_PLAYER;
  doNextMove(currentPlayer, (currentPlayer == X_PLAYER)? x_difficulty:o_difficulty);
  }//end doMove


/**
 * Places the player's mark on the specified cell on the board
 * @player the player whose mark to place
 * @cellIndex the cell index to place the mark
 */
function placeChar(player, cellIndex)
  {
  // Replace button with player mark
  var mark=getMark(player);
  board[cellIndex].innerHTML=mark;
  board[cellIndex].className="taken "+((player == X_PLAYER)? 'x':'o')+"-move new-move";

  // remove new-move class after 3 seconds
  setTimeout('board['+cellIndex+'].className=board['+cellIndex+'].className.replace("new-move","");', 3000);
  }//end placeChar


/**
 * Performs the next move of the specified player
 * @player  the player whose move to make
 * @difficulty  the player's difficulty
 */
function doNextMove(player, difficulty)
  {
  //if no more free cells
  if(!movesLeft)
    {
    //this will only be executed if the game is a draw
    //because a win will be caught earlier
    document.getElementById("board").caption.innerHTML="Draw.";

    return;
    }//end if

  // prompt
  document.getElementById("board").caption.innerHTML=getMark(player)+"'s turn";

  if(difficulty != HUMAN)
    {
    document.getElementById("choose"+nextMove(player, difficulty)).click();
    }//end if
  }//end doNextMove


/**
 * Returns the cell for the specified player's next move.
 * @param player  The player whose next move to calculate
 * @param difficulty The player's difficulty
 * @return The cell index of the player's next move, or -1 if
 *         difficulty is HUMAN
 */
function nextMove(player, difficulty)
  {
  var next=-1;

  switch(difficulty)
    {
    case EASY:
      next=nextMoveEasy(player);
      break;

    case REASONABLE:
      next=nextMoveReasonable(player);
      break;

    case IMPOSSIBLE:
      next=nextMoveImpossible(player);
      break;
    }//end switch difficulty

  return next;
  }//end nextMove


/**
 * Returns the next move of an EASY player
 * @param player  the player whose move to calculate
 * @return the cell index of the next move
 */
function nextMoveEasy(player)
  {
  var next=-1;

  //return a random free cell
  do
    {
    next=Math.floor(Math.random() * 9);
    } while(board[next].className.indexOf("open") === -1);

  return next;
  }//end nextMoveEasy


/**
 * Returns the next move of a REASONABLE player
 * @param player  the player whose move to calculate
 * @return the cell index of the next move
 */
function nextMoveReasonable(player)
  {
  ; //TODO
  }//end nextMoveReasonable


/**
 * Returns the next move of an IMPOSSIBLE player
 * @param player  the player whose move to calculate
 * @return the cell index of the next move
 */
function nextMoveImpossible(player)
  {
  return (player == X_PLAYER)? xDFA.move : oDFA.move;
  }//end nextMoveImpossible


newGame();
