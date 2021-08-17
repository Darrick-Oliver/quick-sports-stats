import './index.css';
import React, { useEffect, useContext } from 'react';
import { UserContext } from '../../App.js';

const getImage = (name) => {
    return `${process.env.PUBLIC_URL}/assets/images/nba_logos/${name}.svg`;
}

const changeTeam = (team) => {
    document.getElementById('drop').innerHTML = team;
}

const Profile = () => {
    const myUser = JSON.parse(useContext(UserContext).user);

    // Set title
    useEffect(() => {
        document.title = 'My profile';
    }, []);

    return (
        <div className='edit-profile'>
            {myUser && myUser.username ? `Welcome back, ${myUser.username}` : 'You must be logged in to access this page'}
            {myUser && myUser.username &&
                <div className='edit-profile-container'>
                    <span className='edit-text'>Favorite NBA team:</span>

                    <div className="dropdown">
                        <p id='drop' className='drop-value'>Favorite Team</p>
                        <div className="dropdown-content">
                            <p onClick={() => changeTeam('None')} style={{ height: 50, textAlign: 'center', top: '50%', bottom: '50%' }}>None</p>
                            <p onClick={() => changeTeam('Atlanta Hawks')}><img src={getImage(1610612737)} alt='Atlanta Hawks' height='50'></img> Atlanta Hawks</p>
                            <p onClick={() => changeTeam('Boston Celtics')}><img src={getImage(1610612738)} alt='Boston Celtics' height='50'></img> Boston Celtics</p>
                            <p onClick={() => changeTeam('Brooklyn Nets')}><img src={getImage(1610612751)} alt='Brooklyn Nets' height='50'></img> Brooklyn Nets</p>
                            <p onClick={() => changeTeam('Charlotte Hornets')}><img src={getImage(1610612766)} alt='Charlotte Hornets' height='50'></img> Charlotte Hornets</p>
                            <p onClick={() => changeTeam('Chicago Bulls')}><img src={getImage(1610612741)} alt='Chicago Bulls' height='50'></img> Chicago Bulls</p>
                            <p onClick={() => changeTeam('Cleveland Cavaliers')}><img src={getImage(1610612739)} alt='Cleveland Cavaliers' height='50'></img> Cleveland Cavaliers</p>
                            <p onClick={() => changeTeam('Dallas Mavericks')}><img src={getImage(1610612742)} alt='Dallas Mavericks' height='50'></img> Dallas Mavericks</p>
                            <p onClick={() => changeTeam('Denver Nuggets')}><img src={getImage(1610612743)} alt='Denver Nuggets' height='50'></img> Denver Nuggets</p>
                            <p onClick={() => changeTeam('Detroit Pistons')}><img src={getImage(1610612765)} alt='Detroit Pistons' height='50'></img> Detroit Pistons</p>
                            <p onClick={() => changeTeam('Golden State Warriors')}><img src={getImage(1610612744)} alt='Golden State Warriors' height='50'></img> Golden State Warriors</p>
                            <p onClick={() => changeTeam('Houston Rockets')}><img src={getImage(1610612745)} alt='Houston Rockets' height='50'></img> Houston Rockets</p>
                            <p onClick={() => changeTeam('Indiana Pacers')}><img src={getImage(1610612754)} alt='Indiana Pacers' height='50'></img> Indiana Pacers</p>
                            <p onClick={() => changeTeam('Los Angeles Clippers')}><img src={getImage(1610612746)} alt='Los Angeles Clippers' height='50'></img> Los Angeles Clippers</p>
                            <p onClick={() => changeTeam('Los Angeles Lakers')}><img src={getImage(1610612747)} alt='Los Angeles Lakers' height='50'></img> Los Angeles Lakers</p>
                            <p onClick={() => changeTeam('Memphis Grizzlies')}><img src={getImage(1610612763)} alt='Memphis Grizzlies' height='50'></img> Memphis Grizzlies</p>
                            <p onClick={() => changeTeam('Miami Heat')}><img src={getImage(1610612748)} alt='Miami Heat' height='50'></img> Miami Heat</p>
                            <p onClick={() => changeTeam('Milwaukee Bucks')}><img src={getImage(1610612749)} alt='Milwaukee Bucks' height='50'></img> Milwaukee Bucks</p>
                            <p onClick={() => changeTeam('Minnesota Timberwolves')}><img src={getImage(1610612750)} alt='Minnesota Timberwolves' height='50'></img> Minnesota Timberwolves</p>
                            <p onClick={() => changeTeam('New Orleans Pelicans')}><img src={getImage(1610612740)} alt='New Orleans Pelicans' height='50'></img> New Orleans Pelicans</p>
                            <p onClick={() => changeTeam('New York Knicks')}><img src={getImage(1610612752)} alt='New York Knicks' height='50'></img> New York Knicks</p>
                            <p onClick={() => changeTeam('Oklahoma City Thunder')}><img src={getImage(1610612760)} alt='Oklahoma City Thunder' height='50'></img> Oklahoma City Thunder</p>
                            <p onClick={() => changeTeam('Orlando Magic')}><img src={getImage(1610612753)} alt='Orlando Magic' height='50'></img> Orlando Magic</p>
                            <p onClick={() => changeTeam('Philadelphia 76ers')}><img src={getImage(1610612755)} alt='Philadelphia 76ers' height='50'></img> Philadelphia 76ers</p>
                            <p onClick={() => changeTeam('Phoenix Suns')}><img src={getImage(1610612756)} alt='Phoenix Suns' height='50'></img> Phoenix Suns</p>
                            <p onClick={() => changeTeam('Portland Trailblazers')}><img src={getImage(1610612757)} alt='Portland Trailblazers' height='50'></img> Portland Trailblazers</p>
                            <p onClick={() => changeTeam('Sacramento Kings')}><img src={getImage(1610612758)} alt='Sacramento Kings' height='50'></img> Sacramento Kings</p>
                            <p onClick={() => changeTeam('San Antonio Spurs')}><img src={getImage(1610612759)} alt='San Antonio Spurs' height='50'></img> San Antonio Spurs</p>
                            <p onClick={() => changeTeam('Toronto Raptors')}><img src={getImage(1610612761)} alt='Toronto Raptors' height='50'></img> Toronto Raptors</p>
                            <p onClick={() => changeTeam('Utah Jazz')}><img src={getImage(1610612762)} alt='Utah Jazz' height='50'></img> Utah Jazz</p>
                            <p onClick={() => changeTeam('Washington Wizards')}><img src={getImage(1610612764)} alt='Washington Wizards' height='50'></img> Washington Wizards</p>
                        </div>
                    </div>

                    <br />
                    <input type='submit' />
                </div>
            }
        </div>
    );
}

export default Profile;