import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import '../../../css/bootstrap.min.css';
import './nba_stats.css';

import descendingIcon from '../resources/arrow_drop_down.svg';
import ascendingIcon from'../resources/arrow_drop_up.svg';

const INCREASE_AMT = 50;
const INIT_PLAYERS = 50;

const NBAStats = () => {
    const [ stats, setStats ] = useState(null);
    const [ sortedStats, setSortedStats ] = useState(null);
    const [ err, setErr ] = useState(null)
    const [ sliceNum, setSliceNum ] = useState(INIT_PLAYERS);
    const [ currSlice, setCurrSlice ] = useState(INIT_PLAYERS);
    const [ sortStat, setSortStat ] = useState('points');
    const [ dir, setDir ] = useState('descending');

    useEffect(() => {
        if (!stats) {
            // Fix this, figure out how to set season automatically
            fetch('/api/nba/players/all/2021')
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
                    return dir === 'descending' ? parseFloat(b[sortStat]) - parseFloat(a[sortStat]) : parseFloat(a[sortStat]) - parseFloat(b[sortStat]);
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
                    return dir === 'descending' ? parseFloat(b[sortStat]) - parseFloat(a[sortStat]) : parseFloat(a[sortStat]) - parseFloat(b[sortStat]);
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
                    <div className='stats-card'>
                        <h2>2020-21 NBA Season</h2>
                        <div className='stats-container'>
                            <table className='stats-box'>
                                <thead>
                                    <tr>
                                        <th>RANK</th>
                                        <th>NAME</th>
                                        <th>POS</th>
                                        <th className='sort-header' onClick={() => changeSort('minutes_played')}>MINS {sortStat === 'minutes_played' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                        <th className='sort-header' onClick={() => changeSort('points')}>PTS {sortStat === 'points' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                        <th className='sort-header' onClick={() => changeSort('assists')}>AST {sortStat === 'assists' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                        <th className='sort-header' onClick={() => changeSort('tot_rebounds')}>REB {sortStat === 'tot_rebounds' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                        <th className='sort-header' onClick={() => changeSort('off_rebounds')}>OREB {sortStat === 'off_rebounds' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                        <th className='sort-header' onClick={() => changeSort('def_rebounds')}>DREB {sortStat === 'def_rebounds' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                        <th className='sort-header' onClick={() => changeSort('fg_made')}>FGM {sortStat === 'fg_made' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                        <th className='sort-header' onClick={() => changeSort('fg_attempted')}>FGA {sortStat === 'fg_attempted' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                        <th className='sort-header' onClick={() => changeSort('fg_percent')}>FG% {sortStat === 'fg_percent' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                        <th className='sort-header' onClick={() => changeSort('threes_made')}>3PM {sortStat === 'threes_made' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                        <th className='sort-header' onClick={() => changeSort('threes_attempted')}>3PA {sortStat === 'threes_attempted' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                        <th className='sort-header' onClick={() => changeSort('threes_percent')}>3P% {sortStat === 'threes_percent' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                        <th className='sort-header' onClick={() => changeSort('ft_made')}>FTM {sortStat === 'ft_made' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                        <th className='sort-header' onClick={() => changeSort('ft_attempted')}>FTA {sortStat === 'ft_attempted' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                        <th className='sort-header' onClick={() => changeSort('ft_percent')}>FT% {sortStat === 'ft_percent' && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedStats.map((player, i) => {
                                        return <tr key={player.player}>
                                            <td>{i + 1}</td>
                                            <td>{player.player}</td>
                                            <td>{player.position}</td>
                                            <td>{player.minutes_played}</td>
                                            <td>{player.points}</td>
                                            <td>{player.assists}</td>
                                            <td>{player.tot_rebounds}</td>
                                            <td>{player.off_rebounds}</td>
                                            <td>{player.def_rebounds}</td>
                                            <td>{player.fg_made}</td>
                                            <td>{player.fg_attempted}</td>
                                            <td>{player.fg_percent ? (parseFloat(player.fg_percent)*100).toFixed(1) : '-'}</td>
                                            <td>{player.threes_made}</td>
                                            <td>{player.threes_attempted}</td>
                                            <td>{player.threes_percent ? (parseFloat(player.threes_percent)*100).toFixed(1) : '-'}</td>
                                            <td>{player.ft_made}</td>
                                            <td>{player.ft_attempted}</td>
                                            <td>{player.ft_percent ? (parseFloat(player.ft_percent)*100).toFixed(1) : '-'}</td>
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

export default NBAStats;