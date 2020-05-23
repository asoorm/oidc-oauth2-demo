import React, {Component} from 'react';
import {Link} from "react-router-dom";

export default class Home extends Component {
  render() {
    return (
      <div>
        <div className="container">
          <div className="card-deck mb-3 text-center">
            <div className="card mb-4 box-shadow">
              <div className="card-header">
                <h4 className="my-0 font-weight-normal">Server - Server</h4>
              </div>
              <div className="card-body d-flex flex-column">
                <p>The client is also the resource owner<br/>
                  as such, it is not necessary to authorize an end-user
                  & the client can securely store
                  the <code>client_id</code> and <code>client_secret</code></p>
                <Link to="/client-credentials" className="btn btn-lg btn-block btn-outline-primary mt-auto">Client
                  Credentials</Link>
              </div>
            </div>
            <div className="card mb-4 box-shadow">
              <div className="card-header">
                <h4 className="my-0 font-weight-normal">Traditional Web App</h4>
              </div>
              <div className="card-body d-flex flex-column">
                <p>A traditional server-side client application, such as Go, NodeJS, PHP, Python,
                  .NET
                  &amp; Java can securely store a <code>client_secret</code>. It also needs to
                  authorize an end-user.</p>
                <Link to="/authorization-code" className="btn btn-lg btn-block btn-outline-primary mt-auto">Authorization
                  Code</Link>
              </div>
            </div>
            <div className="card mb-4 box-shadow">
              <div className="card-header">
                <h4 className="my-0 font-weight-normal">Native / SPA</h4>
              </div>
              <div className="card-body d-flex flex-column">
                <p>These clients cannot securely store a <code>client_secret</code>. As such, it
                  only needs the <code>client_id</code>. We introduce the concept of
                  a <code>code_verifier</code> and <code>code_challenge</code> known as Proof Key
                  for
                  Code Exchange</p>
                <Link to="/authorization-code-pkce"
                      className="btn btn-lg btn-block btn-outline-primary mt-auto">Client Credentials</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
