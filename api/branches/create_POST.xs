query create verb=POST {
  api_group = "Branches"
  auth = "user"

  input {
    int department_id
    text name
    text code
  }

  stack {
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "hod"}
    } as $role_check
  
    db.add branch {
      data = {
        department_id: $input.department_id
        name         : $input.name
        code         : $input.code
        created_at   : now
      }
    } as $branch_rec
  }

  response = {success: true, data: $branch_rec}
  guid = "lKFmTGq4gjl7YtSm2LKfJd_AzDM"
}