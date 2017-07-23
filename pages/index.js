import React from 'react';
import {Link} from 'react-router';
import {config} from 'config';

export default class Index extends React.Component {
  render() {
    const posts = this.props.route.pages.filter(post => !!post.data.title);
    return (
      <span>
        <div className="titles">
          <ul>
            {posts.map((post, i) => (
              <li>
                <h1><Link to={post.path}>{post.data.title}</Link></h1>
              </li>
            ))}
          </ul>
        </div>
        <div className="me">
          <a href="#">@keyserfaty</a>
        </div>
      </span>
      );

  }
}
