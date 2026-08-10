// Logout the user and log the event
// Logout of the system
query logout verb=POST {
  api_group = "Auth"
  auth = "user"

  input {
  }

  stack {
    // Create audit log
    db.add audit_log {
      data = {
        user_id    : $auth.id
        action     : "logout"
        entity_type: "user"
        entity_id  : $auth.id
        description: "User logged out"
        ip_address : $env.$remote_ip
        created_at : now
      }
    } as $audit_log_entry
  }

  response = {success: true, message: "Logout successful"}
  guid = "H8QNBAzWiOlGfc4VqMuF_9N_rfE"
}