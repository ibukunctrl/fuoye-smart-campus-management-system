const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const getHeaders = () => {
  const token = localStorage.getItem('fuoye_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Frontend API Service Client
 * Seamlessly connects React UI components to the high-concurrency Node/Express backend.
 * Includes graceful offline fallback to localStorage if backend is developing/offline.
 */
export const api = {
  async register(userData) {
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('fuoye_token', data.data.token);
        return { success: true, user: data.data.user };
      }
      // Surface the first specific Zod validation error if present
      const message =
        data.error?.details?.[0]?.message ||
        data.error?.message ||
        'Registration failed. Please check your details and try again.';
      return { success: false, message };
    } catch (err) {
      console.warn('Backend API offline or unreachable:', err);
      return { success: false, message: 'Cannot reach server. Please check your connection.' };
    }
  },

  async agentRegister(userData) {
    try {
      const response = await fetch(`${BASE_URL}/auth/agent/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('fuoye_token', data.data.token);
        return { success: true, user: data.data.user };
      }
      const message =
        data.error?.details?.[0]?.message ||
        data.error?.message ||
        'Agent registration failed. Please check your details and try again.';
      return { success: false, message };
    } catch (err) {
      console.warn('Backend API offline or unreachable:', err);
      return { success: false, message: 'Cannot reach server. Please check your connection.' };
    }
  },

  async login(matricNumber, password) {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricNumber, password }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('fuoye_token', data.data.token);
        return { success: true, user: data.data.user };
      }
      return { success: false, message: data.error?.message || 'Invalid matric number or password' };
    } catch (err) {
      console.warn('Backend API offline or unreachable, switching to offline prototype mode:', err);
      return null;
    }
  },

  async getProfile() {
    try {
      const response = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: getHeaders(),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        return data.data;
      }
      return null;
    } catch (err) {
      return null;
    }
  },

  async createBooking(bookingData) {
    try {
      const response = await fetch(`${BASE_URL}/bookings`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(bookingData),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        return { success: true, booking: data.data };
      }
      return { success: false, message: data.error?.message || 'Room booking failed due to high demand' };
    } catch (err) {
      console.warn('Backend API offline, switching to offline prototype mode:', err);
      return null;
    }
  },

  async getMyBookings() {
    try {
      const response = await fetch(`${BASE_URL}/bookings/my`, {
        method: 'GET',
        headers: getHeaders(),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        return data.data;
      }
      return null;
    } catch (err) {
      return null;
    }
  },

  async getHostels(type) {
    try {
      const url = type ? `${BASE_URL}/facilities/hostels?type=${type}` : `${BASE_URL}/facilities/hostels`;
      const response = await fetch(url, { method: 'GET', headers: getHeaders() });
      const data = await response.json();
      return response.ok && data.success ? data.data : null;
    } catch (err) {
      return null;
    }
  },

  async getClassrooms() {
    try {
      const response = await fetch(`${BASE_URL}/facilities/classrooms`, { method: 'GET', headers: getHeaders() });
      const data = await response.json();
      return response.ok && data.success ? data.data : null;
    } catch (err) {
      return null;
    }
  },

  async getFacility(slug) {
    try {
      const response = await fetch(`${BASE_URL}/facilities/${slug}`, { method: 'GET', headers: getHeaders() });
      const data = await response.json();
      return response.ok && data.success ? data.data : null;
    } catch (err) {
      return null;
    }
  },

  async getRoomSchedule(roomId) {
    try {
      const response = await fetch(`${BASE_URL}/facilities/rooms/${roomId}/schedule`, { method: 'GET', headers: getHeaders() });
      const data = await response.json();
      return response.ok && data.success ? data.data : null;
    } catch (err) {
      return null;
    }
  },

  logout() {
    localStorage.removeItem('fuoye_token');
  },

  async updateProfile(profileData) {
    try {
      const response = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(profileData),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        return { success: true, user: data.data };
      }
      return { success: false, message: data.error?.message || 'Failed to update profile' };
    } catch (err) {
      return { success: false, message: 'Could not reach server' };
    }
  },

  async changePassword(currentPassword, newPassword) {
    try {
      const response = await fetch(`${BASE_URL}/auth/password`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        return { success: true };
      }
      return { success: false, message: data.error?.message || 'Failed to change password' };
    } catch (err) {
      return { success: false, message: 'Could not reach server' };
    }
  },

  async getAllBookings() {
    try {
      const response = await fetch(`${BASE_URL}/bookings/all`, {
        method: 'GET',
        headers: getHeaders(),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        return data.data;
      }
      return null;
    } catch (err) {
      return null;
    }
  },

  async updateBookingStatus(id, status) {
    try {
      const response = await fetch(`${BASE_URL}/bookings/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      return response.ok && data.success;
    } catch (err) {
      return false;
    }
  },

  async cancelBooking(id) {
    try {
      const response = await fetch(`${BASE_URL}/bookings/${id}/cancel`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      const data = await response.json();
      return response.ok && data.success;
    } catch (err) {
      return false;
    }
  },

  async getAllUsers() {
    try {
      const response = await fetch(`${BASE_URL}/auth/users/all`, {
        method: 'GET',
        headers: getHeaders(),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        return data.data;
      }
      return null;
    } catch (err) {
      return null;
    }
  },

  async getAgentFacilities() {
    try {
      const response = await fetch(`${BASE_URL}/facilities/agent/my`, {
        method: 'GET',
        headers: getHeaders(),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        return data.data;
      }
      return null;
    } catch (err) {
      return null;
    }
  },

  async getAgentBookings() {
    try {
      const response = await fetch(`${BASE_URL}/bookings/agent/my`, {
        method: 'GET',
        headers: getHeaders(),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        return data.data;
      }
      return null;
    } catch (err) {
      return null;
    }
  },

  async createFacility(facilityData) {
    try {
      const response = await fetch(`${BASE_URL}/facilities`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(facilityData),
      });
      const data = await response.json();
      return response.ok && data.success ? data.data : null;
    } catch (err) {
      return null;
    }
  },

  async updateFacility(id, facilityData) {
    try {
      const response = await fetch(`${BASE_URL}/facilities/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(facilityData),
      });
      const data = await response.json();
      return response.ok && data.success ? data.data : null;
    } catch (err) {
      return null;
    }
  },

  async deleteFacility(id) {
    try {
      const response = await fetch(`${BASE_URL}/facilities/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await response.json();
      return response.ok && data.success;
    } catch (err) {
      return false;
    }
  },

  /**
   * Upload (or replace) a hostel's thumbnail image.
   * Sends multipart/form-data — do NOT pass Content-Type manually (browser sets boundary).
   * @param {string} facilityId - the facility UUID
   * @param {File} file - the image File object from an <input type="file">
   * @returns {{ success: boolean, imageUrl?: string }}
   */
  async uploadHostelImage(facilityId, file) {
    try {
      const token = localStorage.getItem('fuoye_token');
      const form  = new FormData();
      form.append('image', file);

      const response = await fetch(`${BASE_URL}/facilities/${facilityId}/image`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const data = await response.json();
      if (response.ok && data.success) {
        return { success: true, imageUrl: data.data?.imageUrl };
      }
      return { success: false, message: data.error?.message || 'Image upload failed' };
    } catch (err) {
      return { success: false, message: 'Could not reach server' };
    }
  },
};

