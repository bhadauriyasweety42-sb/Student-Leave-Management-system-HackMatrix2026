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

export default function CoordinatorDashboard() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [historyRequests, setHistoryRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [selectedHistoryRequest, setSelectedHistoryRequest] = useState<any>(null)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [comment, setComment] = useState('')
  const [rejectionError, setRejectionError] = useState('')
  const [action, setAction] = useState<'approve' | 'reject'>('approve')

  useEffect(() => {
    const user = localStorage.getItem('currentUser')
    if (!user || JSON.parse(user).role !== 'coordinator') {
      router.push('/auth/login')
      return
    }

    const parsedUser = JSON.parse(user)
    setCurrentUser(parsedUser)

    // Fetch relevant requests for this coordinator
    const savedRequests = localStorage.getItem('leaveRequests')
    if (savedRequests) {
      const allRequests = JSON.parse(savedRequests)
      const relevantRequests = allRequests.filter((req: any) => {
        const studentProfile = localStorage.getItem(req.studentEmail)
        if (!studentProfile) return false
        const studentData = JSON.parse(studentProfile)
        return (
          studentData.department === parsedUser.department &&
          studentData.branch === parsedUser.branch
        )
      })
      setHistoryRequests(relevantRequests)
      const pendingRequests = relevantRequests.filter((req: any) => req.status === 'pending')
      setRequests(pendingRequests)
    }

    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    router.push('/auth/login')
  }

  const handleApproval = () => {
    if (!selectedRequest) return
    // If rejecting, ensure a remark is provided
    if (action === 'reject' && comment.trim() === '') {
      setRejectionError('Please provide a rejection remark before rejecting.')
      return
    }
    setRejectionError('')

    const savedRequests = localStorage.getItem('leaveRequests') || '[]'
    const allRequests = JSON.parse(savedRequests)

    const updatedRequests = allRequests.map((req: any) => {
      if (req.id === selectedRequest.id) {
        return {
          ...req,
          status: action === 'approve' ? 'coordinator_approved' : 'rejected',
          coordinatorApproval: {
            decision: action,
            comments: comment,
            timestamp: new Date().toISOString(),
            coordinatorEmail: currentUser.email,
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

  const handleDecision = (decision: 'approve' | 'reject') => {
    setAction(decision)
    if (decision === 'reject' && comment.trim() === '') {
      setRejectionError('Please provide a rejection remark before rejecting.')
      return
    }
    setRejectionError('')
    handleApproval()
  }

  const getRequestStatusLabel = (request: any) => {
    if (request.status === 'hod_approved') return 'Approved'
    if (request.status === 'coordinator_approved') return 'Pending HOD Approval'
    if (request.status === 'pending') return 'Pending'
    if (request.status === 'rejected') return 'Rejected'
    return 'Pending'
  }

  const getTimelineDot = (state: 'completed' | 'current' | 'rejected' | 'pending' | 'not_reached') => {
    switch (state) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'current':
      case 'pending':
        return <Clock className="w-4 h-4 text-blue-600" />
      default:
        return <span className="block w-3 h-3 rounded-full border border-gray-300 bg-white" />
    }
  }

  const getTimelineState = (request: any) => {
    type TimelineState = 'completed' | 'current' | 'rejected' | 'pending' | 'not_reached'
    const coordinatorDecision = request.coordinatorApproval?.decision as string | undefined
    const hodDecision = request.hodApproval?.decision as string | undefined

    const coordinatorState: TimelineState = coordinatorDecision === 'reject'
      ? 'rejected'
      : coordinatorDecision === 'approve'
      ? 'completed'
      : 'current'

    const hodReviewState: TimelineState = coordinatorDecision === 'approve'
      ? request.hodApproval
        ? 'completed'
        : 'current'
      : 'not_reached'

    const hodDecisionState: TimelineState = coordinatorDecision === 'approve'
      ? request.hodApproval
        ? hodDecision === 'approve'
          ? 'completed'
          : 'rejected'
        : 'pending'
      : 'not_reached'

    const finalState: TimelineState = request.status === 'hod_approved'
      ? 'completed'
      : request.status === 'rejected'
      ? 'rejected'
      : 'current'

    return { coordinatorState, hodReviewState, hodDecisionState, finalState }
  }

  const getFilteredHistoryRequests = () => {
    return historyRequests.filter((request) => {
      if (historyStatusFilter === 'all') return true
      if (historyStatusFilter === 'pending') return request.status === 'pending' || request.status === 'coordinator_approved'
      if (historyStatusFilter === 'approved') return request.status === 'hod_approved'
      if (historyStatusFilter === 'rejected') return request.status === 'rejected'
      return true
    })
  }

  const filteredHistoryRequests = getFilteredHistoryRequests()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-card border-b border-purple-200 dark:border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">LeaveHub</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold">
              <ArrowLeft className="w-5 h-5" />
              Home
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 dark:text-muted-foreground dark:hover:text-foreground font-semibold"
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-2">Coordinator Dashboard</h2>
          <p className="text-gray-600 dark:text-muted-foreground">Review and approve student leave requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{requests.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Processed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">0</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Approved This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">0</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="history">Request History</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-foreground">Pending Leave Requests</CardTitle>
                <CardDescription className="dark:text-muted-foreground">Student requests awaiting your approval</CardDescription>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-muted-foreground">No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <div key={request.id} className="border border-gray-200 dark:border-border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-card transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-foreground">{request.studentName}</h4>
                            <p className="text-sm text-gray-600 dark:text-muted-foreground">{request.studentEmail}</p>
                          </div>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold dark:bg-[var(--color-chart-2)] dark:text-white">
                            {request.numberOfDays} days
                          </span>
                        </div>

                        <div className="mb-4 p-3 bg-gray-50 rounded">
                          <p className="text-sm font-semibold text-gray-900 dark:text-foreground mb-1">Reason</p>
                          <p className="text-sm text-gray-600 dark:text-muted-foreground">{request.reason}</p>
                        </div>

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
                              Review & Decide
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Review Leave Request</DialogTitle>
                              <DialogDescription>
                                {selectedRequest?.studentName} - {selectedRequest?.numberOfDays} days
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              <div>
                                <Label className="text-gray-600">Reason</Label>
                                <p className="font-semibold">{selectedRequest?.reason}</p>
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
                                <div className="space-y-2">
                                  <Label>Supporting Document</Label>
                                  {(selectedRequest?.attachment || selectedRequest?.supportingDocument || selectedRequest?.documentUrl || selectedRequest?.fileUrl || selectedRequest?.file?.url) ? (
                                    <a
                                      href={selectedRequest.attachment || selectedRequest.supportingDocument || selectedRequest.documentUrl || selectedRequest.fileUrl || selectedRequest.file?.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-sm text-blue-600 underline"
                                    >
                                      View Document
                                    </a>
                                  ) : (
                                    <p className="text-sm text-gray-500">No document attached</p>
                                  )}
                                </div>
                                <Label htmlFor="comment">Your Comments</Label>
                                <Input
                                  id="comment"
                                  placeholder="Add comments for the student..."
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                  className="h-24 align-top"
                                />
                                {rejectionError && (
                                  <p className="text-sm text-red-600">{rejectionError}</p>
                                )}
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleDecision('approve')}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => handleDecision('reject')}
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
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-foreground">Request History</h3>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">View past requests for your department and branch.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['all', 'pending', 'approved', 'rejected'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setHistoryStatusFilter(status as typeof historyStatusFilter)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${historyStatusFilter === status ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-card dark:text-muted-foreground dark:border dark:border-border'}`}
                    >
                      {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Total Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-foreground">{historyRequests.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Pending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">{historyRequests.filter((r) => r.status === 'pending' || r.status === 'coordinator_approved').length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Approved</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{historyRequests.filter((r) => r.status === 'hod_approved').length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Rejected</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">{historyRequests.filter((r) => r.status === 'rejected').length}</div>
                  </CardContent>
                </Card>
              </div>

              {filteredHistoryRequests.length === 0 ? (
                <Card className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-muted-foreground">No requests match your filter.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredHistoryRequests.map((request) => (
                    <Card key={request.id} className="border border-gray-200 dark:border-border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-card transition-colors">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 dark:text-muted-foreground">{request.studentEmail}</p>
                          <h4 className="font-semibold text-gray-900 dark:text-foreground">{request.studentName}</h4>
                          <p className="text-sm text-gray-600 dark:text-muted-foreground">Leave Type: {request.leaveType ?? 'Not available'}</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold dark:bg-[var(--color-chart-2)] dark:text-white">
                          {request.numberOfDays} days
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600 dark:text-muted-foreground">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-foreground">Start Date</p>
                          <p>{new Date(request.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-foreground">End Date</p>
                          <p>{new Date(request.endDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-foreground">Submitted</p>
                          <p>{new Date(request.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-foreground">Current Status</p>
                          <p>{getRequestStatusLabel(request)}</p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedHistoryRequest(request)
                            setHistoryDialogOpen(true)
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <Dialog open={historyDialogOpen} onOpenChange={(open) => {
                setHistoryDialogOpen(open)
                if (!open) setSelectedHistoryRequest(null)
              }}>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Request Details</DialogTitle>
                    <DialogDescription>Review the selected leave request details and timeline.</DialogDescription>
                  </DialogHeader>
                  {selectedHistoryRequest ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-600 dark:text-muted-foreground">Student Name</Label>
                          <p className="font-semibold text-gray-900 dark:text-foreground">{selectedHistoryRequest.studentName}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600 dark:text-muted-foreground">Leave Type</Label>
                          <p className="font-semibold text-gray-900 dark:text-foreground">{selectedHistoryRequest.leaveType ?? 'Not available'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600 dark:text-muted-foreground">Start Date</Label>
                          <p className="font-semibold text-gray-900 dark:text-foreground">{new Date(selectedHistoryRequest.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600 dark:text-muted-foreground">End Date</Label>
                          <p className="font-semibold text-gray-900 dark:text-foreground">{new Date(selectedHistoryRequest.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-gray-50 dark:bg-card border border-gray-200 dark:border-border">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3">Processing Timeline</h4>
                        <div className="space-y-5 border-l border-gray-200 dark:border-border pl-5">
                          <div className="relative">
                            <span className="absolute -left-5 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-[color:var(--chart-1)]">
                              <CheckCircle2 className="w-3 h-3" />
                            </span>
                            <div>
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-gray-900 dark:text-foreground">Application Submitted</p>
                                {selectedHistoryRequest.createdAt && (
                                  <span className="text-xs text-gray-500 dark:text-muted-foreground">{new Date(selectedHistoryRequest.createdAt).toLocaleString()}</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-muted-foreground">The student submitted the request.</p>
                            </div>
                          </div>
                          <div className="relative">
                            <span className="absolute -left-5 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-gray-500">
                              {getTimelineDot(getTimelineState(selectedHistoryRequest).coordinatorState)}
                            </span>
                            <div>
                              <div className="flex items-center justify-between gap-3">
                                <p className={`text-sm font-semibold ${getTimelineState(selectedHistoryRequest).coordinatorState === 'rejected' ? 'text-red-700' : getTimelineState(selectedHistoryRequest).coordinatorState === 'completed' ? 'text-green-700' : 'text-gray-900'}`}>
                                  Coordinator Review
                                </p>
                                <span className="text-xs text-gray-500">
                                  {getTimelineState(selectedHistoryRequest).coordinatorState === 'completed'
                                    ? 'Approved'
                                    : getTimelineState(selectedHistoryRequest).coordinatorState === 'rejected'
                                    ? 'Rejected'
                                    : 'Pending'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-muted-foreground">
                                {getTimelineState(selectedHistoryRequest).coordinatorState === 'rejected'
                                  ? 'The coordinator rejected this request.'
                                  : 'Coordinator review pending.'}
                              </p>
                            </div>
                          </div>
                          <div className="relative">
                            <span className="absolute -left-5 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-gray-500">
                              {getTimelineDot(getTimelineState(selectedHistoryRequest).hodReviewState)}
                            </span>
                            <div>
                              <div className="flex items-center justify-between gap-3">
                                <p className={`text-sm font-semibold ${getTimelineState(selectedHistoryRequest).hodReviewState === 'completed' ? 'text-green-700' : getTimelineState(selectedHistoryRequest).hodReviewState === 'current' ? 'text-blue-700' : 'text-gray-900'}`}>
                                  HOD Review
                                </p>
                                <span className="text-xs text-gray-500">
                                  {getTimelineState(selectedHistoryRequest).hodReviewState === 'completed'
                                    ? 'Completed'
                                    : getTimelineState(selectedHistoryRequest).hodReviewState === 'current'
                                    ? 'Pending'
                                    : 'Locked'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-muted-foreground">
                                {getTimelineState(selectedHistoryRequest).hodReviewState === 'current'
                                  ? 'Awaiting HOD review.'
                                  : getTimelineState(selectedHistoryRequest).hodReviewState === 'not_reached'
                                  ? 'Coordinator approval required first.'
                                  : 'HOD review completed.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">Select a request to view its details.</p>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Coordinator Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600 dark:text-muted-foreground">Full Name</Label>
                    <p className="font-semibold text-gray-900 dark:text-foreground">{currentUser?.fullName || 'Not available'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600 dark:text-muted-foreground">Email</Label>
                    <p className="font-semibold text-gray-900 dark:text-foreground">{currentUser?.email || 'Not available'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600 dark:text-muted-foreground">Role</Label>
                    <p className="font-semibold text-gray-900 dark:text-foreground">{currentUser?.role?.toUpperCase() || 'COORDINATOR'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600 dark:text-muted-foreground">Department</Label>
                    <p className="font-semibold text-gray-900 dark:text-foreground">{currentUser?.department || 'Not available'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600 dark:text-muted-foreground">Branch</Label>
                    <p className="font-semibold text-gray-900 dark:text-foreground">{currentUser?.branch || 'Not available'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600 dark:text-muted-foreground">Section</Label>
                    <p className="font-semibold text-gray-900 dark:text-foreground">{currentUser?.section || 'Not available'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600 dark:text-muted-foreground">Phone Number</Label>
                    <p className="font-semibold text-gray-900 dark:text-foreground">{currentUser?.phoneNumber || 'Not available'}</p>
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
