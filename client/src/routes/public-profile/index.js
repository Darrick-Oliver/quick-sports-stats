import './index.css';
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from "react-router-dom";
import { Button, Dropdown } from 'react-bootstrap';
import '../../css/bootstrap.min.css';
import NotFound from '../NotFound.js';
import { UserContext } from '../../App.js';
import { Link } from "react-router-dom";
import { NBAteams, MLSteams } from '../../teams';

const Filter = require('bad-words'), filter = new Filter();

const getTeamName = (id, type) => {
    let teams = type === 'nba' ? NBAteams : MLSteams;

    for (let i = 0; i < teams.length; i += 1) {
        if (teams[i].id === id) {
            return teams[i].team;
        }
    }

    return 'None';
}

const getImage = (id, type) => {
    return `${process.env.PUBLIC_URL}/assets/images/${type}_logos/${id}.svg`;
}

const PublicProfile = () => {
    const { userId } = useParams();
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState(false);
    const [edit, setEdit] = useState(false);
    const myUser = JSON.parse(useContext(UserContext).user);
    const [nbaId, setNbaId] = useState(null);
    const [mlsId, setMlsId] = useState(null);
    const setUser = useContext(UserContext).setUser;

    // Set title
    useEffect(() => {
        document.title = `${userId}'s profile`;
        setError(false);
    }, [userId]);

    // Fetch user's comments
    useEffect(() => {
        fetch(`/api/user/${userId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.status !== 'ok')
                    setError(true);
                else {
                    if (data.comments) {
                        data.comments = data.comments.sort((a, b) => {
                            return new Date(b.date).getTime() - new Date(a.date).getTime();
                        });
                    }

                    setUserInfo(data);
                }
            })
            .catch(err => {
                console.error("Error fetching data:", err);
            });
    }, [userId]);

    // Change team selected
    const changeTeam = (team, selected, id) => {
        document.getElementById(`${selected}-dropdown-text`).innerHTML = team;
        if (selected === 'mls')
            setMlsId(id);
        else if (selected === 'nba')
            setNbaId(id);
    }

    // Submit selected teams
    const submit = async () => {
        const result = await fetch(`/api/user/${userId}/set-teams`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mlsId,
                nbaId
            })
        }).then((res) => res.json());

        if (result.status === 'ok') {
            // Set new favorite teams
            myUser.favNBA = nbaId;
            myUser.favMLS = mlsId;
            setUser(JSON.stringify(myUser));

            // Set userinfo
            if (userInfo) {
                userInfo.user.favMLS = mlsId;
                userInfo.user.favNBA = nbaId;
                setUserInfo(userInfo);
            }

            // Close edit profile box
            setEdit(false);
            return;
        } else {
            console.error(result.error);
        }
    }

    return (
        <div className='profile'>
            {error && <NotFound style={{ marginTop: '-155px' }} />}
            {!error && userInfo &&
                <div>
                    <h2>
                        {userInfo.user.username}
                        {userInfo.user.favMLS !== 'none' && <img style={{marginLeft: 10}} src={getImage(userInfo.user.favMLS, 'mls')} alt={getTeamName(userInfo.user.favMLS, 'mls')} height='50'></img>}
                        {userInfo.user.favNBA !== 'none' && <img style={{marginLeft: 10}} src={getImage(userInfo.user.favNBA, 'nba')} alt={getTeamName(userInfo.user.favNBA, 'nba')} height='50'></img>}
                    </h2>

                    {myUser && userInfo.user.username === myUser.username && <Button onClick={() => setEdit(!edit)}>{edit ? 'Cancel' : 'Edit profile'}</Button>}
                    {myUser && userInfo.user.username === myUser.username && edit && 
                        <div className='edit-profile-container'>
                            <span className='edit-text'>Favorite NBA team:</span>
                            <Dropdown>
                                <Dropdown.Toggle variant='primary' id='nba-dropdown-text'>
                                    {nbaId ? getTeamName(nbaId, 'nba') : 'None'}
                                </Dropdown.Toggle>

                                <Dropdown.Menu className='edit-dropdown'>
                                    <Dropdown.Item onClick={() => changeTeam('None', 'nba', 'none')}><span style={{height: 3.3, lineHeight: 3.3, marginLeft: 52}}>None</span></Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Atlanta Hawks', 'nba', '1610612737')}><img src={getImage(1610612737, 'nba')} alt='Atlanta Hawks' height='50'></img> Atlanta Hawks</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Boston Celtics', 'nba', '1610612738')}><img src={getImage(1610612738, 'nba')} alt='Boston Celtics' height='50'></img> Boston Celtics</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Brooklyn Nets', 'nba', '1610612751')}><img src={getImage(1610612751, 'nba')} alt='Brooklyn Nets' height='50'></img> Brooklyn Nets</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Charlotte Hornets', 'nba', '1610612766')}><img src={getImage(1610612766, 'nba')} alt='Charlotte Hornets' height='50'></img> Charlotte Hornets</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Chicago Bulls', 'nba', '1610612741')}><img src={getImage(1610612741, 'nba')} alt='Chicago Bulls' height='50'></img> Chicago Bulls</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Cleveland Cavaliers', 'nba', '1610612739')}><img src={getImage(1610612739, 'nba')} alt='Cleveland Cavaliers' height='50'></img> Cleveland Cavaliers</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Dallas Mavericks', 'nba', '1610612742')}><img src={getImage(1610612742, 'nba')} alt='Dallas Mavericks' height='50'></img> Dallas Mavericks</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Denver Nuggets', 'nba', '1610612743')}><img src={getImage(1610612743, 'nba')} alt='Denver Nuggets' height='50'></img> Denver Nuggets</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Detroit Pistons', 'nba', '1610612765')}><img src={getImage(1610612765, 'nba')} alt='Detroit Pistons' height='50'></img> Detroit Pistons</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Golden State Warriors', 'nba', '1610612744')}><img src={getImage(1610612744, 'nba')} alt='Golden State Warriors' height='50'></img> Golden State Warriors</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Houston Rockets', 'nba', '1610612745')}><img src={getImage(1610612745, 'nba')} alt='Houston Rockets' height='50'></img> Houston Rockets</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Indiana Pacers', 'nba', '1610612754')}><img src={getImage(1610612754, 'nba')} alt='Indiana Pacers' height='50'></img> Indiana Pacers</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Los Angeles Clippers', 'nba', '1610612746')}><img src={getImage(1610612746, 'nba')} alt='Los Angeles Clippers' height='50'></img> Los Angeles Clippers</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Los Angeles Lakers', 'nba', '1610612747')}><img src={getImage(1610612747, 'nba')} alt='Los Angeles Lakers' height='50'></img> Los Angeles Lakers</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Memphis Grizzlies', 'nba', '1610612763')}><img src={getImage(1610612763, 'nba')} alt='Memphis Grizzlies' height='50'></img> Memphis Grizzlies</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Miami Heat', 'nba', '1610612748')}><img src={getImage(1610612748, 'nba')} alt='Miami Heat' height='50'></img> Miami Heat</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Milwaukee Bucks', 'nba', '1610612749')}><img src={getImage(1610612749, 'nba')} alt='Milwaukee Bucks' height='50'></img> Milwaukee Bucks</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Minnesota Timberwolves', 'nba', '1610612750')}><img src={getImage(1610612750, 'nba')} alt='Minnesota Timberwolves' height='50'></img> Minnesota Timberwolves</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('New Orleans Pelicans', 'nba', '1610612740')}><img src={getImage(1610612740, 'nba')} alt='New Orleans Pelicans' height='50'></img> New Orleans Pelicans</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('New York Knicks', 'nba', '1610612752')}><img src={getImage(1610612752, 'nba')} alt='New York Knicks' height='50'></img> New York Knicks</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Oklahoma City Thunder', 'nba', '1610612760')}><img src={getImage(1610612760, 'nba')} alt='Oklahoma City Thunder' height='50'></img> Oklahoma City Thunder</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Orlando Magic', 'nba', '1610612753')}><img src={getImage(1610612753, 'nba')} alt='Orlando Magic' height='50'></img> Orlando Magic</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Philadelphia 76ers', 'nba', '1610612755')}><img src={getImage(1610612755, 'nba')} alt='Philadelphia 76ers' height='50'></img> Philadelphia 76ers</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Phoenix Suns', 'nba', '1610612756')}><img src={getImage(1610612756, 'nba')} alt='Phoenix Suns' height='50'></img> Phoenix Suns</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Portland Trailblazers', 'nba', '1610612757')}><img src={getImage(1610612757, 'nba')} alt='Portland Trailblazers' height='50'></img> Portland Trailblazers</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Sacramento Kings', 'nba', '1610612758')}><img src={getImage(1610612758, 'nba')} alt='Sacramento Kings' height='50'></img> Sacramento Kings</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('San Antonio Spurs', 'nba', '1610612759')}><img src={getImage(1610612759, 'nba')} alt='San Antonio Spurs' height='50'></img> San Antonio Spurs</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Toronto Raptors', 'nba', '1610612761')}><img src={getImage(1610612761, 'nba')} alt='Toronto Raptors' height='50'></img> Toronto Raptors</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Utah Jazz', 'nba', '1610612762')}><img src={getImage(1610612762, 'nba')} alt='Utah Jazz' height='50'></img> Utah Jazz</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Washington Wizards', 'nba', '1610612764')}><img src={getImage(1610612764, 'nba')} alt='Washington Wizards' height='50'></img> Washington Wizards</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            
                            <br />
                            <span className='edit-text'>Favorite MLS team:</span>
                            <Dropdown style={{ marginTop: 10 }}>
                                <Dropdown.Toggle variant='primary' id='mls-dropdown-text'>
                                    {mlsId ? getTeamName(mlsId, 'mls') : 'None'}
                                </Dropdown.Toggle>

                                <Dropdown.Menu className='edit-dropdown'>
                                    <Dropdown.Item onClick={() => changeTeam('None', 'mls', 'none')}><span style={{height: 3.3, lineHeight: 3.3, marginLeft: 52}}>None</span></Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Atlanta United FC', 'mls', 'ATL')}><img src={getImage('ATL', 'mls')} alt='Atlanta United FC' height='50'></img> Atlanta United FC</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Austin FC', 'mls', 'ATX')}><img src={getImage('ATX', 'mls')} alt='Austin FC' height='50'></img> Austin FC</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('CF Montréal', 'mls', 'MTL')}><img src={getImage('MTL', 'mls')} alt='CF Montréal' height='50'></img> CF Montréal</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Charlotte FC', 'mls', 'CLT')}><img src={getImage('CLT', 'mls')} alt='Charlotte FC' height='50'></img> Charlotte FC</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Chicago Fire FC', 'mls', 'CHI')}><img src={getImage('CHI', 'mls')} alt='Chicago Fire FC' height='50'></img> Chicago Fire FC</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Colorado Rapids', 'mls', 'COL')}><img src={getImage('COL', 'mls')} alt='Colorado Rapids' height='50'></img> Colorado Rapids</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Columbus Crew SC', 'mls', 'CLB')}><img src={getImage('CLB', 'mls')} alt='Columbus Crew SC' height='50'></img> Columbus Crew SC</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('D.C. United', 'mls', 'DC')}><img src={getImage('DC', 'mls')} alt='D.C. United' height='50'></img> D.C. United</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('FC Cincinnati', 'mls', 'CIN')}><img src={getImage('CIN', 'mls')} alt='FC Cincinnati' height='50'></img> FC Cincinnati</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('FC Dallas', 'mls', 'DAL')}><img src={getImage('DAL', 'mls')} alt='FC Dallas' height='50'></img> FC Dallas</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Houston Dynamo', 'mls', 'HOU')}><img src={getImage('HOU', 'mls')} alt='Houston Dynamo' height='50'></img> Houston Dynamo</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Inter Miami CF', 'mls', 'MIA')}><img src={getImage('MIA', 'mls')} alt='Inter Miami CF' height='50'></img> Inter Miami CF</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('LA Galaxy', 'mls', 'LA')}><img src={getImage('LA', 'mls')} alt='LA Galaxy' height='50'></img> LA Galaxy</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Los Angeles FC', 'mls', 'LAFC')}><img src={getImage('LAFC', 'mls')} alt='Los Angeles FC' height='50'></img> Los Angeles FC</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Minnesota United FC', 'mls', 'MIN')}><img src={getImage('MIN', 'mls')} alt='Minnesota United FC' height='50'></img> Minnesota United FC</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Nashville SC', 'mls', 'NSH')}><img src={getImage('NSH', 'mls')} alt='Nashville SC' height='50'></img> Nashville SC</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('New England Revolution', 'mls', 'NE')}><img src={getImage('NE', 'mls')} alt='New England Revolution' height='50'></img> New England Revolution</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('New York City FC', 'mls', 'NYC')}><img src={getImage('NYC', 'mls')} alt='New York City FC' height='50'></img> New York City FC</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('New York Red Bulls', 'mls', 'RBNY')}><img src={getImage('RBNY', 'mls')} alt='New York Red Bulls' height='50'></img> New York Red Bulls</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Orlando City SC', 'mls', 'ORL')}><img src={getImage('ORL', 'mls')} alt='Orlando City SC' height='50'></img> Orlando City SC</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Philadelphia Union', 'mls', 'PHI')}><img src={getImage('PHI', 'mls')} alt='Philadelphia Union' height='50'></img> Philadelphia Union</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Portland Timbers', 'mls', 'POR')}><img src={getImage('POR', 'mls')} alt='Portland Timbers' height='50'></img> Portland Timbers</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Real Salt Lake', 'mls', 'RSL')}><img src={getImage('RSL', 'mls')} alt='Real Salt Lake' height='50'></img> Real Salt Lake</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('San Jose Earthquakes', 'mls', 'SJ')}><img src={getImage('SJ', 'mls')} alt='San Jose Earthquakes' height='50'></img> San Jose Earthquakes</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Seattle Sounders FC', 'mls', 'SEA')}><img src={getImage('SEA', 'mls')} alt='Seattle Sounders FC' height='50'></img> Seattle Sounders FC</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Sporting Kansas City', 'mls', 'SKC')}><img src={getImage('SKC', 'mls')} alt='Sporting Kansas City' height='50'></img> Sporting Kansas City</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('St. Louis City SC', 'mls', 'STL')}><img src={getImage('STL', 'mls')} alt='St. Louis City SC' height='50'></img> St. Louis City SC</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Toronto FC', 'mls', 'TOR')}><img src={getImage('TOR', 'mls')} alt='Toronto FC' height='50'></img> Toronto FC</Dropdown.Item>
                                    <Dropdown.Item onClick={() => changeTeam('Vancouver Whitecaps FC', 'mls', 'VAN')}><img src={getImage('VAN', 'mls')} alt='Vancouver Whitecaps FC' height='50'></img> Vancouver Whitecaps FC</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>

                            <br />
                            <Button style={{ marginTop: 10 }} onClick={() => submit()}>Submit</Button>
                        </div>
                    }

                    {userInfo.comments && userInfo.comments.map(comment => {
                        return (
                            comment &&
                            <div className='user-comment' key={comment._id}>
                                <p className='tagline'>
                                    <Link className='username' to={`/user/${comment.username}`}>{comment.username}</Link>
                                    {' • '}
                                    <span className='date'>
                                        {new Date(comment.date).toLocaleDateString() + ' '}
                                        {new Date(comment.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
                                    </span>
                                    {comment.edited && comment.editDate && 
                                        <span className='edit-date'>
                                            {'(last edited: '}
                                            {new Date(comment.editDate).toLocaleDateString() + ' '}
                                            {new Date(comment.editDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
                                            {')'}
                                        </span>
                                    }
                                </p>
                                <div>
                                <span id={`${comment._id}-content`} className='content'>
                                    {comment.parentId !== 'root' && <Link className='user-link' to={`/user/${comment.parentUser}`}>@{comment.parentUser}</Link>}
                                    {comment.parentId !== 'root' && ' '}
                                    {filter.clean(comment.content)}
                                </span>
                                </div>
                            </div>
                        );
                    })}
                    {!userInfo.comments && <h3>No comments</h3>}
                </div>
            }
        </div>
    );
}

export default PublicProfile;