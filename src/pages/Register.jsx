import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../utils/api';
import {
  validateEmail,
  validatePassword,
  getPasswordStrength,
  validateName,
  cn,
} from '../utils/helpers';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState('');
  const [showPasswordChecklist, setShowPasswordChecklist] = useState(false);

  useEffect(() => {
    document.title = 'Show you care - Register';
  }, []);

  /* =========================
     INPUT HANDLING
  ========================= */
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'name') {
      setFieldErrors((prev) => ({
        ...prev,
        name: validateName(value)
          ? ''
          : 'Name should contain only letters and spaces',
      }));
    }

    if (name === 'email') {
      setFieldErrors((prev) => ({
        ...prev,
        email: validateEmail(value) ? '' : 'Invalid email address',
      }));
    }

    if (name === 'password') {
      if (!showPasswordChecklist && value.length > 0) {
        setShowPasswordChecklist(true);
      }

      const { isValid } = validatePassword(value);

      setFieldErrors((prev) => ({
        ...prev,
        password: isValid ? '' : 'Password does not meet all requirements',
      }));

      setPasswordStrength(getPasswordStrength(value));

      if (value.length === 0) {
        setShowPasswordChecklist(false);
      }
    }
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.role) {
      toast.error('Please select an account type');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
      role: formData.role.toUpperCase(),
    };

    console.group('📝 REGISTER REQUEST');
    console.log('Payload →', payload);
    console.groupEnd();

    try {
      // ✅ Using global wrapper via meta
      const response = await authAPI.signup(payload, {
        meta: { loadingText: 'Creating your account...' },
      });

      console.group('✅ REGISTER SUCCESS');
      console.log('HTTP status →', response.status);
      console.log('Backend response →', response.data);
      console.groupEnd();

      toast.success('Account created successfully 🎉');

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      const res = err?.response;

      console.group('❌ REGISTER FAILURE');
      console.log('HTTP status →', res?.status || 'NO_RESPONSE');
      console.log('Backend payload →', res?.data || null);
      console.log('Axios error →', err.message);
      console.groupEnd();

      if (!res) {
        toast.error('Network error. Please check your connection.');
      } else {
        const backendCode = res.data?.code;

        switch (backendCode) {
          case '400001':
            toast.error('Please fill in all required fields correctly.');
            break;
          case '400003':
            toast.error('This email is already registered.');
            break;
          default:
            toast.error(res.data?.message || 'Registration failed.');
        }
      }
    }
  };

  /* =========================
     PASSWORD CHECKLIST
  ========================= */
  const renderPasswordChecklist = () => {
    if (!showPasswordChecklist) return null;

    const { rules } = validatePassword(formData.password);
    const unmetRules = Object.entries(rules)
      .filter(([_, passed]) => !passed)
      .map(([rule]) => rule);

    if (unmetRules.length === 0) return null;

    return (
      <ul className="text-sm mt-1">
        {unmetRules.includes('length') && (
          <li className="text-red-500">At least 8 characters</li>
        )}
        {unmetRules.includes('uppercase') && (
          <li className="text-red-500">At least 1 uppercase letter</li>
        )}
        {unmetRules.includes('lowercase') && (
          <li className="text-red-500">At least 1 lowercase letter</li>
        )}
        {unmetRules.includes('number') && (
          <li className="text-red-500">At least 1 number</li>
        )}
        {unmetRules.includes('specialChar') && (
          <li className="text-red-500">At least 1 special character</li>
        )}
      </ul>
    );
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-cardLight rounded-2xl shadow-2xl p-6 border border-brand-brown/20">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-brand-brown">
            Create Account
          </h1>
          <p className="text-brand-textSecondary">
            Join Show you care today
          </p>
        </div>

        {/* ROLE SELECTION */}
        <div className="mb-4">
          <label className="block text-brand-brown font-medium mb-2 text-sm">
            Account Type
          </label>
          <div className="flex gap-2">
            {['user', 'vendor', 'admin'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleSelect(role)}
                className={cn(
                  'flex-1 py-2 rounded-lg border text-sm font-medium',
                  formData.role === role
                    ? 'bg-brand-orange text-white border-brand-orange'
                    : 'bg-white text-brand-brown border-brand-brown/20'
                )}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border rounded-lg"
            />
            {fieldErrors.name && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div>
            <input
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border rounded-lg"
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border rounded-lg"
            />

            {renderPasswordChecklist()}

            {formData.password && (
              <p
                className={`text-sm mt-1 ${
                  passwordStrength === 'Weak'
                    ? 'text-red-500'
                    : passwordStrength === 'Medium'
                    ? 'text-yellow-500'
                    : 'text-green-600'
                }`}
              >
                Password strength: {passwordStrength}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-brand-orange text-white rounded-lg"
          >
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-brand-orange font-semibold"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
