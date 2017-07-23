import ReactGA from 'react-ga';
ReactGA.initialize('UA-52135519-1');

exports.onRouteUpdate = (state, page, pages) => {
  ReactGA.pageview(state.pathname);
};