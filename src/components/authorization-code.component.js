import React, {Component} from 'react';
import SyntaxHighlighter from './examples/syntax-highlighter.component';
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";

export default class AuthorizationCodeComponent extends Component {

  constructor(props) {
    super(props);

    this.onChangeWellKnown = this.onChangeWellKnown.bind(this);
    this.onSubmitWellKnown = this.onSubmitWellKnown.bind(this);

    this.onChangeClientID = this.onChangeClientID.bind(this);
    this.onChangeScope = this.onChangeScope.bind(this);
    this.onChangeRedirectUri = this.onChangeRedirectUri.bind(this);
    this.onSubmitLoginWithIdP = this.onSubmitLoginWithIdP.bind(this);

    this.onChangeClientSecret = this.onChangeClientSecret.bind(this);
    this.onSubmitExchangeCodeForToken = this.onSubmitExchangeCodeForToken.bind(this);
    this.onResetState = this.onResetState.bind(this);

    const search = window.location.search;
    const params = new URLSearchParams(search);
    const authorization_code = params.get('code');

    let authCodeState = sessionStorage.getItem("authorization_code_state");
    if (authCodeState) {
      this.state = JSON.parse(authCodeState);
      this.state.authorization_code = authorization_code;
      return
    }

    this.state = this.getInitialState();
  }

  getInitialState() {
    sessionStorage.clear();

    return {
      well_known: '',
      well_known_res: {
        authorization_endpoint: '',
        token_endpoint: ''
      },
      client_id: '',
      scope: 'openid profile email',
      redirect_uri: window.location.href,
      authorization_code: '',
      client_secret: '',
      token_res: {},
      error: ''
    }
  }

  onResetState() {
    this.setState(this.getInitialState());

    window.location.href = "/authorization-code";
  }

  onChangeWellKnown(e) {
    this.onResetState();
    this.setState({
      well_known: e.target.value
    });
  }

  onSubmitWellKnown(e) {
    e.preventDefault();

    fetch(this.state.well_known)
      .then(res => res.json())
      .then(data => {
        this.setState({
          well_known_res: {
            authorization_endpoint: data.authorization_endpoint,
            token_endpoint: data.token_endpoint
          }
        });
      });
  }

  // STEP 1:
  onChangeClientID(e) {
    this.setState({
      client_id: e.target.value
    });
  }

  onChangeScope(e) {
    this.setState({
      scope: e.target.value
    })
  }

  onChangeRedirectUri(e) {
    this.setState({
      redirect_uri: e.target.value
    });
  }


  onChangeClientSecret(e) {
    this.setState({
      client_secret: e.target.value
    });
  }

  onSubmitLoginWithIdP(e) {
    e.preventDefault();

    let urlencoded = new URLSearchParams();
    urlencoded.append("client_id", this.state.client_id);
    urlencoded.append("scope", this.state.scope);
    urlencoded.append("redirect_uri", this.state.redirect_uri);
    urlencoded.append("response_type", "code");

    sessionStorage.setItem("authorization_code_state", JSON.stringify(this.state));

    window.location.href = this.state.well_known_res.authorization_endpoint + '?' + urlencoded;
  }

  onSubmitExchangeCodeForToken(e) {
    let headers = new Headers();
    headers.append("content-type", "application/x-www-form-urlencoded");

    let urlEncoded = new URLSearchParams();
    urlEncoded.append("grant_type", "authorization_code");
    urlEncoded.append("client_id", this.state.client_id);
    urlEncoded.append("client_secret", this.state.client_secret);
    urlEncoded.append("code", this.state.authorization_code);
    urlEncoded.append("redirect_uri", this.state.redirect_uri);

    let requestOptions = {
      method: 'POST',
      headers: headers,
      body: urlEncoded,
      redirect: 'follow'
    };

    fetch(this.state.well_known_res.token_endpoint, requestOptions)
      .then(response => response.json())
      .then(res => {
        this.setState({
          error: '',
          token_res: res
        })
      })
      .catch(error => {
        this.setState({
          error: error.message
        })
      });
  }

  generateCurlTemplate(token_uri, client_id, client_secret, redirect_uri, authorization_code, grant_type) {
    return `curl --location --request POST '${token_uri}' \\
--header 'Content-Type: application/x-www-form-urlencoded' \\
--data-urlencode 'grant_type=${grant_type}' \\
--data-urlencode 'client_id=${client_id}' \\
--data-urlencode 'client_secret=${client_secret}' \\
--data-urlencode 'code=${authorization_code}' \\
--data-urlencode 'redirect_uri=${redirect_uri}'`
  }

