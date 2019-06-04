import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import openSocket from "socket.io-client";

import { SelectNickname } from "./select_nickname";
import { GameBrowser } from "./gameBrowser";
import { Header } from "./header";
import { Game } from "./game";
import { GameLobby } from "./gameLobby";

export class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      player: {},
      games: []
    };

    this.socket = openSocket(window.location.origin);

    this.createNickname = this.createNickname.bind(this);
    this.findNickname = this.findNickname.bind(this);
    this.setGame = this.setGame.bind(this);
    this.getGame = this.getGame.bind(this);
    this.updateGameStatus = this.updateGameStatus.bind(this);
    this.gameLogic = this.gameLogic.bind(this);
  }

  componentDidMount() {
    this.getGames();
    this.socket.on("new game", game => {
      this.setGame(game);
    });

    this.socket.on("update game", game => {
      this.updateGame(game);
    });

    this.socket.on("delete game", id => {
      this.deleteGame(id);
    });
  }

  //PLAYER START

  async findNickname(name) {
    const url = `http://localhost:8080/api/players/${name}`;
    let response;

    try {
      response = await fetch(url, {
        method: "get",
        headers: {
          "Content-Type": "application/json"
        }
      });
    } catch (err) {
      console.log("Something went wrong: ", err);
      return;
    }

    if (response.status === 201) {
      const content = await response.json();
      this.setState({ player: content });
      return content.name;
    }

    return null;
  }

  async createNickname(name) {
    const url = "http://localhost:8080/api/players";
    const payload = { name: name };
    let response;
    try {
      response = await fetch(url, {
        method: "post",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.log("Something went wrong: ", err);
      return;
    }
    if (response.status === 201) {
      const player = await response.json();
      this.setState({ player: player });
    }
  }

  //PLAYER STOP

  //GAME START

  async getGames() {
    const url = "http://localhost:8080/api/games";
    let response;

    try {
      response = await fetch(url, {
        method: "get",
        headers: {
          "Content-Type": "application/json"
        }
      });
    } catch (err) {
      console.log("Something went wrong: ", err);
      return;
    }

    const games = await response.json();
    this.setState({
      games: games
    });
  }

  setGame(game) {
    const games = this.state.games;
    games.push(game);
    this.setState({
      games: games
    });
  }

  updateGame(newGame) {
    const games = this.state.games;
    const updatedGames = games.map(game => {
      if (game.id === newGame.id) {
        return newGame;
      }
      return game;
    });
    this.setState({
      games: updatedGames
    });
  }

  async updateGameStatus(id, status) {
    const url = "http://localhost:8080/api/updateGameStatus";
    const payload = { id: id, status: status };
    try {
      await fetch(url, {
        method: "post",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.log("Status not updated");
      return;
    }
  }

  async updateGamePlayers(id, player) {
    const url = "http://localhost:8080/api/updateGamePlayer";
    const payload = { id: id, player: player };
    try {
      await fetch(url, {
        method: "post",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.log("Status not updated");
      return;
    }
  }

  async getGame(gameID) {
    const url = `http://localhost:8080/api/games/${gameID}`;
    let response;

    try {
      response = await fetch(url, {
        method: "get",
        headers: {
          "Content-Type": "application/json"
        }
      });
    } catch (err) {
      console.log("Something went wrong: ", err);
      return;
    }

    if (response.status === 201) {
      const content = await response.json();
      return content;
    }

    return null;
  }

  async gameLogic(id) {
    const url = "http://localhost:8080/api/gameLogic";
    const payload = { id: id };
    try {
      await fetch(url, {
        method: "post",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.log("Something went wrong: ", err);
      return;
    }
  }

  deleteGame(gameID) {
    const games = this.state.games;
    const updatedGames = games.filter(game => {
      if (parseInt(gameID) !== game.id) {
        return game;
      }
    });
    this.setState({
      games: updatedGames
    });
  }

  //GAME STOP

  render() {
    return (
      <BrowserRouter>
        <div>
          <Header
            name={this.state.player.name}
            score={this.state.player.score}
          />
          <Switch>
            <Route
              exact
              path="/"
              render={props => (
                <SelectNickname
                  name={this.state.player.name}
                  createNickname={this.createNickname}
                />
              )}
            />
            <Route
              exact
              path="/GameBrowser"
              render={props => (
                <GameBrowser
                  games={this.state.games}
                  setGame={this.setGame}
                  player={this.state.player}
                  updateGamePlayers={this.updateGamePlayers}
                />
              )}
            />
            <Route
              exact
              path="/game/:id"
              render={props => (
                <Game
                  {...props}
                  games={this.state.games}
                  player={this.state.player}
                  gameLogic={this.gameLogic}
                />
              )}
            />
            <Route
              exact
              path="/gameLobby/:id"
              render={props => (
                <GameLobby
                  {...props}
                  player={this.state.player}
                  games={this.state.games}
                  updateGameStatus={this.updateGameStatus}
                  updateGamePlayers={this.updateGamePlayers}
                />
              )}
            />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
