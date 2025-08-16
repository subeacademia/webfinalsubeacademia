export const AI_CONFIG = {
  // Configuración de la API externa
  API: {
    BASE_URL: 'https://apisube-smoky.vercel.app/api/azure/generate',
    TIMEOUT: {
      HEALTH_CHECK: 10000, // 10 segundos para verificación de salud
      ANALYSIS: 45000,     // 45 segundos para análisis detallado
      ACTION_PLAN: 35000,  // 35 segundos para plan de acción
      GENERAL: 30000       // 30 segundos para solicitudes generales
    },
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 segundo entre reintentos
  },

  // Configuración de prompts
  PROMPTS: {
    ANALYSIS: {
      MAX_TOKENS: 2048,
      TEMPERATURE: 0.8,
      TOP_P: 0.9,
      FREQUENCY_PENALTY: 0.1,
      PRESENCE_PENALTY: 0.1
    },
    ACTION_PLAN: {
      MAX_TOKENS: 1500,
      TEMPERATURE: 0.8,
      TOP_P: 0.9,
      FREQUENCY_PENALTY: 0.1,
      PRESENCE_PENALTY: 0.1
    }
  },

  // Configuración de fallback
  FALLBACK: {
    ENABLED: true,
    DELAY: 2000, // 2 segundos antes de mostrar fallback
    MESSAGE: 'Usando análisis local mientras se restaura la conexión con la IA'
  },

  // Configuración de monitoreo
  MONITORING: {
    ENABLED: true,
    LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    METRICS: {
      ENABLED: true,
      COLLECT_RESPONSE_TIMES: true,
      COLLECT_ERROR_RATES: true,
      COLLECT_SUCCESS_RATES: true
    }
  },

  // Configuración de caché
  CACHE: {
    ENABLED: true,
    TTL: 300000, // 5 minutos en milisegundos
    MAX_ITEMS: 100
  },

  // Configuración de rate limiting
  RATE_LIMITING: {
    ENABLED: true,
    MAX_REQUESTS_PER_MINUTE: 10,
    MAX_REQUESTS_PER_HOUR: 100
  },

  // Configuración de seguridad
  SECURITY: {
    VALIDATE_INPUT: true,
    SANITIZE_OUTPUT: true,
    MAX_INPUT_LENGTH: 10000,
    ALLOWED_HTML_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'em', 'code', 'pre', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td']
  },

  // Configuración de UI
  UI: {
    LOADING_ANIMATION: true,
    PROGRESS_BAR: true,
    ERROR_DISPLAY: true,
    SUCCESS_NOTIFICATIONS: true,
    AUTO_RETRY: true,
    RETRY_BUTTON: true
  }
};

// Configuración específica para diferentes entornos
export const ENVIRONMENT_CONFIG = {
  development: {
    ...AI_CONFIG,
    API: {
      ...AI_CONFIG.API,
      TIMEOUT: {
        ...AI_CONFIG.API.TIMEOUT,
        HEALTH_CHECK: 5000,  // Más rápido en desarrollo
        ANALYSIS: 30000,     // Más rápido en desarrollo
        ACTION_PLAN: 25000   // Más rápido en desarrollo
      }
    },
    MONITORING: {
      ...AI_CONFIG.MONITORING,
      LOG_LEVEL: 'debug'
    }
  },
  
  production: {
    ...AI_CONFIG,
    MONITORING: {
      ...AI_CONFIG.MONITORING,
      LOG_LEVEL: 'warn'
    },
    CACHE: {
      ...AI_CONFIG.CACHE,
      TTL: 600000 // 10 minutos en producción
    }
  }
};

// Función para obtener la configuración según el entorno
export function getAIConfig() {
  const environment = process.env['NODE_ENV'] || 'development';
  return ENVIRONMENT_CONFIG[environment as keyof typeof ENVIRONMENT_CONFIG] || AI_CONFIG;
}
