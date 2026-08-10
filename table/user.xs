// Stores user information for Students, Coordinators, and HODs
table user {
  auth = true

  schema {
    int id
    timestamp created_at?=now
    timestamp updated_at?
    text name filters=trim
    email email filters=trim|lower
    password password filters=min:8
    enum role {
      values = ["student", "coordinator", "hod"]
    }
  
    text roll_number?
    int department_id?
    int branch_id?
    int section_id?
    image? profile_image?
    bool is_active?=true
    object password_reset? {
      schema {
        password token?
        timestamp? expiration?
        bool used?
      }
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
    {type: "btree|unique", field: [{name: "email", op: "asc"}]}
  ]

  tags = ["xano:quick-start"]
  guid = "WJ2iPT5qub9eMVSgWJZMIPv54cU"
}