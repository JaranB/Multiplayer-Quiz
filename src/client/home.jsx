import React from "react";
import { SelectNickname } from "./select_nickname";

export class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: ""
    };
  }

  render() {
    return (
      <div>
        <SelectNickname />
      </div>
    );
  }
}
