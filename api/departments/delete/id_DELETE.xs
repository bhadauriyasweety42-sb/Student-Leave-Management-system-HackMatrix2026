// Delete a department (Admin)
query "delete/{id}" verb=DELETE {
  api_group = "Departments"
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
    db.del department {
      field_name = "id"
      field_value = $input.id
    }
  }

  response = {success: true, message: "Department deleted"}
  guid = "m2KNcpUX_rldtrYT5FucSlNtpCM"
}