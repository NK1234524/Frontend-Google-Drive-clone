import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import { 
  Search, 
  Grid3X3, 
  List, 
  Upload, 
  FolderPlus, 
  MoreVertical, 
  Download, 
  Trash2, 
  Share2, 
  Star, 
  Clock, 
  Folder, 
  File, 
  FileText, 
  Image, 
  Video, 
  Music,
  Archive,
  Settings,
  User,
  Menu,
  X,
  LogOut,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Plus
} from 'lucide-react';

const API_BASE = 'http://localhost:5000'; 

const GoogleDriveApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); 
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPath, setCurrentPath] = useState('My Drive');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Auth form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    currentPassword: '',
    newPassword: '',
    name: '',
    age: ''
  });

  // Password visibility states
  const [passwordVisible, setPasswordVisible] = useState({
    password: false,
    currentPassword: false,
    newPassword: false
  });

  useEffect(() => {
    
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      fetchUsers();
    }
  }, []);

  // Auth Functions
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const endpoint = authMode === 'signup' ? '/signup' : '/login';
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        const userData = authMode === 'signup' ? data.auth.user : data.user;
        setCurrentUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        setFormData({ email: '', password: '', currentPassword: '', newPassword: '', name: '', age: '' });
        fetchUsers();
      } else {
        alert(data.error || 'Authentication failed');
      }
    } catch (error) {
      alert('Network error: ' + error.message);
    }
    
    setLoading(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Password changed successfully!');
        setAuthMode('login');
        setFormData({ email: '', password: '', currentPassword: '', newPassword: '', name: '', age: '' });
      } else {
        alert(data.error || 'Password change failed');
      }
    } catch (error) {
      alert('Network error: ' + error.message);
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setFormData({ email: '', password: '', currentPassword: '', newPassword: '', name: '', age: '' });
  };

  // File Upload Function
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/upload-file`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('File uploaded successfully!');
        // Add the uploaded file to our files state
        const newFile = {
          id: Date.now(),
          name: file.name,
          type: getFileTypeFromName(file.name),
          size: formatFileSize(file.size),
          modified: 'Just now',
          owner: 'You',
          starred: false
        };
        setFiles(prev => [newFile, ...prev]);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (error) {
      alert('Upload error: ' + error.message);
    }
    
    setLoading(false);
    event.target.value = ''; 
  };

  // User Management Functions
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/find-users`);
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.age) {
      alert('Name and age are required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          age: parseInt(formData.age)
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('User created successfully!');
        setFormData(prev => ({ ...prev, name: '', age: '' }));
        fetchUsers();
      } else {
        alert(data.error || 'User creation failed');
      }
    } catch (error) {
      alert('Network error: ' + error.message);
    }
  };

  // Helper Functions
  const getFileTypeFromName = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
    const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv'];
    const audioExts = ['mp3', 'wav', 'flac', 'aac'];
    const documentExts = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
    const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz'];

    if (imageExts.includes(ext)) return 'image';
    if (videoExts.includes(ext)) return 'video';
    if (audioExts.includes(ext)) return 'audio';
    if (documentExts.includes(ext)) return 'document';
    if (archiveExts.includes(ext)) return 'archive';
    return 'file';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'folder': return <Folder className="w-6 h-6 text-blue-500" />;
      case 'document': return <FileText className="w-6 h-6 text-red-500" />;
      case 'image': return <Image className="w-6 h-6 text-green-500" />;
      case 'video': return <Video className="w-6 h-6 text-purple-500" />;
      case 'audio': return <Music className="w-6 h-6 text-orange-500" />;
      case 'archive': return <Archive className="w-6 h-6 text-yellow-500" />;
      default: return <File className="w-6 h-6 text-gray-500" />;
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileSelect = (fileId) => {
    setSelectedItems(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const toggleStar = (fileId) => {
    setFiles(prev => prev.map(file =>
      file.id === fileId ? { ...file, starred: !file.starred } : file
    ));
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisible(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Auth Component
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Folder className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Drive Clone</h1>
            <p className="text-gray-600 mt-2">
              {authMode === 'login' && 'Welcome back! Please sign in.'}
              {authMode === 'signup' && 'Create your account to get started.'}
              {authMode === 'changePassword' && 'Change your password.'}
            </p>
          </div>

          <form onSubmit={authMode === 'changePassword' ? handleChangePassword : handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            {authMode !== 'changePassword' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible.password ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('password')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {passwordVisible.password ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {authMode === 'changePassword' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={passwordVisible.currentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('currentPassword')}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {passwordVisible.currentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={passwordVisible.newPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('newPassword')}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {passwordVisible.newPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50"
            >
              {loading ? 'Please wait...' : (
                authMode === 'login' ? 'Sign In' : 
                authMode === 'signup' ? 'Sign Up' : 
                'Change Password'
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {authMode === 'login' && (
              <>
                <button
                  onClick={() => setAuthMode('signup')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Don't have an account? Sign up
                </button>
                <br />
                <button
                  onClick={() => setAuthMode('changePassword')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Change Password
                </button>
              </>
            )}
            
            {(authMode === 'signup' || authMode === 'changePassword') && (
              <button
                onClick={() => setAuthMode('login')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const QuickAccessItem = ({ icon, label, active = false, onClick }) => (
    <div 
      className={`flex items-center space-x-3 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
        active ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );

  // Main Drive Interface
  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        multiple
      />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Folder className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Drive Clone</h1>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search in Drive"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowPasswordFields(!showPasswordFields)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-gray-100 text-red-600"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200`}>
          <div className="p-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors mb-6 disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              <span className="font-medium">{loading ? 'Uploading...' : 'New Upload'}</span>
            </button>

            <nav className="space-y-2">
              <QuickAccessItem icon={<Folder className="w-5 h-5" />} label="My Drive" active />
              <QuickAccessItem icon={<User className="w-5 h-5" />} label="Shared with me" />
              <QuickAccessItem icon={<Clock className="w-5 h-5" />} label="Recent" />
              <QuickAccessItem icon={<Star className="w-5 h-5" />} label="Starred" />
              <QuickAccessItem icon={<Trash2 className="w-5 h-5" />} label="Trash" />
            </nav>

            {/* User Management Section */}
            {showPasswordFields && (
              <div className="mt-8 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Add User</h3>
                <form onSubmit={createUser} className="space-y-3">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Age"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add User</span>
                  </button>
                </form>

                {users.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Users ({users.length})</h4>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {users.map(user => (
                        <div key={user.id} className="text-xs bg-gray-50 p-2 rounded">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-gray-500">Age: {user.age}</div>
                          {user.email && <div className="text-gray-500">{user.email}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 pt-4 border-t border-gray-200">
              <div className="px-4 py-2">
                <div className="text-xs text-gray-500 mb-2">Storage</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '65%'}}></div>
                </div>
                <div className="text-xs text-gray-500">6.5 GB of 15 GB used</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <nav className="text-sm text-gray-500">
                <span className="hover:text-blue-600 cursor-pointer">{currentPath}</span>
              </nav>
            </div>

            <div className="flex items-center space-x-3">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <FolderPlus className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* File Grid/List */}
          <div className="p-6">
            {files.length === 0 ? (
              <div className="text-center py-12">
                <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No files yet</h3>
                <p className="text-gray-500 mb-4">Upload your first file to get started</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upload Files
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`group relative bg-white rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                      selectedItems.includes(file.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleFileSelect(file.id)}
                  >
                    <div className="p-4">
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-3">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="w-full">
                          <h3 className="text-sm font-medium text-gray-900 truncate mb-1">{file.name}</h3>
                          <p className="text-xs text-gray-500">{file.size}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(file.id);
                          }}
                          className={`p-1 rounded hover:bg-gray-100 ${file.starred ? 'text-yellow-500' : 'text-gray-400'}`}
                        >
                          <Star className={`w-4 h-4 ${file.starred ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modified</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredFiles.map((file) => (
                      <tr
                        key={file.id}
                        className={`hover:bg-gray-50 cursor-pointer ${
                          selectedItems.includes(file.id) ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleFileSelect(file.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="mr-3">
                              {getFileIcon(file.type)}
                            </div>
                            <div className="text-sm font-medium text-gray-900">{file.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.owner}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.modified}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.size}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStar(file.id);
                              }}
                              className={`p-1 rounded hover:bg-gray-100 ${file.starred ? 'text-yellow-500' : 'text-gray-400'}`}
                            >
                              <Star className={`w-4 h-4 ${file.starred ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded hover:bg-gray-100 text-gray-400"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded hover:bg-gray-100 text-gray-400"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded hover:bg-gray-100 text-gray-400"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Selection toolbar */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-4">
          <span className="text-sm">{selectedItems.length} selected</span>
          <div className="flex space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-700">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-700">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-700">
              <Trash2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setSelectedItems([])}
              className="p-2 rounded-full hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-900">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleDriveApp;