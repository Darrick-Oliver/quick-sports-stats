import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import '../../../css/bootstrap.min.css';

import descendingIcon from '../../nba/resources/arrow_drop_down.svg';
import ascendingIcon from'../../nba/resources/arrow_drop_up.svg';

const INCREASE_AMT = 50;
const INIT_PLAYERS = 50;

const MLSStats = () => {
    const [ stats, setStats ] = useState(null);
    const [ sortedStats, setSortedStats ] = useState(null);
    const [ err, setErr ] = useState(null)
    const [ sliceNum, setSliceNum ] = useState(INIT_PLAYERS);
    const [ currSlice, setCurrSlice ] = useState(INIT_PLAYERS);
    const [ sortStat, setSortStat ] = useState('goals');
    const [ dir, setDir ] = useState('descending');

    useEffect(() => {
        if (!stats) {
            // Fix this, figure out how to set season automatically
            fetch('/api/mls/players/all')
                .then((res) => res.json())
                .then((res) => {
                    if (res.status !== 'ok') {
                        setErr(res.error);
                    } else {
                        if (res.data.length === 0) {
                            setErr('Stats unavailable');
                        } else {
                            setStats(res.data);
                        }
                    }
                })
                .catch(error => {
                    console.error("Error fetching data:", error);
                });
        } else if (!sortedStats || sliceNum !== currSlice) {
            // Sort by selected stat
            stats.sort((a, b) => {
                if (!a[sortStat] && !b[sortStat])
                    return 0;
                else if (!a[sortStat])
                    return dir === 'descending' ? 1 : -1;
                else if (!b[sortStat])
                    return dir === 'descending' ? -1 : 1;
                else
                    return dir === 'descending' ? parseFloat(b[sortStat].replace(/,/g, '')) - parseFloat(a[sortStat].replace(/,/g, '')) : parseFloat(a[sortStat].replace(/,/g, '')) - parseFloat(b[sortStat].replace(/,/g, ''));
            });
            setSortedStats(stats.slice(0, sliceNum));
            setCurrSlice(sliceNum);
        }
    }, [stats, sortedStats, sliceNum, currSlice, sortStat, dir]);

    // Sort when sortStat changes
    useEffect(() => {
        if (stats) {
            stats.sort((a, b) => {
                if (!a[sortStat] && !b[sortStat])
                    return 0;
                else if (!a[sortStat])
                    return dir === 'descending' ? 1 : -1;
                else if (!b[sortStat])
                    return dir === 'descending' ? -1 : 1;
                else
                    return dir === 'descending' ? parseFloat(b[sortStat].replace(/,/g, '')) - parseFloat(a[sortStat].replace(/,/g, '')) : parseFloat(a[sortStat].replace(/,/g, '')) - parseFloat(b[sortStat].replace(/,/g, ''));
            });
            setSortedStats(stats.slice(0, sliceNum));
            setCurrSlice(sliceNum);
        }
    }, [sortStat, dir, sliceNum, stats]);

    // Handles sorting by stats
    const changeSort = (stat) => {
        if (stat === sortStat) {
            // Change direction
            if (dir === 'descending') setDir('ascending');
            else setDir('descending');
        } else {
            setSortStat(stat);
            setDir('descending');
        }
    }

    return (
        <div className='stats-content'>
            {!err && !sortedStats && <img id='load' src={`${process.env.PUBLIC_URL}/assets/loading/load_ring.svg`} alt='Fetching data...' />}
            {err && <h2>{err}</h2>}
            {sortedStats && 
                <div>
                    <div className='stats-card' style={{ maxWidth: 860 }}>
                        <h2>2020-21 MLS Season</h2>
                        <div className='stats-container'>
                            <table className='stats-box'>
                                <thead>
                                    <tr>
                                        <th>RANK</th>
                                        <th>NAME</th>
                                        <th title='Position'>POS</th>
                                        <th className='sort-header' onClick={() => changeSort('matches_played')} title='Games played'>GP {sortStat === 'matches_played' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                        <th className='sort-header' onClick={() => changeSort('matches_started')} title='Games started'>GS {sortStat === 'matches_started' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                        <th className='sort-header' onClick={() => changeSort('minutes_played')} title='Minutes'>MINS {sortStat === 'minutes_played' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                        <th className='sort-header' onClick={() => changeSort('full_minutes')} title='Minutes played over 90'>90s {sortStat === 'full_minutes' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                        <th className='sort-header' onClick={() => changeSort('goals')} title='Goals scored or allowed'>GLS {sortStat === 'goals' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                        <th className='sort-header' onClick={() => changeSort('assists')} title='Assists'>AST {sortStat === 'assists' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                        <th className='sort-header' onClick={() => changeSort('non_penalty_goals')} title='Non-penalty goals'>NPG {sortStat === 'non_penalty_goals' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                        <th className='sort-header' onClick={() => changeSort('pens_made')} title='Penalties made'>PK {sortStat === 'pens_made' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                        <th className='sort-header' onClick={() => changeSort('pens_attempted')} title='Penalties attempted'>PKA {sortStat === 'pens_attempted' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                        <th className='sort-header' onClick={() => changeSort('yellows')} title='Yellow cards'>YC {sortStat === 'yellows' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                        <th className='sort-header' onClick={() => changeSort('reds')} title='Red cards'>RC {sortStat === 'reds' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedStats.map((player, i) => {
                                        return <tr key={player.name}>
                                            <td>{i + 1}</td>
                                            <td>{player.name}</td>
                                            <td>{player.position}</td>
                                            <td>{player.matches_played}</td>
                                            <td>{player.matches_started}</td>
                                            <td>{player.minutes_played}</td>
                                            <td>{player.full_minutes}</td>
                                            <td>{player.goals}</td>
                                            <td>{player.assists}</td>
                                            <td>{player.non_penalty_goals}</td>
                                            <td>{player.pens_made}</td>
                                            <td>{player.pens_attempted}</td>
                                            <td>{player.yellows}</td>
                                            <td>{player.reds}</td>
                                        </tr>
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {currSlice <= stats.length && <Button variant='success' className='load-button' onClick={() => { setSliceNum(sliceNum + INCREASE_AMT) }}>Load more</Button>}
                    </div>
                </div>
            }
        </div>
    )
}

export default MLSStats;