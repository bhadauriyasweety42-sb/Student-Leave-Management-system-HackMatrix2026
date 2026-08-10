// Stores different types of leave available
table leave_type {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    timestamp updated_at?
    text name filters=trim
    text description?
    int total_days
    bool is_paid?=true
    bool requires_document?
    bool is_active?=true
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "name", op: "asc"}]}
  ]

  guid = "TLbsfIgQfOFKT9P6jH3-ZdX-Tlc"
}