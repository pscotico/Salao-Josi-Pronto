import { useEffect, useMemo, useState } from 'react';
import consts from '../../consts';
import api from '../../services/api';
import './styles.css';

const emptySalao = {
  nome: '',
  email: '',
  telefone: '',
  foto: '',
  logo: '',
  capa: '',
  endereco: {
    logradouro: '',
    numero: '',
    cidade: '',
    uf: '',
    cep: '',
    pais: 'br',
  },
  site: {
    enderecoTexto: '',
    telefoneLink: '',
    whatsapp: '',
    instagram: '',
    botaoPrincipalTexto: 'Agendar agora',
    botaoLigarTexto: 'Ligar',
    botaoLocalizacaoTexto: 'Localizacao',
    botaoCompartilharTexto: 'Compartilhar',
  },
};

const mergeSalao = (salao = {}) => ({
  ...emptySalao,
  ...salao,
  endereco: {
    ...emptySalao.endereco,
    ...(salao.endereco || {}),
  },
  site: {
    ...emptySalao.site,
    ...(salao.site || {}),
  },
});

const Salao = () => {
  const [salao, setSalao] = useState(emptySalao);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const previewCapa = salao.capa || '/images/salao-capa.jpg';
  const previewLogo = salao.logo || salao.foto || '';
  const enderecoResumo = useMemo(() => {
    if (salao.site.enderecoTexto) {
      return salao.site.enderecoTexto;
    }

    return [
      salao.endereco.logradouro,
      salao.endereco.numero,
      salao.endereco.cidade,
      salao.endereco.uf,
    ]
      .filter(Boolean)
      .join(', ');
  }, [salao]);

  useEffect(() => {
    const loadSalao = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await api.get(`/salao/${consts.salaoId}`);

        if (data.error) {
          setError(data.message);
          return;
        }

        setSalao(mergeSalao(data.salao));
      } catch (err) {
        setError(err?.response?.data?.message || 'Nao foi possivel carregar o salao.');
      } finally {
        setLoading(false);
      }
    };

    loadSalao();
  }, []);

  const updateSalao = (key) => (event) => {
    setMessage('');
    setError('');
    setSalao((current) => ({ ...current, [key]: event.target.value }));
  };

  const updateEndereco = (key) => (event) => {
    setMessage('');
    setError('');
    setSalao((current) => ({
      ...current,
      endereco: {
        ...current.endereco,
        [key]: event.target.value,
      },
    }));
  };

  const updateSite = (key) => (event) => {
    setMessage('');
    setError('');
    setSalao((current) => ({
      ...current,
      site: {
        ...current.site,
        [key]: event.target.value,
      },
    }));
  };

  const saveSalao = async () => {
    if (!salao.nome || !salao.email) {
      setError('Nome e e-mail do salao sao obrigatorios.');
      return;
    }

    try {
      setSaving(true);
      setMessage('');
      setError('');
      const { data } = await api.put(`/salao/${consts.salaoId}`, salao);

      if (data.error) {
        setError(data.message);
        return;
      }

      setSalao(mergeSalao(data.salao));
      setMessage('Dados do salao atualizados com sucesso.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Nao foi possivel salvar o salao.');
    } finally {
      setSaving(false);
    }
  };

  const uploadImagem = (field) => async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploadingField(field);
      setMessage('');
      setError('');

      const payload = new FormData();
      payload.append('arquivo', file);

      const { data } = await api.post(
        `/salao/${consts.salaoId}/upload/${field}`,
        payload,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (data.error) {
        setError(data.message);
        return;
      }

      setSalao(mergeSalao(data.salao));
      setMessage('Imagem enviada com sucesso.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Nao foi possivel enviar a imagem.');
    } finally {
      setUploadingField('');
      event.target.value = '';
    }
  };

  return (
    <div className="salao-admin col p-5 overflow-auto h-100">
      <div className="salao-admin__header">
        <div>
          <span className="salao-admin__eyebrow">Configuracoes</span>
          <h2 className="mb-1 mt-0">Salao</h2>
          <p>Edite os dados, imagens e botoes exibidos na area do cliente.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={saveSalao}
          disabled={saving || loading}
        >
          <span className="mdi mdi-content-save"></span>
          {saving ? ' Salvando...' : ' Salvar'}
        </button>
      </div>

      {error && <div className="salao-admin__alert is-error">{error}</div>}
      {message && <div className="salao-admin__alert is-success">{message}</div>}

      <div className="salao-admin__grid">
        <section className="salao-admin__section">
          <h3>Identidade</h3>
          <div className="row">
            <label className="form-group col-md-6">
              <b>Nome do salao</b>
              <input
                className="form-control"
                value={salao.nome}
                onChange={updateSalao('nome')}
                placeholder="Salao Josi"
              />
            </label>
            <label className="form-group col-md-6">
              <b>E-mail</b>
              <input
                className="form-control"
                value={salao.email}
                onChange={updateSalao('email')}
                placeholder="contato@salao.com"
              />
            </label>
            <label className="form-group col-md-6">
              <b>Telefone exibido</b>
              <input
                className="form-control"
                value={salao.telefone || ''}
                onChange={updateSalao('telefone')}
                placeholder="(37) 98418-3573"
              />
            </label>
            <label className="form-group col-md-6">
              <b>Link do botao ligar</b>
              <input
                className="form-control"
                value={salao.site.telefoneLink}
                onChange={updateSite('telefoneLink')}
                placeholder="tel:+5537984183573"
              />
            </label>
          </div>
        </section>

        <section className="salao-admin__section">
          <h3>Imagens</h3>
          <div className="row">
            <div className="form-group col-md-4">
              <b>Logo</b>
              <input
                className="form-control"
                value={salao.logo}
                onChange={updateSalao('logo')}
                placeholder="https://..."
              />
              <label className="salao-admin__upload">
                <span className="mdi mdi-upload"></span>
                {uploadingField === 'logo' ? 'Enviando...' : 'Enviar da maquina'}
                <input type="file" accept="image/*" onChange={uploadImagem('logo')} />
              </label>
            </div>
            <div className="form-group col-md-4">
              <b>Foto do perfil</b>
              <input
                className="form-control"
                value={salao.foto || ''}
                onChange={updateSalao('foto')}
                placeholder="https://..."
              />
              <label className="salao-admin__upload">
                <span className="mdi mdi-upload"></span>
                {uploadingField === 'foto' ? 'Enviando...' : 'Enviar da maquina'}
                <input type="file" accept="image/*" onChange={uploadImagem('foto')} />
              </label>
            </div>
            <div className="form-group col-md-4">
              <b>Imagem de capa</b>
              <input
                className="form-control"
                value={salao.capa || ''}
                onChange={updateSalao('capa')}
                placeholder="https://..."
              />
              <label className="salao-admin__upload">
                <span className="mdi mdi-upload"></span>
                {uploadingField === 'capa' ? 'Enviando...' : 'Enviar da maquina'}
                <input type="file" accept="image/*" onChange={uploadImagem('capa')} />
              </label>
            </div>
          </div>
        </section>

        <section className="salao-admin__section">
          <h3>Endereco</h3>
          <div className="row">
            <label className="form-group col-md-8">
              <b>Endereco exibido no site</b>
              <input
                className="form-control"
                value={salao.site.enderecoTexto}
                onChange={updateSite('enderecoTexto')}
                placeholder="R. Camilo Bernardes, 126 - Formiga, MG"
              />
            </label>
            <label className="form-group col-md-4">
              <b>CEP</b>
              <input
                className="form-control"
                value={salao.endereco.cep || ''}
                onChange={updateEndereco('cep')}
                placeholder="35570-222"
              />
            </label>
            <label className="form-group col-md-5">
              <b>Rua</b>
              <input
                className="form-control"
                value={salao.endereco.logradouro || ''}
                onChange={updateEndereco('logradouro')}
              />
            </label>
            <label className="form-group col-md-2">
              <b>Numero</b>
              <input
                className="form-control"
                value={salao.endereco.numero || ''}
                onChange={updateEndereco('numero')}
              />
            </label>
            <label className="form-group col-md-3">
              <b>Cidade</b>
              <input
                className="form-control"
                value={salao.endereco.cidade || ''}
                onChange={updateEndereco('cidade')}
              />
            </label>
            <label className="form-group col-md-2">
              <b>UF</b>
              <input
                className="form-control"
                value={salao.endereco.uf || ''}
                onChange={updateEndereco('uf')}
              />
            </label>
          </div>
        </section>

        <section className="salao-admin__section">
          <h3>Botoes da area do cliente</h3>
          <div className="row">
            <label className="form-group col-md-6">
              <b>Botao principal</b>
              <input
                className="form-control"
                value={salao.site.botaoPrincipalTexto}
                onChange={updateSite('botaoPrincipalTexto')}
              />
            </label>
            <label className="form-group col-md-6">
              <b>Botao ligar</b>
              <input
                className="form-control"
                value={salao.site.botaoLigarTexto}
                onChange={updateSite('botaoLigarTexto')}
              />
            </label>
            <label className="form-group col-md-6">
              <b>Botao localizacao</b>
              <input
                className="form-control"
                value={salao.site.botaoLocalizacaoTexto}
                onChange={updateSite('botaoLocalizacaoTexto')}
              />
            </label>
            <label className="form-group col-md-6">
              <b>Botao compartilhar</b>
              <input
                className="form-control"
                value={salao.site.botaoCompartilharTexto}
                onChange={updateSite('botaoCompartilharTexto')}
              />
            </label>
          </div>
        </section>
      </div>

      <section className="salao-admin__preview">
        <div
          className="salao-admin__preview-cover"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(24, 18, 28, .1), rgba(18, 16, 20, .84)), url(${previewCapa})`,
          }}
        >
          {previewLogo && <img src={previewLogo} alt="Logo do salao" />}
          <div>
            <span>{salao.nome || 'Salao Josi'}</span>
            <small>{enderecoResumo || 'Endereco do salao'}</small>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Salao;
