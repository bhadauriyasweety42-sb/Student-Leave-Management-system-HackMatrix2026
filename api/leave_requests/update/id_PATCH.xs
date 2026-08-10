// Update a leave request (HR/Admin)
query "update/{id}" verb=PATCH {
  api_group = "LeaveRequests"
  auth = "user"

  input {
    int id
    int? leave_type_id
    date? start_date
    date? end_date
    decimal? number_of_days
    text? reason
    enum? status {
      values = ["pending", "approved", "rejected", "cancelled"]
    }
  
    text? manager_comment
    text? hr_comment
    text? rejection_reason
  }

  stack {
    // 1. RBAC
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "hr"}
    } as $role_check
  
    // 2. Get request
    db.get leave_request {
      field_name = "id"
      field_value = $input.id
    } as $request
  
    precondition ($request != null) {
      error_type = "notfound"
      error = "Leave request not found"
    }
  
    // 3. Build updates
    var $updates {
      value = {updated_at: now}
    }
  
    conditional {
      if ($input.leave_type_id != null) {
        var.update $updates {
          value = $updates
            |set:"leave_type_id":$input.leave_type_id
        }
      }
    }
  
    conditional {
      if ($input.start_date != null) {
        var.update $updates {
          value = $updates
            |set:"start_date":$input.start_date
        }
      }
    }
  
    conditional {
      if ($input.end_date != null) {
        var.update $updates {
          value = $updates|set:"end_date":$input.end_date
        }
      }
    }
  
    conditional {
      if ($input.number_of_days != null) {
        var.update $updates {
          value = $updates
            |set:"number_of_days":$input.number_of_days
        }
      }
    }
  
    conditional {
      if ($input.reason != null) {
        var.update $updates {
          value = $updates|set:"reason":$input.reason
        }
      }
    }
  
    conditional {
      if ($input.status != null) {
        var.update $updates {
          value = $updates|set:"status":$input.status
        }
      }
    }
  
    conditional {
      if ($input.manager_comment != null) {
        var.update $updates {
          value = $updates
            |set:"manager_comment":$input.manager_comment
        }
      }
    }
  
    conditional {
      if ($input.hr_comment != null) {
        var.update $updates {
          value = $updates
            |set:"hr_comment":$input.hr_comment
        }
      }
    }
  
    conditional {
      if ($input.rejection_reason != null) {
        var.update $updates {
          value = $updates
            |set:"rejection_reason":$input.rejection_reason
        }
      }
    }
  
    // 4. Patch
    db.patch leave_request {
      field_name = "id"
      field_value = $input.id
      data = $updates
    } as $updated_request
  }

  response = {
    success: true
    message: "Leave request updated"
    data   : $updated_request
  }

  guid = "aqzW6VUheAw_bGHU04pLyAAZfVs"
}