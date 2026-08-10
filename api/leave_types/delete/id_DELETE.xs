// Delete a leave type (Admin)
query "delete/{id}" verb=DELETE {
  api_group = "LeaveTypes"
  auth = "user"

  input {
    int id
  }

  stack {
    // 1. RBAC
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "admin"}
    } as $role_check
  
    // 2. Delete
    db.del leave_type {
      field_name = "id"
      field_value = $input.id
    }
  }

  response = {success: true, message: "Leave type deleted"}
  guid = "hS1w8UHfJxceUB1YsjCsTvfHhEo"
}