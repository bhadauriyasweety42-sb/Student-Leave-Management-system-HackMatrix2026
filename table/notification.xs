// Stores notifications for users
table notification {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int user_id
    text title
    text message
    enum type {
      values = [
        "leave_submitted"
        "leave_approved"
        "leave_rejected"
        "leave_cancelled"
        "system"
      ]
    }
  
    int? related_leave_id
    bool is_read?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "user_id", op: "asc"}]}
    {type: "btree", field: [{name: "is_read", op: "asc"}]}
  ]

  guid = "eRc_TMO4w3-zOVR7dV_GESfQBUU"
}