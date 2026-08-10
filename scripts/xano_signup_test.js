const base = 'https://x8ki-letl-twmt.n7.xano.io/api:HduUvIo3';
const signupUrl = base + '/auth/signup';
const loginUrl = base + '/auth/login';
const payload = {
  fullName: 'Test Student',
  email: 'teststudent@college.com',
  password: 'Test@12345',
  phoneNumber: '',
  rollNumber: 'TEST12345',
  department: 'Computer Science and Technology',
  academicYear: '1st Year',
  semester: '1',
  role: 'student',
};

(async () => {
  try {
    console.log('SIGNUP URL', signupUrl);
    const signupRes = await fetch(signupUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const signupText = await signupRes.text();
    console.log('SIGNUP STATUS', signupRes.status, signupRes.statusText);
    console.log('SIGNUP BODY', signupText);

    console.log('Attempting login to verify creation...');
    const loginPayload = { email: payload.email, password: payload.password };
    const loginRes = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginPayload),
    });
    const loginText = await loginRes.text();
    console.log('LOGIN STATUS', loginRes.status, loginRes.statusText);
    console.log('LOGIN BODY', loginText);
  } catch (err) {
    console.error('ERROR', err.message || err);
  }
})();
