// Stores audit logs for important system actions
table audit_log {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int user_id
    text action
    text entity_type?
    int? entity_id
    text description?
    text ip_address?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "user_id", op: "asc"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]

  guid = "Skmsa_LUqEMao-HIKg6X5hLVghM"
}