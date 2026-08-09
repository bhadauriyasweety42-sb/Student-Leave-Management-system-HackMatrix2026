'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FileText, LogOut, CheckCircle2, XCircle, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function HODDashboard() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [comment, setComment] = useState('')
  const [action, setAction] = useState<'approve' | 'reject'>('approve')

  useEffect(() => {
    const user = localStorage.getItem('currentUser')
    if (!user || JSON.parse(user).role !== 'hod') {
      router.push('/auth/login')
      return
    }

    setCurrentUser(JSON.parse(user))

    // Fetch coordinator approved requests
    const savedRequests = localStorage.getItem('leaveRequests')
    if (savedRequests) {
      const allRequests = JSON.parse(savedRequests)
      const approvedByCoordinator = allRequests.filter((req: any) => req.status === 'coordinator_approved')
      setRequests(approvedByCoordinator)
    }

    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    router.push('/auth/login')
  }

  const handleApproval = () => {
    if (!selectedRequest) return

    const savedRequests = localStorage.getItem('leaveRequests') || '[]'
    const allRequests = JSON.parse(savedRequests)

    const updatedRequests = allRequests.map((req: any) => {
      if (req.id === selectedRequest.id) {
        return {
          ...req,
          status: action === 'approve' ? 'hod_approved' : 'rejected',
          hodApproval: {
            decision: action,
            comments: comment,
            timestamp: new Date().toISOString(),
            hodEmail: currentUser.email,
          },
        }
      }
      return req
    })

    localStorage.setItem('leaveRequests', JSON.stringify(updatedRequests))

    // Remove from pending
    setRequests(requests.filter(r => r.id !== selectedRequest.id))
    setSelectedRequest(null)
    setComment('')
    setAction('approve')
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Head of Department Dashboard</h2>
          <p className="text-gray-600">Final authorization of student leave requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Awaiting Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{requests.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">0</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">0</div>
            </CardContent>
          </Card>
        </div>

        {/* Coordinator Approved Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Coordinator Approved Requests</CardTitle>
            <CardDescription>Requests approved by coordinators awaiting your final approval</CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">No requests awaiting approval</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{request.studentName}</h4>
                        <p className="text-sm text-gray-600">{request.studentEmail}</p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                        {request.numberOfDays} days
                      </span>
                    </div>

                    <div className="mb-4 p-3 bg-gray-50 rounded">
                      <p className="text-sm font-semibold text-gray-900 mb-1">Reason</p>
                      <p className="text-sm text-gray-600">{request.reason}</p>
                    </div>

                    {request.coordinatorApproval && (
                      <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm font-semibold text-gray-900 mb-1">Coordinator's Comments</p>
                        <p className="text-sm text-gray-600">{request.coordinatorApproval.comments || 'No comments'}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-600">Start Date</p>
                        <p className="font-semibold">{new Date(request.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">End Date</p>
                        <p className="font-semibold">{new Date(request.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setSelectedRequest(request)}
                        >
                          Make Final Decision
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Final Authorization</DialogTitle>
                          <DialogDescription>
                            {selectedRequest?.studentName} - {selectedRequest?.numberOfDays} days
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div>
                            <Label className="text-gray-600">Reason</Label>
                            <p className="font-semibold">{selectedRequest?.reason}</p>
                          </div>

                          <div>
                            <Label className="text-gray-600">Coordinator's Comments</Label>
                            <p className="font-semibold text-sm">
                              {selectedRequest?.coordinatorApproval?.comments || 'No comments'}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-gray-600">Start Date</Label>
                              <p className="font-semibold">
                                {selectedRequest && new Date(selectedRequest.startDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <Label className="text-gray-600">End Date</Label>
                              <p className="font-semibold">
                                {selectedRequest && new Date(selectedRequest.endDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="hod-comment">Your Comments</Label>
                            <Input
                              id="hod-comment"
                              placeholder="Add comments for the student..."
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              className="h-24 align-top"
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setAction('approve')
                                handleApproval()
                              }}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => {
                                setAction('reject')
                                handleApproval()
                              }}
                              variant="destructive"
                              className="flex-1 flex items-center gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
