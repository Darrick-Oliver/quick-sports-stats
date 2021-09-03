import React, { useState, useEffect } from 'react';
import { NBAteams } from '../../../teams';

// Gets requested logo from public folder
const getImage = (name) => {
    return `${process.env.PUBLIC_URL}/assets/images/nba_logos/${name}.svg`;
}

// Returns NBA id given eID
const idFromEId = (eId) => {
    for (let i = 0; i < NBAteams.length; i += 1) {
        if (NBAteams[i].eId === eId) {
            return NBAteams[i].id;
        }
    }
    return null;
}

const Standings = () => {
    const [standings, setStandings] = useState(null);
    const [err, setErr] = useState(null);

    // Fetch standings data
    useEffect(() => {
        if (!standings) {
            fetch('/api/nba/standings')
                .then((res) => res.json())
                .then((res) => {
                    if (res.status !== 'ok') {
                        setErr(res.error);
                    } else {
                        setStandings(res.data);
                    }
                    if (res.data.length === 0)
                        setErr('Schedule unavailable');
                })
                .catch(error => {
                    console.error("Error fetching data:", error);
                });
        }
    }, [standings]);

    return (
        <div className='standings-content'>
            {err && <h2>{err}</h2>}
            {!standings ? <img id='load' src={`${process.env.PUBLIC_URL}/assets/loading/load_ring.svg`} alt='Fetching data...' /> : 
                <div className='standings-container'>
                    {standings.map((conference) => {
                        conference.standings.entries.sort((a, b) => {
                            return a.stats[0].value - b.stats[0].value;
                        })
                        return (
                            <div className='standings-table card' key={conference.name}>
                                <h2>{conference.name}</h2>
                                <div className='table-container'>
                                    <table id={conference.name}>
                                        <thead>
                                            <tr>
                                                <th>POS</th>
                                                <th style={{ textAlign: 'left' }}>NAME</th>
                                                <th>W</th>
                                                <th>L</th>
                                                <th>W%</th>
                                                <th>GB</th>
                                                <th>APF</th>
                                                <th>APA</th>
                                                <th>DIFF</th>
                                                <th>STK</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {conference.standings.entries.map((entry, i) => {
                                                const fill = entry.stats[0].value < 7 ? '#4285f4' : '#fa7b17';

                                                return (
                                                    <tr key={entry.team.id}>
                                                        <td>
                                                            {entry.stats[0].value < 11 && 
                                                                <svg width='4' height='35' style={{marginRight: 5}}>
                                                                    <rect width='4' height='35' style={{ fill: fill }} />
                                                                </svg>
                                                            }
                                                            {i + 1}
                                                        </td>
                                                        <td style={{ textAlign: 'left' }}><img style={{ height: 40, marginRight: 5 }} src={getImage(idFromEId(entry.team.id))} draggable={false} alt={entry.team.abbreviation} />{entry.team.displayName}</td>
                                                        <td>{entry.stats[1].value}</td>
                                                        <td>{entry.stats[2].value}</td>
                                                        <td>{(entry.stats[3].value*100).toFixed(1)}</td>
                                                        <td>{entry.stats[4].value}</td>
                                                        <td>{entry.stats[5].value.toFixed(1)}</td>
                                                        <td>{entry.stats[6].value.toFixed(1)}</td>
                                                        <td>{entry.stats[7].value.toFixed(1)}</td>
                                                        <td>{entry.stats[8].value}</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <span style={{marginLeft: 45, marginTop: 15, textAlign: 'left'}}>
                                    <svg width='15' height='15' style={{marginTop: -2, marginRight: 5}}>
                                        <rect width='15' height='15' style={{fill: '#4285f4'}} />
                                    </svg>
                                    Qualifies for Playoffs
                                </span>
                                <span style={{marginLeft: 45, marginTop: 15, textAlign: 'left', marginBottom: 15}}>
                                    <svg width='15' height='15' style={{marginTop: -2, marginRight: 5}}>
                                        <rect width='15' height='15' style={{fill: '#fa7b17'}} />
                                    </svg>
                                    Qualifies for Play-in tournament
                                </span>
                            </div>
                        )
                    })}
                </div>
            }
        </div>
    )
}

export default Standings;