'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FileText, LogOut, Plus, CheckCircle2, Clock, XCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function StudentDashboard() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [studentData, setStudentData] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newRequest, setNewRequest] = useState({
    reason: '',
    numberOfDays: '',
    startDate: '',
    endDate: '',
  })
  const [showNewRequest, setShowNewRequest] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem('currentUser')
    if (!user || JSON.parse(user).role !== 'student') {
      router.push('/auth/login')
      return
    }

    setCurrentUser(JSON.parse(user))

    // Fetch student data
    const userData = localStorage.getItem(JSON.parse(user).email)
    if (userData) {
      setStudentData(JSON.parse(userData))
    }

    // Fetch requests
    const savedRequests = localStorage.getItem('leaveRequests')
    if (savedRequests) {
      const allRequests = JSON.parse(savedRequests)
      const userRequests = allRequests.filter((req: any) => req.studentEmail === JSON.parse(user).email)
      setRequests(userRequests)
    }

    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    router.push('/auth/login')
  }

  const handleNewRequest = (e: React.FormEvent) => {
    e.preventDefault()

    const request = {
      id: Date.now().toString(),
      studentEmail: currentUser.email,
      studentName: studentData?.fullName,
      reason: newRequest.reason,
      numberOfDays: parseInt(newRequest.numberOfDays),
      startDate: newRequest.startDate,
      endDate: newRequest.endDate,
      status: 'pending',
      createdAt: new Date().toISOString(),
      coordinatorApproval: null,
      hodApproval: null,
    }

    const savedRequests = localStorage.getItem('leaveRequests') || '[]'
    const allRequests = JSON.parse(savedRequests)
    allRequests.push(request)
    localStorage.setItem('leaveRequests', JSON.stringify(allRequests))

    setRequests([...requests, request])
    setNewRequest({ reason: '', numberOfDays: '', startDate: '', endDate: '' })
    setShowNewRequest(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hod_approved':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'coordinator_approved':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-blue-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hod_approved':
        return 'bg-green-50 border-green-200'
      case 'coordinator_approved':
        return 'bg-yellow-50 border-yellow-200'
      case 'rejected':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">LeaveHub</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold">
              <ArrowLeft className="w-5 h-5" />
              Home
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {studentData?.fullName || 'Student'}</h2>
          <p className="text-gray-600">Manage and track your leave requests here</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{requests.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {requests.filter(r => r.status === 'pending').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Coordinator Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {requests.filter(r => r.status === 'coordinator_approved').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">HOD Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {requests.filter(r => r.status === 'hod_approved').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">Leave Requests</h3>
              <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Request
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Submit a Leave Request</DialogTitle>
                    <DialogDescription>Fill in the details of your leave request</DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleNewRequest} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason for Leave *</Label>
                      <Input
                        id="reason"
                        placeholder="Medical, Family emergency, etc."
                        value={newRequest.reason}
                        onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numberOfDays">Number of Days *</Label>
                      <Input
                        id="numberOfDays"
                        type="number"
                        min="1"
                        placeholder="5"
                        value={newRequest.numberOfDays}
                        onChange={(e) => setNewRequest({ ...newRequest, numberOfDays: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newRequest.startDate}
                        onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newRequest.endDate}
                        onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Submit Request
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {requests.length === 0 ? (
              <Card className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No leave requests yet</p>
                <Button
                  onClick={() => setShowNewRequest(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create Your First Request
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <Card key={request.id} className={`border ${getStatusColor(request.status)}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(request.status)}
                            <CardTitle className="text-lg capitalize">
                              {request.status.replace('_', ' ')}
                            </CardTitle>
                          </div>
                          <CardDescription>{request.reason}</CardDescription>
                        </div>
                        <span className="text-sm font-semibold text-gray-600">
                          {request.numberOfDays} days
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Start Date</p>
                          <p className="font-semibold">{new Date(request.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">End Date</p>
                          <p className="font-semibold">{new Date(request.endDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Submitted</p>
                          <p className="font-semibold">{new Date(request.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Student Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Full Name</Label>
                    <p className="font-semibold">{studentData?.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Email</Label>
                    <p className="font-semibold">{studentData?.email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Roll Number</Label>
                    <p className="font-semibold">{studentData?.rollNumber}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Phone Number</Label>
                    <p className="font-semibold">{studentData?.phoneNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Department</Label>
                    <p className="font-semibold">{studentData?.department}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Academic Year</Label>
                    <p className="font-semibold">{studentData?.academicYear}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Semester</Label>
                    <p className="font-semibold">{studentData?.semester}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">College</Label>
                    <p className="font-semibold">{studentData?.collegeName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
