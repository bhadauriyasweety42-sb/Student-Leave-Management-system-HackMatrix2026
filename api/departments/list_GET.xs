// List all departments
query list verb=GET {
  api_group = "Departments"
  auth = "user"

  input {
  }

  stack {
    db.query department {
      return = {type: "list"}
    } as $departments
  }

  response = {success: true, data: $departments}
  guid = "xLGCjb8RIP3Qw5O7BxrzYHDdyMc"
}