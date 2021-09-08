import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import '../../../css/bootstrap.min.css';
import './nba_stats.css';
import SortableTable from '../../../components/SortableTable';

import filterIcon from'../../../components/resources/filter_icon.svg';

const DEFAULT_PER_PAGE = 25;
const STAT_INDECES = {
    name: 'NAME',
    position: 'POS',
    minutes_played: 'MINS',
    points: 'PTS',
    assists: 'AST',
    tot_rebounds: 'REB',
    off_rebounds: 'OREB',
    def_rebounds: 'DREB',
    fg_made: 'FGM',
    fg_attempted: 'FGA',
    fg_percent: 'FG%',
    threes_made: '3PM',
    threes_attempted: '3PA',
    threes_percent: '3P%',
    ft_made: 'FTM',
    ft_attempted: 'FTA',
    ft_percent: 'FT%'
}

const NBAStats = () => {
    const [ stats, setStats ] = useState(null);
    const [ err, setErr ] = useState(null)
    const [ page, setPage ] = useState(0);
    const [ maxPage, setMaxPage ] = useState(0);
    const [ amount, setAmount ] = useState(DEFAULT_PER_PAGE);

    useEffect(() => {
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
                        setMaxPage(parseInt(res.data.length/DEFAULT_PER_PAGE));
                        console.log(res.data)
                    }
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
    }, []);

    return (
        <div className='stats-content'>
            {!err && !stats && <img id='load' src={`${process.env.PUBLIC_URL}/assets/loading/load_ring.svg`} alt='Fetching data...' />}
            {err && <h2>{err}</h2>}
            {stats && 
                <div className='stats-card'>
                    <h2>2020-21 NBA Season</h2>

                    <div className='stat-table-controls'>
                        <div className='control-amount'>
                            <select style={{ marginRight: 5 }} value={amount} className='form-black form-black-sm' onChange={e => setAmount(parseInt(e.target.value))}>
                                <option value='10'>10</option>
                                <option value='25'>25</option>
                                <option value='50'>50</option>
                                <option value='100'>100</option>
                            </select>
                            per page
                        </div>
                    </div>

                    <SortableTable stats={stats} indeces={STAT_INDECES} amount={amount} defaultSort='points' page={page} setPage={setPage} setMaxPage={setMaxPage} />
                    <div className='stat-navigation' style={{display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Button disabled={page === 0} style={{ width: '20%', marginRight: '5px' }} variant='success' onClick={() => { setPage(0) }}>{'<<'}</Button>
                        <Button disabled={page === 0} style={{ width: '50%' }} variant='success' onClick={() => { setPage(page - 1) }}>Prev</Button>
                        <div style={{ margin: '0px 20px' }}>Page {page + 1}/{maxPage + 1}</div>
                        <Button disabled={page === maxPage} style={{ width: '50%'}} variant='success' onClick={() => { setPage(page + 1) }}>Next</Button>
                        <Button disabled={page === maxPage} style={{ width: '20%', marginLeft: '5px' }} variant='success' onClick={() => { setPage(maxPage) }}>{'>>'}</Button>
                    </div>
                </div>
            }
        </div>
    )
}

export default NBAStats;