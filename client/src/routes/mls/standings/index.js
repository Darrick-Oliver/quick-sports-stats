import './index.css';
import React, { useState, useEffect } from 'react';

// Gets requested logo from public folder
const getImage = (name) => {
    return `${process.env.PUBLIC_URL}/assets/images/mls_logos/${name}.svg`;
}

const Standings = () => {
    const [standings, setStandings] = useState(null);
    const [err, setErr] = useState(null);

    // Fetch standings data
    useEffect(() => {
        if (!standings) {
            fetch('/api/mls/standings')
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
                        // Order by rank
                        conference.standings.entries.sort((a, b) => {
                            return a.stats[8].value - b.stats[8].value;
                        })
                        return (
                            <div className='standings-table table-container card' key={conference.name}>
                                <h2>{conference.name}</h2>
                                <table id={conference.name}>
                                    <thead>
                                        <tr>
                                            <th>POS</th>
                                            <th style={{ textAlign: 'left' }}>NAME</th>
                                            <th>GP</th>
                                            <th>W</th>
                                            <th>T</th>
                                            <th>L</th>
                                            <th>GF</th>
                                            <th>GA</th>
                                            <th>GD</th>
                                            <th>PTS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {conference.standings.entries.map((entry, i) => {
                                            let fill = '#ffffff';

                                            // Fix NYCFC
                                            if (entry.team.abbreviation === 'NY') entry.team.abbreviation = 'NYC';

                                            if (entry.note)
                                                fill = entry.note.rank === 1 ? '#4285f4' : '#fa7b17';

                                            return (
                                                <tr key={entry.team.id}>
                                                    <td>
                                                        {entry.note && 
                                                            <svg width='4' height='35' style={{marginRight: 5}}>
                                                                <rect width='4' height='35' style={{ fill: fill }} />
                                                            </svg>
                                                        }
                                                        {i + 1}
                                                    </td>
                                                    <td style={{ textAlign: 'left' }}><img style={{ height: 40, marginRight: 5 }} src={getImage(entry.team.abbreviation)} alt={entry.team.abbreviation} />{entry.team.displayName}</td>
                                                    <td>{entry.stats[3].value}</td>
                                                    <td>{entry.stats[0].value}</td>
                                                    <td>{entry.stats[2].value}</td>
                                                    <td>{entry.stats[1].value}</td>
                                                    <td>{entry.stats[4].value}</td>
                                                    <td>{entry.stats[5].value}</td>
                                                    <td>{entry.stats[9].value}</td>
                                                    <td>{entry.stats[6].value}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                                <span style={{marginLeft: 45, marginTop: 25, textAlign: 'left'}}>
                                    <svg width='15' height='15' style={{marginTop: -2, marginRight: 5}}>
                                        <rect width='15' height='15' style={{fill: '#4285f4'}} />
                                    </svg>
                                    Qualifies for Playoffs Conference semifinals
                                </span>
                                <span style={{marginLeft: 45, marginTop: 15, textAlign: 'left'}}>
                                    <svg width='15' height='15' style={{marginTop: -2, marginRight: 5}}>
                                        <rect width='15' height='15' style={{fill: '#fa7b17'}} />
                                    </svg>
                                    Qualifies for Playoffs first round
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