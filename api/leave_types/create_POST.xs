// Create a new leave type (Admin)
query create verb=POST {
  api_group = "LeaveTypes"
  auth = "user"

  input {
    text name
    text? description
    int total_days
    bool is_paid?=true
    bool requires_document?
    bool is_active?=true
  }

  stack {
    // 1. RBAC
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "admin"}
    } as $role_check
  
    // 2. Add
    db.add leave_type {
      data = {
        name             : $input.name
        description      : $input.description
        total_days       : $input.total_days
        is_paid          : $input.is_paid
        requires_document: $input.requires_document
        is_active        : $input.is_active
        created_at       : now
      }
    } as $type
  }

  response = {
    success: true
    message: "Leave type created"
    data   : $type
  }

  guid = "1Mk9LtoCNuG9TvYDgeLeaNQ3yLk"
}