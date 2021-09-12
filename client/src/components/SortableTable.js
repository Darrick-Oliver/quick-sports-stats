import React, { useState, useEffect } from 'react';
import './SortableTable.css';

import descendingIcon from './resources/arrow_drop_down.svg';
import ascendingIcon from'./resources/arrow_drop_up.svg';

// Checks if string is numeric
const isNumeric = (str) => {
    if (typeof str != "string")
        return false;
    return !isNaN(str) && !isNaN(parseFloat(str));
}

const TextBoxes = (props) => {
    const { length, filter, setFilter } = props;

    const registerInput = (index) => {
        const input = document.getElementById(`input-${index}`).value;
        let newFilter = filter;
        newFilter[index] = input;
        setFilter([...newFilter]);
    }
    
    // Create array to map over
    let count = [];
    for (let i = 0; i < length; i += 1)
        count.push(i);

    return (
        <tr>
            {count.map((val, i) => {
                let styles = { width: '100%' };
                if (i === 0) styles = { width: '100%', minWidth: 110 }

                return (
                    <th key={`input-${i}`}>
                        <input style={styles} className='sortable-th-input' id={`input-${i}`} type='text' onChange={() => {registerInput(i)}} />
                    </th>
                )
            })}
        </tr>
    );
}

const SortableTable = (props) => {
    let { stats, indeces, amount, defaultSort, page, setPage, setMaxPage } = props;
    const [ filteredStats, setFilteredStats ] = useState(stats);
    const [ sortedStats, setSortedStats ] = useState(stats.slice(0, amount));
    const [ sortStat, setSortStat ] = useState(defaultSort);
    const [ filter, setFilter ] = useState(new Array(Object.keys(indeces).length).fill(null));
    const [ dir, setDir ] = useState('descending');

    // Sorts stats
    useEffect(() => {
        if (filteredStats) {
            filteredStats.sort((a, b) => {
                if (!a[sortStat] && !b[sortStat])
                    return 0;
                else if (!a[sortStat])
                    return dir === 'descending' ? 1 : -1;
                else if (!b[sortStat])
                    return dir === 'descending' ? -1 : 1;
                
                const aStat = a[sortStat].replace(/,/g, '');
                const bStat = b[sortStat].replace(/,/g, '');
                if (isNumeric(aStat) && isNumeric(bStat))
                    return dir === 'descending' ? parseFloat(bStat) - parseFloat(aStat) : parseFloat(aStat) - parseFloat(bStat);
                else
                    return dir === 'descending' ? b[sortStat].localeCompare(a[sortStat]) : a[sortStat].localeCompare(b[sortStat]);
            });
            setSortedStats(filteredStats.slice(page * amount, page * amount + amount));
        }
    }, [sortStat, dir, amount, filteredStats, page]);

    useEffect(() => {
        if (filter) {
            let newStats = stats;
            for (let i = 0; i < filter.length; i += 1) {
                if (filter[i]) {
                    if (filter[i].charAt(0) === '>') {
                        if (filter[i].length > 1 && isNumeric(filter[i].substring(1)))
                            newStats = newStats.filter(player => player[Object.keys(indeces)[i]] > parseFloat(filter[i].substring(1)));
                    } else if (filter[i].charAt(0) === '<') {
                        if (filter[i].length > 1 && isNumeric(filter[i].substring(1)))
                            newStats = newStats.filter(player => player[Object.keys(indeces)[i]] < parseFloat(filter[i].substring(1)));
                    } else {
                        newStats = newStats.filter(player => player[Object.keys(indeces)[i]].toLowerCase().includes(filter[i].toLowerCase()));
                    }
                }
            }
            setFilteredStats(newStats);

            // Handle pages
            if (setMaxPage)
                setMaxPage(Math.ceil(newStats.length/amount) - 1);
            if (page > parseInt(newStats.length/amount) && setPage)
                setPage(parseInt(newStats.length/amount));
        }
    }, [amount, filter, indeces, page, setMaxPage, setPage, stats]);

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
        <div className='stats-container'>
            <table className='stats-box'>
                <thead>
                    <tr>
                        {Object.keys(indeces).map((key, i) => {
                            return <th key={`th-key-${key}`} className='sort-header' onClick={() => changeSort(key)}>{indeces[key]} {sortStat === key && <img src={dir === 'ascending' ? ascendingIcon : descendingIcon} height='15' alt='sort' />}</th>
                        })}
                    </tr>
                    <TextBoxes length={Object.keys(indeces).length} filter={filter} setFilter={setFilter} />
                </thead>
                <tbody>
                    {sortedStats.map((player, i) => {
                        return (
                            <tr key={`tr-index-${i}`}>
                                {Object.keys(indeces).map((key) => {
                                    return <td key={`tr-${i}-key-${key}`}>{player[key] ? player[key] : '-'}</td>
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    )
};

export default SortableTable;