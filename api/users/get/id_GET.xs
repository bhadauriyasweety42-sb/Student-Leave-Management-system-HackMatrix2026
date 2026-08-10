// Get a specific user by ID
query "get/{id}" verb=GET {
  api_group = "Users"
  auth = "user"

  input {
    int id
  }

  stack {
    // 1. RBAC
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "hr"}
    }
  
    // 2. Get user
    db.get user {
      field_name = "id"
      field_value = $input.id
    } as $user
  
    precondition ($user != null) {
      error_type = "notfound"
      error = "User not found"
    }
  }

  response = {success: true, data: $user}
  guid = "XlfSxWXCFoh_f922uezh8yYxlf8"
}