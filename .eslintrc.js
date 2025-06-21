// .eslintrc.js - Configuração para desabilitar warnings problemáticos
module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Desabilitar warnings que causam problemas no build
    'no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'no-undef': 'warn',
    'jsx-a11y/anchor-is-valid': 'warn',
    'jsx-a11y/alt-text': 'warn',
    'react/jsx-no-target-blank': 'warn',
    
    // Permitir console.log em desenvolvimento
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    
    // Permitir variáveis não utilizadas que começam com underscore
    'no-unused-vars': ['warn', { 
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_' 
    }],
    
    // Permitir algumas práticas comuns em React
    'react/prop-types': 'off',
    'react/display-name': 'off'
  },
  
  // Ignorar alguns arquivos
  ignorePatterns: [
    'build/',
    'node_modules/',
    'public/',
    '*.config.js'
  ]
};
