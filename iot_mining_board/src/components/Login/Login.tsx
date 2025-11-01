import React, { useState } from 'react';
import { Wifi, Lock, User, AlertCircle, Loader2, Server, Activity, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const IoTLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { login, register } = useAuth();
  
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  
  const [registerData, setRegisterData] = useState({
    email: '',
    username: '',
    full_name: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const success = await login({
        username: loginData.username,
        password: loginData.password
      });
      
      if (success) {
        setSuccess('¡Login exitoso! Redirigiendo...');
        // Redirigir después de un breve delay
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        setError('Credenciales incorrectas. Por favor, verifica tus datos.');
      }
    } catch (err) {
      setError('Error de conexión. Verifica que el servidor esté funcionando.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validaciones del frontend
    if (registerData.password !== registerData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    if (!registerData.email.includes('@')) {
      setError('Por favor ingresa un email válido');
      setIsLoading(false);
      return;
    }

    try {
      const success = await register({
        email: registerData.email,
        username: registerData.username,
        full_name: registerData.full_name || '',
        password: registerData.password
      });
      
      if (success) {
        setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
        // Limpiar formulario
        setRegisterData({
          email: '',
          username: '',
          full_name: '',
          password: '',
          confirmPassword: ''
        });
        // Cambiar a login después de un delay
        setTimeout(() => {
          setIsLogin(true);
          setSuccess('');
        }, 3000);
      } else {
        setError('Error al crear la cuenta. El usuario o email ya existen.');
      }
    } catch (err) {
      setError('Error de conexión. Verifica que el servidor esté funcionando.');
      console.error('Register error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  const resetForm = () => {
    setError('');
    setSuccess('');
    setLoginData({ username: '', password: '' });
    setRegisterData({
      email: '',
      username: '',
      full_name: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      {/* Floating IoT Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <Wifi className="absolute top-20 left-20 text-purple-400 opacity-20 w-8 h-8 animate-pulse" />
        <Server className="absolute bottom-32 right-32 text-blue-400 opacity-20 w-10 h-10 animate-pulse" />
        <Activity className="absolute top-1/3 right-20 text-pink-400 opacity-20 w-6 h-6 animate-pulse" />
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-30"></div>
        
        <div className="relative bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-center relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center border border-white/30">
                <Wifi className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">IoT Manager</h1>
              <p className="text-purple-100 text-sm">Sistema de Gestión de Microservicios</p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-slate-900/50 p-1 m-6 rounded-xl">
            <button
              onClick={() => {
                setIsLogin(true);
                resetForm();
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                isLogin
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                resetForm();
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                !isLogin
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Forms */}
          <div className="p-6 pt-0">
            {error && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-start gap-3 animate-fade-in">
                <Activity className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-green-200 text-sm">{success}</p>
              </div>
            )}

            {isLogin ? (
              <div className="space-y-5">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Usuario o Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      value={loginData.username}
                      onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                      onKeyPress={(e) => handleKeyPress(e, handleLogin)}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="tu_usuario o email@ejemplo.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      onKeyPress={(e) => handleKeyPress(e, handleLogin)}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  onClick={handleLogin}
                  disabled={isLoading || !loginData.username || !loginData.password}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Iniciar Sesión
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="usuario@ejemplo.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Usuario
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="tu_usuario"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Nombre Completo (Opcional)
                  </label>
                  <input
                    type="text"
                    value={registerData.full_name}
                    onChange={(e) => setRegisterData({...registerData, full_name: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                      onKeyPress={(e) => handleKeyPress(e, handleRegister)}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Repite tu contraseña"
                    />
                  </div>
                </div>

                <button
                  onClick={handleRegister}
                  disabled={isLoading || !registerData.email || !registerData.username || !registerData.password || !registerData.confirmPassword}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5" />
                      Crear Cuenta
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-900/50 p-4 text-center border-t border-slate-700/50">
            <p className="text-slate-400 text-xs">
              Powered by <span className="text-purple-400 font-semibold">IoT Microservices</span>
            </p>
          </div>
        </div>
      </div>

    
    </div>
  );
}