// In-frame scripts are imported as text (angular.json loader option '.frame.js': 'text').
declare module '*.frame.js' {
  const source: string;
  export default source;
}
