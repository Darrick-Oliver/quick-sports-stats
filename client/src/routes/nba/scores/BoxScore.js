/* eslint-disable eqeqeq */
import React from 'react';
import { NBAteams } from '../../../teams';


/**
 *  Used for retrieving photos from the /images folder using only the image name
 *  Returns the link to the image with the given name
 */
const getImage = (name) => {
    return `${process.env.PUBLIC_URL}/assets/images/nba_logos/` + name + '.svg'
}


/**
 *  Retrieves the corresponding NBA id from eId
 *  Returns the id if found, null if not found
 */
const idFromEId = (eId) => {
    for (let i = 0; i < NBAteams.length; i += 1) {
        if (NBAteams[i].eId === eId) {
            return NBAteams[i].id;
        }
    }
    return null;
}


/**
 *  Generates the totals for each stat on the given team
 *  Returns a table row with the summed stats in the correct columns
 */
const generateTotals = (id, team) => {
    return (
        <tr>
            <td colSpan='2'>Totals</td>
            {team.totals.map((total, i) => {
                return total ? <td key={`${id}-totals-${i}`}>{total}</td> : <td key={`${id}-totals-${i}`}>-</td>;
            })}
        </tr>
    )
}

/**
 *  Generates the stats for each player on the given team
 *  Returns one table row for each player, with their stats filled in the correct column
 */
const generateTeamStats = (team) => {
    return team.athletes.map(player => {
        if (!player.didNotPlay) {
            return (
                <tr key={player.athlete.guid}>
                    <td>{player.athlete.shortName}</td>
                    <td>{player.starter ? player.athlete.position.abbreviation : '-'}</td>
                    {player.stats.map((stat, i) => {
                        return <td key={`${player.athlete.guid}-stat-${i}`}>{stat}</td>
                    })}
                </tr>
            )
        }
        else {
            return (
                <tr key={player.athlete.guid}>
                    <td>{player.athlete.shortName}</td>
                    <td colSpan='20' style={{textAlign: 'center'}}>
                        DNP
                        {player.reason && ' - ' + player.reason}
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
                    <th>NAME</th>
                    <th>POS</th>
                    {team.labels.map((label, i) => {
                        return <th key={`${id}-label-${i}`}>{label}</th>
                    })}
                </tr>
            </thead>
            <tbody>
                {generateTeamStats(team)}
            </tbody>
            <tfoot>
                {generateTotals(id, team)}
            </tfoot>
        </table>
    )
}


/**
 *  Creates the box score for the given game
 */
const BoxScore = (data) => {
    const home = data.gameData.teams[0];
    const away = data.gameData.teams[1];

    const homePlayers = data.gameData.players[0].statistics[0];
    const awayPlayers = data.gameData.players[1].statistics[0];

    // Creating the Box Score Area
    return (
        <div>
            <div className="card">
                <h2><img src={getImage(idFromEId(home.team.id))} height='50' alt={home.team.displayName}></img> {home.team.displayName}</h2>
                <div className="table-container">
                    {generateTable('home', homePlayers)}
                </div>
            </div>
            <div className="card">
                <h2><img src={getImage(idFromEId(away.team.id))} height='50' alt={away.team.displayName}></img> {away.team.displayName}</h2>
                <div className="table-container">
                    {generateTable('away', awayPlayers)}
                </div>
            </div>
        </div>
    );
}

export default BoxScore;