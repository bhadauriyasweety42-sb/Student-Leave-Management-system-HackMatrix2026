-- Create students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roll_number VARCHAR(50) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  semester VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create coordinators table
CREATE TABLE IF NOT EXISTS public.coordinators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create hods table
CREATE TABLE IF NOT EXISTS public.hods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create leave_requests table
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  number_of_days INTEGER NOT NULL CHECK (number_of_days > 0),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'coordinator_approved', 'hod_approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create coordinator_approvals table
CREATE TABLE IF NOT EXISTS public.coordinator_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_request_id UUID NOT NULL UNIQUE REFERENCES public.leave_requests(id) ON DELETE CASCADE,
  coordinator_id UUID NOT NULL REFERENCES public.coordinators(id) ON DELETE CASCADE,
  approval_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create hod_approvals table
CREATE TABLE IF NOT EXISTS public.hod_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_request_id UUID NOT NULL UNIQUE REFERENCES public.leave_requests(id) ON DELETE CASCADE,
  hod_id UUID NOT NULL REFERENCES public.hods(id) ON DELETE CASCADE,
  approval_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coordinators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coordinator_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hod_approvals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Students can view their own records
CREATE POLICY "students_select_own" ON public.students FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "students_insert_own" ON public.students FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "students_update_own" ON public.students FOR UPDATE USING (auth.uid() = user_id);

-- Coordinators can view their own records
CREATE POLICY "coordinators_select_own" ON public.coordinators FOR SELECT USING (auth.uid() = user_id);

-- HODs can view their own records
CREATE POLICY "hods_select_own" ON public.hods FOR SELECT USING (auth.uid() = user_id);

-- Leave requests - students can view/create their own
CREATE POLICY "leave_requests_select_own" ON public.leave_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.students WHERE students.id = leave_requests.student_id AND students.user_id = auth.uid())
);
CREATE POLICY "leave_requests_insert_own" ON public.leave_requests FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.students WHERE students.id = leave_requests.student_id AND students.user_id = auth.uid())
);

-- Coordinator approvals
CREATE POLICY "coordinator_approvals_select" ON public.coordinator_approvals FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.coordinators WHERE coordinators.id = coordinator_approvals.coordinator_id AND coordinators.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.leave_requests lr JOIN public.students s ON s.id = lr.student_id WHERE lr.id = coordinator_approvals.leave_request_id AND s.user_id = auth.uid())
);

-- HOD approvals
CREATE POLICY "hod_approvals_select" ON public.hod_approvals FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.hods WHERE hods.id = hod_approvals.hod_id AND hods.user_id = auth.uid())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_roll_number ON public.students(roll_number);
CREATE INDEX IF NOT EXISTS idx_coordinators_user_id ON public.coordinators(user_id);
CREATE INDEX IF NOT EXISTS idx_hods_user_id ON public.hods(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_student_id ON public.leave_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_coordinator_approvals_coordinator_id ON public.coordinator_approvals(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_hod_approvals_hod_id ON public.hod_approvals(hod_id);
