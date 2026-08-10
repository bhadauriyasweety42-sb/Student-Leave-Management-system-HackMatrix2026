// Leave requests from students
table leave_request {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    timestamp updated_at?
    int student_id
    text leave_type
    text reason
    date from_date
    date to_date
    decimal total_days
    attachment? attachment
    enum coordinator_status?=pending {
      values = ["pending", "approved", "rejected"]
    }
  
    text coordinator_remark?
    enum hod_status?=pending {
      values = ["pending", "approved", "rejected"]
    }
  
    text hod_remark?
    enum final_status?="pending_coordinator" {
      values = [
        "pending_coordinator"
        "pending_hod"
        "approved"
        "rejected_by_coordinator"
        "rejected_by_hod"
      ]
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "student_id", op: "asc"}]}
    {type: "btree", field: [{name: "final_status", op: "asc"}]}
  ]

  guid = "JUfR0pnf8v6eBCQv_x5MpxvJugg"
}