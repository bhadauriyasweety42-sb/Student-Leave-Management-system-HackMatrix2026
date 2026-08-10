// Stores leave balance for each user per leave type per year
table leave_balance {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    timestamp updated_at?
    int user_id
    int leave_type_id
    decimal total_allocated
    decimal used_days?
    decimal pending_days?
    decimal remaining_days?
    int year
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "user_id", op: "asc"}]}
    {type: "btree", field: [{name: "leave_type_id", op: "asc"}]}
  ]

  guid = "oZ17f0xs6z53E5sVC-MVZfHrhqU"
}