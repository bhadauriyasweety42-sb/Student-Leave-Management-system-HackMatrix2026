// Seed college demo data
// Initialize the system with college departments, branches, and users
function "utils/seed_data" {
  input {
  }

  stack {
    // 1. Create Department
    db.add_or_edit department {
      field_name = "code"
      field_value = "CS"
      data = {
        name      : "Computer Science"
        code      : "CS"
        created_at: now
      }
    } as $dept
  
    // 2. Create Branch
    db.add_or_edit branch {
      field_name = "code"
      field_value = "CSE"
      data = {
        department_id: $dept.id
        name         : "Computer Science & Engineering"
        code         : "CSE"
        created_at   : now
      }
    } as $branch_rec
  
    // 3. Create Section
    db.query section {
      where = ($db.section.branch_id == $branch_rec.id) && ($db.section.name == "Section A")
      return = {type: "single"}
    } as $section
  
    conditional {
      if ($section == null) {
        db.add section {
          data = {
            branch_id : $branch_rec.id
            name      : "Section A"
            created_at: now
          }
        } as $section
      }
    }
  
    // 4. Create Users
    // HOD
    db.add_or_edit user {
      field_name = "email"
      field_value = "hod@college.edu"
      data = {
        name         : "Dr. Smith (HOD)"
        email        : "hod@college.edu"
        password     : "Password123"
        role         : "hod"
        department_id: $dept.id
        is_active    : true
        created_at   : now
      }
    } as $hod
  
    // Coordinator
    db.add_or_edit user {
      field_name = "email"
      field_value = "coordinator@college.edu"
      data = {
        name         : "Prof. Johnson (Coordinator)"
        email        : "coordinator@college.edu"
        password     : "Password123"
        role         : "coordinator"
        department_id: $dept.id
        branch_id    : $branch_rec.id
        section_id   : $section.id
        is_active    : true
        created_at   : now
      }
    } as $coord
  
    // Student
    db.add_or_edit user {
      field_name = "email"
      field_value = "student@college.edu"
      data = {
        name         : "John Doe (Student)"
        email        : "student@college.edu"
        password     : "Password123"
        role         : "student"
        roll_number  : "CS2025001"
        department_id: $dept.id
        branch_id    : $branch_rec.id
        section_id   : $section.id
        is_active    : true
        created_at   : now
      }
    } as $student
  }

  response = "College demo data seeded successfully"
  guid = "Pdxu7lVdPxn94ywezPfmspNojhI"
}