import React from "react";
import { Link } from "react-router-dom";
import openSocket from "socket.io-client";

export class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      questions: []
    };

    this.socket = openSocket(window.location.origin);
  }

  componentDidMount() {
    this.props.gameLogic(this.props.match.params.id);

    this.socket.on(
      "update questions" + this.props.match.params.id,
      questionObject => {
        this.updateQuestions(questionObject);
      }
    );
  }

  async giveAnswer(gameID, id, answer) {
    const url = "http://localhost:8080/api/gamePlayerAnswer";
    const payload = { gameID: gameID, id: id, answer: answer };
    try {
      await fetch(url, {
        method: "post",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.log("Answer not updated");
      return;
    }
  }

  updateQuestions(questionObject) {
    this.setState({
      questions: questionObject
    });
  }

  render() {
    const id = this.props.match.params.id;

    if (this.state.questions.length < 1) {
      return (
        <div className="container">
          <div
            style={{ marginTop: "10px", marginBottom: "10px" }}
            className="row"
          >
            <div style={{ width: "300px", textAlign: "center" }}>Players:</div>
            <div style={{ width: "300px", textAlign: "center" }}>Scores:</div>
          </div>
          {this.props.games[id].players
            .sort((a, b) => {
              return b.score - a.score;
            })
            .map((player, i) => {
              return (
                <div
                  style={{ marginTop: "10px", marginBottom: "10px" }}
                  className="row"
                >
                  <div
                    id={i === 0 ? "winnerStyle" : "player"}
                    className="gamePlayerTag playerBorder"
                    key={player.name}
                  >
                    {player.name}
                  </div>
                  <div
                    id={i === 0 ? "winnerStyle" : "player"}
                    className="gamePlayerTag playerBorder"
                    key={player.name}
                  >
                    {player.score}
                  </div>
                </div>
              );
            })}
          <div className="row">
            <Link className="button" to={`/gameBrowser`}>
              Leave game!
            </Link>
          </div>
        </div>
      );
    }
    return (
      <div id="gameFrame">
        <div id="gameTop">
          <div className="gameTop__box gameTop__box--players">
            Players:
            {this.props.games[id].players.map((player, i) => {
              return (
                <div
                  id={"player" + (i + 1)}
                  className="gamePlayerTag playerBorder"
                  key={player.name}
                >
                  {player.name}
                </div>
              );
            })}
          </div>
          <div className="gameTop__box gameTop__box--question">
            <div id="questionBox">
              {this.state.questions != "" && (
                <a> {(this.state.questions[0] || {}).question}</a>
              )}
            </div>
          </div>
          <div className="gameTop__box gameTop__box--scores">
            Scores:
            {this.props.games[id].players.map((player, i) => {
              return (
                <div
                  id={"player" + (i + 1)}
                  className="gamePlayerTag playerBorder"
                  key={player.name}
                >
                  {player.score}
                </div>
              );
            })}
          </div>
          <div className="clearFix" />
        </div>

        <div id="gameBottom">
          {this.state.questions != "" && (
            <div>
              {this.state.questions[0].alternatvies.map((question, i) => {
                return (
                  <div
                    className="gameAlternative green playerBorder"
                    key={i}
                    onClick={() => {
                      this.giveAnswer(
                        id,
                        this.props.player.id,
                        this.state.questions[0].alternatvies[i]
                      );
                      this.props.gameLogic(id);
                    }}
                  >
                    {this.state.questions != "" && (
                      <a> {this.state.questions[0].alternatvies[i]}</a>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="clearFix" />
        </div>
      </div>
    );
  }
}
