/**
 * Tiny blocking script that sets data-theme from a cookie/localStorage before paint,
 * so dark/light mode never flashes (FOUC). Kept dependency-free and inline.
 */
export function ThemeScript() {
  const script = `(function(){try{var m=document.cookie.match(/(?:^|; )theme=(light|dark)/);var t=m?m[1]:localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;
  return <script id="mk-theme-mode" dangerouslySetInnerHTML={{ __html: script }} />;
}