  generateJavascriptTemplate(token_uri, client_id, client_secret, redirect_uri, authorization_code, grant_type) {
    return `let headers = new Headers();
headers.append("Content-Type", "application/x-www-form-urlencoded");

    let urlEncoded = new URLSearchParams();
    urlEncoded.append("grant_type", "${grant_type}");
    urlEncoded.append("client_id", "${client_id}");
    urlEncoded.append("client_secret", "${client_secret}");
    urlEncoded.append("code", "${authorization_code}");
    urlEncoded.append("redirect_uri", "${redirect_uri}");

let requestOptions = {
  method: 'POST',
  headers: headers,
  body: urlencoded,
  redirect: 'follow'
};

fetch("${token_uri}", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));`
  }

  generateGoTemplate(token_uri, client_id, client_secret, redirect_uri, authorization_code, grant_type) {
    return `package main

import (
  "fmt"
  "strings"
  "net/http"
  "io/ioutil"
)

func main() {
  url := "${token_uri}"
  method := "POST"

  payload := strings.NewReader("client_id=${client_id}&client_secret=${client_secret}&grant_type=${grant_type}&code=${authorization_code}&redirect_uri=${redirect_uri}")

  client := &http.Client {}
  req, _ := http.NewRequest(method, url, payload)

  req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

  res, _ := client.Do(req)
  defer res.Body.Close()
  body, _ := ioutil.ReadAll(res.Body)

  fmt.Println(string(body))
}`
  }

  render() {

    return (
      <div>
        <h1>Authorization Code</h1>

        <div className="input-group mb-3">
          <input type="text"
                 className="form-control"
                 placeholder="OpenID Configuration .well-known endpoint"
                 value={this.state.well_known}
                 onChange={this.onChangeWellKnown}
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-primary"
              type="button"
              onClick={this.onSubmitWellKnown}
              disabled={!this.state.well_known}
            >Query
            </button>
          </div>
          <div className="input-group-append">
            <button
              className="btn btn-outline-warning"
              type="button"
              onClick={this.onResetState}
            >Reset
            </button>
          </div>
        </div>

        <SyntaxHighlighter template={JSON.stringify(this.state.well_known_res, null, 2)}/>

        <div className="input-group mb-3">
          <input type="text"
                 className="form-control"
                 placeholder="Scopes"
                 value={this.state.scope}
                 onChange={this.onChangeScope}
          />
        </div>

        <div className="input-group mb-3">
          <input type="text"
                 className="form-control"
                 placeholder="Client ID"
                 value={this.state.client_id}
                 onChange={this.onChangeClientID}
          />
        </div>

        <div className="input-group mb-3">
          <input type="text"
                 className="form-control"
                 placeholder="Redirect URI"
                 value={this.state.redirect_uri}
                 onChange={this.onChangeRedirectUri}
          />
        </div>

        <div className="input-group mb-3">
          <button className="btn btn-outline-primary btn-block"
                  onClick={this.onSubmitLoginWithIdP}
                  disabled={!this.state.well_known_res.authorization_endpoint}
          >Login with your Identity Provider
          </button>
        </div>

        <SyntaxHighlighter template={JSON.stringify({code: this.state.authorization_code})}/>

        <div className="input-group mb-3">
          <input type="text"
                 className="form-control"
                 placeholder="Client Secret"
                 value={this.state.client_secret}
                 onChange={this.onChangeClientSecret}
          />
        </div>

        <div className="input-group mb-3">
          <button className="btn btn-outline-primary btn-block"
                  onClick={this.onSubmitExchangeCodeForToken}
                  disabled={!this.state.well_known_res.token_endpoint}
          >Exchange Authorization Code for Access token
          </button>
        </div>

        <div className="row">
          <div className="col col-6">
            <Tabs defaultActiveKey="javascript" id="uncontrolled-tab-example">
              <Tab eventKey="javascript" title="JS">
                <SyntaxHighlighter
                  template={this.generateJavascriptTemplate(this.state.well_known_res.token_endpoint, this.state.client_id, this.state.client_secret, this.state.redirect_uri, this.state.authorization_code, "authorization_code")}/>
              </Tab>
              <Tab eventKey="go" title="Go">
                <SyntaxHighlighter
                  template={this.generateGoTemplate(this.state.well_known_res.token_endpoint, this.state.client_id, this.state.client_secret, this.state.redirect_uri, this.state.authorization_code, "authorization_code")}/>
              </Tab>
              <Tab eventKey="curl" title="Curl">
                <SyntaxHighlighter
                  template={this.generateCurlTemplate(this.state.well_known_res.token_endpoint, this.state.client_id, this.state.client_secret, this.state.redirect_uri, this.state.authorization_code, "authorization_code")}/>
              </Tab>
            </Tabs>
          </div>
          <div className="col col-6">
            <h2>Response</h2>
            <SyntaxHighlighter
              template={this.state.error ? this.state.error : JSON.stringify(this.state.token_res, null, 2)}/>
          </div>
        </div>
      </div>
    )
  }
}
