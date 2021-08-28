import './footer.css';
import React from 'react';
import githubLogo from './images/GitHub-Mark-Light-32px.png';
import linkedinLogo from './images/LI-In-Bug.png';

const Footer = () => {
    return (
        <div className='footer'>
            <span>2021 Darrick Oliver</span>
            <a href='https://github.com/Darrick-Oliver' target='_blank' rel='noreferrer'><img style={{ marginLeft: 10, height: 32 }} src={githubLogo} alt='GitHub' /></a>
            <a href='https://www.linkedin.com/in/darrickoliver/' target='_blank' rel='noreferrer'><img className='footer-logo' src={linkedinLogo} alt='GitHub' /></a>
        </div>
    )
}

export default Footer;