import React, {Component} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter as Router, Route, Link} from "react-router-dom";
import AuthorizationCodePage from './components/authorization-code.component';
import ClientCredentialsPage from './components/client-credentials.component';
import HomePage from "./components/home.component";
import logo from './images/tyk-logo.png'

class App extends Component {
    render() {
        return (
            <Router>
                <div className="container">
                    <nav className="navbar navbar-expand-lg navbar-light bg-light">
                        <a className="navbar-brand" href="https://tyk.io" target="_blank">
                            <img src={logo} width="50" alt="Tyk Technologies Ltd Logo"/>
                        </a>
                        <Link to="/" className="navbar-brand">OAuth2 OIDC Playground</Link>
                        <div className="collpase navbar-collapse">
                            {/*<ul className="navbar-nav mr-auto">*/}
                            {/*    <li className="navbar-item">*/}
                            {/*        <Link to="/" className="nav-link">Todos</Link>*/}
                            {/*    </li>*/}
                            {/*    <li className="navbar-item">*/}
                            {/*        <Link to="/create" className="nav-link">Create Todo</Link>*/}
                            {/*    </li>*/}
                            {/*</ul>*/}
                        </div>
                    </nav>
                    <br/>
                    <Route path="/" exact component={HomePage}/>
                    <Route path="/client-credentials" component={ClientCredentialsPage}/>
                    <Route path="/authorization-code" component={AuthorizationCodePage}/>

                    <footer className="pt-4 my-md-5 pt-md-5 border-top">
                    </footer>
                </div>
            </Router>

        )
    }
}

export default App;
