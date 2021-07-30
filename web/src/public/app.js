async function handleSubmit(event) {
  event.preventDefault();
  const data = new FormData(event.target);

  try {
    const res = await fetch(event.target.action, {
      method: event.target.method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(Object.fromEntries([...data.entries()])),
    });

    const body = await res.json();

    document.querySelector('#response-header').textContent = 'Response:';
    document.querySelector('#response-body').textContent = JSON.stringify(body, null, 2);
    hljs.highlightAll();
  } catch (err) {
    console.error(err.message);
  }
}

function configureForms() {
  const forms = [
    '#register-form',
    '#login-form',
    '#logout-form',
    '#change-password-form',
    '#forgot-password-form',
    '#reset-password-form',
    '#token-form',
  ];

  forms.map((id) => {
    const form = document.querySelector(id);
    form && form.addEventListener('submit', handleSubmit);
  });
}

function displayAlert() {
  const params = new URLSearchParams(window.location.search);

  if (params.get('success') === 'true') {
    const emailVerified = params.get('verified') === 'true';
    const message = emailVerified
      ? 'Email verified!'
      : 'The email address could not be verified.';
    const className = emailVerified ? 'alert-success' : 'alert-error';
    const alert = document.querySelector('.alert');
    alert.textContent = message;
    alert.className = `alert ${className}`;
    alert.attributes.style.value = '';
  }
}

function init() {
  configureForms();
  displayAlert();
}

init();
