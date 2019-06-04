import React from "react";
import { Link, Redirect } from "react-router-dom";

export class GameBrowser extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirectId: null
    };

    this.createGame = this.createGame.bind(this);
  }

  async createGame(name) {
    const url = "http://localhost:8080/api/games";
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
      const redirectId = await response.json();
      this.setState({
        redirectId: redirectId.id
      });
    }
  }

  render() {
    if (this.state.redirectId !== null) {
      return <Redirect to={`gameLobby/${this.state.redirectId}`} />;
    }

    return (
      <div className="container">
        <div className="center-container">
          <div id="nicknameBox" />
          {this.props.games &&
            this.props.games.map((game, i) => {
              if (!game.inprogress && !game.gameOver) {
                return (
                  <Link
                    id={i}
                    className="playerButton blue playerBorder"
                    key={i}
                    onClick={() => {
                      this.props.updateGamePlayers(
                        this.props.games[i].id,
                        this.props.player.name
                      );
                    }}
                    to={`gameLobby/${this.props.games[i].id}`}
                  >
                    {game.creator}
                  </Link>
                );
              }
            })}
          <div
            className="button"
            onClick={() => {
              this.createGame(this.props.player.name);
            }}
          >
            Create game
          </div>
        </div>
      </div>
    );
  }
}
