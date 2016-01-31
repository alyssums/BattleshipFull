// the view is responsible for updating the display
var view = {
  displayMessage: function(msg) {
    var messageArea = document.getElementById('messageArea');
    messageArea.innerHTML = msg;
  },
  displayHit: function(location) {
    // updates the view with a ship icon when called and given a location
    var cell = document.getElementById(location);
    cell.setAttribute('class', 'hit');
  },

  displayMiss: function(location) {
    // updates the view with a MISS image when called and given a location
    var cell = document.getElementById(location);
    cell.setAttribute('class', 'miss');
  }
};

// the model is responsible for tracking the state of the game and the logic to
// test the guesses for hits and misses
var model = {
  boardSize: 7, // the size of the grid, 0 - 6 in this case
  numShips: 3, // the number of ships on the board
  shipLength: 3, // length each ship takes up on the board
  shipsSunk: 0, // initialize the number of ships sunk
  ships: [
    { locations: [0, 0, 0], hits: ['', '', ''] },
    { locations: [0, 0, 0], hits: ['', '', ''] },
    { locations: [0, 0, 0], hits: ['', '', ''] }
  ],
  // fire method accepts a guess
  fire: function(guess) {
    // then iterates through the array of ships
    for (var i = 0; i < this.numShips; i++) {
      var ship = this.ships[i]; // get the current ship
      // get the current ship's location search the location array for
      // a match to 'guess' and get its index; will return -1 if no match
      var index = ship.locations.indexOf(guess);
      if (index >= 0) {
        // we have a hit, so add string 'hit' to the hits array at that index
        ship.hits[index] = 'hit';
        // notify the view that we got hit at the location in guess
        view.displayHit(guess);
        view.displayMessage('HIT!');
        // call the isSunk method to check if the ship is sunk and if so,
        // increase the number for the property shipsSunk
        if (this.isSunk(ship)) {
          // update the view letting the player know they sunk a battleship
          view.displayMessage('You sank my battleship!');
          this.shipsSunk++;
        }
        return true;
      }
    }
    // update the view to tell the player they missed
    view.displayMiss(guess);
    view.displayMessage('You missed.');
    return false;
  },
  // takes a ship and returns true if sunk
  isSunk: function(ship) {
    // iterate through the current ship
    for (var i = 0; i < this.shipLength; i++) {
      // if the ship is not hit at index i, it is still floating so return false
      if (ship.hits[i] !== 'hit') {
        return false;
      }
    }
    // otherwise, the ship is sunk
    return true;
  },
  generateShip: function() {
    // get a number between 0 and 2 but not 2, so essentially 0 or 1
    var direction = Math.floor(Math.random() * 2);
    var row;
    var col;
    if (direction === 1) {
      // generate starting location for a horizontal ship
       row = Math.floor(Math.random() * this.boardSize);
       // because it's horizontal, the starting col has to be between 0 - 4
       col = Math.floor(Math.random() * (this.boardSize - (this.shipLength + 1)));
    } else {
      // generate starting location for a vertical ship
      // because it's vertical, the starting row has to be between 0 - 4
      row = Math.floor(Math.random() * (this.boardSize - (this.shipLength + 1)));
      col = Math.floor(Math.random() * this.boardSize);
    }
    // array to add ship locations to
    var newShipLocations = [];
    // loop through the number of locations in a ship
    for (var i = 0; i < this.shipLength; i++) {
      if (direction === 1) {
        // add location to array for new horizontal ship
        newShipLocations.push(row + '' + (col + i));
      } else {
        // add location to array for new vertical ship
        newShipLocations.push((row + i) + '' + col);
      }
    }
    return newShipLocations;
  },
  generateShipLocations: function() {
    var locations;
    for (var i = 0; i < this.numShips; i++) {
      // generate a new set of locations until there's no collision
      do {
        locations = this.generateShip();
      } while (this.collision(locations));
      // once there's no collisions, assign the location to the
      // ship's location property
      this.ships[i].locations = locations;
    }
  },
  // locations is an array of locations for a new ship we'd like to place
  collision: function(locations) {
    // for each ship on the board...
    for (var i = 0; i < this.numShips; i++) {
      var ship = this.ships[i];
      // ...check to see if the location already exists in an
      // existing ship's array
      for (var j = 0; j < locations.length; j++) {
        if (ship.locations.indexOf(locations[j]) >= 0) {
          // if this location exists at index j, it returns true
          // meaning there's a collision
          return true;
        }
      }
    }
    // otherwise, there's no collisions so it's all good
    return false;
  }
};

// the controller gets and processes input, then asks the model to update itself
// based on the latest guess - it also keeps track of the number of guesses
// and determines when the game is over
var controller = {
  // initialize guesses at 0 at the beginning of the game
  guesses: 0,
  // processes the guess, which comes in the form of 'A0'
  processGuess: function(guess) {
    // validate the guess using parseGuess method
    var location = parseGuess(guess);
    // if location is valid...
    if (location) {
      // increment amount of guesses - player isn't penalized for invalid guess
      this.guesses++;
      // pass the location to the model's fire method, which will
      // return true if a ship is hit
      var hit = model.fire(location);
      // and then if all the ships are sunk, end the game
      // if the guess was a hit and the number of ships sunk is
      // equal to the number of ships in the game, end it
      if (hit && model.shipsSunk === model.numShips) {
        view.displayMessage('You sank all my battleships in ' + this.guesses + ' guesses.');
      }
    }
  },
};

// parse the guess and return the guess in the form of '00'
// or null if we don't have a valid guess
function parseGuess(guess) {
  var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  if (guess === null || guess.length !== 2) {
    alert('Please enter a letter and a number on the board.');
  } else {
    // get the first character and turn it into a number
    var firstChar = guess.charAt(0);
    var row = alphabet.indexOf(firstChar);
    var column = guess.charAt(1);
    // make sure that the row and column are both numbers
    if (isNaN(row) || isNaN(column)) {
      alert('Oops, that is not on the board');
      // if both are numbers, make sure they're numbers on the board
    } else if (row < 0 || row >= model.boardSize || column < 0 || column >= model.boardSize) {
      alert('Oops, that is off the board!');
    } else {
      // row is a number and column is a string at this point, so they'll
      // concatenate instead of add together
      return row + column;
    }
  }
  // failed check along the way
  return null;
}

// get button reference using its ID and run handleFireButton when clicked
// also get ships
function init() {
  var fireButton = document.getElementById('fireButton');
  fireButton.onclick = handleFireButton;
  // key press
  var guessInput = document.getElementById('guessInput');
  guessInput.onkeypress = handleKeyPress;
  model.generateShipLocations();
}

// run handleFireButton on keypress instead of click
function handleKeyPress(e) {
  var fireButton = document.getElementById('fireButton');
  if (e.keyCode === 13) {
    fireButton.click();
    return false;
  }
}

// get the user input
function handleFireButton() {
  var guessInput = document.getElementById('guessInput');
  var guess = guessInput.value;
  // then pass it to the controller
  controller.processGuess(guess);
  // and clear the input area
  guessInput.value = '';
}

// initialize the fire button on page load
window.onload = init;
