// src/components/AutomationComponent.js
import React, { useState } from 'react';
import { 
  Bot, 
  Zap, 
  FileText, 
  Users, 
  MessageSquare, 
  Settings, 
  Play, 
  Pause, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Upload,
  Eye,
  Edit
} from 'lucide-react';

const AutomationComponent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [automations, setAutomations] = useState([
    {
      id: 1,
      name: 'Extração PDF Semanal',
      description: 'Extrai perguntas automaticamente do PDF da lição semanal',
      status: 'active',
      lastRun: '2024-11-15 09:30',
      nextRun: '2024-11-22 09:00',
      successRate: 95,
      runs: 24
    },
    {
      id: 2,
      name: 'Envio de Questionários',
      description: 'Distribui questionários para membros do grupo automaticamente',
      status: 'active',
      lastRun: '2024-11-15 10:00',
      nextRun: '2024-11-22 10:00',
      successRate: 98,
      runs: 18
    },
    {
      id: 3,
      name: 'Relatório de Participação',
      description: 'Gera relatórios automáticos de participação semanal',
      status: 'paused',
      lastRun: '2024-11-08 11:00',
      nextRun: '-',
      successRate: 92,
      runs: 12
    }
  ]);

  const [pdfContent] = useState({
    title: 'Lição 45 - O Amor de Deus',
    extractedText: `
    ESCOLA BÍBLICA DOMINICAL - NOVA BRASÍLIA I
    Lição 45: O Amor de Deus
    Data: 17 de Novembro de 2024
    
    TEXTO ÁUREO: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito..." (João 3:16)
    
    VERDADE PRÁTICA: O amor de Deus é demonstrado através do sacrifício de Jesus Cristo.
    
    OBJETIVOS:
    1. Compreender a grandeza do amor divino
    2. Reconhecer as manifestações do amor de Deus
    3. Aplicar o amor de Deus em nossa vida diária
    
    DESENVOLVIMENTO:
    I. A NATUREZA DO AMOR DIVINO
    - O amor incondicional de Deus
    - A expressão máxima do amor: o sacrifício
    
    II. AS MANIFESTAÇÕES DO AMOR DE DEUS
    - Na criação
    - Na redenção
    - Na providência diária
    
    III. NOSSA RESPOSTA AO AMOR DIVINO
    - Amar a Deus sobre todas as coisas
    - Amar ao próximo como a nós mesmos
    `,
    extractedQuestions: [
      {
        id: 1,
        question: 'Como podemos compreender a grandeza do amor divino?',
        type: 'discursiva',
        points: 2
      },
      {
        id: 2,
        question: 'Quais são as principais manifestações do amor de Deus mencionadas na lição?',
        type: 'multipla_escolha',
        options: [
          'Criação, redenção e providência',
          'Apenas a criação',
          'Somente o sacrifício de Jesus',
          'Nenhuma das anteriores'
        ],
        correctAnswer: 0,
        points: 1
      },
      {
        id: 3,
        question: 'Como devemos responder ao amor de Deus segundo a lição?',
        type: 'discursiva',
        points: 2
      }
    ],
    generatedAt: '2024-11-15 09:30:00'
  });

  // Remover variáveis não utilizadas
  // const [selectedMembers, setSelectedMembers] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const toggleAutomation = (id) => {
    setAutomations(prev => 
      prev.map(auto => 
        auto.id === id 
          ? { ...auto, status: auto.status === 'active' ? 'paused' : 'active' }
          : auto
      )
    );
    showMessage('success', 'Status da automação atualizado!');
  };

  const runAutomation = (id) => {
    const automation = automations.find(a => a.id === id);
    showMessage('info', `Executando "${automation.name}"...`);
    
    setTimeout(() => {
      setAutomations(prev =>
        prev.map(auto =>
          auto.id === id
            ? { 
                ...auto, 
                lastRun: new Date().toLocaleString('pt-BR'),
                runs: auto.runs + 1
              }
            : auto
        )
      );
      showMessage('success', `"${automation.name}" executada com sucesso!`);
    }, 2000);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Bot },
    { id: 'pdf-extraction', label: 'Extração PDF', icon: FileText },
    { id: 'members', label: 'Membros', icon: Users },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bot className="h-8 w-8" />
              Sistema de Automação RPA
            </h1>
            <p className="text-purple-100 mt-2">Nova Brasília I - Automação Inteligente da EBD</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-purple-100">Automações</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">95%</div>
                <div className="text-sm text-purple-100">Taxa Sucesso</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">54</div>
                <div className="text-sm text-purple-100">Execuções</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message.text && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' :
          'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
            {message.type === 'error' && <AlertCircle className="h-5 w-5 mr-2" />}
            {message.type === 'info' && <RefreshCw className="h-5 w-5 mr-2 animate-spin" />}
            {message.text}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Automações Ativas</h2>
              
              <div className="grid gap-4">
                {automations.map(automation => (
                  <div key={automation.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          automation.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        <h3 className="font-semibold text-lg">{automation.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          automation.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {automation.status === 'active' ? 'Ativa' : 'Pausada'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => runAutomation(automation.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Executar agora"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleAutomation(automation.id)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                          title={automation.status === 'active' ? 'Pausar' : 'Ativar'}
                        >
                          {automation.status === 'active' ? 
                            <Pause className="h-4 w-4" /> : 
                            <Play className="h-4 w-4" />
                          }
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{automation.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Última execução:</span>
                        <div className="font-medium">{automation.lastRun}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Próxima execução:</span>
                        <div className="font-medium">{automation.nextRun}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Taxa de sucesso:</span>
                        <div className="font-medium text-green-600">{automation.successRate}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Total execuções:</span>
                        <div className="font-medium">{automation.runs}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PDF Extraction Tab */}
          {activeTab === 'pdf-extraction' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Extração de PDF - Lição Semanal</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Novo PDF
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Conteúdo Extraído */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {pdfContent.title}
                  </h3>
                  <div className="bg-white rounded p-3 text-sm max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-mono text-xs">
                      {pdfContent.extractedText}
                    </pre>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    Extraído em: {pdfContent.generatedAt}
                  </div>
                </div>

                {/* Perguntas Geradas */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Perguntas Geradas ({pdfContent.extractedQuestions.length})
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {pdfContent.extractedQuestions.map((q, index) => (
                      <div key={q.id} className="bg-white rounded p-3 border-l-4 border-blue-500">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-blue-600">
                            Pergunta {index + 1}
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {q.points} pts
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 mb-2">{q.question}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            q.type === 'discursiva' 
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {q.type === 'discursiva' ? 'Discursiva' : 'Múltipla Escolha'}
                          </span>
                        </div>
                        {q.options && (
                          <div className="mt-2 text-xs text-gray-600">
                            <div className="font-medium">Opções:</div>
                            {q.options.map((option, idx) => (
                              <div key={idx} className={`ml-2 ${idx === q.correctAnswer ? 'font-bold text-green-600' : ''}`}>
                                {String.fromCharCode(65 + idx)}) {option}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Gerar Questionário Automático
                </button>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Membros - Nova Brasília I</h2>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">Grupo 2 - WALACE</span>
                </div>
                <p className="text-blue-700 text-sm">
                  16 membros cadastrados • Responsável: WALACE CARDOSO DE ANDRADE
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { nome: 'WALACE CARDOSO DE ANDRADE', funcao: 'Responsável', ativo: true },
                  { nome: 'MARIA SILVA SANTOS', funcao: 'Secretária', ativo: true },
                  { nome: 'JOÃO PEDRO OLIVEIRA', funcao: 'Membro', ativo: true },
                  { nome: 'ANA CAROLINA FERREIRA', funcao: 'Professora', ativo: true },
                  { nome: 'CARLOS EDUARDO LIMA', funcao: 'Diácono', ativo: true },
                  { nome: 'LETICIA SOUZA COSTA', funcao: 'Membro', ativo: true }
                ].map((member, index) => (
                  <div key={index} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-3 h-3 rounded-full ${member.ativo ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <div className="flex gap-1">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Eye className="h-3 w-3" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-yellow-600">
                          <Edit className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-medium text-sm text-gray-900 mb-1">{member.nome}</h4>
                    <p className="text-xs text-gray-600">{member.funcao}</p>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Ver todos os 16 membros →
                </button>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Configurações de Automação</h2>
              
              <div className="grid gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Extração de PDF</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Execução automática</span>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6"></span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Horário de execução</span>
                      <input type="time" value="09:00" className="border rounded px-2 py-1 text-sm" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Dia da semana</span>
                      <select className="border rounded px-2 py-1 text-sm">
                        <option>Domingo</option>
                        <option>Segunda-feira</option>
                        <option>Terça-feira</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Notificações</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email de sucesso</span>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6"></span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email de erro</span>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6"></span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Integração</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Supabase</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Conectado</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Externa</span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Configurar</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutomationComponent;
