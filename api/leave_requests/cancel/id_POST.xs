// Cancel a leave request
// Cancel a pending leave request
query "cancel/{id}" verb=POST {
  api_group = "LeaveRequests"
  auth = "user"

  input {
    int id
  }

  stack {
    // 1. Get request
    db.get leave_request {
      field_name = "id"
      field_value = $input.id
    } as $request
  
    precondition ($request != null) {
      error_type = "notfound"
      error = "Leave request not found"
    }
  
    // 2. Ownership check
    precondition ($request.user_id == $auth.id) {
      error_type = "accessdenied"
      error = "You can only cancel your own leave requests"
    }
  
    // 3. Status check
    precondition ($request.status == "pending") {
      error_type = "inputerror"
      error = "Only pending requests can be cancelled"
    }
  
    // 4. Date check (start date has not passed)
    precondition ($request.start_date > now) {
      error_type = "inputerror"
      error = "Cannot cancel leave that has already started or passed"
    }
  
    // 5. Update request status
    db.edit leave_request {
      field_name = "id"
      field_value = $input.id
      data = {status: "cancelled", updated_at: now}
    } as $updated_request
  
    // 6. Update leave balance (pending_days decrease, remaining_days increase back)
    db.query leave_balance {
      where = ($db.leave_balance.user_id == $auth.id) && ($db.leave_balance.leave_type_id == $request.leave_type_id)
      return = {type: "single"}
    } as $balance
  
    conditional {
      if ($balance != null) {
        db.edit leave_balance {
          field_name = "id"
          field_value = $balance.id
          data = {
            pending_days  : $balance.pending_days - $request.number_of_days
            remaining_days: $balance.remaining_days + $request.number_of_days
            updated_at    : now
          }
        }
      }
    }
  
    // 7. Notify manager
    db.get user {
      field_name = "id"
      field_value = $auth.id
    } as $user
  
    db.get department {
      field_name = "id"
      field_value = $user.department_id
    } as $dept
  
    conditional {
      if (($dept != null) && ($dept.manager_id != null)) {
        db.add notification {
          data = {
            user_id         : $dept.manager_id
            title           : "Leave Request Cancelled"
            message         : ($user.full_name|to_text) ~ " has cancelled their leave request for " ~ ($request.number_of_days|to_text) ~ " days."
            type            : "leave_cancelled"
            related_leave_id: $request.id
            is_read         : false
            created_at      : now
          }
        } as $notif
      }
    }
  
    // 8. Audit log
    db.add audit_log {
      data = {
        user_id    : $auth.id
        action     : "leave_cancellation"
        entity_type: "leave_request"
        entity_id  : $request.id
        description: "Cancelled own leave request"
        ip_address : $env.$remote_ip
        created_at : now
      }
    } as $audit
  }

  response = {
    success: true
    message: "Leave request cancelled"
    data   : $updated_request
  }

  guid = "R7-bwN6Nh0rzIP7i1coIIQD8Pmw"
}