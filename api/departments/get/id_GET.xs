// Get a department by ID
query "get/{id}" verb=GET {
  api_group = "Departments"
  auth = "user"

  input {
    int id
  }

  stack {
    db.get department {
      field_name = "id"
      field_value = $input.id
    } as $dept
  
    precondition ($dept != null) {
      error_type = "notfound"
      error = "Department not found"
    }
  }

  response = {success: true, data: $dept}
  guid = "MSH1RyJKP1vtAfLYm0SH6CrtfUc"
}