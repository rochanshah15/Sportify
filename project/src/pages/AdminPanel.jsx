import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Calendar, DollarSign, TrendingUp, Search, Filter, Edit, Trash2, Eye } from 'lucide-react'
import { Line, Doughnut } from 'react-chartjs-2'

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data
  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12%',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Bookings',
      value: '1,234',
      change: '+8%',
      icon: Calendar,
      color: 'bg-green-500'
    },
    {
      title: 'Total Revenue',
      value: '₹4,56,789',
      change: '+15%',
      icon: DollarSign,
      color: 'bg-purple-500'
    },
    {
      title: 'Active Boxes',
      value: '156',
      change: '+5%',
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ]

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [65000, 78000, 82000, 95000, 105000, 120000],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  }

  const sportsData = {
    labels: ['Cricket', 'Football', 'Tennis', 'Badminton', 'Basketball', 'Pickleball'],
    datasets: [
      {
        data: [35, 25, 15, 12, 8, 5],
        backgroundColor: [
          '#10B981',
          '#3B82F6',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#06B6D4',
        ],
      },
    ],
  }

  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'User', status: 'Active', bookings: 12 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Owner', status: 'Active', bookings: 0 },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'User', status: 'Inactive', bookings: 5 },
  ]

  const boxes = [
    { id: 1, name: 'Elite Cricket Box', owner: 'John Owner', sport: 'Cricket', location: 'Mumbai', status: 'Approved', bookings: 45 },
    { id: 2, name: 'Football Arena', owner: 'Jane Owner', sport: 'Football', location: 'Delhi', status: 'Pending', bookings: 32 },
    { id: 3, name: 'Tennis Court Pro', owner: 'Mike Owner', sport: 'Tennis', location: 'Bangalore', status: 'Approved', bookings: 28 },
  ]

  const bookings = [
    { id: 1, user: 'John Doe', box: 'Elite Cricket Box', date: '2024-01-15', amount: 1600, status: 'Confirmed' },
    { id: 2, user: 'Jane Smith', box: 'Football Arena', date: '2024-01-14', amount: 600, status: 'Completed' },
    { id: 3, user: 'Mike Johnson', box: 'Tennis Court Pro', date: '2024-01-13', amount: 800, status: 'Cancelled' },
  ]

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'boxes', label: 'Boxes' },
    { id: 'bookings', label: 'Bookings' }
  ]

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-max section-padding">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage users, boxes, and monitor platform performance</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <div key={stat.title} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.change} from last month</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card mb-8"
        >
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium mb-4">Revenue Trend</h4>
                    <Line data={revenueData} options={chartOptions} />
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium mb-4">Sports Distribution</h4>
                    <Doughnut data={sportsData} />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg border">
                    <h4 className="font-medium mb-4">Recent Activity</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">New user registered</span>
                        </div>
                        <span className="text-xs text-gray-500">2 min ago</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">New box submitted for approval</span>
                        </div>
                        <span className="text-xs text-gray-500">15 min ago</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm">Payment processed</span>
                        </div>
                        <span className="text-xs text-gray-500">1 hour ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg border">
                    <h4 className="font-medium mb-4">Top Performing Boxes</h4>
                    <div className="space-y-3">
                      {boxes.slice(0, 3).map((box) => (
                        <div key={box.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{box.name}</p>
                            <p className="text-xs text-gray-600">{box.location}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">{box.bookings} bookings</p>
                            <p className="text-xs text-gray-600">{box.sport}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">User Management</h3>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Filter size={16} />
                      <span>Filter</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Bookings</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100">
                          <td className="py-3 px-4">{user.name}</td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'Owner' 
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.status === 'Active' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">{user.bookings}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-1 text-gray-600 hover:text-primary-600">
                                <Eye size={16} />
                              </button>
                              <button className="p-1 text-gray-600 hover:text-primary-600">
                                <Edit size={16} />
                              </button>
                              <button className="p-1 text-gray-600 hover:text-red-600">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Boxes Tab */}
            {activeTab === 'boxes' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Box Management</h3>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search boxes..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Filter size={16} />
                      <span>Filter</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Box Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Owner</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Sport</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Location</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Bookings</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {boxes.map((box) => (
                        <tr key={box.id} className="border-b border-gray-100">
                          <td className="py-3 px-4">{box.name}</td>
                          <td className="py-3 px-4">{box.owner}</td>
                          <td className="py-3 px-4">{box.sport}</td>
                          <td className="py-3 px-4">{box.location}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              box.status === 'Approved' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {box.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">{box.bookings}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-1 text-gray-600 hover:text-primary-600">
                                <Eye size={16} />
                              </button>
                              <button className="p-1 text-gray-600 hover:text-primary-600">
                                <Edit size={16} />
                              </button>
                              <button className="p-1 text-gray-600 hover:text-red-600">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Booking Management</h3>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search bookings..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Filter size={16} />
                      <span>Filter</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Box</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-gray-100">
                          <td className="py-3 px-4">{booking.user}</td>
                          <td className="py-3 px-4">{booking.box}</td>
                          <td className="py-3 px-4">{booking.date}</td>
                          <td className="py-3 px-4">₹{booking.amount}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'Confirmed' 
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'Completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-1 text-gray-600 hover:text-primary-600">
                                <Eye size={16} />
                              </button>
                              <button className="p-1 text-gray-600 hover:text-primary-600">
                                <Edit size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminPanel