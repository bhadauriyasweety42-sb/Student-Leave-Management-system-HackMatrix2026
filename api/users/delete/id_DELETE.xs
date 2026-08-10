// Delete a user (Admin only)
query "delete/{id}" verb=DELETE {
  api_group = "Users"
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
    db.del user {
      field_name = "id"
      field_value = $input.id
    }
  
    // 3. Audit log
    db.add audit_log {
      data = {
        user_id    : $auth.id
        action     : "user_deletion"
        entity_type: "user"
        entity_id  : $input.id
        description: "Deleted user ID: " ~ ($input.id|to_text)
        ip_address : $env.$remote_ip
        created_at : now
      }
    } as $audit
  }

  response = {success: true, message: "User deleted"}
  guid = "5ZczURUa69Irw4ze-Xs7W3Z0700"
}