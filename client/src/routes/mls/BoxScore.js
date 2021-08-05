/* eslint-disable eqeqeq */
import React from 'react';


/**
 *  Used for retrieving photos from the /images folder using only the image name
 *  Returns the link to the image with the given name
 */
const getImage = (name) => {
    return `${process.env.PUBLIC_URL}/assets/images/mls_logos/` + name + '.svg'
}


/**
 *  Sums the given stat of each player on the inputted team
 *  Returns the total
 */
const sumStat = (team, stat) => {
    let total = 0;
    team.map(player => {
        if (player.statistics[stat])
            total += parseInt(player.statistics[stat]);
        return null;
    })
    return total;
}


const getShotPercent = (player) => {
    if (!player.statistics.ontarget_scoring_att)
        return 0;
    else if (!player.statistics.total_scoring_att)
        return 'INF';
    else
        return (player.statistics.ontarget_scoring_att/player.statistics.total_scoring_att*100).toFixed(1);
}


const getPassPercent = (player) => {
    if (!player.statistics.successful_passes)
        return 0;
    else if (!player.statistics.total_pass)
        return 'INF';
    else
        return (player.statistics.successful_passes/player.statistics.total_pass*100).toFixed(1);
}


/**
 *  Generates the totals for each stat on the given team
 *  Returns a table row with the summed stats in the correct columns
 */
 const generateTotals = (team) => {
    return (
        <tr>
            <td colSpan='3'>Totals</td>
            <td>{sumStat(team, 'goals')}</td>
            <td>N/A</td>
            <td>{sumStat(team, 'goal_assist')}</td>
            <td>N/A</td>
            <td>{sumStat(team, 'ontarget_scoring_att')}-{sumStat(team, 'total_scoring_att')}</td>
            <td>{(sumStat(team, 'ontarget_scoring_att')/sumStat(team, 'total_scoring_att') * 100).toFixed(1)}</td>
            <td>{sumStat(team, 'successful_passes')}-{sumStat(team, 'total_pass')}</td>
            <td>{(sumStat(team, 'successful_passes')/sumStat(team, 'total_pass') * 100).toFixed(1)}</td>
            <td>{sumStat(team, 'own_goals')}</td>
            <td>{sumStat(team, 'fouls')}</td>
            <td>{sumStat(team, 'total_offside')}</td>
            <td>{sumStat(team, 'yellow_card')}</td>
            <td>{sumStat(team, 'red_card')}</td>
        </tr>
    )
}


/**
 *  Generates the stats for each player on the given team
 *  Returns one table row for each player, with their stats filled in the correct column
 */
 const generateTeamStats = (team) => {
    return team.map(player => {
        if (player.statistics.mins_played) {
            return (
                <tr key={player.id}>
                    <td>{player.player.first_name.charAt(0)}. {player.player.last_name}{player.is_captain && ' (C)'}</td>
                    <td>{player.status === 'Start' ? player.position : 'Sub'}</td>
                    <td>{player.statistics.mins_played}</td>
                    <td>{player.statistics.goals ? player.statistics.goals : 0 }</td>
                    <td>{player.statistics.expected_goals ? player.statistics.expected_goals.toFixed(2) : 0}</td>
                    <td>{player.statistics.goal_assist ? player.statistics.goal_assist : 0}</td>
                    <td>{player.statistics.expected_assists ? player.statistics.expected_assists.toFixed(2) : 0}</td>
                    <td>{player.statistics.ontarget_scoring_att ? player.statistics.ontarget_scoring_att : 0}-{player.statistics.total_scoring_att ? player.statistics.total_scoring_att : 0}</td>
                    <td>{getShotPercent(player)}</td>
                    <td>{player.statistics.successful_passes ? player.statistics.successful_passes : 0}-{player.statistics.total_pass ? player.statistics.total_pass : 0}</td>
                    <td>{getPassPercent(player)}</td>
                    <td>{player.statistics.own_goals ? player.statistics.own_goals : 0}</td>
                    <td>{player.statistics.fouls ? player.statistics.fouls : 0}</td>
                    <td>{player.statistics.total_offside ? player.statistics.total_offside : 0}</td>
                    <td>{player.statistics.yellow_card ? player.statistics.yellow_card : 0}</td>
                    <td>{player.statistics.red_card ? player.statistics.red_card : 0}</td>
                </tr>
            )
        }
        else {
            return (
                <tr key={player.id}>
                    <td>{player.player.first_name.charAt(0)}. {player.player.last_name}</td>
                    <td colSpan='20' style={{textAlign: 'center'}}>
                        DNP
                    </td>
                </tr>
            )
        }
    })
}


/**
 *  Creates the full box score table, including the header and footer
 *  Returns the created box score table
 */
 const generateTable = (id, team) => {
    return (
        <table id={id}>
            <thead>
                <tr>
                    <th>PLAYER</th>
                    <th>POS</th>
                    <th>MINS</th>
                    <th>GOALS</th>
                    <th>xG</th>
                    <th>AST</th>
                    <th>xA</th>
                    <th>SOT-TS</th>
                    <th>SOT%</th>
                    <th>PC-PA</th>
                    <th>PASS%</th>
                    <th>OG</th>
                    <th>FLS</th>
                    <th>OFF</th>
                    <th>YC</th>
                    <th>RC</th>
                </tr>
            </thead>
            <tbody>
                {generateTeamStats(team)}
            </tbody>
            <tfoot>
                {generateTotals(team)}
            </tfoot>
        </table>
    )
}


/**
 *  Creates the box score for the given game
 */
const BoxScore = (data) => {
    const home = data.gameInfo.home;
    const away = data.gameInfo.away;
    const stats = data.gameData;

    // Create home/away team stats
    let homeTeam = [];
    let awayTeam = [];
    for (let i = 0; i < stats.length; i += 1) {
        if (stats[i].club.opta_id === home.optaId) {
            homeTeam.push(stats[i]);
        } else {
            awayTeam.push(stats[i]);
        }
    }

    // Sort both teams by minutes played
    const sortMins = (a, b) => {
        return (b.statistics.mins_played ? b.statistics.mins_played : 0) - (a.statistics.mins_played ? a.statistics.mins_played : 0);
    }
    homeTeam.sort(sortMins);
    awayTeam.sort(sortMins);


    // Creating the Box Score Area
    return (
        <div>
            <div className="scoring-card">
                <h2>Team Stats</h2>
                <div className="table-container">
                    {/* {generateScores(homeTeam, awayTeam)} */}
                </div>
            </div>
            <div className="card">
                <h2><img src={getImage(home.abbreviation)} height='50' alt={home.abbreviation}></img> {home.fullName}</h2>
                <div className="table-container">
                    {generateTable('home', homeTeam)}
                </div>
            </div>
            <div className="card">
                <h2><img src={getImage(away.abbreviation)} height='50' alt={away.abbreviation}></img> {away.fullName}</h2>
                <div className="table-container">
                    {generateTable('away', awayTeam)}
                </div>
            </div>
        </div>
    );
}

export default BoxScore;