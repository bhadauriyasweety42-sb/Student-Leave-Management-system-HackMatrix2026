const base = 'https://x8ki-letl-twmt.n7.xano.io/api:HduUvIo3';
const paths = ['/users', '/auth/users', '/auth/signup', '/auth/login', '/departments', '/branches', '/sections'];
(async () => {
  for (const path of paths) {
    const url = base + path;
    try {
      const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
      const text = await res.text();
      console.log('PATH', path, 'STATUS', res.status, res.statusText);
      console.log(text.length > 800 ? text.slice(0, 800) + '...' : text);
    } catch (err) {
      console.error('PATH', path, 'ERROR', err.message);
    }
    console.log('---');
  }
})();
