import React from 'react'
import 'css/markdown-styles.css'
import Helmet from 'react-helmet'
import { config } from 'config'

export default (props) => {
  const post = props.route.page.data
  return (
      <div className="body">
        <Helmet title={`${config.siteTitle} | ${post.title}`} />
        <h1>{post.title}</h1>
        <div className="content" dangerouslySetInnerHTML={{ __html: post.body }} />
      </div>
  )
}