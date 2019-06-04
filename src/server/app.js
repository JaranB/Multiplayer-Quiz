const express = require("express");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");

const app = express();
const server = require("http").Server(app);
const io = socketIo(server);

app.use(bodyParser.json());
app.use(express.static("public"));

let counterPlayer = 0;
let counterGames = 0;

const players = [];
let games = [];
const questions = [
  {
    question: "What weighs the most?",
    alternatvies: [
      "1kg feathers",
      "1kg stone",
      "They are the same weight",
      "Stone is always heavier than feathers"
    ],
    answer: "They are the same weight"
  },
  {
    question: "What color did Donald Ducks car have?",
    alternatvies: ["Blue", "Red", "Pink", "Green"],
    answer: "Red"
  },
  {
    question: "What is the name of Mickey Mouse's dog?",
    alternatvies: ["Robin", "Bobby", "Venus", "Pluto"],
    answer: "Pluto"
  },
  {
    question: "How many fingers does a human have?",
    alternatvies: ["Ten", "Five", "Three", "Seven"],
    answer: "Ten"
  },
  {
    question: "What year did Norway become independent?",
    alternatvies: ["1866", "1414", "1814", "1952"],
    answer: "1814"
  },
  {
    question: "What is the largest animal currently on Earth?",
    alternatvies: ["Rhino", "Giraffe", "Elephant", "Blue Whale"],
    answer: "Blue Whale"
  },
  {
    question: "What color do you get by mixing yellow and red?",
    alternatvies: ["Blue", "Purple", "Green", "Orange"],
    answer: "Orange"
  },
  {
    question: "What is the only mammal born with horns?",
    alternatvies: ["Giraffe", "Tiger", "Dog", "Turtle"],
    answer: "Giraffe"
  },
  {
    question: "The dingo is a type of feral dog native to which country?",
    alternatvies: ["Australia", "Sweden", "China", "Turkey"],
    answer: "Australia"
  },
  {
    question: "What type of animal is known as the ship of the desert?",
    alternatvies: ["Rat", "Camel", "Dog", "Horse"],
    answer: "Camel"
  }
];

//PLAYER START

function findPlayer(newPlayer) {
  const findPlayer = players.filter(player => {
    return player.name === newPlayer;
  });
  return findPlayer[0];
}

function findPlayerPosition(newPlayer) {
  let playerIndex = null;
  players.forEach((player, i) => {
    if (player.name === newPlayer.name) {
      playerIndex = i;
    }
  });
  return playerIndex;
}

app.get("/api/players", (req, res) => {
  const since = req.query["since"];

  const data = players;

  if (since !== undefined && since !== null) {
    res.json(data.filter(m => m.id > since));
  } else {
    res.json(data);
  }
});

app.post("/api/players", (req, res) => {
  const dto = req.body;

  const findNick = players.filter(player => {
    return player.name.toLowerCase() === dto.name.toLowerCase();
  });

  let playerForm;
  if (findNick.length === 0) {
    res.status(201);
    const id = counterPlayer++;
    playerForm = {
      id: id,
      name: dto.name,
      score: 0,
      answer: "",
      hasAnswered: false
    };
    players.push(playerForm);
  } else {
    res.status(204);
    res.json(findNick);
    return;
  }

  res.status(201);
  res.json(playerForm);
});

app.get("/api/players/:nickname", (req, res) => {
  const findNick = players.filter(player => {
    return player.name === req.params.nickname;
  });

  if (findNick.length === 0) {
    res.status(204);
    res.send();
  } else {
    res.status(201);
    res.json(findNick);
  }
});

//PLAYER STOP

//GAME GENERALSTART

app.post("/api/games", (req, res) => {
  const dto = req.body;

  let playerHasGame = false;
  games.forEach(function(game) {
    if (dto.name === game.creator && game.gameOver === false) {
      playerHasGame = true;
    }
  });
  if (playerHasGame) {
    res.status(204).json({ hasGame: true });
  } else {
    res.status(201);
    const id = counterGames;
    gameForm = {
      id: id,
      creator: dto.name,
      players: [findPlayer(dto.name)],
      time: +new Date(),
      inprogress: false,
      gameOver: false,
      round: 0,
      runOnce: true,
      gameQuestions: []
    };
    games.push(gameForm);
    counterGames = counterGames + 1;
    io.sockets.emit("new game", gameForm);
    res.json(gameForm);
  }
});

app.get("/api/games/:gameID", (req, res) => {
  const paramsID = Number(req.params.gameID);
  const findGame = games.filter(game => {
    return game.id === paramsID;
  });

  if ("null" != findGame[0].id) {
    res.status(201);
    res.json(findGame);
  }
});

app.post("/api/updateGamePlayer", (req, res) => {
  const id = req.body.id;
  const newPlayer = req.body.player;

  let gameForm;
  const updatedGames = games.map((game, i) => {
    if (game.id === id) {
      const gamePlayers = game.players;

      if (gamePlayers.filter(player => player.name === newPlayer).length > 0) {
        const newPlayers = gamePlayers.filter(
          player => player.name !== newPlayer
        );
        game.players = newPlayers;
      } else {
        if (gamePlayers.length < 4) {
          game.players.push(findPlayer(newPlayer));
        } else {
          res.status(403).send("For mange spillere");
        }
      }
      gameForm = game;
    }
    return game;
  });

  games.forEach(function(entry) {
    if (entry.id === id) {
      if (entry.players.length === 4) {
        updatedGames[req.body.id].inprogress = true;
      }
    }

    if (entry.players.length < 4) {
      games[id].inprogress = false;
    }
    if (entry.players.length < 5) {
      games = updatedGames;
      io.sockets.emit("update game", gameForm);
      res.status(201).send();
    } else {
      res.status(403).send("For mange spillere");
    }
  });
});

