import React from "react";
import { Link, Redirect } from "react-router-dom";

export class GameLobby extends React.Component {
  constructor(props) {
    super(props);

    this.deleteGame = this.deleteGame.bind(this);
  }

  async deleteGame(id) {
    const url = "http://localhost:8080/api/endGame";
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

  render() {
    const id = this.props.match.params.id;

    if (this.props.games[id].gameOver) {
      return <Redirect to={`/gameBrowser`} />;
    }
    if (this.props.games[id].inprogress === true) {
      return <Redirect to={`/game/${id}`} />;
    }

    return (
      <div id="gameLobbyBox">
        <h1 style={{ marginTop: "200px", textAlign: "center" }}>
          Game ID: {id}
        </h1>
        <div className="spacer">
          <h3 className="spacing-reset">Players:</h3>
          {this.props.games[id].players.map((player, i) => {
            return (
              <div
                className="playerButton blue playerBorder"
                style={{ marginTop: "10px" }}
                key={player.name}
              >
                {player.name}
              </div>
            );
          })}
        </div>
        {this.props.player.name === this.props.games[id].creator &&
          this.props.games[id].players.length > 1 && (
            <Link
              className="button green"
              onClick={() => {
                this.props.updateGameStatus(parseInt(id), true);
              }}
              to={`/game/${id}`}
            >
              Start game
            </Link>
          )}
        <Link
          className="button red"
          to={`/gameBrowser`}
          onClick={() => {
            this.props.updateGamePlayers(parseInt(id), this.props.player.name);

            if (this.props.player.name === this.props.games[id].creator) {
              this.deleteGame(id);
            }
          }}
        >
          Leave game
        </Link>
      </div>
    );
  }
}
