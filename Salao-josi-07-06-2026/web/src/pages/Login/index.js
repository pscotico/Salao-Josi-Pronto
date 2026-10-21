import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';
import './styles.css';

const accessOptions = [
  {
    id: 'cliente',
    title: 'Entrar como Cliente',
    description: 'Agendamentos, servicos, perfil e historico.',
    icon: 'mdi-account-heart-outline',
  },
  {
    id: 'admin',
    title: 'Entrar como Administrativo',
    description: 'Painel, agenda, clientes e configuracoes.',
    icon: 'mdi-shield-account-outline',
  },
];

const redirectByAccess = {
  cliente: '/cliente',
  admin: '/',
};

const Login = () => {
  const {
    login,
    registerCliente,
    requestClientePasswordCode,
    resetClientePassword,
    logout,
    loading,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedAccess, setSelectedAccess] = useState('cliente');
  const [authMode, setAuthMode] = useState('login');
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    email: '',
    senha: '',
    dataNascimento: '',
    sexo: 'F',
    cpf: '',
    codigo: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recoveryStep, setRecoveryStep] = useState('email');

  const redirectTo = useMemo(
    () => location.state?.from?.pathname || redirectByAccess[selectedAccess],
    [location.state, selectedAccess]
  );

  useEffect(() => {
    document.body.classList.add('login-page');
    logout();

    return () => document.body.classList.remove('login-page');
  }, [logout]);

  const updateForm = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setError('');
    setSuccess('');
  };

  const isClienteRegister = selectedAccess === 'cliente' && authMode === 'register';
  const isClienteRecovery = selectedAccess === 'cliente' && authMode === 'recover';

  const validate = () => {
    if (!selectedAccess) {
      return 'Selecione o tipo de acesso.';
    }

    if (isClienteRegister && !form.nome.trim()) {
      return 'Informe seu nome.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return 'Informe um e-mail valido.';
    }

    if (isClienteRecovery && recoveryStep === 'email') {
      return '';
    }

    if (!form.senha.trim()) {
      return isClienteRecovery ? 'Informe a nova senha.' : 'Informe sua senha.';
    }

    if ((isClienteRegister || isClienteRecovery) && form.senha.trim().length < 4) {
      return 'Use uma senha com pelo menos 4 caracteres.';
    }

    if (isClienteRegister && form.telefone.replace(/\D/g, '').length < 10) {
      return 'Informe um telefone valido.';
    }

    if (isClienteRegister && !form.dataNascimento) {
      return 'Informe sua data de nascimento.';
    }

    if (isClienteRegister && form.cpf.replace(/\D/g, '').length < 11) {
      return 'Informe um CPF valido.';
    }

    if (isClienteRecovery && !form.codigo.trim()) {
      return 'Informe o codigo enviado por e-mail.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validate();

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      if (isClienteRecovery) {
        if (recoveryStep === 'email') {
          const response = await requestClientePasswordCode({
            email: form.email.trim(),
          });

          setRecoveryStep('code');
          setSuccess(
            response.devCode
              ? `Codigo gerado para teste: ${response.devCode}`
              : 'Codigo enviado para seu e-mail.'
          );
          return;
        }

        await resetClientePassword({
          email: form.email.trim(),
          codigo: form.codigo,
          novaSenha: form.senha,
        });
        setAuthMode('login');
        setRecoveryStep('email');
        setSuccess('Senha atualizada. Entre com sua nova senha.');
        setForm((current) => ({ ...current, senha: '', codigo: '' }));
        return;
      }

      const session = isClienteRegister
        ? await registerCliente({
            cliente: {
              nome: form.nome.trim(),
              telefone: form.telefone,
              email: form.email.trim(),
              senha: form.senha,
              dataNascimento: form.dataNascimento,
              sexo: form.sexo,
              documento: {
                tipo: 'cpf',
                numero: form.cpf,
              },
            },
          })
        : await login({
            email: form.email.trim(),
            senha: form.senha,
            accessType: selectedAccess,
          });

      navigate(redirectByAccess[session.accessType] || redirectTo, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Usuario ou senha invalidos.');
    }
  };

  return (
    <main className="login-shell">
      <section className="login-panel" aria-label="Login unico Salao Josi">
        <div className="login-panel__brand">
          <img src={logo} alt="Salao Josi" />
          <div>
            <span>Salao Josi</span>
            <small>Acesso unificado</small>
          </div>
        </div>

        <div className="login-panel__heading">
          <span className="login-panel__eyebrow">Bem-vindo</span>
          <h1>Escolha seu acesso e entre no sistema</h1>
          <p>Uma unica tela para clientes e equipe administrativa.</p>
        </div>

        <div className="login-access" role="tablist" aria-label="Tipo de acesso">
          {accessOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`login-access__option ${
                selectedAccess === option.id ? 'is-active' : ''
              }`}
              onClick={() => {
                setSelectedAccess(option.id);
                setAuthMode('login');
                setRecoveryStep('email');
                setError('');
                setSuccess('');
              }}
            >
              <span className={`mdi ${option.icon}`} aria-hidden="true"></span>
              <strong>{option.title}</strong>
              <small>{option.description}</small>
            </button>
          ))}
        </div>

        {selectedAccess === 'cliente' && (
          <div className="login-mode" aria-label="Modo de acesso do cliente">
            <button
              type="button"
              className={authMode === 'login' ? 'is-active' : ''}
              onClick={() => {
                setAuthMode('login');
                setRecoveryStep('email');
                setError('');
                setSuccess('');
              }}
            >
              Entrar
            </button>
            <button
              type="button"
              className={authMode === 'register' ? 'is-active' : ''}
              onClick={() => {
                setAuthMode('register');
                setRecoveryStep('email');
                setError('');
                setSuccess('');
              }}
            >
              Criar conta
            </button>
            <button
              type="button"
              className={authMode === 'recover' ? 'is-active' : ''}
              onClick={() => {
                setAuthMode('recover');
                setRecoveryStep('email');
                setError('');
                setSuccess('');
              }}
            >
              Esqueci a senha
            </button>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {isClienteRegister && (
            <label>
              <span>Nome completo</span>
              <div className="login-form__input">
                <span className="mdi mdi-account-outline" aria-hidden="true"></span>
                <input
                  type="text"
                  value={form.nome}
                  onChange={updateForm('nome')}
                  placeholder="Seu nome completo"
                  autoComplete="name"
                />
              </div>
            </label>
          )}

          {isClienteRecovery && (
            <p className="login-form__helper">
              {recoveryStep === 'email'
                ? 'Informe seu e-mail cadastrado para receber o codigo de recuperacao.'
                : 'Digite o codigo enviado por e-mail e escolha uma nova senha.'}
            </p>
          )}

          <label>
            <span>E-mail</span>
            <div className="login-form__input">
              <span className="mdi mdi-email-outline" aria-hidden="true"></span>
              <input
                type="email"
                value={form.email}
                onChange={updateForm('email')}
                placeholder="seuemail@exemplo.com"
                autoComplete="email"
              />
            </div>
          </label>

          {(!isClienteRecovery || recoveryStep === 'code') && (
            <label>
              <span>{isClienteRecovery ? 'Nova senha' : 'Senha'}</span>
              <div className="login-form__input">
                <span className="mdi mdi-lock-outline" aria-hidden="true"></span>
                <input
                  type="password"
                  value={form.senha}
                  onChange={updateForm('senha')}
                  placeholder={isClienteRecovery ? 'Digite a nova senha' : 'Digite sua senha'}
                  autoComplete="current-password"
                />
              </div>
            </label>
          )}

          {isClienteRecovery && recoveryStep === 'code' && (
            <label>
              <span>Codigo recebido</span>
              <div className="login-form__input">
                <span className="mdi mdi-key-variant" aria-hidden="true"></span>
                <input
                  type="text"
                  value={form.codigo}
                  onChange={updateForm('codigo')}
                  placeholder="000000"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              </div>
            </label>
          )}

          {isClienteRegister && (
            <>
              {isClienteRegister && (
                <label>
                  <span>Telefone</span>
                  <div className="login-form__input">
                    <span className="mdi mdi-phone-outline" aria-hidden="true"></span>
                    <input
                      type="tel"
                      value={form.telefone}
                      onChange={updateForm('telefone')}
                      placeholder="(00) 00000-0000"
                      autoComplete="tel"
                    />
                  </div>
                </label>
              )}

              {isClienteRegister && (
                <div className="login-form__row">
                  <label>
                    <span>Nascimento</span>
                    <div className="login-form__input">
                      <span className="mdi mdi-calendar-outline" aria-hidden="true"></span>
                      <input
                        type="date"
                        value={form.dataNascimento}
                        onChange={updateForm('dataNascimento')}
                      />
                    </div>
                  </label>

                  <label>
                    <span>Sexo</span>
                    <div className="login-form__input">
                      <span className="mdi mdi-account-details-outline" aria-hidden="true"></span>
                      <select value={form.sexo} onChange={updateForm('sexo')}>
                        <option value="F">Feminino</option>
                        <option value="M">Masculino</option>
                      </select>
                    </div>
                  </label>
                </div>
              )}

              <label>
                <span>CPF</span>
                <div className="login-form__input">
                  <span className="mdi mdi-card-account-details-outline" aria-hidden="true"></span>
                  <input
                    type="text"
                    value={form.cpf}
                    onChange={updateForm('cpf')}
                    placeholder="000.000.000-00"
                    autoComplete="off"
                  />
                </div>
              </label>
            </>
          )}

          {error && (
            <div className="login-form__message" role="alert">
              <span className="mdi mdi-alert-circle-outline" aria-hidden="true"></span>
              {error}
            </div>
          )}

          {success && (
            <div className="login-form__message is-success" role="status">
              <span className="mdi mdi-check-circle-outline" aria-hidden="true"></span>
              {success}
            </div>
          )}

          <button className="login-form__submit" type="submit" disabled={loading}>
            {loading ? (
              <span className="login-form__spinner" aria-hidden="true"></span>
            ) : (
              <span className="mdi mdi-login" aria-hidden="true"></span>
            )}
            {isClienteRegister
              ? 'Criar conta e entrar'
              : isClienteRecovery
                ? recoveryStep === 'email'
                  ? 'Enviar codigo'
                  : 'Atualizar senha'
                : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
};

export default Login;