app.post("/api/updateGameStatus", (req, res) => {
  const id = req.body.id;
  const newStatus = req.body.status;

  let gameForm;
  const updatedGames = games.map(game => {
    if (game.id === id) {
      game.inprogress = newStatus;
      gameForm = game;
    }
    return game;
  });
  games = updatedGames;
  io.sockets.emit("update game", gameForm);
  res.status(201).send();
});

app.get("/api/games", (req, res) => {
  const since = req.query["since"];

  const data = games;

  if (since !== undefined && since !== null) {
    res.json(data.filter(m => m.id > since));
  } else {
    res.json(data);
  }
});

app.post("/api/endGame", (req, res) => {
  const id = req.body.id;

  const updatedGames = games.map(game => {
    if (parseInt(id) === game.id) {
      game.gameOver = true;
    }
    return game;
  });
  games = updatedGames;
  io.sockets.emit("update game", games[id]);
  res.status(200).send();
});

//GAME GENERAL STOP

//GAME LOGIC START

//Thus shuffle function was found on https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function questionTimer(gameID, round) {
  if (games[gameID].round === round) {
    if (games[gameID].gameQuestions.length != 0) {
      const checkingAnswers = games[gameID].players.map((player, i) => {
        if (player.answer === games[gameID].gameQuestions[0].answer) {
        }
        games[gameID].players[i].answer = "";
        games[gameID].players[i].answerTime = null;
      });
      games[gameID].gameQuestions.splice(0, 1);
      games[gameID].round++;
      games[gameID].lastQuestionTime = new Date();
      io.sockets.emit("update questions" + gameID, games[gameID].gameQuestions);
      var currentGameRound = games[gameID].round;
      var startQuestionTimer = setTimeout(function() {
        questionTimer(gameID, currentGameRound);
      }, 10000);
    }
  }
}

app.post("/api/gamePlayerAnswer", (req, res) => {
  const gameID = req.body.gameID;
  const playerID = req.body.id;
  const answer = req.body.answer;

  const givenAnswers = games[gameID].players.map((player, i) => {
    if (player.id === playerID) {
      games[gameID].players[i].answer = answer;
      games[gameID].players[i].answerTime = new Date();
      res.status(200).send();
    }
  });

  res.status(200).send();
});

function checkAnswers(gameID, correctAnswer) {
  var countAnswers = 0;
  games[gameID].players.forEach(function(player, i) {
    if (player.answer != "") {
      if (player.hasAnswered === false) {
        games[gameID].players[i].hasAnswered = true;

        if (player.answer === correctAnswer) {
          const answerTime =
            (player.answerTime - games[gameID].lastQuestionTime) / 1000;
          const playerId = findPlayerPosition(player);

          if (playerId !== null) {
            players[playerId].score = players[playerId].score + answerTime * 10;
            games[gameID].players[i].score =
              games[gameID].players[i].score + answerTime * 10;
            io.sockets.emit("update game", games[gameID]);
          }
        }
      }
      countAnswers++;
    }
  });

  if (countAnswers === games[gameID].players.length) {
    return true;
  }

  return false;
}

app.post("/api/gameLogic", (req, res) => {
  const gameID = req.body.id;

  if (games[gameID].runOnce) {
    games[gameID].runOnce = false;
    games[gameID].gameQuestions = questions.slice(0);

    games[gameID].gameQuestions = shuffle(games[gameID].gameQuestions);
    games[gameID].gameQuestions = games[gameID].gameQuestions.map(question => {
      question.alternatives = shuffle(question.alternatvies);
      return question;
    });

    games[gameID].time = +new Date() + 10000;
    var currentGameRound = games[gameID].round;
    var startQuestionTimer = setTimeout(function() {
      questionTimer(gameID, currentGameRound);
    }, 10000);
    games[gameID].lastQuestionTime = new Date();
    io.sockets.emit("update questions" + gameID, games[gameID].gameQuestions);
    res.status(200).send();
  } else {
    if (checkAnswers(gameID, games[gameID].gameQuestions[0].answer)) {
      const checkingAnswers = games[gameID].players.map((player, i) => {
        games[gameID].players[i].answer = "";
        games[gameID].players[i].answerTime = null;
        games[gameID].players[i].hasAnswered = false;
      });

      games[gameID].gameQuestions.splice(0, 1);
      games[gameID].round++;
      games[gameID].lastQuestionTime = new Date();
      io.sockets.emit("update questions" + gameID, games[gameID].gameQuestions);
      games[gameID].time = +new Date() + 10000;
      var currentGameRound = games[gameID].round;
      var startQuestionTimer = setTimeout(function() {
        questionTimer(gameID, currentGameRound);
      }, 10000);
      if (games[gameID].gameQuestions.length == 0) {
        games[gameID].gameOver = true;
      }
      res.status(200).send();
    } else {
      games[gameID].lastQuestionTime = new Date();
      io.sockets.emit("update questions" + gameID, games[gameID].gameQuestions);
      res.status(200).send();
    }
    res.status(200).send();
  }
});
//GAME LOGIC STOP

module.exports = server;
