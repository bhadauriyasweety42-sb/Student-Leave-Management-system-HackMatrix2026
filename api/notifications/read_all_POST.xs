// Mark all notifications as read
query "read-all" verb=POST {
  api_group = "Notifications"
  auth = "user"

  input {
  }

  stack {
    db.query notification {
      where = ($db.notification.user_id == $auth.id) && ($db.notification.is_read == false)
      return = {type: "list"}
    } as $unread
  
    foreach ($unread) {
      each as $notif {
        db.edit notification {
          field_name = "id"
          field_value = $notif.id
          data = {is_read: true}
        }
      }
    }
  
    var $count {
      value = $unread|count
    }
  }

  response = {
    success: true
    message: "All notifications marked as read"
    count  : $count
  }

  guid = "wmVwVyPLACvZ0P9PUVgyDeukiBs"
}