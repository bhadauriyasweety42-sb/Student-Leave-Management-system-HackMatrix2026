// Student dashboard overview
// Get overview for student dashboard
query student verb=GET {
  api_group = "Dashboard"
  auth = "user"

  input {
  }

  stack {
    // 1. RBAC
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "student"}
    }
  
    // 2. Summary stats
    db.query leave_request {
      where = ($db.leave_request.student_id == $auth.id) && ($db.leave_request.final_status == "pending_coordinator" || $db.leave_request.final_status == "pending_hod")
      return = {type: "count"}
    } as $pending_count
  
    db.query leave_request {
      where = ($db.leave_request.student_id == $auth.id) && ($db.leave_request.final_status == "approved")
      return = {type: "count"}
    } as $approved_count
  
    db.query leave_request {
      where = ($db.leave_request.student_id == $auth.id) && ($db.leave_request.final_status includes "rejected")
      return = {type: "count"}
    } as $rejected_count
  
    // 3. Recent requests
    db.query leave_request {
      where = $db.leave_request.student_id == $auth.id
      sort = {created_at: "desc"}
      return = {type: "list", paging: {page: 1, per_page: 5}}
    } as $recent_requests
  
    // 4. Notifications
    db.query notification {
      where = ($db.notification.user_id == $auth.id) && ($db.notification.is_read == false)
      sort = {created_at: "desc"}
      return = {type: "list", paging: {page: 1, per_page: 5}}
    } as $notifications
  }

  response = {
    success: true
    data   : ```
      {
        stats: {
          pending: $pending_count,
          approved: $approved_count,
          rejected: $rejected_count
        },
        recent_requests: $recent_requests,
        notifications: $notifications
      }
      ```
  }

  guid = "_6O41aRL7JtkdtaXd1d9SQGpQMo"
}