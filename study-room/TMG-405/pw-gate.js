(function () {
  if (sessionStorage.getItem('tmg405_auth') === '1') return;

  var gate = document.createElement('div');
  gate.id = 'pw-gate';
  gate.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#0a0a0f;display:flex;align-items:center;justify-content:center;padding:1rem';
  gate.innerHTML = '<div style="background:#111827;border:1px solid rgba(99,102,241,.4);border-radius:1.25rem;padding:2.5rem;max-width:380px;width:100%;text-align:center">'
    + '<div style="width:56px;height:56px;border-radius:50%;background:rgba(99,102,241,.15);display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem">'
    + '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>'
    + '</div>'
    + '<h2 style="font-family:\'Poppins\',sans-serif;font-size:1.35rem;font-weight:700;color:#f8fafc;margin-bottom:0.5rem">TMG 405 \u2014 Access Required</h2>'
    + '<p style="color:#94a3b8;font-size:0.875rem;margin-bottom:1.5rem">Enter the password to access this study resource.</p>'
    + '<input id="pw-gate-input" type="password" placeholder="Enter password" autocomplete="off" style="width:100%;background:#1e293b;border:1px solid rgba(255,255,255,.12);border-radius:0.5rem;color:#f8fafc;padding:0.8rem 1rem;font-size:0.9rem;font-family:\'Inter\',sans-serif;margin-bottom:0.75rem;outline:none;box-sizing:border-box">'
    + '<div id="pw-gate-error" style="color:#f87171;font-size:0.8rem;margin-bottom:0.75rem;display:none">Incorrect password. Please try again.</div>'
    + '<button id="pw-gate-btn" style="width:100%;padding:0.8rem;background:#1e40af;color:#f8fafc;border:none;border-radius:0.5rem;font-weight:600;font-family:\'Inter\',sans-serif;font-size:0.9rem;cursor:pointer">Unlock</button>'
    + '</div>';

  document.body.insertBefore(gate, document.body.firstChild);

  function check() {
    var v = document.getElementById('pw-gate-input').value.trim().toUpperCase();
    if (v === 'AKWAABA') {
      sessionStorage.setItem('tmg405_auth', '1');
      document.getElementById('pw-gate').style.display = 'none';
    } else {
      document.getElementById('pw-gate-error').style.display = 'block';
      document.getElementById('pw-gate-input').style.borderColor = '#f87171';
    }
  }

  document.getElementById('pw-gate-btn').addEventListener('click', check);
  document.getElementById('pw-gate-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') check();
  });
})();
