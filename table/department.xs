// College Departments
table department {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    text name filters=trim
    text code filters=trim|upper
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "name", op: "asc"}]}
    {type: "btree|unique", field: [{name: "code", op: "asc"}]}
  ]

  guid = "9KAA0FP9gTfU_qePT8Rc59HOpdk"
}