// Student applies for leave
// Student submits a new leave application
query apply verb=POST {
  api_group = "LeaveRequests"
  auth = "user"

  input {
    text leave_type
    text reason
    text from_date
    text to_date
    file? attachment?
  }

  stack {
    // 1. RBAC Check
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "student"}
    } as $role_check
  
    // 2. Get and Validate User
    db.get user {
      field_name = "id"
      field_value = $auth.id
    } as $student
  
    precondition ($student != null) {
      error_type = "accessdenied"
      error = "Authenticated user not found in database."
    }
  
    precondition ($student.role == "student") {
      error_type = "accessdenied"
      error = "Only students can apply for leave. Your current role is: " ~ ($student.role|to_text)
    }
  
    // 3. Parse and Validate Dates
    // We use to_timestamp to handle various date formats (ISO, YYYY-MM-DD, etc.)
    var $start_ts {
      value = $input.from_date|to_timestamp
    }
  
    var $end_ts {
      value = $input.to_date|to_timestamp
    }
  
    precondition (($start_ts != null) && ($end_ts != null)) {
      error_type = "inputerror"
      error = "Invalid date format. Please provide dates in YYYY-MM-DD or ISO format."
    }
  
    precondition ($start_ts <= $end_ts) {
      error_type = "inputerror"
      error = "The 'from_date' cannot be after 'to_date'."
    }
  
    var $from_date_formatted {
      value = $start_ts|format_timestamp:"Y-m-d":"UTC"
    }
  
    var $to_date_formatted {
      value = $end_ts|format_timestamp:"Y-m-d":"UTC"
    }
  
    // 4. Calculate total days
    // Divide seconds by 86400 (seconds in a day) and add 1 for inclusive range
    var $total_days {
      value = ((($end_ts|to_seconds) - ($start_ts|to_seconds)) / 86400) + 1
    }
  
    // 5. Check overlapping active applications
    // A student cannot have two active leave applications overlapping on the same dates
    db.query leave_request {
      where = ($db.leave_request.student_id == $auth.id) && ($db.leave_request.final_status not in ["rejected_by_coordinator", "rejected_by_hod", "cancelled"]) && (($db.leave_request.from_date <= $to_date_formatted) && ($db.leave_request.to_date >= $from_date_formatted))
      return = {type: "exists"}
    } as $overlap_exists
  
    precondition (!$overlap_exists) {
      error_type = "inputerror"
      error = "You already have a pending or approved leave application overlapping with these dates."
    }
  
    // 6. Handle attachment
    var $attachment_meta {
      value = null
    }
  
    conditional {
      if ($input.attachment != null) {
        storage.create_attachment {
          value = $input.attachment
          access = "private"
          filename = $input.attachment.name
        } as $attachment_meta
      }
    }
  
    // 7. Create Leave Request
    db.add leave_request {
      data = {
        student_id        : $auth.id
        leave_type        : $input.leave_type
        reason            : $input.reason
        from_date         : $from_date_formatted
        to_date           : $to_date_formatted
        total_days        : $total_days
        attachment        : $attachment_meta
        coordinator_status: "pending"
        hod_status        : "pending"
        final_status      : "pending_coordinator"
        created_at        : now
      }
    } as $new_request
  
    // 8. Create Notification for the student
    db.add notification {
      data = {
        user_id         : $auth.id
        title           : "Leave Application Submitted"
        message         : "Your leave application for " ~ ($total_days|to_text) ~ " days has been submitted successfully."
        type            : "leave_submitted"
        related_leave_id: $new_request.id
        is_read         : false
        created_at      : now
      }
    } as $notif
  
    // 9. Audit Log entry
    db.add audit_log {
      data = {
        user_id    : $auth.id
        action     : "leave_application_submitted"
        entity_type: "leave_request"
        entity_id  : $new_request.id
        description: "Student submitted a new leave application."
        ip_address : $env.$remote_ip
        created_at : now
      }
    } as $audit
  }

  response = {
    success: true
    message: "Leave application submitted successfully"
    data   : $new_request
  }

  guid = "GkhEr9BlUiIR9IPEtiNfiW8z2TE"
}