// Sections within a Branch
table section {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int branch_id
    text name filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "branch_id", op: "asc"}]}
  ]

  guid = "vn6AZrCK1f4FbUoQTpLgJmty4zY"
}