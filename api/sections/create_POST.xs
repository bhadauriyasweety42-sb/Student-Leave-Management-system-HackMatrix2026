query create verb=POST {
  api_group = "Sections"
  auth = "user"

  input {
    int branch_id
    text name
  }

  stack {
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "hod"}
    } as $role_check
  
    db.add section {
      data = {
        branch_id : $input.branch_id
        name      : $input.name
        created_at: now
      }
    } as $section
  }

  response = {success: true, data: $section}
  guid = "baNVOzDIesGRuUHqDW09jUm9UGc"
}