import React from "react";

export class Header extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.name) {
      return (
        <div id="header">
          <p id="nicknameText">Hello {this.props.name}</p>
        </div>
      );
    }
    return <div id="header" />;
  }
}
