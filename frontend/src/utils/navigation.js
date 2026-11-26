// Navigate without relying on server-side routing, so it works with both
// BrowserRouter (default) and HashRouter (static demo build, mode "demo").
export const IS_DEMO = import.meta.env.MODE === 'demo'

export function goTo(path) {
  if (IS_DEMO) {
    window.location.hash = '#' + path
  } else {
    window.location.href = path
  }
}
