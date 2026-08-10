// Student views own leave applications
// Get authenticated student's leave applications
query me verb=GET {
  api_group = "LeaveRequests"
  auth = "user"

  input {
    int page?=1
    int per_page?=10
    text? status
  }

  stack {
    db.query leave_request {
      where = ($db.leave_request.student_id == $auth.id) && ($db.leave_request.final_status ==? $input.status)
      sort = {created_at: "desc"}
      return = {
        type  : "list"
        paging: {
          page    : $input.page
          per_page: $input.per_page
          totals  : true
        }
      }
    } as $requests
  }

  response = {success: true, data: $requests}
  guid = "bJ7-kgRtbyJs2Y4eHdKIj_6clTY"
}