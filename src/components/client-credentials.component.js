import React, {Component} from 'react';
import SyntaxHighlighter from './examples/syntax-highlighter.component';
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";

export default class ClientCredentialsComponent extends Component {
  constructor(props) {
    super(props);

    this.onChangeWellKnown = this.onChangeWellKnown.bind(this);
    this.onSubmitWellKnown = this.onSubmitWellKnown.bind(this);
    this.onChangeClientID = this.onChangeClientID.bind(this);
    this.onChangeClientSecret = this.onChangeClientSecret.bind(this);
    this.onSubmitLogin = this.onSubmitLogin.bind(this);

    this.state = {
      well_known: '',
      well_known_res: {
        token_endpoint: ''
      },
      client_id: '',
      client_secret: '',
      token_res: {},
      error: ''
    }
  }

  onChangeWellKnown(e) {
    this.setState({
      well_known: e.target.value,
      well_known_res: {
        token_endpoint: ''
      }
    });
  }

  onChangeClientID(e) {
    this.setState({
      client_id: e.target.value
    });
  }

  onChangeClientSecret(e) {
    this.setState({
      client_secret: e.target.value
    });
  }

  onSubmitWellKnown(e) {
    e.preventDefault();

    fetch(this.state.well_known)
      .then(res => res.json())
      .then(data => {
        this.setState({
          well_known_res: {
            token_endpoint: data.token_endpoint
          }
        });
      });
  }

  onSubmitLogin(e) {
    let headers = new Headers()
    headers.append("content-type", "application/x-www-form-urlencoded");

    let urlencoded = new URLSearchParams();
    urlencoded.append("client_id", this.state.client_id);
    urlencoded.append("client_secret", this.state.client_secret);
    urlencoded.append("grant_type", "client_credentials");

    let requestOptions = {
      method: 'POST',
      headers: headers,
      body: urlencoded,
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

  generateCurlTemplate(token_uri, client_id, client_secret, grant_type) {
    return `curl --location --request POST '${token_uri}' \\
--header 'Content-Type: application/x-www-form-urlencoded' \\
--data-urlencode 'client_id=${client_id}' \\
--data-urlencode 'client_secret=${client_secret}' \\
--data-urlencode 'grant_type=${grant_type}'`
  }

  generateJavascriptTemplate(token_uri, client_id, client_secret, grant_type) {
    return `let headers = new Headers();
headers.append("Content-Type", "application/x-www-form-urlencoded");

let urlencoded = new URLSearchParams();
urlencoded.append("client_id", "${client_id}");
urlencoded.append("client_secret", "${client_secret}");
urlencoded.append("grant_type", "${grant_type}");

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

  generateGoTemplate(token_uri, client_id, client_secret, grant_type) {
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

  payload := strings.NewReader("client_id=${client_id}&client_secret=${client_secret}&grant_type=${grant_type}")

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
        <h1>Client Credentials</h1>

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
        </div>

        <SyntaxHighlighter template={JSON.stringify(this.state.well_known_res)}/>

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
                 placeholder="Client Secret"
                 value={this.state.client_secret}
                 onChange={this.onChangeClientSecret}
          />
        </div>

        <div className="input-group mb-3">
          <button className="btn btn-outline-primary btn-block"
                  onClick={this.onSubmitLogin}
                  disabled={!this.state.well_known_res.token_endpoint}
          >Login
          </button>
        </div>

        <div className="row">
          <div className="col col-6">
            <Tabs defaultActiveKey="javascript" id="uncontrolled-tab-example">
              <Tab eventKey="javascript" title="JS">
                <SyntaxHighlighter
                  template={this.generateJavascriptTemplate(this.state.well_known_res.token_endpoint, this.state.client_id, this.state.client_secret, "client-credentials")}/>
              </Tab>
              <Tab eventKey="go" title="Go">
                <SyntaxHighlighter
                  template={this.generateGoTemplate(this.state.well_known_res.token_endpoint, this.state.client_id, this.state.client_secret, "client-credentials")}/>
              </Tab>
              <Tab eventKey="curl" title="Curl">
                <SyntaxHighlighter
                  template={this.generateCurlTemplate(this.state.well_known_res.token_endpoint, this.state.client_id, this.state.client_secret, "client-credentials")}/>
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
