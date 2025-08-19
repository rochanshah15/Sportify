import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../api.jsx'; // Import 'api' from your Auth context file
import { useBooking } from '../context/BookingContext';
import { toast } from 'react-toastify';
import { Dialog, Transition } from '@headlessui/react';
import {
  Calendar,
  Clock,
  CreditCard,
  Trophy,
  Heart,
  Users,
  CheckCircle,
  XCircle,
  Info,
  Clock as ClockCounterClockwise,
} from 'lucide-react';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';


// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const { bookings, loading, error, fetchBookings, cancelBooking } = useBooking();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [favoriteBoxes, setFavoriteBoxes] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState(null);

  // Fetch Analytics Data (memoized)
  const fetchAnalytics = useCallback(async () => {
    if (!user) return;
    setAnalyticsLoading(true);
    try {
      const response = await api.get(`/dashboard/analytics/`);
      setAnalyticsData(response.data);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      toast.error('Failed to load analytics data.');
    } finally {
      setAnalyticsLoading(false);
    }
  }, [user]);

  // Fetch Achievements (memoized)
  const fetchAchievements = useCallback(async () => {
    if (!user) return;
    setAchievementsLoading(true);
    try {
      const response = await api.get(`/dashboard/achievements/`);
      setAchievements(response.data);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      toast.error('Failed to load achievements.');
    } finally {
      setAchievementsLoading(false);
    }
  }, [user]);

  // Fetch Favorite Boxes (memoized)
  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    setFavoritesLoading(true);
    try {
      const response = await api.get(`/dashboard/favorites/`);
      console.log("FAVORITES DATA:", JSON.stringify(response.data, null, 2));
      setFavoriteBoxes(response.data);
    } catch (err) {
      console.error('Error fetching favorite boxes:', err);
      toast.error('Failed to load favorite boxes.');
    } finally {
      setFavoritesLoading(false);
    }
  }, [user]);


  // useEffect to call all dashboard data fetches
  useEffect(() => {
    if (user && user.id) {
      fetchBookings(user.id);
      fetchAnalytics();
      fetchAchievements();
      fetchFavorites();
    }
  }, [user, fetchBookings, fetchAnalytics, fetchAchievements, fetchFavorites]);

  // useEffect for handling favorite-added event
  useEffect(() => {
    const handler = () => fetchFavorites();
    window.addEventListener('favorite-added', handler);
    return () => window.removeEventListener('favorite-added', handler);
  }, [fetchFavorites]);


  // Handle Logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Open Cancel Modal
  const openCancelModal = (booking) => {
    setSelectedBookingToCancel(booking);
    setIsCancelModalOpen(true);
  };

  // Close Cancel Modal
  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    setSelectedBookingToCancel(null);
  };

  // Confirm Cancellation
  const confirmCancelBooking = async () => {
    if (selectedBookingToCancel) {
      const { success } = await cancelBooking(selectedBookingToCancel.id);
      if (success) {
        toast.success('Booking cancelled successfully!');
        if (user && user.id) {
          fetchBookings(user.id); // Re-fetch bookings
          fetchAnalytics(); // Re-fetch analytics to update spent
        }
      } else {
        toast.error('Failed to cancel booking.');
      }
      closeCancelModal();
    }
  };


  // --- Chart Data & Options ---
  const doughnutData = {
    labels: analyticsData?.sport_distribution?.map(item => item.sport) || ['No Data'],
    datasets: [{
      data: analyticsData?.sport_distribution?.map(item => item.percentage) || [100],
      backgroundColor: analyticsData?.sport_distribution?.length > 0 ? ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#00BCD4'] : ['#cccccc'],
      hoverOffset: 4
    }]
  };

  const lineData = {
    labels: analyticsData?.monthly_spending?.map(item => item.month) || [],
    datasets: [{
      label: 'Monthly Spending (₹)',
      data: analyticsData?.monthly_spending?.map(item => item.total_spent) || [],
      borderColor: 'rgb(16, 185, 129)',
      tension: 0.1,
      fill: false,
    }]
  };

  const barData = {
    labels: analyticsData?.activity_by_day?.map(item => item.day_of_week) || [],
    datasets: [{
      label: 'Hours Played',
      data: analyticsData?.activity_by_day?.map(item => item.total_hours) || [],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }]
  };


  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          font: {
            size: 14,
          },
          color: '#374151',
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += context.parsed + '%';
            }
            return label;
          },
        },
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Spending',
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#e5e7eb',
        },
        ticks: {
          callback: function (value) {
            return '₹' + value;
          },
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Activity by Day of Week',
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#e5e7eb',
        },
        title: {
          display: true,
          text: 'Hours Played',
        },
      },
    },
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Please log in to view your dashboard.</p>
      </div>
    );
  }

  // Filter bookings for upcoming
  const upcomingBookings = bookings.filter(b => {
    const bookingDateTime = new Date(`${b.date}T${b.start_time}:00`);
    return bookingDateTime > new Date();
  }).sort((a, b) => new Date(`${a.date}T${a.start_time}:00`) - new Date(`${b.date}T${b.start_time}:00`));

  // Filter bookings for past bookings
  const pastBookings = bookings.filter(b => {
    const bookingDateTime = new Date(`${b.date}T${b.start_time}:00`);
    return bookingDateTime <= new Date();
  }).sort((a, b) => new Date(`${b.date}T${b.start_time}:00`) - new Date(`${a.date}T${a.start_time}:00`));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 sm:p-8 text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold flex items-center">
              <Users size={36} className="mr-3" />
              Welcome, {user.username}!
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white dark:bg-gray-200 text-primary-700 dark:text-primary-800 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-300 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
          <p className="mt-2 text-lg opacity-90">{user.email}</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6 sm:px-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-base ${
                activeTab === 'overview'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-base ${
                activeTab === 'bookings'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Bookings
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-base ${
                activeTab === 'analytics'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-base ${
                activeTab === 'achievements'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Achievements
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-base ${
                activeTab === 'favorites'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Favorites
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg shadow flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Bookings</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {loading ? '...' : bookings.length}
                    </p>
                  </div>
                  <Calendar size={48} className="text-blue-400" />
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg shadow flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">This Month's Bookings</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {analyticsLoading ? '...' : (analyticsData?.this_month_bookings || 0)}
                    </p>
                  </div>
                  <ClockCounterClockwise size={48} className="text-green-400" />
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-lg shadow flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Spent</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {analyticsLoading ? '...' : `₹${(analyticsData?.total_spent || 0).toFixed(2)}`}
                    </p>
                  </div>
                  <CreditCard size={48} className="text-purple-400" />
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-6 rounded-lg shadow flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Favorite Boxes</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {favoritesLoading ? '...' : (favoriteBoxes.length || 0)}
                    </p>
                  </div>
                  <Heart size={48} className="text-yellow-400" />
                </div>
              </div>

              {/* Recent Activity & Favorite Sports (Doughnut Chart) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Recent Activity</h3>
                  {loading ? (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">Loading recent activity...</div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-4 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p>No recent activity. <button onClick={() => navigate('/boxes')} className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Book a session!</button></p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookings.slice(0, 4).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
                              {(booking.box?.sport || booking.box_sport)?.charAt(0).toUpperCase() ?? 'S'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{booking.box?.name || booking.box_name || 'Unknown Box'}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(booking.date).toLocaleDateString()} • {booking.start_time} - {booking.end_time}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-primary-600 dark:text-primary-400 font-medium">₹{booking.total_amount}</span>
                            <p className={`text-xs font-semibold ${booking.booking_status === 'Cancelled' ? 'text-red-500' : 'text-green-500'}`}>
                              {booking.booking_status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Favorite Sports</h3>
                  {analyticsLoading ? (
                    <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">Loading chart...</div>
                  ) : (
                    <div className="h-64">
                      <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* My Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">My Bookings</h2>

              {loading ? (
                <div className="text-center py-10 text-gray-500">Loading your bookings...</div>
              ) : error ? (
                <div className="text-center py-10 text-red-500">Error: {error}</div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg shadow-sm">
                  <p className="text-lg text-gray-600 mb-4">You don't have any bookings yet.</p>
                  <button
                    onClick={() => navigate('/boxes')}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg shadow-md hover:bg-primary-700 transition-colors duration-200 text-lg"
                  >
                    Find a Box and Book Now!
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <CheckCircle size={24} className="mr-2 text-green-500" />
                      Upcoming Bookings ({upcomingBookings.length})
                    </h3>
                    {upcomingBookings.length === 0 ? (
                      <p className="text-gray-600 dark:text-gray-400">No upcoming bookings.</p>
                    ) : (
                      <div className="space-y-4">
                        {upcomingBookings.map((booking) => (
                          <div key={booking.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center bg-blue-50 dark:bg-blue-900/30">
                            <div>
                              <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{booking.box?.name || booking.box_name || 'Unknown Box'}</p>
                              <p className="text-gray-700 dark:text-gray-300">
                                {new Date(booking.date).toLocaleDateString()} at {booking.start_time} - {booking.end_time} ({booking.duration} hr)
                              </p>
                              <p className="text-gray-700 dark:text-gray-300">Total: ₹{booking.total_amount}</p>
                            </div>
                            <div className="mt-3 sm:mt-0">
                              {booking.booking_status === 'Confirmed' ? (
                                <button
                                  onClick={() => openCancelModal(booking)}
                                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center"
                                >
                                  <XCircle size={20} className="mr-2" />
                                  Cancel Booking
                                </button>
                              ) : (
                                <span className="px-3 py-1 text-sm font-semibold text-red-700 bg-red-100 rounded-full">
                                  {booking.booking_status}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <ClockCounterClockwise size={24} className="mr-2 text-gray-500" />
                      Past Bookings ({pastBookings.length})
                    </h3>
                    {pastBookings.length === 0 ? (
                      <p className="text-gray-600 dark:text-gray-400">No past bookings.</p>
                    ) : (
                      <div className="space-y-4">
                        {pastBookings.map((booking) => (
                          <div key={booking.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 dark:bg-gray-700">
                            <div>
                              <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{booking.box?.name || booking.box_name || 'Unknown Box'}</p>
                              <p className="text-gray-700 dark:text-gray-300">
                                {new Date(booking.date).toLocaleDateString()} at {booking.start_time} - {booking.end_time} ({booking.duration} hr)
                              </p>
                              <p className="text-gray-700 dark:text-gray-300">Total: ₹{booking.total_amount}</p>
                            </div>
                            <div>
                              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${booking.booking_status === 'Cancelled' ? 'text-red-700 bg-red-100' : 'text-green-700 bg-green-100'}`}>
                                {booking.booking_status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Performance & Activity Analytics</h2>
              {analyticsLoading ? (
                <div className="text-center py-10 text-gray-500">Loading analytics data...</div>
              ) : !analyticsData ? (
                <div className="text-center py-10 text-gray-500">No analytics data available.</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-green-500 to-green-700 p-6 rounded-lg shadow text-white">
                      <p className="text-sm font-medium opacity-90">Total Hours Played</p>
                      <p className="text-3xl font-bold mt-1">{(analyticsData?.total_hours_played ?? 0).toFixed(1)} <span className="text-xl">hrs</span></p>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 rounded-lg shadow text-white">
                      <p className="text-sm font-medium opacity-90">Average Rating</p>
                      <p className="text-3xl font-bold mt-1">{(analyticsData?.average_rating ?? 0).toFixed(1)} / 5</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-6 rounded-lg shadow text-white">
                      <p className="text-sm font-medium opacity-90">Avg Cost / Session</p>
                      <p className="text-3xl font-bold mt-1">₹{(analyticsData?.average_cost_per_session ?? 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-500 to-red-700 p-6 rounded-lg shadow text-white">
                      <p className="text-sm font-medium opacity-90">Cancellation Rate</p>
                      <p className="text-3xl font-bold mt-1">{(analyticsData?.cancellation_rate ?? 0).toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Monthly Spending Trend</h3>
                      <div className="h-72">
                        {(analyticsData?.monthly_spending && analyticsData.monthly_spending.length > 0) ? (
                          <Line data={lineData} options={lineChartOptions} />
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-400">No monthly spending data.</div>
                        )}
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Activity by Day of Week</h3>
                      <div className="h-72">
                        {(analyticsData?.activity_by_day && analyticsData.activity_by_day.length > 0) ? (
                          <Bar data={barData} options={barChartOptions} />
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-400">No activity data.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Your Peak Booking Hours</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {(analyticsData?.peak_booking_hours && analyticsData.peak_booking_hours.length > 0) ? (
                        analyticsData.peak_booking_hours.map((hour, index) => (
                          <div key={index} className="p-4 bg-purple-50 rounded-lg flex items-center justify-between">
                            <span className="font-medium text-purple-800">{hour.hour_range}</span>
                            <span className="text-purple-700 text-lg font-bold">{hour.percentage?.toFixed(1) ?? 0}%</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600">No peak booking hours data available.</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Achievements</h2>
              {achievementsLoading ? (
                <div className="text-center py-10 text-gray-500">Loading achievements...</div>
              ) : !Array.isArray(achievements) || achievements.length === 0 ? (
                <div className="text-center py-10 text-gray-600 bg-gray-50 rounded-lg">
                  <p>No achievements yet. Keep booking sessions to unlock them!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {achievements.filter(Boolean).map((achievement, idx) => (
                    <div key={achievement?.id || achievement?.name || idx} className={`p-6 rounded-lg shadow flex items-center space-x-4 ${achievement?.earned ? 'bg-gradient-to-br from-green-100 to-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200 opacity-75'}`}>
                      <div className={`text-4xl ${achievement?.earned ? 'text-green-600' : 'text-gray-400'}`}>
                        <Trophy size={32} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{achievement?.name || 'Achievement'}</h3>
                        <p className="text-sm text-gray-700">{achievement?.description || ''}</p>
                        {achievement?.earned && (
                          <span className="mt-2 inline-block px-3 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Earned!</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Favorite Boxes</h2>
              {favoritesLoading ? (
                <div className="text-center py-10 text-gray-500">Loading your favorite boxes...</div>
              ) : !Array.isArray(favoriteBoxes) || favoriteBoxes.length === 0 ? (
                <div className="text-center py-10 text-gray-600 bg-gray-50 rounded-lg">
                  <p>No favorite boxes added yet. Click the heart icon on box pages to save them!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteBoxes.filter(Boolean).map((fav, idx) => {
                    // Use flat structure as per backend response
                    return (
                      <div key={fav.id} className="bg-white p-6 rounded-lg shadow flex flex-col justify-between border border-gray-200 hover:shadow-md transition-shadow duration-150">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{fav.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">{fav.location}</p>
                          <p className="text-primary-600 font-medium text-lg mt-2">₹{fav.price_per_hour} / hour</p>
                          <p className="text-gray-700 text-sm mt-2">{fav.description}</p>
                          {fav.added_on && (
                            <p className="text-gray-500 text-xs mt-2">Added on: {new Date(fav.added_on).toLocaleDateString()}</p>
                          )}
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() => navigate(`/boxes/${fav.id}`)}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm"
                          >
                            View Box
                          </button>
                          <button
                            onClick={() => toast.info('Remove from favorites functionality needs backend integration.')}
                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <Transition appear show={isCancelModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeCancelModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex items-center"
                  >
                    <Info size={24} className="mr-2 text-blue-500" />
                    Confirm Cancellation
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to cancel your booking for{' '}
                      <span className="font-semibold">{selectedBookingToCancel?.box?.name}</span> on{' '}
                      <span className="font-semibold">
                        {selectedBookingToCancel?.date ? new Date(selectedBookingToCancel.date).toLocaleDateString() : ''}
                      </span>{' '}
                      at <span className="font-semibold">{selectedBookingToCancel?.start_time}</span>?
                    </p>
                    <p className="text-xs text-orange-500 mt-2">
                      Please note: Cancellations made within 2 hours of the booking time are not allowed.
                      (This policy is handled by the backend.)
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={closeCancelModal}
                    >
                      Keep Booking
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={confirmCancelBooking}
                    >
                      Confirm Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default UserDashboard;