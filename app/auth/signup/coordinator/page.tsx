'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, ArrowLeft } from 'lucide-react'

export default function CoordinatorSignUp() {
  const router = useRouter()
  const departmentBranches: Record<string, string[]> = {
    AI: ['AIR', 'AIEML', 'AIDS', 'AI'],
    IoT: ['EAC', 'IoT'],
    CST: ['CST', 'CSBS'],
    CSE: ['CSE', 'CSD'],
    'Electronics & Communication': ['Electronics', 'Telecommunication'],
    'Civil Engineering': ['Civil Engineering'],
    'Mechanical Engineering': ['Mechanical Engineering'],
    'Electrical Engineering': ['Electrical Engineering'],
    IT: ['IT'],
    'Engineering Mathematics & Computing (MAC)': ['Engineering Mathematics & Computing (MAC)'],
    'Chemical Engineering': ['Chemical Engineering'],
  }

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    department: '',
    branch: '',
  })

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
      if (!formData.fullName || !formData.password || !formData.department) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      const selectedBranches = departmentBranches[formData.department] || []
      if (!formData.branch) {
        setError('Please select a branch for your department')
        setLoading(false)
        return
      }

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

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Save coordinator data to localStorage
      localStorage.setItem(formData.email, JSON.stringify({
        ...formData,
        role: 'coordinator'
      }))

      setSuccess(true)
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } catch (err) {
      setError('An error occurred. Please try again.')
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
            <p>Your coordinator account has been created successfully. Redirecting to login...</p>
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

      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">LeaveHub</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Class Coordinator Registration</h1>
            <p className="text-gray-600">Use your MITS college email to register</p>
          </div>

          <Card className="border-green-200 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-green-900">Create Coordinator Account</CardTitle>
            </CardHeader>
            <CardContent>
              {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="ENTER YOUR FULL NAME"
                    value={formData.fullName}
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
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="ENTER STRONG PASSWORD"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-gray-500">Min 8 chars, must include letters, number & special character (!@#$%^&*)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="ENTER YOUR PHONE NUMBER"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => handleSelectChange('department', value)}>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="SELECT YOUR DEPARTMENT" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AI">AI</SelectItem>
                      <SelectItem value="IoT">IoT</SelectItem>
                      <SelectItem value="CST">CST</SelectItem>
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
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-400 hover:bg-green-500 text-white"
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