// Initialize leave balances for a user (Admin)
query initialize verb=POST {
  api_group = "LeaveBalances"
  auth = "user"

  input {
    int user_id
    int year?
  }

  stack {
    // 1. RBAC
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "admin"}
    }
  
    // 2. Set year
    var $target_year {
      value = $input.year ?? (now|format_timestamp:"Y":"UTC"|to_int)
    }
  
    // 3. Get all active leave types
    db.query leave_type {
      where = $db.leave_type.is_active == true
      return = {type: "list"}
    } as $types
  
    // 4. Initialize balances
    foreach ($types) {
      each as $type {
        // Check existence
        db.query leave_balance {
          where = ($db.leave_balance.user_id == $input.user_id) && ($db.leave_balance.leave_type_id == $type.id) && ($db.leave_balance.year == $target_year)
          return = {type: "single"}
        } as $existing
      
        conditional {
          if ($existing == null) {
            db.add leave_balance {
              data = {
                user_id        : $input.user_id
                leave_type_id  : $type.id
                total_allocated: $type.total_days
                used_days      : 0
                pending_days   : 0
                remaining_days : $type.total_days
                year           : $target_year
                created_at     : now
              }
            } as $new_balance
          }
        }
      }
    }
  }

  response = {
    success: true
    message: "Leave balances initialized for year " ~ ($target_year|to_text)
  }

  guid = "SASSSfC1AGO_KPK4xTxP-uxgmnc"
}