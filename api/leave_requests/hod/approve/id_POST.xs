// HOD finalizes approval of a student's leave application
// HOD reviews and approves leave application
query "hod/approve/{id}" verb=POST {
  api_group = "LeaveRequests"
  auth = "user"

  input {
    int id
    text hod_remark?
  }

  stack {
    // 1. RBAC
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "hod"}
    } as $role_check
  
    // 2. Get Request and validate scope
    db.get leave_request {
      field_name = "id"
      field_value = $input.id
    } as $request
  
    precondition ($request != null) {
      error_type = "notfound"
      error = "Application not found"
    }
  
    precondition ($request.coordinator_status == "approved") {
      error_type = "inputerror"
      error = "Coordinator approval required before HOD review"
    }
  
    precondition ($request.hod_status == "pending") {
      error_type = "inputerror"
      error = "Application already reviewed by HOD"
    }
  
    db.get user {
      field_name = "id"
      field_value = $auth.id
    } as $hod
  
    db.get user {
      field_name = "id"
      field_value = $request.student_id
    } as $student
  
    precondition ($hod.department_id == $student.department_id) {
      error_type = "accessdenied"
      error = "You can only approve applications for your department"
    }
  
    // 3. Update Request
    db.edit leave_request {
      field_name = "id"
      field_value = $input.id
      data = {
        hod_status  : "approved"
        hod_remark  : $input.hod_remark
        final_status: "approved"
        updated_at  : now
      }
    } as $updated_request
  
    // 4. Notify Student
    db.add notification {
      data = {
        user_id         : $student.id
        title           : "Leave Approved by HOD"
        message         : "Congratulations! Your leave application has been fully approved by the HOD."
        type            : "leave_approved"
        related_leave_id: $request.id
        is_read         : false
        created_at      : now
      }
    } as $notif
  
    // 5. Audit Log
    db.add audit_log {
      data = {
        user_id    : $auth.id
        action     : "hod_approval"
        entity_type: "leave_request"
        entity_id  : $request.id
        description: "HOD approved application for student " ~ ($student.name|to_text)
        ip_address : $env.$remote_ip
        created_at : now
      }
    } as $audit
  }

  response = {
    success: true
    message: "Application fully approved"
    data   : $updated_request
  }

  guid = "4OdlCzRtB9qEeyeHGBp41Ic1lh0"
}