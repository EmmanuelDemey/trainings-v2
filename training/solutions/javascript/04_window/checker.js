// Self-check for this workshop — you do not need to modify it.
// It runs on load and prints one line per acceptance criterion in the console.
// Red is normal at the start: that is the list of what is left to do.
(function selfCheck() {
  const results = [];

  window.check = (label, assertion) => {
    let ok = false;
    let detail = '';
    try {
      ok = assertion() === true;
    } catch (error) {
      detail = ` (${error.message})`;
    }
    results.push(ok);
    const style = ok ? 'color:#1f9d55' : 'color:#d33a3a';
    console.log(`%c${ok ? '✅' : '❌'} ${label}${detail}`, style);
  };

  window.checkReport = () => {
    const passed = results.filter(Boolean).length;
    console.log(
      `%c${passed}/${results.length} checks passing`,
      `font-weight:bold; color:${passed === results.length ? '#1f9d55' : '#d33a3a'}`,
    );
  };
})();
