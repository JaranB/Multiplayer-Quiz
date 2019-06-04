# PG6300 Exam Documentation 2018

Final exam in PG300 at Westerdals/Høyskolen Kristiania

## What this project is?

Our assignment was to create an online multiplayer quiz game. In the game a user is going to be able to create a game or find an already started game. During the game the players will have to choose one of four alternatives for each question, and get a score depending on wether they answer right and how long time they spent answering. At the end of the game the users will be displayed in descending order by score.

## How does it work?

When the user first launches the URL he/she will be met with a welcome site where you can choose your own nickname. Once a nickname is chosen the player will be able to access the gamebrowser by clicking on "Find game". Inside the gamebrowser the user will see all available games listed. At the bottom of the games list you will see a "Create game" button(this will be the only visible button on the site if no other games exists). By clicking this you will be taken to a gamelobby where you will have to wait for atleast one more player to join in. Once there are two players, the creator of the game can start the game. If there are 4 players in the lobby the game will start automaticly.

Once the game has begun a question will be served with alternatives to the players. The players will have 10 seconds to choose their answer and they will get a score depending on wether their answer is correct and how long time they spent answering. If the time runs out before you manage to answer you answer blank, and the next question will be displayed. The game will continue running until there are no more questions. At the end of the game the users will be sorted in descending order by their score, and the winner will be decleared at the top of the list with a special "winner" border.

Once the game is over the users can choose to leave the game and either create a new game or join an existing one.

## How to run the project?

In order to run the project all you have to do is:

1. First unzip the project folder
2. Open up your terminal in the project location
3. Run "**npm i**" to install modules
4. Run "**npm run start**" to start the server
5. Open http://localhost:8080 in your browser
6. Everything should now be ready to be used

## How is the project structured?

The frontend is made up with react and consists of components for the welcome screen, gamebrowser, gamelobby, the game itself and user scores. With react routing the user will navigate through the diffrent components depending on where in the game the user is.

The whole project relies on the user sending API calls to the server to store or retrive data. Most of the data the user retrives from the server is set to state. The data set to state is used to display games in the client. The state is also beeing updated by WebSockets to make sure everything is displayed in the same way for each player. For example: If there are three available games, user 1 and user 2 should both see three games in their server browser, and if one of the games starts that game should be removed from the server browser for all players.
WebSockets is also beeing used to update the ongoing games to make sure all the players in the game is beeing displayed the same data like game questions, alternatives and user scores.

Most of the API calls is related to creating users, games and upating them. When it comes to the game logic itself I have tried to keep it on the server to make it harder for the users to cheat. Every time a user choose a question alternative the gamelogic will run and check wether all the users has answered, if their answer is correct add score, and if the round is still ongoing. If the round time runs out or all the players has answered then a new question will be pushed with WebSockets and the players answers and round time to calculate score wiped and set again for the next round.

To handle the timers on each round I have been using the setTimeout function. With this a check will be called after 10 seconds to check wether the game round is still ongoing or not. If it is it will push the new question out through WebSockets.