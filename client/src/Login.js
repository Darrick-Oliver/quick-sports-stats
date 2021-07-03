import './Login.css';
import React, { useState } from 'react';
import {Button} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-modal';

const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const clearErr = (id, err) => {
    if (document.getElementById(id).classList.contains('form-input-error')) {
        document.getElementById(id).classList.remove('form-input-error');
        document.getElementById(err).innerHTML = "";
    }
}

Modal.setAppElement('#root');
const Login = () => {
    const [regPopup, setRP] = useState(false);
    const [logPopup, setLP] = useState(false);
    const [user, setUser] = useState(null);
    const [login, setLogin] = useState(false);

    // Register account
    const regAttempt = async (event) => {
        event.preventDefault();
        let user = document.getElementById("reg-user");
        let em = document.getElementById("reg-email");
        let pwd = document.getElementById("reg-pass");
        const pass_conf = document.getElementById("reg-pass-confirm");
        let err = 0;

        if (pwd.value !== pass_conf.value) {
            pwd.classList.add('form-input-error');
            pass_conf.classList.add('form-input-error');
            document.getElementById("reg-pass-err").innerHTML = "The two password fields do not match";
            err += 1;
        } else {
            if (pwd.classList.contains('form-input-error')) {
                pwd.classList.remove('form-input-error');
                document.getElementById("reg-pass-err").innerHTML = "";
            }
            if (pass_conf.classList.contains('form-input-error'))
                pass_conf.classList.remove('form-input-error');
        }
        if (!validateEmail(em.value)) {
            err += 1;
            em.classList.add('form-input-error');
            document.getElementById("reg-email-err").innerHTML = "Invalid email";
        } else {
            if (em.classList.contains('form-input-error')) {
                em.classList.remove('form-input-error');
                document.getElementById("reg-email-err").innerHTML = "";
            }
        }
        if (err) {
            return;
        }
        const username = user.value;
        const email = em.value;
        const pass = pwd.value;
        
        // Send data as JSON
        const result = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                pass
            })
        }).then((res) => res.json());

        // Check status
        if (result.status === 'ok') {
            // Show login screen
            setLP(true);
            document.getElementById("login-announce").innerHTML = "Account creation successful, please re-enter your login info";
            document.getElementById("login-announce").classList.add('form-message-success');

            // Close register
            setRP(false);
        } else {
            switch(result.type) {
                case 'username':
                    document.getElementById("reg-user-err").innerHTML = result.error;
                    user.classList.add('form-input-error');
                    break;
                case 'email':
                    document.getElementById("reg-email-err").innerHTML = result.error;
                    em.classList.add('form-input-error');
                    break;
                case 'password':
                    document.getElementById("reg-pass-err").innerHTML = result.error;
                    pwd.classList.add('form-input-error');
                    pass_conf.classList.add('form-input-error');
                    break;
                default:
                    console.log(result.error);
            }
        }
        
        return;
    }

    // Log in to account
    const loginAttempt = async (event) => {
        event.preventDefault();
        const user = document.getElementById("login-user");
        const pass = document.getElementById("login-pass");
    
        let username = user.value;
        const password = pass.value;
        let email = null;
    
        // Clear errors
        if (user.classList.contains('form-input-error')) {
            user.classList.remove('form-input-error');
            document.getElementById("login-user-err").innerHTML = "";
        }
        if (pass.classList.contains('form-input-error')) {
            pass.classList.remove('form-input-error');
            document.getElementById("login-pass-err").innerHTML = "";
        }
    
        if (validateEmail(username)) {
            // Given an email
            email = username;
            username = null;
        }
    
        // Send data as JSON
        const result = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        }).then((res) => res.json());
    
        if (result.status === 'ok') {
            setLP(false);
        } else {
            document.getElementById("login-user-err").innerHTML = result.error;
            user.classList.add('form-input-error');
            pass.classList.add('form-input-error');
        }
        setLogin(false);
        
        return;
    }

    // Log out of account
    const logOut = async () => {
        const result = await fetch('/api/logout', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res) => res.json());
        if (result.status !== 'ok') {
            console.log(result);
        }
        setLogin(false);
        setUser(null);
        return;
    }

    // Fetch username
    if (!login) {
        setLogin(true);
        fetch('/api/me')
            .then((res) => res.json())
            .then((data) => {
                if (data.status === 'ok') {
                    setUser(data.user);
                }
            })
            .catch(err => {
                console.error("Error fetching data:", err);
            });
    }
    
    return (
        <div>
                <span className='header-login'>
                    {user ? `Logged in as ${user}` : <Button variant='link' style={{color: "white"}} onClick={() => setLP(!logPopup)} title='Log in'>Log in</Button> }
                    {user ? <Button variant='link' style={{color: "white"}} onClick={() => logOut()} title='Log out'>Log out</Button> : <Button variant='success' onClick={() => setRP(!regPopup)} title='Sign Up'>Sign up</Button>}
                </span>
            <Modal
                className='rcontainer'
                overlayClassName='rcontainer-overlay'
                isOpen={regPopup}
                onRequestClose={() => setRP(false)}
            >
                <form className='form' id='register' onSubmit={regAttempt}>
                    <h1 className='form-title'>Register</h1>
                    <div className='form-message form-message-error'></div>
                    <div className='form-input-group'>
                        <input id='reg-user' type='text' className='form-input' onInput={() => clearErr('reg-user', 'reg-user-err')} autoFocus placeholder='Username' />
                        <div id='reg-user-err' className='form-input-error-message'></div>
                    </div>
                    <div className='form-input-group'>
                        <input id='reg-email' type='text' className='form-input' onInput={() => clearErr('reg-email', 'reg-email-err')} placeholder='Email' />
                        <div id='reg-email-err' className='form-input-error-message'></div>
                    </div>
                    <div className='form-input-group'>
                        <input id='reg-pass' type='password' className='form-input' onInput={() => clearErr('reg-pass', 'reg-pass-err')} placeholder='Password' />
                        <div className='form-input-error-message'></div>
                    </div>
                    <div className='form-input-group'>
                        <input id='reg-pass-confirm' type='password' className='form-input' onInput={() => clearErr('reg-pass-confirm', 'reg-pass-err')} placeholder='Confirm password' />
                        <div id='reg-pass-err' className='form-input-error-message'></div>
                    </div>
                    <Button type='submit' className='form-button'>Continue</Button>
                </form>
            </Modal>
            <Modal
                className='lcontainer'
                overlayClassName='lcontainer-overlay'
                isOpen={logPopup}
                onRequestClose={() => setLP(false)}
            >
                <form className='form' id='login' onSubmit={loginAttempt}>
                    <h1 className='form-title'>Log in</h1>
                    <div id='login-announce' className='form-message'></div>
                    <div className='form-input-group'>
                        <input id='login-user' type='text' className='form-input' onInput={() => {clearErr('login-pass', 'login-pass-err'); clearErr('login-user', 'login-user-err')}} autoFocus placeholder='Username or email' />
                        <div id='login-user-err' className='form-input-error-message'></div>
                    </div>
                    <div className='form-input-group'>
                        <input id='login-pass' type='password' className='form-input' onInput={() => {clearErr('login-pass', 'login-pass-err'); clearErr('login-user', 'login-user-err')} } placeholder='Password' />
                        <div id='login-pass-err' className='form-input-error-message'></div>
                    </div>
                    <Button type='submit' className='form-button'>Continue</Button>

                    <p className='form-text'>
                        <a href='/' className='form-link'>Forgot your password?</a>
                    </p>
                </form>
            </Modal>
        </div>
    );
}

export default Login;