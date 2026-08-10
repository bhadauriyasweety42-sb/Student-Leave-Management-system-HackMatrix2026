// Update own profile
query me verb=PATCH {
  api_group = "Users"
  auth = "user"

  input {
    text? full_name
    text? designation
    text? phone
    file? profile_image
  }

  stack {
    var $updates {
      value = {updated_at: now}
    }
  
    conditional {
      if ($input.full_name != null) {
        var.update $updates {
          value = $updates|set:"full_name":$input.full_name
        }
      }
    }
  
    conditional {
      if ($input.designation != null) {
        var.update $updates {
          value = $updates
            |set:"designation":$input.designation
        }
      }
    }
  
    conditional {
      if ($input.phone != null) {
        var.update $updates {
          value = $updates|set:"phone":$input.phone
        }
      }
    }
  
    // Profile image
    conditional {
      if ($input.profile_image != null) {
        storage.create_attachment {
          value = $input.profile_image
          access = "public"
          filename = $input.profile_image.name
        } as $img
      
        var.update $updates {
          value = $updates|set:"profile_image":$img
        }
      }
    }
  
    db.patch user {
      field_name = "id"
      field_value = $auth.id
      data = $updates
    } as $updated_user
  }

  response = {
    success: true
    message: "Profile updated"
    data   : $updated_user
  }

  guid = "QahNIlUmKUtZUqU8Bin781U5lRo"
}