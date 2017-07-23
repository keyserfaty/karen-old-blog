import React from 'react';
import Helmet from 'react-helmet';
import {config} from 'config';

import 'css/style.css';

export default class extends React.Component {
  render() {
    return (
      <div>
        <Helmet
          title={config.siteTitle}
          meta={[
            {name: 'description', content: config.description},
            {name: 'keywords', content: config.keywords}
          ]}
        />
        <section className="content">
          {this.props.children}
        </section>
      </div>
    );
  }
}
