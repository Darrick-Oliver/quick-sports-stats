# Areto

[Areto Homepage](https://areto.herokuapp.com) (hosted on Heroku, may take a while to load at first)

To see a list of the most recent changes, visit the [changelog](https://github.com/Darrick-Oliver/areto/wiki/Changelog)

Currently displays NBA and MLS scores

- Can access current, past, and future fixtures
- Box scores can be generated for present and most\* past NBA games
- All box scores are present for MLS games

<sub>\*only ones using nba api v3<sub>

One major bug I plan on fixing is that the NBA blacklists Heroku applications from accessing certain parts of their API. Scores from past games, and future scheduled games will be taken from a different sports API.

Features a register, login, and commenting system using MongoDB

TODO:

- Show users' favorite teams in comments
- Team scores database (retrieves if not stored)
- Change NBA api (ESPN, bbref, or something else)
- Team stats (posession, score, etc) in MLS box scores
- Comment context permalink
- Team builder
