// Mark a notification as read
query "read/{id}" verb=PATCH {
  api_group = "Notifications"
  auth = "user"

  input {
    int id
  }

  stack {
    db.get notification {
      field_name = "id"
      field_value = $input.id
    } as $notif
  
    precondition ($notif != null) {
      error_type = "notfound"
      error = "Notification not found"
    }
  
    precondition ($notif.user_id == $auth.id) {
      error_type = "accessdenied"
      error = "Unauthorized"
    }
  
    db.edit notification {
      field_name = "id"
      field_value = $input.id
      data = {is_read: true}
    } as $updated
  }

  response = {success: true, message: "Notification marked as read"}
  guid = "C449ExKKbDYoYF18XeE6NChvMs0"
}