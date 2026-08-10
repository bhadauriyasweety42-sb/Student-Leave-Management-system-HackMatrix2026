const url = 'https://x8ki-letl-twmt.n7.xano.io/apispec:HduUvIo3?type=json&token=';
(async () => {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    const obj = await res.json();
    const path = obj.paths?.['/auth/signup'];
    console.log('signup path exists?', !!path);
    console.log(JSON.stringify(path, null, 2));
  } catch (err) {
    console.error('error', err.message || err);
  }
})();
