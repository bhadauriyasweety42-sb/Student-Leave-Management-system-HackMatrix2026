// Create a new Department
query create verb=POST {
  api_group = "Departments"
  auth = "user"

  input {
    text name
    text code
  }

  stack {
    // RBAC: Only HOD can create (assuming HOD is highest for now)
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "hod"}
    }
  
    db.add department {
      data = {name: $input.name, code: $input.code, created_at: now}
    } as $dept
  }

  response = {success: true, data: $dept}
  guid = "oaG6skj4ZijwuvnL1KioTZ0xDOY"
}