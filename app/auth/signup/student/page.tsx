'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { xanoFetch, setAuthToken } from '@/lib/xano'

export default function StudentSignUp() {
  const router = useRouter()
  const departmentBranches: Record<string, string[]> = {
    AI: ['AIR', 'AIEML', 'AIDS', 'AI'],
    'Artificial Intelligence': ['AIR', 'AIEML', 'AIDS', 'AI'],
    IoT: ['EAC', 'IoT'],
    CST: ['CST', 'CSBS'],
    'Computer Science and Technology': ['CST', 'CSBS'],
    CSE: ['CSE', 'CSD'],
    'Electronics & Communication': ['Electronics', 'Telecommunication'],
    'Electronics Engineering': ['Electronics', 'Telecommunication'],
    'Civil Engineering': ['Civil Engineering'],
    'Mechanical Engineering': ['Mechanical Engineering'],
    'Electrical Engineering': ['Electrical Engineering'],
    IT: ['IT'],
    'Engineering Mathematics & Computing (MAC)': ['Engineering Mathematics & Computing (MAC)'],
    'Chemical Engineering': ['Chemical Engineering'],
  }

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
<<<<<<< HEAD
    roll_number: '',
    department_id: '',
    branch_id: '',
    section_id: '',
=======
    phoneNumber: '',
    rollNumber: '',
    department: '',
    branch: '',
    academicYear: '',
    semester: '',
>>>>>>> origin/main
  })
  const [showPassword, setShowPassword] = useState(false)

  const branchOptions = departmentBranches[formData.department] ?? []

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => {
      if (name === 'department') {
        return { ...prev, department: value, branch: '' }
      }
      return { ...prev, [name]: value }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate college email
      if (!formData.email.endsWith('@mitsgwl.ac.in')) {
        setError('Please use your MITS college email address (must end with @mitsgwl.ac.in)')
        setLoading(false)
        return
      }

      // Validate all fields
<<<<<<< HEAD
      if (!formData.name || !formData.password || !formData.roll_number || !formData.department_id || !formData.branch_id || !formData.section_id) {
=======
      if (!formData.fullName || !formData.password || !formData.rollNumber || !formData.department || !formData.branch || !formData.academicYear || !formData.semester) {
>>>>>>> origin/main
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      const selectedBranches = departmentBranches[formData.department] || []
      if (!selectedBranches.includes(formData.branch)) {
        setError('Please select a valid branch for your department')
        setLoading(false)
        return
      }

      // Validate password
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
      if (!passwordRegex.test(formData.password)) {
        setError('Password must be at least 8 characters long and contain letters, numbers, and a special character (!@#$%^&*)')
        setLoading(false)
        return
      }

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'student',
        roll_number: formData.roll_number,
        department_id: Number(formData.department_id),
        branch_id: Number(formData.branch_id),
        section_id: Number(formData.section_id),
      }

      const response: any = await xanoFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, 'auth')

      const parsedResponse = typeof response === 'string'
        ? (() => {
            try { return JSON.parse(response) } catch { return null }
          })()
        : response

      const authToken = parsedResponse?.authToken
        ?? parsedResponse?.data?.authToken
        ?? parsedResponse?.token
        ?? parsedResponse?.data?.token
        ?? parsedResponse?.access_token
        ?? parsedResponse?.data?.access_token

      if (authToken) {
        setAuthToken(authToken)
        const profile: any = await xanoFetch('/auth/me', { method: 'GET' }, 'auth')
        if (profile?.role === 'student') {
          router.push('/dashboard/student')
          return
        }
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } catch (err: any) {
      setError(err?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-green-200">
          <CardHeader className="text-center">
            <div className="text-5xl mb-4">✓</div>
            <CardTitle className="text-green-600">Account Created!</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-gray-600">
            <p>Your student account has been created successfully. Redirecting to login...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      {/* Back Button in Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <Link href="/auth/signup" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 bg-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Role Selection</span>
        </Link>
      </div>

      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">LeaveHub</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Registration</h1>
            <p className="text-gray-600">Use your MITS college email to register</p>
          </div>

          <Card className="border-purple-200 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-purple-900">Create Student Account</CardTitle>
            </CardHeader>
            <CardContent>
              {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="ENTER YOUR FULL NAME"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">College Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ENTER YOUR COLLEGE EMAIL ADDRESS"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-gray-500">Must end with @mitsgwl.ac.in</p>
                </div>

               <div className="space-y-2">
  <Label htmlFor="password">Password *</Label>

  <div className="relative">
    <Input
      id="password"
      name="password"
      type={showPassword ? "text" : "password"}
      placeholder="ENTER STRONG PASSWORD"
      value={formData.password}
      onChange={handleChange}
      required
      className="pr-10"
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
    >
      {showPassword ? (
        <EyeOff className="h-5 w-5" />
      ) : (
        <Eye className="h-5 w-5" />
      )}
    </button>
  </div>

  <p className="text-xs text-gray-500">
    Min 8 chars, must include letters, number & special character (!@#$%^&*)
  </p>
</div>
                <div className="space-y-2">
                  <Label htmlFor="roll_number">Roll Number *</Label>
                  <Input
                    id="roll_number"
                    name="roll_number"
                    type="text"
                    placeholder="ENTER YOUR ROLL NUMBER"
                    value={formData.roll_number}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department_id">Department *</Label>
                  <Select value={formData.department_id} onValueChange={(value) => handleSelectChange('department_id', value)}>
                    <SelectTrigger id="department_id">
                      <SelectValue placeholder="SELECT YOUR DEPARTMENT" />
                    </SelectTrigger>
                    <SelectContent>
<<<<<<< HEAD
                      <SelectItem value="1">Computer Science and Technology</SelectItem>
                      <SelectItem value="2">Artificial Intelligence</SelectItem>
                      <SelectItem value="3">Electrical Engineering</SelectItem>
                      <SelectItem value="4">Mechanical Engineering</SelectItem>
                      <SelectItem value="5">Civil Engineering</SelectItem>
                      <SelectItem value="6">Electronics Engineering</SelectItem>
=======
                      <SelectItem value="AI">AI</SelectItem>
                      <SelectItem value="Artificial Intelligence">Artificial Intelligence</SelectItem>
                      <SelectItem value="IoT">IoT</SelectItem>
                      <SelectItem value="CST">CST</SelectItem>
                      <SelectItem value="Computer Science and Technology">Computer Science and Technology</SelectItem>
                      <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                      <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                      <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                      <SelectItem value="CSE">CSE</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Electronics & Communication">Electronics & Communication</SelectItem>
                      <SelectItem value="Engineering Mathematics & Computing (MAC)">Engineering Mathematics & Computing (MAC)</SelectItem>
                      <SelectItem value="Chemical Engineering">Chemical Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Branch *</Label>
                  <Select
                    value={formData.branch}
                    onValueChange={(value) => handleSelectChange('branch', value)}
                  >
                    <SelectTrigger
                      id="branch"
                      disabled={!formData.department || branchOptions.length === 0}
                    >
                      <SelectValue placeholder="SELECT YOUR BRANCH" />
                    </SelectTrigger>
                    <SelectContent>
                      {branchOptions.map(branch => (
                        <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                      ))}
>>>>>>> origin/main
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch_id">Branch *</Label>
                  <Select value={formData.branch_id} onValueChange={(value) => handleSelectChange('branch_id', value)}>
                    <SelectTrigger id="branch_id">
                      <SelectValue placeholder="SELECT YOUR BRANCH" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Computer Science</SelectItem>
                      <SelectItem value="2">Artificial Intelligence</SelectItem>
                      <SelectItem value="3">Electrical</SelectItem>
                      <SelectItem value="4">Mechanical</SelectItem>
                      <SelectItem value="5">Civil</SelectItem>
                      <SelectItem value="6">Electronics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section_id">Section *</Label>
                  <Select value={formData.section_id} onValueChange={(value) => handleSelectChange('section_id', value)}>
                    <SelectTrigger id="section_id">
                      <SelectValue placeholder="SELECT YOUR SECTION" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">A</SelectItem>
                      <SelectItem value="2">B</SelectItem>
                      <SelectItem value="3">C</SelectItem>
                      <SelectItem value="4">D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-purple-400 hover:bg-purple-500 text-white"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">Already have an account? <Link href="/auth/login" className="text-purple-600 hover:underline font-semibold">Sign In</Link></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
