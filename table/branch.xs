// Branches within a Department
table branch {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int department_id
    text name filters=trim
    text code filters=trim|upper
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "department_id", op: "asc"}]}
    {type: "btree|unique", field: [{name: "code", op: "asc"}]}
  ]

  guid = "ScNcV0E84KSOlEj7nIA37D05hVw"
}