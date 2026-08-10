const base = 'https://x8ki-letl-twmt.n7.xano.io/api:HduUvIo3';
const url = base + '/auth/signup';
const tests = [
  { name:'Test A', body:{name:'Test Student', email:'teststudent@college.com', password:'Test@12345', role:'student', roll_number:'TEST12345', department_id:1, branch_id:1, section_id:1} },
  { name:'Test B', body:{name:'Test Student', email:'teststudent@college.com', password:'Test@12345', role:'student', roll_number:'TEST12345', department_id:1, branch_id:1} },
  { name:'Test C', body:{name:'Test Student', email:'teststudent@college.com', password:'Test@12345', role:'student'} },
  { name:'Test D', body:{fullName:'Test Student', email:'teststudent@college.com', password:'Test@12345', role:'student', rollNumber:'TEST12345', department:'Computer Science and Technology', academicYear:'1st Year', semester:'1'} },
];
(async () => {
  for (const test of tests) {
    console.log('===', test.name, '===');
    try {
      const res = await fetch(url, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(test.body),
      });
      const text = await res.text();
      console.log('status', res.status, res.statusText);
      console.log(text);
    } catch (err) {
      console.error('error', err.message || err);
    }
  }
})();
