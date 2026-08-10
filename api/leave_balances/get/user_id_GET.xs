// Get leave balance for a specific user (Manager/HR/Admin)
query "get/{user_id}" verb=GET {
  api_group = "LeaveBalances"
  auth = "user"

  input {
    int user_id
  }

  stack {
    // 1. RBAC (Manager/HR/Admin)
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "manager"}
    } as $role_check
  
    // 2. Query
    db.query leave_balance {
      join = {
        leave_type: {
          table: "leave_type"
          type : "left"
          where: $db.leave_balance.leave_type_id == $db.leave_type.id
        }
      }
    
      where = $db.leave_balance.user_id == $input.user_id
      eval = {leave_type_name: $db.leave_type.name}
      return = {type: "list"}
    } as $balances
  }

  response = {success: true, data: $balances}
  guid = "RbdOhMfQSWW2XwCtsXYsQgaV4SI"
}