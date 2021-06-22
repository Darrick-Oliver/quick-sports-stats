/* eslint-disable eqeqeq */
import React from 'react';


/**
 *  Formats the minutes from nba.com data to make it readable
 *  Returns the formatted minutes
 */
const formatMinutes = (minutes) => {
    let totMinutes = parseInt(minutes.match(/\d\dM/)[0].slice(0, -1));
    let totSeconds = minutes.match(/\d\d\./)[0].slice(0, -1);

    if(totMinutes == 0 && totSeconds == '00') {
        return '0';
    }
    return totMinutes + ':' + totSeconds;
}


/**
 *  Used for retrieving photos from the /images folder using only the image name
 *  Returns the link to the image with the given name
 */
const getImage = (name) => {
    return `${process.env.PUBLIC_URL}/assets/images/` + name + '.svg'
}


/**
 *  Sums the given stat of each player on the inputted team
 *  Returns the total
 */
const sumStat = (team, stat) => {
    let total = 0;
    team.map(player => {
        total += parseInt(player.statistics[stat]);
        return null;
    })
    return total;
}


/**
 *  Generates the totals for each stat on the given team
 *  Returns a table row with the summed stats in the correct columns
 */
const generateTotals = (team, plusMinus) => {
    return (
        <tr>
            <td colSpan='3'>Totals</td>
            <td>{sumStat(team, 'points')}</td>
            <td>{sumStat(team, 'assists')}</td>
            <td>{sumStat(team, 'reboundsTotal')}</td>
            <td>{sumStat(team, 'reboundsOffensive')}</td>
            <td>{sumStat(team, 'reboundsDefensive')}</td>
            <td>{sumStat(team, 'steals')}</td>
            <td>{sumStat(team, 'blocks')}</td>
            <td>{sumStat(team, 'fieldGoalsMade')}-{sumStat(team, 'fieldGoalsAttempted')}</td>
            <td>{(sumStat(team, 'fieldGoalsMade')/sumStat(team, 'fieldGoalsAttempted') * 100).toFixed(1)}</td>
            <td>{sumStat(team, 'threePointersMade')}-{sumStat(team, 'threePointersAttempted')}</td>
            <td>{(sumStat(team, 'threePointersMade')/sumStat(team, 'threePointersAttempted') * 100).toFixed(1)}</td>
            <td>{sumStat(team, 'freeThrowsMade')}-{sumStat(team, 'freeThrowsAttempted')}</td>
            <td>{(sumStat(team, 'freeThrowsMade')/sumStat(team, 'freeThrowsAttempted') * 100).toFixed(1)}</td>
            <td>{sumStat(team, 'foulsPersonal')}</td>
            <td>{plusMinus}</td>
        </tr>
    )
}

/**
 *  Generates the stats for each player on the given team
 *  Returns one table row for each player, with their stats filled in the correct column
 */
const generateTeamStats = (team) => {
    return team.map(player => {
        if (player.status == 'ACTIVE') {
            return (
                <tr key={player.personId}>
                    <td>{player.nameI}</td>
                    <td>{player.position}</td>
                    <td>{formatMinutes(player.statistics.minutes)}</td>
                    <td>{player.statistics.points}</td>
                    <td>{player.statistics.assists}</td>
                    <td>{player.statistics.reboundsTotal}</td>
                    <td>{player.statistics.reboundsOffensive}</td>
                    <td>{player.statistics.reboundsDefensive}</td>
                    <td>{player.statistics.steals}</td>
                    <td>{player.statistics.blocks}</td>
                    <td>{player.statistics.fieldGoalsMade}-{player.statistics.fieldGoalsAttempted}</td>
                    <td>{(player.statistics.fieldGoalsPercentage * 100).toFixed(1)}</td>
                    <td>{player.statistics.threePointersMade}-{player.statistics.threePointersAttempted}</td>
                    <td>{(player.statistics.threePointersPercentage * 100).toFixed(1)}</td>
                    <td>{player.statistics.freeThrowsMade}-{player.statistics.freeThrowsAttempted}</td>
                    <td>{(player.statistics.freeThrowsPercentage * 100).toFixed(1)}</td>
                    <td>{player.statistics.foulsPersonal}</td>
                    <td>{player.statistics.plusMinusPoints}</td>
                </tr>
            )
        }
        else {
            return (
                <tr key={player.personId}>
                    <td>{player.nameI}</td>
                    <td colSpan='20' style={{textAlign: 'center'}}>OUT{player.notPlayingDescription != undefined && player.notPlayingDescription != ''  ? ' - ' + player.notPlayingDescription : ''}</td>
                </tr>
            )
        }
    })
}


/**
 *  Creates the full box score table, including the header and footer
 *  Returns the created box score table
 */
const generateTable = (id, team, score, oppScore) => {
    let teamPlusMinus = score - oppScore;
    return (
        <table id={id}>
            <thead>
                <tr>
                    <th>PLAYER</th>
                    <th>POS</th>
                    <th>MINS</th>
                    <th>PTS</th>
                    <th>AST</th>
                    <th>REB</th>
                    <th>OREB</th>
                    <th>DREB</th>
                    <th>STL</th>
                    <th>BLK</th>
                    <th>FGM-A</th>
                    <th>FG%</th>
                    <th>3PM-A</th>
                    <th>3P%</th>
                    <th>FTM-A</th>
                    <th>FT%</th>
                    <th>PF</th>
                    <th>+/-</th>
                </tr>
            </thead>
            <tbody>
                {generateTeamStats(team)}
            </tbody>
            <tfoot>
                {generateTotals(team, teamPlusMinus)}
            </tfoot>
        </table>
    )
}

const generateScores = (home, away) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Team</th>
                    {home.periods.map(period => {
                        return (
                            <th key={period.period}>{period.periodType == 'REGULAR' ? `Q${period.period}` : `OT${period.period-4}`}</th>
                        )
                    })}
                    <th>Totals</th>
                </tr>
            </thead>
            <tbody>
                <tr id='home'>
                    <td>{home.teamTricode}</td>
                    {home.periods.map(period => {
                        return (
                            <td key={period.period}>{period.score}</td>
                        )
                    })}
                    <td>{home.statistics.points}</td>
                </tr>
                <tr id='away'>
                    <td>{away.teamTricode}</td>
                    {away.periods.map(period => {
                        return (
                            <td key={period.period}>{period.score}</td>
                        )
                    })}
                    <td>{away.statistics.points}</td>
                </tr>
            </tbody>
        </table>
    )
}

/**
 *  Creates the box score for the given game
 */
const BoxScore = (game) => {
    if (game) {
        let scoreHome = game.homeTeam.score;
        let scoreAway = game.awayTeam.score;

        // Creating the Box Score Area
        return (
            <div>
                <hr />
                <br />
                <div className="card">
                    <h2>Scoring by Quarter</h2>
                    {generateScores(game.homeTeam, game.awayTeam)}
                </div>
                <br />
                <div className="card">
                    <h2><img src={getImage(game.homeTeam.teamId)} height='50' alt={game.homeTeam.teamName}></img> {game.homeTeam.teamCity} {game.homeTeam.teamName}</h2>
                    {generateTable('home', game.homeTeam.players, scoreHome, scoreAway)}
                </div>
                <br />
                <div className="card">
                    <h2><img src={getImage(game.awayTeam.teamId)} height='50' alt={game.awayTeam.teamName}></img> {game.awayTeam.teamCity} {game.awayTeam.teamName}</h2>
                    {generateTable('away', game.awayTeam.players, scoreAway, scoreHome)}
                </div>
            </div>
        )
    }
    return;
}

export default BoxScore;