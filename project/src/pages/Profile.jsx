import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Camera, Edit2, Save, X, Info } from 'lucide-react';
import { useAuth } from '../api.jsx'; // Correct path to your api.jsx

const Profile = () => {
  const { user, fetchUserProfile, updateProfile, generalError } = useAuth(); // Destructure new functions and generalError

  // State for form data, initialized with separate first_name and last_name
  const [formData, setFormData] = useState({
    firstName: '', // Mapped from user.first_name, use camelCase for frontend state
    lastName: '',  // Mapped from user.last_name, use camelCase for frontend state
    email: '',
    phone: '',
    location: '',
    dateOfBirth: '', // Frontend camelCase for user.date_of_birth
    bio: '',
    preferredSports: [], // Frontend camelCase for user.preferred_sports
    emergencyContact: '', // Frontend camelCase for user.emergency_contact
    address: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true); // State for initial profile fetch loading
  const [globalProfileError, setGlobalProfileError] = useState(null); // For general profile loading errors or API errors
  const [formErrors, setFormErrors] = useState({}); // <--- NEW: State for field-specific validation errors
  const [saveLoading, setSaveLoading] = useState(false); // State for save operation loading
  const [saveSuccess, setSaveSuccess] = useState(false); // State for save success message

  const sports = ['Cricket', 'Football', 'Tennis', 'Badminton', 'Basketball', 'Pickleball', 'Volleyball', 'Table Tennis'];

  // Effect 1: Initialize formData when the `user` object from AuthProvider changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || '', // Map from snake_case to camelCase for formData
        lastName: user.last_name || '',   // Map from snake_case to camelCase for formData
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        dateOfBirth: user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : '',
        bio: user.bio || '',
        preferredSports: user.preferred_sports || [],
        emergencyContact: user.emergency_contact || '',
        address: user.address || ''
      });
      setProfileLoading(false); // Once user data is loaded/initialized, stop loading
      setGlobalProfileError(null); // Clear any previous global errors
      setFormErrors({}); // Clear any previous form errors
      setSaveSuccess(false); // Clear previous save success
    } else {
      // If user logs out or is not present initially
      setFormData({ // Clear form data
        firstName: '', lastName: '', email: '', phone: '', location: '', dateOfBirth: '', bio: '',
        preferredSports: [], emergencyContact: '', address: ''
      });
      setProfileLoading(false);
    }
  }, [user]); // DEPENDENCY IS JUST `user` here. This effect reacts to user object changes.

  // Effect 2: Fetch user profile data *only once* on component mount (or if fetchUserProfile reference changes)
  useEffect(() => {
    const initialLoad = async () => {
      // Only fetch if `user` isn't already populated and we are not already in a loading state
      if (!user && !profileLoading) {
        setProfileLoading(true);
        setGlobalProfileError(null);
        console.log("Profile component: Initial fetchUserProfile triggered.");
        const result = await fetchUserProfile();
        if (!result.success) {
          setGlobalProfileError(result.error || 'Failed to load initial profile data.');
        }
        setProfileLoading(false);
      } else if (user) {
        // If user is already available (e.g., from a quick re-mount or refresh after login),
        // we can consider it loaded.
        setProfileLoading(false);
      }
    };

    initialLoad();
  }, [fetchUserProfile, user]); // Include user in dependency to avoid re-fetching if user state updates from elsewhere

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setSaveSuccess(false); // Clear save success message on any change
    // Clear the specific error for this field when user starts typing
    // Ensure formErrors[name] exists before trying to access it
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined })); // Set to undefined to remove key or null
    }
  };

  const handleSportToggle = (sport) => {
    setFormData(prev => {
      const updatedSports = prev.preferredSports.includes(sport)
        ? prev.preferredSports.filter(s => s !== sport)
        : [...prev.preferredSports, sport];
      return {
        ...prev,
        preferredSports: updatedSports
      };
    });
    setSaveSuccess(false); // Clear save success message on any change
    // Clear the error for preferredSports when user changes selection
    if (formErrors.preferredSports) {
      setFormErrors(prev => ({ ...prev, preferredSports: undefined }));
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setGlobalProfileError(null); // Clear general profile errors
    setFormErrors({}); // <--- IMPORTANT: Clear previous field errors
    setSaveSuccess(false); // Clear previous success message

    // Map frontend camelCase to backend snake_case for sending data
    const dataToSave = {
      first_name: formData.firstName, // Send first_name (snake_case)
      last_name: formData.lastName,    // Send last_name (snake_case)
      phone: formData.phone,
      location: formData.location,
      date_of_birth: formData.dateOfBirth, // Adapt to backend field name
      bio: formData.bio,
      preferred_sports: formData.preferredSports, // Adapt to backend field name
      emergency_contact: formData.emergencyContact, // Adapt to backend field name
      address: formData.address
    };

    const result = await updateProfile(dataToSave); // Call the API function

    if (result.success) {
      console.log('Profile saved successfully:', result.data);
      setIsEditing(false); // Exit edit mode
      setSaveSuccess(true); // Show success message
      // The `user` state in AuthProvider will be updated by `updateProfile`,
      // which in turn will trigger `Effect 1` to re-sync `formData` with the latest `user` data.
    } else {
      console.error('Failed to save profile:', result.error || result.errors);
      if (result.errors) {
        const mappedErrors = {};
        for (const key in result.errors) {
          // Convert snake_case to camelCase for frontend keys (e.g., 'first_name' -> 'firstName')
          const frontendKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
          mappedErrors[frontendKey] = result.errors[key];
        }
        setFormErrors(mappedErrors); // <--- SET FIELD-SPECIFIC ERRORS HERE
        // Set a general message indicating there are form errors
        setGlobalProfileError('Please correct the errors in the form.');
      } else {
        // Handle general API errors (e.g., 401, 500, or a 'detail' error from backend)
        setGlobalProfileError(result.error || 'An unexpected error occurred during save.');
      }
    }
    setSaveLoading(false);
  };

  const handleCancelEdit = () => {
    // Reset formData to current user data when canceling
    if (user) {
      setFormData({
        firstName: user.first_name || '', // Reset using snake_case from user object
        lastName: user.last_name || '',   // Reset using snake_case from user object
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        dateOfBirth: user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : '',
        bio: user.bio || '',
        preferredSports: user.preferred_sports || [],
        emergencyContact: user.emergency_contact || '',
        address: user.address || ''
      });
    }
    setIsEditing(false);
    setGlobalProfileError(null); // Clear any errors
    setFormErrors({}); // Clear field errors too
    setSaveSuccess(false); // Clear success message
  };

  // Display handling before rendering the main profile content
  if (!user && !profileLoading) { // Only show login message if not loading and no user
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-700">Please log in to view your profile.</p>
      </div>
    );
  }

  // Handle loading state
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-3 text-lg text-gray-700">Loading profile...</p>
      </div>
    );
  }

  // Determine the display name (combined first/last or email)
  const displayName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || user?.email;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-max section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600">Manage your personal information and preferences</p>
            </div>
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="btn-primary flex items-center space-x-2"
              disabled={saveLoading}
            >
              {saveLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isEditing ? (
                <Save size={20} />
              ) : (
                <Edit2 size={20} />
              )}
              <span>{saveLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}</span>
            </button>
            {isEditing && (
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2 ml-3"
                disabled={saveLoading}
              >
                <X size={18} />
                <span>Cancel</span>
              </button>
            )}
          </div>

          {/* General Error/Success Messages */}
          {(globalProfileError || generalError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2 mb-6"
            >
              <Info size={20} />
              <p className="text-sm font-medium">{globalProfileError || generalError}</p>
            </motion.div>
          )}

          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2 mb-6"
            >
              <Info size={20} />
              <p className="text-sm font-medium">Profile updated successfully!</p>
            </motion.div>
          )}


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture & Basic Info */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card p-6 text-center"
              >
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 bg-primary-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50">
                      <Camera size={16} className="text-gray-600" />
                    </button>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{displayName}</h2>
                <p className="text-gray-600 mb-4">{formData.email}</p>

                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{formData.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{formData.location || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Preferred Sports - Display Mode */}
              {!isEditing && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="card p-6 mt-6"
                >
                  <h3 className="font-semibold text-gray-900 mb-4">Preferred Sports</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.preferredSports.length > 0 ? (
                      formData.preferredSports.map((sport) => (
                        <span
                          key={sport}
                          className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                        >
                          {sport}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No preferred sports selected.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Detailed Information */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          name="firstName" // <--- Corrected: Use 'firstName' to match formData key
                          value={formData.firstName}
                          onChange={handleChange}
                          className="input-field"
                        />
                        {formErrors.firstName && ( // Display error for firstName (camelCase)
                          <div className="text-red-500 text-xs mt-1">
                            {formErrors.firstName[0]}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-900">{formData.firstName || 'N/A'}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          name="lastName" // <--- Corrected: Use 'lastName' to match formData key
                          value={formData.lastName}
                          onChange={handleChange}
                          className="input-field"
                        />
                        {formErrors.lastName && ( // Display error for lastName (camelCase)
                          <div className="text-red-500 text-xs mt-1">
                            {formErrors.lastName[0]}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-900">{formData.lastName || 'N/A'}</p>
                    )}
                  </div>

                  {/* Email Address (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <p className="text-gray-900">{formData.email || 'N/A'}</p>
                    {formErrors.email && ( // Error for email (should be read-only on backend but good to have)
                      <div className="text-red-500 text-xs mt-1">
                        {formErrors.email[0]}
                      </div>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="input-field"
                        />
                        {formErrors.phone && (
                          <div className="text-red-500 text-xs mt-1">
                            {formErrors.phone[0]}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-900">{formData.phone || 'N/A'}</p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="date"
                          name="dateOfBirth" // Frontend camelCase
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          className="input-field"
                        />
                        {formErrors.dateOfBirth && ( // Error for dateOfBirth (camelCase)
                          <div className="text-red-500 text-xs mt-1">
                            {formErrors.dateOfBirth[0]}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-900">
                        {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : 'N/A'}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          className="input-field"
                        />
                        {formErrors.location && (
                          <div className="text-red-500 text-xs mt-1">
                            {formErrors.location[0]}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-900">{formData.location || 'N/A'}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    {isEditing ? (
                      <>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows="2"
                          className="input-field"
                        />
                        {formErrors.address && (
                          <div className="text-red-500 text-xs mt-1">
                            {formErrors.address[0]}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-900">{formData.address || 'N/A'}</p>
                    )}
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    {isEditing ? (
                      <>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          rows="3"
                          className="input-field"
                          placeholder="Tell us about yourself..."
                        />
                        {formErrors.bio && (
                          <div className="text-red-500 text-xs mt-1">
                            {formErrors.bio[0]}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-900">{formData.bio || 'N/A'}</p>
                    )}
                  </div>

                  {/* Emergency Contact */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="tel"
                          name="emergencyContact" // Frontend camelCase
                          value={formData.emergencyContact}
                          onChange={handleChange}
                          className="input-field"
                        />
                        {formErrors.emergencyContact && ( // Error for emergencyContact (camelCase)
                          <div className="text-red-500 text-xs mt-1">
                            {formErrors.emergencyContact[0]}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-900">{formData.emergencyContact || 'N/A'}</p>
                    )}
                  </div>
                </div>

                {/* Sports Preferences - Edit Mode */}
                {isEditing && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Preferred Sports
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {sports.map((sport) => (
                        <label key={sport} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.preferredSports.includes(sport)}
                            onChange={() => handleSportToggle(sport)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">{sport}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.preferredSports && ( // Error for preferredSports (camelCase)
                      <div className="text-red-500 text-xs mt-1">
                        {formErrors.preferredSports[0]}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons in Edit Mode - moved Save/Cancel here for better UI flow */}
                {isEditing && (
                  <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                      disabled={saveLoading}
                    >
                      <X size={18} />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      className="btn-primary flex items-center space-x-2"
                      disabled={saveLoading}
                    >
                      {saveLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save size={20} />
                      )}
                      <span>{saveLoading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;