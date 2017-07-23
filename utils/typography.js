import ReactDOM from 'react-dom/server'
import React from 'react'
import Typography from 'typography'
import CodePlugin from 'typography-plugin-code'
import { MOBILE_MEDIA_QUERY } from 'typography-breakpoint-constants'

const options = {
  baseFontSize: '14px',
  baseLineHeight: '20px',
  scaleRatio: 2.25,
  plugins: [new CodePlugin()],
  overrideStyles: ({ rhythm, scale }, options) => ({
    [MOBILE_MEDIA_QUERY]: {
      // Make baseFontSize on mobile 16px.
      html: {
        fontFamily: "'Open Sans', sans-serif",
        fontSize: `${16 / 16 * 100}%`,
        color: 'black'
      },
    },
  }),
}

const typography = new Typography(options)

// Hot reload typography in development.
if (process.env.NODE_ENV !== 'production') {
  typography.injectStyles()
}

export default typography
