// List all active leave types
query list verb=GET {
  api_group = "LeaveTypes"
  auth = "user"

  input {
  }

  stack {
    db.query leave_type {
      where = $db.leave_type.is_active == true
      return = {type: "list"}
    } as $types
  }

  response = {success: true, data: $types}
  guid = "4zeeTYhNyMa3oJEWoSgb7F0GZcs"
}