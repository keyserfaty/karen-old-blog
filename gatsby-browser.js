import ReactGA from 'react-ga';
ReactGA.initialize('UA-103064745-1');

exports.onRouteUpdate = (state, page, pages) => {
  ReactGA.pageview(state.pathname);
};