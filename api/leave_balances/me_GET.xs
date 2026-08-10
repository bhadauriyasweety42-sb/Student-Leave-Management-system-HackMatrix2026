// Get own leave balances
query me verb=GET {
  api_group = "LeaveBalances"
  auth = "user"

  input {
  }

  stack {
    db.query leave_balance {
      join = {
        leave_type: {
          table: "leave_type"
          type : "left"
          where: $db.leave_balance.leave_type_id == $db.leave_type.id
        }
      }
    
      where = $db.leave_balance.user_id == $auth.id
      eval = {
        leave_type_name       : $db.leave_type.name
        leave_type_description: $db.leave_type.description
      }
    
      return = {type: "list"}
    } as $balances
  }

  response = {success: true, data: $balances}
  guid = "Hh1KOpKx_nvjMhCLnKvsyNqXeYk"
}