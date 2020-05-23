import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism';
import React, {Component} from "react";

export default class SyntaxHighlighterComponent extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <SyntaxHighlighter language="javascript" style={dark}>
                {this.props.template}
            </SyntaxHighlighter>
        )
    };
};
