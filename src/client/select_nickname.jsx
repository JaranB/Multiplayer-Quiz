import React from "react";
import { Link } from "react-router-dom";

export class SelectNickname extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      input: ""
    };
  }

  render() {
    return (
      <div id="welcomeBox">
        <h3 id="welcomeText">Welcome to the Quiz!</h3>
        <div id="nicknameBox">
          {this.props.name ? (
            <Link className="button" to={"/GameBrowser"}>
              Find game
            </Link>
          ) : (
            <div id="nicknameBox">
              <input
                className="textinput"
                type="text"
                name="name"
                placeholder="Your nickname"
                onChange={e => {
                  this.setState({ input: e.target.value });
                }}
                value={this.state.input}
              />
              <div
                className="button"
                onClick={() => {
                  this.props.createNickname(this.state.input);
                }}
              >
                Choose name
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
