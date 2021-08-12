# Areto

https://areto.herokuapp.com

Currently displays NBA and MLS scores

- Can access current, past, and future fixtures
- Box scores can be generated for present and most\* past NBA/MLS games

<sub>\*only ones using nba api v3<sub>
  
One major bug I plan on fixing is that the NBA blacklists Heroku applications from accessing certain parts of their API. Scores from past games, and future scheduled games will be taken from Basketball Reference.

Features a register, login, and commenting system using MongoDB

Planned features:

- Team stats (posession, score, etc) to MLS box scores
- Profile page
- Player overall scores database
- Weekly score database
- Team builder
