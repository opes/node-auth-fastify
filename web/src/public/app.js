function createSubmitHandler(callback = () => {}) {
  return async (event) => {
    event.preventDefault();
    const data = new FormData(event.target);

    try {
      const values = Object.fromEntries([...data.entries()]);
      const res = await fetch(event.target.action, {
        method: event.target.method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(values),
      });
      const body = await res.json();

      callback(values, body);

      document.querySelector('#response-header').textContent = 'Response:';
      document.querySelector('#response-body').textContent = JSON.stringify(
        body,
        null,
        2
      );
      hljs.highlightAll();
    } catch (err) {
      console.error(err.message);
    }
  };
}

function configureForms() {
  const forms = {
    '#register-form': () => {},
    '#login-form': (values, res) => {
      if (res.status === '2FA') {
        const { email, password } = values;
        document.querySelector('#token-form input[name="email"]').value = email;
        document.querySelector('#token-form input[name="password"]').value =
          password;
      }
    },
    '#logout-form': () => {},
    '#change-password-form': () => {},
    '#forgot-password-form': () => {},
    '#reset-password-form': () => {},
    '#token-form': () => {},
  };

  Object.entries(forms).map(async ([id, callback]) => {
    const form = document.querySelector(id);
    form?.addEventListener('submit', createSubmitHandler(callback));
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
